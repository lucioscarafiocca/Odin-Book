import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import socket from "../socket"
import axios from "axios"
import { attachInterceptor } from "../jwtlib"
import { SwitchCamera, X } from "lucide-react"
function EditUser({ isOpen = false, setOpenModal, data, setEditData }) {
  const [username, setUsername] = useState()
  const [status, setStatus] = useState()
  const [files, setFile] = useState()
  const navigate = useNavigate()
  const dialog = useRef(null)
  const inputRef = useRef(null)
  const [picture, setPicture] = useState()

  function handleClickOutside(e) {
    console.log(e.target)
    if (e.target === dialog.current) {
      setOpenModal(false)
    }
  }
  function handleSave() {
    console.log(status)
    if (username || status || status == "" || files) {
      socket.emit(
        "userSave",
        username || data.username,
        status == "" ? "" : status || data.status
      )
      setEditData({
        username: username || null,
        status: status == "" ? "" : status || null,
        file: files,
      })
      setOpenModal(false)
    }
    setOpenModal(false)
  }
  function handlePicture(file) {
    attachInterceptor()
    const formData = new FormData()
    formData.append("file", file)
    // formData.append("username", username)

    setFile(file)
    const url = URL.createObjectURL(file)
    setPicture(url)
    console.log(url)
    axios
      .post("http://localhost:3000/upload", formData)
      .then((res) => console.log(res))
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    if (isOpen) {
      console.log(isOpen)
      dialog.current.showModal()
    } else {
      console.log(isOpen)
      setTimeout(() => {
        dialog.current.close()
      }, 200)
    }
    socket.on()
  }, [isOpen])

  return (
    <>
      <dialog
        onClick={(e) => handleClickOutside(e)}
        className={`overflow-visible w-150 backdrop:bg-black/60    max-sm:left-5 max-sm:top-20 flex-col relative top-[28%] text-white bg-[#141414] left-[38%] rounded-2xl open:starting:scale-75   open:starting:opacity-0 pb-4 pt-2  ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-75"
        }  transition-all duration-300 post-dialog`}
        ref={dialog}
        onCancel={() => setOpenModal(false)}
      >
        <div className="flex pb-1 ">
          <button
            className=" text-black   rounded-full  p-1  pr-5 transition-all duration-150"
            onClick={() => setOpenModal(false)}
          >
            <X
              color="white"
              size="2.4em"
              className="rounded-full hover:bg-white/10  transition-colors duration-2s00 ease-in-out p-2 "
            />
          </button>
          <p className="text-2xl place-self-center grow font-bold">
            Edit profile
          </p>
          <div className="place-self-center">
            <button
              className={` text-black mr-3  rounded-full p-1  pl-10 pr-10 hover:bg-white/80 ${
                status && status.length > 240 ? "bg-white/30" : "bg-white"
              } transition-all duration-150"`}
              onClick={() => status && status.length < 240 && handleSave()}
            >
              Save
            </button>
          </div>
        </div>
        <div
          style={{
            backgroundImage: `url(https://dachviqnhuhkkrzqnalk.supabase.co/storage/v1/object/public/AvatarUrls/360_F_906452980_i8kmnj7ihgfbWYGV9Jliy6mIR1irMwZQ.jpg)`,
          }}
          className="relative pt-2 pb-2 "
        >
          <img
            className="max-h-25 rounded-full m-2 ml-2 mr-4   aspect-square object-cover "
            src={picture || data.image}
            alt=""
          />
          <label htmlFor={"uploaded_file_editProfile"}>
            <input
              className="hidden"
              ref={inputRef}
              onChange={(e) => {
                handlePicture(e.target.files[0])
              }}
              type="file"
              name="uploaded_file"
              id={"uploaded_file_editProfile"}
            />
            <SwitchCamera
              size="2em"
              className="absolute top-12 left-10 bg-white/50 rounded-full p-1 hover:bg-white/10"
            />
          </label>
        </div>
        <div className="flex-col flex grow gap-5 p-5 pb-10">
          {/* <form action="" onSubmit={(e) => handlePicture(e)}>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            name="uploaded_file"
          />
          <button>Save profile picture</button>
        </form> */}
          <label className="relative flex flex-col     " htmlFor="username">
            <input
              className="  peer outline-0 border-2 align-text-bottom rounded-md pl-2 text-xl pt-4.5 pb-1 border-gray-400/20  text-white hover:border-[#1d9bf0]  focus:border-[#1d9bf0] transition-colors"
              type="text"
              placeholder=""
              onChange={(e) => setUsername(e.target.value)}
              defaultValue={data.username}
              id="username"
            />
            <div className="absolute peer-focus:text-[#1d9bf0] left-2 pt-1 text-[1.1em] top-1.5 text peer-focus:-translate-y-1.5 peer-focus:scale-75 origin-top-left  peer-not-placeholder-shown:scale-75   peer-not-placeholder-shown:-translate-y-1.5   transition-transform text-gray-400/30">
              Username
            </div>
          </label>
          <label
            className="relative flex flex-col  border rounded-md border-[#16181C] "
            htmlFor="status"
          >
            <input
              className=" peer outline-0 border-2  align-text-bottom rounded-md pl-2 text-xl pt-4.5 pb-1 border-gray-400/20 text-white hover:border-[#1d9bf0] focus:border-[#1d9bf0] transition-colors"
              type="text"
              placeholder=""
              onChange={(e) => setStatus(e.target.value)}
              defaultValue={data.status}
              id="status"
            />
            <div className="absolute peer-focus:text-[#1d9bf0] left-2 pt-1 text-[1.1em] top-1.5 text- peer-focus:-translate-y-1.5 peer-focus:scale-75 origin-top-left  peer-not-placeholder-shown:scale-75   peer-not-placeholder-shown:-translate-y-1.5   transition-transform text-gray-400/30">
              Status
            </div>
          </label>
        </div>
        {/* <label htmlFor="">
          Location
          <input type="text" defaultValue={data.username} />
        </label> */}
      </dialog>
    </>
  )
}

export default EditUser
