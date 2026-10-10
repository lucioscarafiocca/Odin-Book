import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import socket from "./socket"
import CreateComment from "./components/CreateComment"
import Notification from "./components/Notification"
import Sidebar from "./components/Sidebar"
import CreatePost from "./components/CreatePost"
import SearchSidebar from "./components/SearchSidebar"
import { ArrowLeft } from "lucide-react"
import Footer from "./components/Footer"
import NotificationListener from "./components/NotificationListener"

function Notifications() {
  const [data, setData] = useState(false)
  const [openModal, setOpenModal] = useState()
  const [loading, setLoading] = useState()
  const [users, setUsers] = useState()
  const [search, setSearch] = useState()
  const [user, setUser] = useState(false)
  // const location = useLocation()
  const navigate = useNavigate()

  function handlePostLink(postId, username) {
    navigate(`/${username}/status/${postId}`)
  }

  function handleSearching() {
    navigate(`/search?q=${search}`)
  }

  function handleSearch(name) {
    if (name != "" && /[a-z]/i.test(name)) {
      socket.emit("searchUser", name.toLowerCase().trim(), (res) => {
        setUsers(res.data.users)
        setSearch(name)
        // res.data[0] ? setUsers(res.data.users) : setUsers(["no user found"])
        console.log(res)
      })
    } else {
      setUsers(undefined)
    }
  }

  function handleComment(e, postId) {
    e.stopPropagation()
    setOpenModal(postId)
  }

  function handleLike(postId) {
    console.log(data)
    const newPosts = data.map((element) => {
      return element.postId == postId
        ? element.post.likedBy.length == 1
          ? {
              ...element,
              post: {
                ...element.post,
                likes: element.post.likes - 1,
                likedBy: [],
              },
            }
          : {
              ...element,
              post: {
                ...element.post,
                likes: element.post.likes + 1,
                likedBy: [element.sender.username],
              },
            }
        : element
    })
    console.log(newPosts)
    setData(newPosts)
    socket.emit("likedpost", postId)
  }

  useEffect(() => {
    // const data = location.state
    socket.emit("getNotifications", (response) => {
      console.log(response)
      setData(response.data.fullNotifications)
      setUser(response.data.user)
    })
    socket.on("connect_error", (err) => {
      console.log(err)
      navigate("/")
    })
    // setData(data)
  }, [])
  console.log(data[0])
  return (
    <>
      {data ? (
        <div className=" h-full  max-sm:min-h-lvh max-sm:flex-col bg-black text-white flex align-middle grow gap-0.5">
          {user && (
            <Sidebar
              data={{
                picture: user.avatarUrl.data.publicUrl,
                username: user.username,
                receivedNotifications: user.receivedNotifications,
              }}
              setLoading={setLoading}
            ></Sidebar>
          )}
          <div className=" border   border-[#16181C] flex-col max-sm:border-black max-sm:border-0 text-white grow  max-h-full">
            <div className=" flex font-bold grow text-2xl sticky top-0 bg-black/70 backdrop-blur-md gap-7 p-3  ">
              <button className="pl-2" onClick={() => navigate(-1)}>
                <ArrowLeft className="hover:scale-130 transition-transform duration-200" />
              </button>
              Notifications
            </div>
            <div className="  ">
              {data && data[0] ? (
                data.map((element) => {
                  return (
                    <Notification
                      key={element.id}
                      element={element}
                      setOpenModal={setOpenModal}
                      setData={setData}
                      data={data}
                    />
                  )
                })
              ) : (
                <p className="p-10 text-center font-bold text-3xl">
                  No notifications
                </p>
              )}
            </div>

            {/* <CreateComment
          isOpen={openModal}
          setOpenModal={setOpenModal}
          ></CreateComment> */}
          </div>
          <Footer
            data={{
              picture: user.avatarUrl.data.publicUrl,
              username: user.username,
              receivedNotifications: user.receivedNotifications,
            }}
            setLoading={setLoading}
          ></Footer>
          <SearchSidebar />
          <CreatePost
            isOpen={openModal}
            setOpenModal={setOpenModal}
            data={user && user.avatarUrl.data.publicUrl}
          />
          <NotificationListener />
        </div>
      ) : (
        <div
          className="h-lvh bg-black flex items-center justify-center grow  "
          role="status"
        >
          <svg
            aria-hidden="true"
            class="w-20 h-20 text-neutral-tertiary animate-spin fill-blue-500 text-white"
            viewBox="0 0 100 101"
            fill="none"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      )}
    </>
  )
}

export default Notifications

// return (
//   <div
//     onClick={(e) =>
//       handlePostLink(element.post.id, element.sender.username)
//     }
//     key={element.post.id}
//   >
//     <img src={element.sender.avatarUrl} alt="" />
//     <div>{element.sender.username}</div>
//     <p>{element.post.CreatedAt}</p>
//     <p>{element.post.text}</p>
//     <div>
//       <p
//         onClick={(e) => {
//           e.stopPropagation()
//           handleLike(element.post.id)
//         }}
//         className={
//           element.post.likedBy[0] ? "text-red-400" : undefined
//         }
//       >
//         {element.post.likes}
//       </p>
//     </div>
//     <div>
//       <button onClick={(e) => handleComment(e, element.postId)}>
//         Comment here
//       </button>
//     </div>
//   </div>
// )
