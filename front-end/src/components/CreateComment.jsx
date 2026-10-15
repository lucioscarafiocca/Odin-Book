import { useEffect, useRef, useState } from "react"
import socket from "../socket"
function CreateComment({ isOpen = false, setOpenModal }) {
  const [text, setText] = useState()
  const dialog = useRef(null)

  function handlePost() {
    socket.emit("createPost", text, isOpen)
  }

  useEffect(() => {
    if (isOpen) {
      dialog.current.showModal()
    } else {
      dialog.current.close()
    }
  }, [isOpen])

  return (
    <>
      <dialog
        onClick={(e) => e.stopPropagation()}
        className="bg-white absolute top-100 left-200 size-96"
        ref={dialog}
      >
        <button
          onClick={() => {
            setOpenModal(false)
          }}
        >
          close
        </button>
        <textarea
          onChange={(e) => setText(e.target.value)}
          placeholder="whats going on?"
          className="border br-black name"
          id=""
          cols="30"
          rows="10"
        ></textarea>

        <button
          onClick={(e) => {
            handlePost()
          }}
        >
          Post
        </button>
      </dialog>
    </>
  )
}

export default CreateComment
