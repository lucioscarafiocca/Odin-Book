import { useEffect, useState } from "react"
import socket from "../socket"
import { useNavigate } from "react-router"

function NotificationListener() {
  const [postNotification, setPostNotification] = useState(false)
  const [errorNotification, setErrorNotification] = useState(false)
  const [message, setMessage] = useState("")
  const [data, setData] = useState()
  const navigate = useNavigate()

  useEffect(() => {
    let timer
    socket.on("postNotification", (data) => {
      setData(data)
      setMessage("Post was created!")
      setPostNotification(true)
      timer = setTimeout(() => {
        setPostNotification(false)
      }, 2000)
    })
    socket.on("errorNotification", (data) => {
      setMessage(data)
      setErrorNotification(true)
      timer = setTimeout(() => {
        setErrorNotification(false)
      }, 2000)
      console.log(data)
    })
    // socket.on("deleteNotification", () => {
    //   console.log("DELETE")
    //   setMessage("post was deleted")
    //   setPostNotification(true)
    //   timer = setTimeout(() => {
    //     setPostNotification(false)
    //   }, 1500)
    // })
    return () => {
      console.log("COMMENT")
      socket.off("postNotification")
      socket.off("notification")
      socket.off("errorNotification")
      clearTimeout(timer)
    }
  }, [])

  return (
    <>
      <div
        className={`fixed font-extralight top-11/12 left-6/12 z-200  max-sm:opacity-95 max-sm:top-7 max-sm:left-3/12       flex gap-2 rounded-sm pl-5 pr-5 bg-[#1d9bf0] p-3 opacity-100 text-white shadow-lg transition-opacity duration-1000 ease-in-out ${
          postNotification ? "visible" : "hidden"
        } `}
      >
        {message}
        <p
          onClick={() => {
            navigate(`/${data.username}/status/${data.id}`)
          }}
          className="font-bold hover:underline"
        >
          See
        </p>
      </div>
      <div
        className={`fixed font-extralight top-11/12 left-5/12 max-sm:top-7 z-200 max-sm:left-2/12 max-sm:opacity-95 flex gap-2 rounded-sm pl-5 pr-5 bg-red-700 p-3 opacity-100 text-white shadow-lg transition-opacity duration-1000 ease-in-out ${
          errorNotification ? "visible" : "hidden"
        } `}
      >
        {message}
      </div>
    </>
  )
}

export default NotificationListener
