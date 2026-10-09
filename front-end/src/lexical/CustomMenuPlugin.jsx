function useBasicTypeaheadTriggerMatch(trigger, { minLength = 0 } = {}) {
  return (text) => {
    console.log(text)
    const triggerIndex = text.lastIndexOf(trigger)
    if (triggerIndex === -1) return null

    const start = triggerIndex
    const end = text.length
    const query = text.slice(start + 1, end)

    if (query.length < minLength) return null
    if (text.charAt(start - 1) != " ") return null
    return {
      leadOffset: start,
      matchingString: query,
      replaceableString: text.slice(start, end),
    }
  }
}
import { useState, useMemo, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LexicalTypeaheadMenuPlugin } from "@lexical/react/LexicalTypeaheadMenuPlugin"
import {
  $getSelection,
  $isRangeSelection,
  $createTextNode,
  COMMAND_PRIORITY_EDITOR,
  KEY_SPACE_COMMAND,
} from "lexical"
import { $createMentionNode } from "./MentionNode"
import socket from "../socket"

export function CustomTypeaheadPlugin({ dialog, cords, post }) {
  const [editor] = useLexicalComposerContext()
  const [queryString, setQueryString] = useState(null)
  const [options, setOptions] = useState([])

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("@", {
    minLength: 1,
  })

  useEffect(() => {
    if (queryString) {
      socket.emit("searchUser", queryString.toLowerCase(), (res) => {
        res.data.fullUsers && setOptions(res.data.fullUsers)
        console.log(res)
      })
    }
    // editor.registerCommand(
    //   KEY_SPACE_COMMAND,
    //   (event) => {
    //     const selection = $getSelection()

    //     if ($isRangeSelection(selection)) {
    //       event.preventDefault()

    //       const newTextNode = $createTextNode(" ")

    //       selection.insertNodes([newTextNode])

    //       newTextNode.select()
    //       return true
    //     }
    //     return false
    //   },
    //   COMMAND_PRIORITY_EDITOR
    // )
  }, [queryString])

  const onSelectOption = (option, textNodeContainingQuery, closeMenu) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        if (textNodeContainingQuery) {
          textNodeContainingQuery.remove()
        }
        console.log(options)
        const newTextNode = $createTextNode("@" + option.username)
        selection.insertNodes([newTextNode])

        newTextNode.select()
        selection.insertText(" ")

        closeMenu()
      }
    })
  }

  return (
    <LexicalTypeaheadMenuPlugin
      onQueryChange={setQueryString}
      onSelectOption={onSelectOption}
      triggerFn={checkForTriggerMatch}
      anchorClassName={"menu-anchor"}
      options={options}
      menuRenderFn={(
        anchorElementRef,
        { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
      ) => {
        console.log(options)
        if (!anchorElementRef.current || options.length === 0) return null
        const dialogRect = dialog.current.getBoundingClientRect()
        const rect = anchorElementRef.current.getBoundingClientRect()

        console.log(cords)
        return (
          <div
            className="typeahead-menu-dropdown fixed border-0   text-white  bg-black"
            style={{
              boxShadow:
                "rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px",
              position: "absolute",
              top: `${
                post
                  ? cords.top - dialogRect.top + 18
                  : cords.top - dialogRect.top - 50
              }px`,
              left: `${0}px`,
            }}
          >
            <ul className=" w-80  max-sm:w-60 ">
              {options.map((option, index) => {
                console.log(option)
                const isSelected = selectedIndex === index
                return (
                  <li
                    className="flex items-center font-bold   "
                    key={option.username}
                    style={{
                      padding: "2px",
                      paddingLeft: "4px",
                      background: isSelected ? "#80808030" : "transparent",
                      cursor: "pointer",
                    }}
                    onClick={() => selectOptionAndCleanUp(option)}
                  >
                    <img
                      className="max-h-10 rounded-full m-2 ml-2  aspect-square object-cover "
                      src={option.avatarUrl}
                      alt=""
                    />
                    {option.username}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      }}
    />
  )
}
