import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router"
import socket from "../socket"
import CreatePost from "./CreatePost"
import { logOut } from "../jwtlib"
import NotificationListener from "./NotificationListener"
import { House, User, Bell, Circle, Search, LogOut, Plus } from "lucide-react"

function Footer({ data, setLoading }) {
  const [openModal, setOpenModal] = useState(false)
  const [notification, setNotification] = useState()
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const location = useLocation()
  useEffect(() => {
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
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY < 10) {
        setIsVisible(true)
        setLastScrollY(currentScrollY)
        return
      }
      console.log(lastScrollY)
      console.log(currentScrollY)

      if (currentScrollY > lastScrollY) {
        setIsVisible(false) // Scrolling down
      } else {
        setIsVisible(true) // Scrolling up
      }

      setLastScrollY(currentScrollY)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      socket.off("notification")
      socket.off("removeNotification")
      socket.off("cleanNotifications")
    }
  }, [lastScrollY])
  console.log(data)
  return (
    <>
      <div
        className={`  border-t border-[#16181C] items-end max-sm:block max-sm:invisible z-20 hidden sticky bottom-0 bg-black p-1  scale-0 transition-transform :duration-300 origin-bottom justify-between ${
          isVisible ? "max-sm:visible max-sm:scale-100 " : " "
        } text-white`}
      >
        <div className="flex gap-1   relative justify-between  ">
          <Link
            className={`flex gap-4 ${
              location.pathname.includes("home") ? "font-bold" : "font-light"
            } items-center text-xl hover:bg-white/10 transition-colors  duration-200 rounded-full  `}
            to="/home"
          >
            <House
              className="pl-2 ml-3"
              size={"1.7em"}
              fill={location.pathname.includes("home") ? "white" : undefined}
            />
          </Link>
          <Link
            className={`flex gap-4 items-center ${
              !location.pathname.includes("home") &&
              !location.pathname.includes("notification")
                ? "font-bold"
                : "font-light"
            } text-xl hover:bg-white/10 transition-colors duration-200 rounded-full `}
            to={`/${data && data.username}`}
          >
            <User
              className="pl-1 pr-1 "
              size={"1.8em"}
              fill={
                !location.pathname.includes("home") &&
                !location.pathname.includes("notification")
                  ? "white"
                  : undefined
              }
            />
          </Link>
          <Link
            className={`flex gap-4 ${
              location.pathname.includes("notification")
                ? "font-bold"
                : "font-light"
            } items-end text-xl hover:bg-white/10 duration-200 rounded-full  `}
            state={data.receivedNotifications}
            to="/notifications"
          >
            <div className="relative">
              <Bell
                className="pl-1 pr-1 pb-1 "
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
                    (notification || data.receivedNotifications.length) == 0 &&
                    "hidden"
                  }`}
                >
                  <svg
                    className="absolute -top-2 left-4"
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.2em"
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
                  <p className="absolute text-sm  -top-1 left-6">
                    {notification || data.receivedNotifications.length}
                  </p>
                </div>
              ) : (
                <div>
                  <svg
                    className="absolute -top-3.5 left-2"
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.8em"
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

                  <p className="absolute text-xs -top-0.5 left-4.5">
                    {(notification || data.receivedNotifications.length) < 20
                      ? notification || data.receivedNotifications.length
                      : "20+"}
                  </p>
                </div>
              )}
            </div>
          </Link>

          <Link
            className={`flex gap-4 ${
              location.pathname.includes("home") ? "font-bold" : "font-light"
            } items-center text-xl hover:bg-white/10 transition-colors  duration-200 rounded-full  `}
            to={"/search?q="}
          >
            <Search className="pl-2" size={"1.7em"} />
          </Link>

          <CreatePost
            setLoading={setLoading}
            data={data}
            isOpen={openModal}
            setOpenModal={setOpenModal}
            client={data.username}
            footer={true}
          ></CreatePost>

          <button
            onClick={() => {
              logOut()
              window.location.reload()
            }}
            className=" text-xl mr-2 text-black place-self-center  outline-0 rounded-full p-2.5 font-bold  hover:bg-white/90 transition-opacity"
          >
            <LogOut color="white" />
          </button>
          <button
            className="bg-white absolute right-0 bottom-15 justify-center place-self-center text-xl text-black mr-2  outline-0 rounded-full p-3 font-bold  hover:bg-white/90 transition-colors"
            onClick={() => setOpenModal("post")}
          >
            <Plus />
          </button>
        </div>
      </div>
    </>
  )
}

export default Footer
