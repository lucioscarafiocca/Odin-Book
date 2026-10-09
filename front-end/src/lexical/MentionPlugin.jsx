// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
// import { TextNode } from "lexical"
// import { useEffect } from "react"
// import { $createMentionNode } from "./MentionNode"

// export function MentionPlugin() {
//   const [editor] = useLexicalComposerContext()

//   useEffect(() => {
//     return editor.registerNodeTransform(TextNode, (textNode) => {
//       const text = textNode.getTextContent()
//       const words = text.split(/\s+/)
//       const atText = words.find((element) => {
//         return element.startsWith("@")
//       })
//       console.log(atText)
//       // Look for the '@' symbol followed by characters
//       if (atText != undefined) {
//         // const mentionText = text.slice(1)

//         // Replace the plain text node with your custom outlined node
//         const mentionNode = $createMentionNode(atText)
//         textNode.replace(mentionNode)
//       }

//     })
//   }, [editor])

//   return null
// }

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { TextNode, $createTextNode, $getRoot } from "lexical"
import { useEffect } from "react"
import { $createMentionNode, $isMentionNode, MentionNode } from "./MentionNode"
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_SPACE_COMMAND,
} from "lexical"

import { createRectsFromDOMRange } from "@lexical/selection"
import { elementScroll } from "@tanstack/react-virtual"

export function MentionPlugin({ setOpen, anchorRef, setCords }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    const removeTransform = editor.registerNodeTransform(
      TextNode,
      (textNode) => {
        // console.log(textNode)
        if (
          !textNode.isSimpleText() ||
          $isMentionNode(textNode) ||
          textNode.__style != ""
        ) {
          if (textNode.__style != "") {
            const text = textNode.getTextContent()
            const mentionMatch = text.match(/@[a-zA-Z]/)
            const beforeMatch = text.match(/(?:^|\s)(@[^\s]+)/g)
            const bothMatch = text.match(/[a-zA-Z]@[a-zA-Z]/)
            console.log(beforeMatch)
            if (mentionMatch == null) {
              textNode.setStyle("")
            } else if (beforeMatch && beforeMatch[0][0] != " ") {
              const mentionNode = $createTextNode(beforeMatch[0])
              console.log(mentionNode)
              textNode.replace(mentionNode)
            } else if (bothMatch) textNode.setStyle("")
          }
          return
        } else {
          const selection = $getSelection()
          if ($isRangeSelection(selection)) {
            const text = textNode.getTextContent()
            // console.log(text)
            const mentionMatch = text.match(/(?:^|\s)(@[^\s]+)/)
            console.log("true")
            // console.log(mentionMatch)
            if (mentionMatch !== null) {
              const matchStart = mentionMatch.index
              const matchEnd = matchStart + mentionMatch[0].length

              let targetNode = textNode
              console.log(targetNode)

              if (matchStart > 0) {
                ;[, targetNode] = textNode.splitText(matchStart)
              }

              if (matchEnd < text.length) {
                ;[targetNode] = targetNode.splitText(matchEnd - matchStart)
              }

              console.log(targetNode.getTextContent())

              const anchor = selection.anchor
              const node = anchor.getNode()
              console.log(anchor)
              const isAtStartOfParent = anchor.offset === 1

              const mentionNode = isAtStartOfParent
                ? $createTextNode(" " + targetNode.getTextContent())
                : $createTextNode(targetNode.getTextContent())
              console.log(targetNode)
              console.log(mentionNode)
              mentionNode.setStyle("color: #1d9bf0;")
              targetNode.replace(mentionNode)

              const nativeSelection = window.getSelection()
              const range = nativeSelection.getRangeAt(0)
              const rect = range.getBoundingClientRect()
              setCords(rect)

              // mentionNode.toggleUnmergeable()
              mentionNode.selectNext()

              // const newTextNode = $createTextNode(targetNode.getTextContent())
              // newTextNode.setStyle("color: #1d9bf0;")
              // selection.insertNodes([newTextNode])
              // newTextNode.select()
            }
          }
        }
      }
    )
    const a = editor.registerCommand(
      KEY_SPACE_COMMAND,
      (event) => {
        const selection = $getSelection()

        if ($isRangeSelection(selection)) {
          event.preventDefault()

          const newTextNode = $createTextNode(" ")

          selection.insertNodes([newTextNode])
          selection.setStyle("")
          selection.format = 0
          // newTextNode.select()
          return true
        }
        return false
      },
      COMMAND_PRIORITY_EDITOR
    )
    // const b = editor.registerNodeTransform(MentionNode, (node) => {
    //   if (!$isMentionNode(node)) {
    //     return
    //   }
    //   const text = node.getTextContent()
    //   const mentionMatch = text.match(/(?:^|\s)(@[^\s]+)$/)
    //   console.log(text)
    //   if (mentionMatch != null) {
    //     const selection = $getSelection()

    //     if ($isRangeSelection(selection)) {
    //       const nativeSelection = window.getSelection()
    //       if (nativeSelection && nativeSelection.rangeCount > 0) {
    //         const domRange = nativeSelection.getRangeAt(0)

    //         // Option A: Use Lexical's utility
    //         const rects = createRectsFromDOMRange(editor, domRange)
    //         // setOpen(rects[0])
    //       }
    //     }
    //   }
    // })
  }, [editor])

  return null
}
