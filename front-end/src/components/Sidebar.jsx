import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router"
import socket from "../socket"
import CreatePost from "./CreatePost"
import { logOut } from "../jwtlib"
import NotificationListener from "./NotificationListener"
import { House, User, Bell, Circle } from "lucide-react"

function Sidebar({ data, setLoading }) {
  const [openModal, setOpenModal] = useState(false)
  const [notification, setNotification] = useState()
  const location = useLocation()
  useEffect(() => {
    console.log(data)
    // socket.emit("data")
    !notification && setNotification(data.receivedNotifications.length)
    socket.on("newNotification", (data) => {
      console.log(notification)
      setNotification((prevNotification) => {
        return prevNotification + 1
      })
      console.log(data)
    })
    socket.on("removeNotification", (data) => {
      setNotification((prevNotification) => {
        return prevNotification - 1
      })
      console.log(data)
    })
    socket.on("cleanNotifications", (data) => {
      setNotification(0)
    })

    return () => {
      socket.off("newNotification")
      socket.off("removeNotification")
      socket.off("cleanNotifications")
    }
  }, [])
  console.log(data)
  return (
    <>
      <div className=" flex max-sm:hidden  flex-col items-end  grow-2 p-5 mr-6 h-dvh justify-between  text-white">
        <div className="flex fixed gap-1  m  flex-col ">
          <Link
            className={`flex gap-4 ${
              location.pathname.includes("home") ? "font-bold" : "font-light"
            } items-center text-xl hover:bg-white/10 transition-colors  duration-200 rounded-full p-2 `}
            to="/home"
          >
            <House
              className="pl-2"
              size={"1.7em"}
              fill={location.pathname.includes("home") ? "white" : undefined}
            />
            <p className="pl-1">Home</p>
          </Link>
          <Link
            className={`flex gap-4 items-center ${
              !location.pathname.includes("home") &&
              !location.pathname.includes("notification")
                ? "font-bold"
                : "font-light"
            } text-xl hover:bg-white/10 transition-colors duration-200 rounded-full p-2`}
            to={`/${data && data.username}`}
          >
            <User
              className="pl-2 "
              size={"1.8em"}
              fill={
                !location.pathname.includes("home") &&
                !location.pathname.includes("notification")
                  ? "white"
                  : undefined
              }
            />
            Profile
          </Link>
          <Link
            className={`flex gap-4 ${
              location.pathname.includes("notification")
                ? "font-bold"
                : "font-light"
            } items-center text-xl hover:bg-white/10 duration-200 rounded-full p-2 pr-4`}
            state={data.receivedNotifications}
            to="/notifications"
          >
            <div className="relative">
              <Bell
                className="pl-2 "
                size={"1.8em"}
                fill={
                  location.pathname.includes("notification")
                    ? "white"
                    : undefined
                }
              />

              {(notification || data.receivedNotifications.length) < 10 ? (
                <div
                  className={`${
                    notification ||
                    (data.receivedNotifications.length == 0 && "hidden")
                  }`}
                >
                  <svg
                    className="absolute -top-2 left-4.5"
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.25em"
                    height="1.25em"
                    viewBox="0 0 24 24"
                    fill="#1591EA"
                    stroke="black"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                  <p className="absolute text-sm  -top-1 left-6.5">
                    {notification || data.receivedNotifications.length}
                  </p>
                </div>
              ) : (
                <div>
                  <svg
                    className="absolute -top-3.5 left-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="2em"
                    height="2em"
                    viewBox="0 0 24 24"
                    fill="#1591EA"
                    stroke="black"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="12" x="2" y="6" rx="6" />
                  </svg>

                  <p className="absolute text-sm  -top-1 left-5">
                    {(notification || data.receivedNotifications.length) < 20
                      ? notification || data.receivedNotifications.length
                      : "20+"}
                  </p>
                </div>
              )}
            </div>
            Notifications
          </Link>

          <button
            className="bg-white text-xl text-black mt-5 ml-3 grow outline-0 rounded-full p-2.5 font-bold pl-10 pr-10 hover:bg-white/90 transition-colors"
            onClick={() => setOpenModal("post")}
          >
            Post
          </button>
          <CreatePost
            setLoading={setLoading}
            data={data}
            isOpen={openModal}
            setOpenModal={setOpenModal}
            client={data.username}
            sidebar={true}
          ></CreatePost>

          <button
            onClick={() => {
              logOut()
              window.location.reload()
            }}
            className="bg-white text-xl  text-black mt-5 ml-3 outline-0 rounded-full p-2.5 font-bold pl-10 pr-10 hover:bg-white/90 transition-opacity"
          >
            Log Out
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
