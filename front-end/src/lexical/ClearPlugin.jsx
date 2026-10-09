import { useEffect } from "react"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { $getRoot } from "lexical"

export function ClearPlugin({ open }) {
  const [editor] = useLexicalComposerContext()
  console.log(open)
  useEffect(() => {
    !open &&
      editor.update(() => {
        const root = $getRoot()
        root.clear()
      })
  }, [open])
}
