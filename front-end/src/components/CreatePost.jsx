import { useEffect, useRef, useState } from "react"
import socket from "../socket"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { $createMentionNode, MentionNode } from "../lexical/MentionNode"
import { TextNode } from "lexical"
import { MentionPlugin } from "../lexical/MentionPlugin"
import { createPortal } from "react-dom"
import { CustomTypeaheadPlugin } from "../lexical/CustomMenuPlugin"
import EmojiPicker from "emoji-picker-react"
import { attachInterceptor } from "../jwtlib"
import { useLocation } from "react-router"
import axios from "axios"
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
} from "lexical"
import { ClearPlugin } from "../lexical/ClearPlugin"
import { X, Image } from "lucide-react"

function CreatePost({
  isOpen = false,
  setOpenModal,
  data,
  setLoading,
  client = null,
  sidebar = false,
  footer = false,
}) {
  const [text, setText] = useState("")
  const [open, setOpen] = useState(false)
  const [publicUrl, setPublicUrl] = useState()
  const [imageUrl, setImageUrl] = useState()
  const location = useLocation()
  const inputRef = useRef()
  const [cords, setCords] = useState()

  // const anchorRef = useRef(null)
  const dialog = useRef(null)

  function handlePost() {
    if (isOpen != "post") {
      location.pathname.includes("/with_replies") && setLoading(true)
      socket.emit("createComment", text, isOpen, publicUrl)
      setOpenModal(false)
    } else {
      if (
        (location.pathname.includes(client) &&
          !location.pathname.includes("status") &&
          !location.pathname.includes("follow")) ||
        location.pathname.includes("/with_replies")
      ) {
        setLoading(true)
      }

      socket.emit("createPost", text, null, publicUrl)
      setOpenModal(false)
    }
  }
  function handleClickOutside(e) {
    console.log(e.target)
    if (e.target === dialog.current) {
      setOpenModal(false)
    }
  }
  function handlePicture(files) {
    // e.preventDefault()
    attachInterceptor()
    const formData = new FormData()
    console.log(files)

    formData.append("file", files)
    // formData.append("text", text)
    // formData.append("username", username)

    axios
      .post(
        import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL}/upload/post`
          : "http://localhost:3000/upload/post",
        formData
      )
      .then((res) => {
        setPublicUrl(res.data)
        console.log(res)
      })
      .catch((err) => console.log(err))

    const url = URL.createObjectURL(files)
    setImageUrl(url)
  }

  useEffect(() => {
    console.log(isOpen)
    console.log(location.pathname.includes(client))
    // function handleClickOutside(event) {
    //   console.log(event)
    //   if (dialog.current && !dialog.current.contains(event.target)) {
    //     setOpenModal(false)
    //   }
    // }
    if (isOpen) {
      console.log(isOpen)
      dialog.current.showModal()
      // document.addEventListener("mousedown", handleClickOutside)
    } else {
      console.log(isOpen)
      inputRef.current && (inputRef.current.value = "")
      setText("")
      setImageUrl(null)
      setPublicUrl(null)
      setTimeout(() => {
        dialog.current.close()
      }, 200)
    }
    return () => {
      // document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const theme = {}

  function ParagraphWithSpaceInitialState() {
    const root = $getRoot()
    const selection = $getSelection()
    const anchor = selection.anchor
    console.log(root)
    if (root.isEmpty() || anchor.offset === 1) {
      const paragraph = $createParagraphNode()
      const textNode = $createTextNode("  ")
      paragraph.append(textNode)
      root.append(paragraph)
    }
  }

  function initialEditorState() {
    const root = $getRoot()
    console.log("asd")
    console.log(root.isEmpty())
    if (root.isEmpty()) {
      const paragraph = $createParagraphNode()
      root.append(paragraph)
    }
  }

  function onError(error) {
    console.log(error)
  }

  const myEditorTheme = {
    text: {
      bold: "my-custom-bold-class",
      italic: "my-custom-italic-class",
      underline: "my-custom-underline-class",
    },
  }

  const initialConfig = {
    namespace: "MyEditor",
    nodes: [MentionNode],
    theme: myEditorTheme,
    editorState: initialEditorState,
    // editorState: ParagraphWithSpaceInitialState,
    onError,
  }

  return (
    <>
      {console.log(data)}
      <dialog
        onClick={(e) => handleClickOutside(e)}
        className={`overflow-visible w-150  backdrop:bg-black/60    max-sm:left-5 max-sm:top-20      flex-col relative top-10 text-white  bg-[#141414] left-[38%] rounded-2xl open:starting:scale-75  open:starting:opacity-0  open:flex ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }  transition-all duration-300 post-dialog`}
        ref={dialog}
        onCancel={() => setOpenModal(false)}
      >
        <div className="p-4  ">
          <div className=" max-w-5" onClick={() => setOpenModal(false)}>
            <X
              size="2.4em"
              className="rounded-full hover:bg-white/10   transition-colors duration-2s00 ease-in-out p-2"
            />
          </div>
          <div className="grow flex mt-3">
            <img
              className="max-h-10 rounded-full m-2 ml-2 mr-4 aspect-square object-cover "
              src={data.picture || data}
              alt=""
            />

            <div
              className={`flex-col max-sm:max-h-100 max-h-250 ${
                text.length >= 240 && "overflow-y-auto"
              } scrollbar-track-gray-950 scrollbar-thumb-gray-800  grow pt-3 pb-5`}
            >
              <div
                className={`relative mb-2 ${
                  imageUrl ? "" : "min-h-35"
                }  max-h-150 ${
                  text.length >= 240 && "overflow-y-auto"
                } scrollbar-track-gray-950 scrollbar-thumb-gray-800 z-10 editor-container`}
              >
                <LexicalComposer initialConfig={initialConfig}>
                  <RichTextPlugin
                    contentEditable={
                      <ContentEditable
                        autoFocus
                        className=" overflow-x-auto text-xl  outline-0 "
                        placeholder={
                          <div className="absolute text-gray-600 text-xl top-0 pointer-events-none">
                            Whats up doc...
                          </div>
                        }
                      />
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                  />
                  <OnChangePlugin
                    onChange={(editorState) => {
                      editorState.read(() => {
                        const text = $getRoot().getTextContent()
                        console.log(text.length)
                        setText(text)
                      })
                    }}
                  />
                  <MentionPlugin setCords={setCords} />
                  <CustomTypeaheadPlugin dialog={dialog} cords={cords} />
                  <ClearPlugin open={isOpen} />

                  <HistoryPlugin />
                </LexicalComposer>
              </div>
              {imageUrl && (
                <div className="relative">
                  <img
                    className="bg-center bg-cover rounded-2xl "
                    src={imageUrl}
                  ></img>
                  <button
                    onClick={() => {
                      setImageUrl(false)
                      setPublicUrl(false)
                    }}
                  >
                    <X className="absolute top-1 right-1 m-2 p-1 rounded-full bg-gray-900/70 hover:bg-white/30" />
                  </button>
                </div>
              )}
              {text.length >= 240 && (
                <p className="text-white text-[0.8em] bg-red-500/80 rounded-sm p-2 text-shadow text-shadow-black shadow-2xs">
                  Youve reached the 240 character limit!
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-2 border-[#2f3336] grow">
            <form action="" onSubmit={(e) => handlePicture(e)}>
              <label
                htmlFor={
                  sidebar
                    ? "uploaded_file_sidebar"
                    : footer
                    ? "uploaded_file_footer"
                    : "uploaded_file_createPost"
                }
              >
                <input
                  className="hidden"
                  ref={inputRef}
                  onChange={(e) => {
                    handlePicture(e.target.files[0])
                  }}
                  type="file"
                  name="uploaded_file"
                  id={
                    sidebar
                      ? "uploaded_file_sidebar"
                      : footer
                      ? "uploaded_file_footer"
                      : "uploaded_file_createPost"
                  }
                />
                <Image
                  className="  rounded-full hover:bg-white/10  hover:scale-110 transition-transform duration-100 p-2 "
                  size={"2.5em"}
                  color="gray"
                />
              </label>
              {/* <button>Submit</button> */}
            </form>
            <button
              className={`bg-blue-700 mt-1 ${
                text.length > 0 && text.length < 240
                  ? "bg-white hover:bg-white/80"
                  : "bg-white/50"
              } rounded-full p-1 pl-5 font-bold pr-5  transition-opacity text-black`}
              onClick={() =>
                text.length > 0 && text.length < 240 && handlePost()
              }
            >
              Post
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default CreatePost

{
  /* <LexicalTypeaheadMenuPlugin
              triggerFn={triggerMatch}
              options={["win", 2, 3, "hello"]}
              onQueryChange={setQuery}
              onSelectOption={(option, textNode, closeMenu) => {
                editor.update(() => {
                  const mentionNode = $createMentionNode(option.name)
                  if (textNode) {
                    textNode.replace(mentionNode)
                  }
                  closeMenu()
                })
              }}
              menuRenderFn={(
                anchorRef,
                { options, selectedIndex, selectOptionAndCleanUp }
              ) => (
                <MentionMenu
                  anchorRef={anchorRef}
                  selectedIndex={selectedIndex}
                  selectOptionAndCleanUp={selectOptionAndCleanUp}
                  options={options}
                />
              )}
            /> */
}

{
  /* <button onClick={() => setEmoji(true)}>Emoji</button> */
}
{
  /* {emoji && (
          <EmojiPicker
            theme="dark"
            emojiStyle="native"
            width={320}
            height={400}
            previewConfig={{ showPreview: false }}
            onEmojiClick={(emojiData) => console.log(emojiData.emoji)}
          />
        )} */
}
