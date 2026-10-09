import { useEffect, useState } from "react"
import { useParams, useNavigate, Link, useLocation } from "react-router"
import socket from "./socket"
import CreateComment from "./components/CreateComment"
import EditUser from "./components/EditUser"
import CreatePost from "./components/CreatePost"
import Sidebar from "./components/Sidebar"
import { useRef } from "react"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import SearchSidebar from "./components/SearchSidebar"
import { useInView } from "react-intersection-observer"
import { Heart, MessageCircle, Repeat, Trash, CalendarDays } from "lucide-react"
import NotificationListener from "./components/NotificationListener"
import Footer from "./components/Footer"

function ProfilePage() {
  const [posts, setPosts] = useState()
  const [user, setUser] = useState(null)
  const [client, setClient] = useState()
  const [users, setUsers] = useState()
  const [search, setSearch] = useState()
  const [openModalComment, setOpenModalComment] = useState()
  const [openModalUser, setOpenModalUser] = useState()
  const [image, setImage] = useState()
  const [error, setError] = useState()
  const [loading, setLoading] = useState(true)
  const [nextPages, setNextPages] = useState([])
  const [page, setPage] = useState(0)
  const [morePosts, setMorePosts] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [editData, setEditData] = useState({
    username: null,
    status: null,
    file: null,
  })
  const parentRef = useRef()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { ref, inView, entry } = useInView({
    triggerOnce: true,
  })
  const listRef = useRef(null)

  function handleMention(text) {
    const parts = text.split(/(\s+)/)
    const formattedText = parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/${part.slice(1)}`)
            }}
            key={index}
            className="text-[#1d9bf0] hover:underline"
          >
            {part}
          </span>
        )
      }
      return part
    })
    return <p>{formattedText}</p>
  }

  const rowVirtualizer = useWindowVirtualizer({
    count: page == 0 ? 20 + 1 : page * 20 + 1 + 20,
    estimateSize: () => 100,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    overscan: 5,
  })

  function handlePostLink(postId, username) {
    navigate(`/${username}/status/${postId}`)
  }

  function handleComment(e, postId) {
    e.stopPropagation()
    setOpenModalComment(postId)
  }

  function handleDate(timestamp) {
    const date = new Date(timestamp)
    const month = date.toLocaleString("en-US", { month: "long" })
    const year = date.getFullYear()
    return "user joined in " + month + " of " + year
  }
  function handleTime(timestamp) {
    const currentDate = new Date()
    const date = new Date(timestamp)
    const result = Math.floor((currentDate - date) / (1000 * 60 * 60))
    console.log(result)
    return result > 24
      ? date.getDate() +
          " " +
          date.toLocaleString("default", { month: "short" }) +
          "."
      : result < 25 && result > 0
      ? result + "h"
      : (currentDate - date) / (1000 * 60) < 1
      ? "just now"
      : Math.floor((currentDate - date) / (1000 * 60)) + "m"
  }

  function handleMorePosts(key) {
    console.log(page)
    const prevPage = page
    const replies = location.pathname.includes("/with_replies")
    const { username } = params
    if (posts.length == key && !loadingPosts) {
      setLoadingPosts(true)
      setPage((prevPage) => prevPage + 1)
      socket.emit("userpost", username, replies, page + 1, (res) => {
        console.log(res)
        if (res.status == "ok") {
          console.log(posts)
          setLoadingPosts(false)
          setPosts([...posts, ...res.data.posts])
        } else {
          setError(res.error.code)
        }
      })
    }
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

  function handleFollow() {
    user.followers[0]
      ? setUser({ ...user, followers: [] })
      : setUser({ ...user, followers: [{ followingId: user.id }] })

    socket.emit("follow", user.id)
  }
  console.log(posts)

  useEffect(() => {
    const replies = location.pathname.includes("/with_replies")
    const { username } = params
    console.log(morePosts)
    if (morePosts && !loadingPosts && !replies) {
      setLoadingPosts(true)
      socket.emit("userpost", username, replies, 0, (res) => {
        console.log(res)
        if (res.status == "ok") {
          console.log(posts)
          setUser(res.data.user)
          setClient(res.data.client)
          setImage(res.data.picture)
          setLoading(false)
          setMorePosts(false)
          setLoadingPosts(false)
          setPosts([...res.data.posts])
          // rowVirtualizer.measure()
          rowVirtualizer.scrollToOffset(0)
          setPage(0)
        } else {
          setError(res.error.code)
          setClient(res.client)
          setLoading(false)
        }
      })
    } else if (!loadingPosts && replies) {
      setLoadingPosts(true)
      socket.emit("userpost", username, replies, 0, (res) => {
        if (res.status == "ok") {
          setPosts([...res.data.posts])
          setUser(res.data.user)
          setClient(res.data.client)
          setImage(res.data.picture)
          // rowVirtualizer.measure()
          rowVirtualizer.scrollToOffset(0)
          setLoadingPosts(false)
          setPage(0)
          setMorePosts(true)
          setLoading(false)
        } else {
          setError(res.error.code)
          setClient(res.client)
          setLoading(false)
        }
      })
    } else if (user && username != user.username) {
      setLoading(true)
      socket.emit("userpost", username, replies, 0, (res) => {
        console.log(res)
        if (res.status == "ok") {
          console.log(posts)
          setUser(res.data.user)
          setClient(res.data.client)
          setImage(res.data.picture)
          setPosts([...res.data.posts])
          // rowVirtualizer.measure()
          rowVirtualizer.scrollToOffset(0)
          setLoading(false)
          setPage(0)
        } else {
          setError(res.error.code)
          setClient(res.client)
          setLoading(false)
        }
      })
    }
    socket.on("connect_error", (err) => {
      console.log(err)
      navigate("/")
    })
  }, [params, location, loading, morePosts])

  function handleLike(postId) {
    console.log(user.username)
    const newPosts = posts.map((element) => {
      return element.id == postId
        ? element.likedBy[0]
          ? { ...element, likes: element.likes - 1, likedBy: [] }
          : { ...element, likes: element.likes + 1, likedBy: [user.username] }
        : element
    })
    // const newPosts = posts.map((element) => {
    //   return element.id == postId
    //     ? { ...element, likes: element.likes + 1 }
    //     : element
    // })
    setPosts(newPosts)
    socket.emit("likedpost", postId)
  }
  function handleDelete(postId) {
    socket.emit("removePost", postId)
    setLoading(true)
    setMorePosts(true)
  }

  return loading ? (
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
  ) : (
    <div className=" scrollbar-track-gray-100/10   scrollbar-thumb-gray-500 bg-black text-white   flex align-middle grow gap-0.5">
      <Sidebar
        data={{
          picture: client.avatarUrl.data.publicUrl,
          username: client.username,
          receivedNotifications: client.receivedNotifications,
        }}
        setLoading={setMorePosts}
      ></Sidebar>
      {error ? (
        <p className="text-white text-3xl p-10 grow border max-w-170 border-[#16181C] max-sm:border-black max-sm:border-0 flex justify-center font-bold">
          {error}
        </p>
      ) : (
        <div className=" grow max-w-170">
          {/* {console.log(donePages)} */}
          <div className="text-white border  border-[#16181C]">
            {console.log(editData)}
            <div
              className="relative p-1 "
              style={{
                backgroundImage: `url(https://dachviqnhuhkkrzqnalk.supabase.co/storage/v1/object/public/AvatarUrls/360_F_906452980_i8kmnj7ihgfbWYGV9Jliy6mIR1irMwZQ.jpg)`,
              }}
            >
              <img
                className="max-h-50  rounded-full m-2 ml-4 mr-4 mt-0 aspect-square object-cover "
                src={editData.file ? URL.createObjectURL(editData.file) : image}
                alt=""
              />
            </div>
            <div>
              <div className="text-2xl mt-3 font-bold flex justify-between items-center pl-3">
                {editData.username || user.username}
                {user.username == client.username ? (
                  <button
                    className="bg-black text-white text-xl mr-3 mt-1 mb-1  border-gray-700 border  ml-3  outline-0 rounded-full p-1 font-bold pl-5 pr-5 hover:bg-white/10 transition-colors duration-200"
                    onClick={() => setOpenModalUser(true)}
                  >
                    Edit profile
                  </button>
                ) : user.followers[0] ? (
                  <button
                    className="bg-black text-white mt-1 mr-3  mb-1 border border-white  rounded-full p-1 pl-10 pr-10 ml-3 hover:bg-white/10 transition-all duration-150"
                    onClick={() => handleFollow()}
                  >
                    Following
                  </button>
                ) : (
                  <button
                    className="bg-white text-black mt-1   mr-3 rounded-full p-1 pl-10 pr-10 ml-3 hover:bg-white/80 transition-all duration-150"
                    onClick={() => handleFollow()}
                  >
                    Follow
                  </button>
                )}
              </div>
              <div className="pl-3 pb-1 pt-2">
                {editData.status || user.status || "no status"}
              </div>

              <div className="text-[#71767b] gap-1 flex pl-3">
                <CalendarDays size={"1.2em"} className="mt-0.5" />
                {handleDate(user.createdAt)}
              </div>
              <div className="flex gap-3 align-middle pl-3 pt-1">
                <Link
                  className="text-bold gap-1 hover:underline text-md flex"
                  to={`/${user.username}/following`}
                >
                  {user._count.following}
                  <p className="text-sm place-self-center text-[#71767b]   font-extralight">
                    following
                  </p>
                </Link>

                <Link
                  className="text-bold gap-1 hover:underline  text-md flex"
                  to={`/${user.username}/followers`}
                >
                  {user._count.followers}
                  <p className="text-sm place-self-center font-extralight text-[#71767b] ">
                    followers
                  </p>
                </Link>
              </div>

              <div className="text-white text-xl flex  pt-2">
                <div
                  onClick={() => navigate(`/${user.username}/`)}
                  className=" hover:bg-white/10 p-5  transition-colors duration-200 grow text-center "
                >
                  <Link
                    className={`${
                      !location.pathname.includes(`/with_replies`) &&
                      "border-b-blue-500 border-b-4 pb-4.5 -mb-4 rounded-md  text-bold border-black"
                    }`}
                    to={`/${user.username}`}
                  >
                    Posts
                  </Link>
                </div>
                <div
                  onClick={() => navigate(`/${user.username}/with_replies`)}
                  className=" hover:bg-white/10 p-5 transition-colors duration-200  grow text-center"
                >
                  <Link
                    className={`${
                      location.pathname.includes(
                        `/${user.username}/with_replies`
                      ) &&
                      "border-b-blue-500 border-b-4 pb-4.5  -mb-4 rounded-md text-bold border-black"
                    } `}
                    to={`/${user.username}/with_replies`}
                  >
                    Comments
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={parentRef}
            className=" flex-col bg-black box-border text-white  max-h-full"
          >
            <div
              className="border border-t-0 bg-black  border-[#16181C]"
              ref={listRef}
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const element = posts[virtualItem.index]
                // console.log(element)
                // console.log(posts.length)
                // console.log(virtualItem.index)
                return (
                  <div
                    className=" box-border "
                    key={virtualItem.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      // height: `${virtualItem.size}px`,
                      transform: `translateY(${
                        virtualItem.start - rowVirtualizer.options.scrollMargin
                      }px)`,
                    }}
                  >
                    {virtualItem.index != 0 &&
                    virtualItem.index % 20 == 0 &&
                    posts[virtualItem.index - 1] &&
                    virtualItem.index == posts.length ? (
                      <div
                        ref={ref}

                        // onClick={() => {
                        //   setPage((prevPage) => prevPage + 1)
                        //   setMorePosts(true)
                        // }}
                      >
                        {console.log(entry)}
                        {inView ? handleMorePosts(virtualItem.index) : "asdasd"}
                      </div>
                    ) : element == undefined ? null : (
                      <div
                        className="hover:bg-white/3 box-border border-b  border-[#16181C] transition-colors  wrap-anywhere duration-200"
                        key={element.id}
                      >
                        <div
                          ref={rowVirtualizer.measureElement}
                          data-index={virtualItem.index}
                          className="flex grow overflow-hidden  pt-1 "
                          onClick={(e) =>
                            handlePostLink(element.id, user.username)
                          }
                          key={element.id}
                        >
                          <img
                            className="max-h-10 rounded-full m-2 ml-4 mr-4 mt-2.5 aspect-square object-cover"
                            src={
                              editData.file
                                ? URL.createObjectURL(editData.file)
                                : image
                            }
                            alt=""
                          />
                          <div className="flex-col grow mr-4 mt-2">
                            <div className=" flex justify-between">
                              <div className="flex gap-3 font-bold">
                                <p className="hover:text-red-500 hover:underline">
                                  {user.username}
                                </p>
                                <p
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/${user.username}`)
                                  }}
                                  className="text-[#71767b] font-extralight"
                                >
                                  {handleTime(element.CreatedAt)}
                                </p>
                              </div>
                              {user.username == client.username && (
                                <Trash
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(element.id)
                                  }}
                                  className="hover:scale-110 transition-transform  duration-200"
                                  color="red"
                                  size={"1.3em"}
                                />
                              )}
                            </div>
                            <p className="font-light grow-0 ">
                              {handleMention(element.text)}
                            </p>
                            {element.imageUrl && (
                              <div
                                className="bg-cover bg-center  rounded-2xl aspect-square border border-gray-900 mb-1 mt-2"
                                style={{
                                  backgroundImage: `url(${element.imageUrl})`,
                                }}
                              ></div>
                              // <img
                              //   className="border  object-cover border-black rounded-2xl"
                              //   src={element.imageUrl}
                              //   alt=""
                              // />
                            )}

                            <div className="flex  pb-1 justify-evenly  ">
                              <div>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleLike(element.id)
                                  }}
                                  className={`${
                                    element.likedBy[0]
                                      ? "hover:text-red-500 "
                                      : "hover:text-red-500 "
                                  } flex font-extralight flex-row-reverse transition-colors duration-200   items-center
                                  ${
                                    element.likedBy[0]
                                      ? "text-red-400"
                                      : undefined
                                  }
                                    `}
                                >
                                  <p className="pt-1 select-none  peer">
                                    {element.likes != 0 && element.likes}
                                  </p>
                                  <Heart
                                    className={`peer-hover:bg-red-500/20 hover:text-red-500   peer-hover:text-red-500 p-2.5 overflow-visible justify-self-end-safe text-gray-700 hover:bg-red-500/20 transition-colors duration-200   rounded-full ${
                                      element.likedBy[0] && " text-red-500/0"
                                    } transition-all"`}
                                    fill={element.likedBy[0] && "red"}
                                    size={"2.5em"}
                                  />
                                </div>
                              </div>

                              <div
                                onClick={(e) => handleComment(e, element.id)}
                                className={`${
                                  element.max !== null
                                    ? "hover:text-blue-500 "
                                    : "hover:text-blue-500 "
                                } flex select-none transition-colors duration-200 flex-row-reverse "`}
                              >
                                <p className="place-self-center peer select-none hover:text-blue-500 transition-colors duration-200  font-extralight  pt-1">
                                  {element._count != 0 &&
                                    element._count.replies}
                                </p>
                                <MessageCircle
                                  size={"2.5em"}
                                  className=" text-gray-700 peer-hover:bg-blue-500/20 peer-hover:text-blue-500 hover:text-blue-500 p-2.5 overflow-visible pt-3 transition-colors duration-200  hover:bg-blue-500/20 rounded-full "
                                />
                              </div>
                              {/* <Repeat
                                size={"2.5em"}
                                className=" text-gray-700 hover:text-green-500 p-2.5  hover:bg-green-500/20 rounded-full "
                              /> */}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* <div
                      onClick={(e) => handlePostLink(element.id, user.username)}
                      key={element.id}
                    >
                      {user.username == client.username && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(element.id)
                          }}
                        >
                          Delete post
                        </button>
                      )}
                      <img className="max-h-5" src={image} alt="" />
                      <div>{user.username}</div>
                      <p>{element.CreatedAt}</p>
                      <p>{element.text}</p>
                      {element.imageUrl && (
                        <img src={element.imageUrl} alt="" />
                      )}
                      <div>
                        <p
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLike(element.id)
                          }}
                          className={element.likedBy[0] && "text-red-400"}
                        >
                          {element.likes}
                        </p>
                      </div>
                      <div>
                        <div>Comments {element._count.replies}</div>
                        <button onClick={(e) => handleComment(e, element.id)}>
                          Comment here
                        </button>
                      </div>
                    </div> */}
                  </div>
                )
              })}
            </div>
          </div>
          <Footer
            data={{
              picture: client.avatarUrl.data.publicUrl,
              username: client.username,
              receivedNotifications: client.receivedNotifications,
            }}
            setLoading={setMorePosts}
          ></Footer>
        </div>
      )}
      <SearchSidebar />
      <CreatePost
        isOpen={openModalComment}
        setOpenModal={setOpenModalComment}
        data={client.avatarUrl.data.publicUrl}
        client={client}
        setLoading={setLoading}
      />
      <EditUser
        data={{ ...user, image: image }}
        isOpen={openModalUser}
        setOpenModal={setOpenModalUser}
        setEditData={setEditData}
      ></EditUser>

      <NotificationListener />
    </div>
  )
}

export default ProfilePage
