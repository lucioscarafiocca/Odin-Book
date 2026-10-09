import { useEffect, useRef, useState } from "react"
import socket from "./socket"
import { useNavigate } from "react-router"
import Sidebar from "./components/Sidebar"
import CreateComment from "./components/CreateComment"
import { useWindowVirtualizer } from "@tanstack/react-virtual"
import CreatePost from "./components/CreatePost"
import SearchSidebar from "./components/SearchSidebar"
import { Heart, MessageCircle, Repeat } from "lucide-react"
import NotificationListener from "./components/NotificationListener"
import Footer from "./components/Footer"

function MainPage() {
  const [data, setData] = useState()
  // const [users, setUsers] = useState()
  // const [search, setSearch] = useState()
  const [cursor, setCursor] = useState(null)
  const [openModal, setOpenModal] = useState()
  const [text, setText] = useState()
  const [fetching, setFetching] = useState(false)
  const [key, setKey] = useState(true)
  const [count, setCount] = useState(60)
  // const [postNotification, setPostNotification] = useState(false)
  const navigate = useNavigate()
  const parentRef = useRef()
  const listRef = useRef(null)

  const rowVirtualizer = useWindowVirtualizer({
    count: count,
    overscan: 5,
    estimateSize: () => 100,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  // function handleSearch(name) {
  //   if (name != "" && /[a-z]/i.test(name)) {
  //     socket.emit("searchUser", name.toLowerCase().trim(), (res) => {
  //       setUsers(res.data.users)
  //       setSearch(name)
  //       // res.data[0] ? setUsers(res.data.users) : setUsers(["no user found"])
  //       console.log(res)
  //     })
  //   } else {
  //     setUsers(undefined)
  //   }
  // }

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
  function handlePostLink(postId, username) {
    navigate(`/${username}/status/${postId}`)
  }

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

  function handleLike(postId) {
    const newPosts = data.posts.map((element) => {
      return element.id == postId
        ? element.max
          ? { ...element, likes: element.likes - 1, max: null }
          : { ...element, likes: element.likes + 1, max: true }
        : element
    })
    // console.log(data.user.receivedNotifications[0].post.likedBy.length == 1)
    // const notificationPosts = data.user.receivedNotifications.map((element) => {
    //   return element.postId == postId
    //     ? element.post.likedBy.length == 1
    //       ? {
    //           ...element,
    //           post: {
    //             ...element.post,
    //             likes: element.post.likes - 1,
    //             likedBy: [],
    //           },
    //         }
    //       : {
    //           ...element,
    //           post: {
    //             ...element.post,
    //             likes: element.post.likes + 1,
    //             likedBy: [element.sender.username],
    //           },
    //         }
    //     : element
    // })

    // console.log(notificationPosts)
    // const newPosts = posts.map((element) => {
    //   return element.id == postId
    //     ? { ...element, likes: element.likes + 1 }
    //     : element
    // })
    setData({
      ...data,
      posts: newPosts,
      // user: { ...data.user, receivedNotifications: notificationPosts },
    })
    socket.emit("likedpost", postId)
  }

  function handleComment(e, postId) {
    e.stopPropagation()
    setOpenModal(postId)
  }

  function triggerNotification() {}

  function handleUpdateFeed(cursor) {
    socket.emit("data", { cursor: 46, type: "bottom" }, (response) => {
      if ((response.status = "ok")) {
        setData(response.data)
      }
      console.log(response)
    })
  }
  const virtualItem = rowVirtualizer.getVirtualItems()
  function roundDownTo20(num) {
    return Math.floor(num / 20) * 20
  }

  console.log(virtualItem)
  data && console.log(data.posts)
  // !socket.id && socket.connect()
  useEffect(() => {
    console.log(data)
    const lastItem = virtualItem ? virtualItem[virtualItem.length - 1] : null
    const firstItem = virtualItem ? virtualItem[0] : null
    console.log(socket.id)
    !data &&
      socket.emit("data", { cursor: null, type: "bottom" }, (response) => {
        if ((response.status = "ok")) {
          setData(response.data)
        }
        console.log(response)
      })

    // socket.on("postNotification", (data) => {
    //   setPostNotification(true)
    //   timer = setTimeout(() => {
    //     setPostNotification(false)
    //   }, 1500)
    //   console.log(data)
    // })
    // socket.on("newPosNotification", (data) => {
    //   console.log("update for new posts")
    // })
    socket.on("connect_error", (err) => {
      console.log(err)
      navigate("/")
    })
    console.log(key)

    if (
      firstItem &&
      data &&
      data.posts.length >= 40 &&
      data.posts[firstItem.index] == null &&
      !fetching
    ) {
      setFetching(true)
      // setKey(data.posts.length)
      socket.emit(
        "data",
        { cursor: data.posts[data.posts.length - 40].id, type: "top" },
        (response) => {
          const last20 = data.posts.slice(data.posts.length - 20, 0)
          const array =
            lastItem.index + 2 - 60 > 0
              ? Array(lastItem.index + 2 - 60).fill(null)
              : []
          const newArray = [...response.data.posts, ...last20]
          if ((response.status = "ok")) {
            const newPosts = [...array, ...newArray]
            console.log(newPosts)
            setData({ ...response.data, posts: newPosts })
            setFetching(false)
          }
        }
      )
    }
    if (
      lastItem &&
      data &&
      lastItem.index > data.posts.length - 3 &&
      lastItem.index > 0 &&
      virtualItem.length >= 19 &&
      !fetching &&
      data.posts.length % 20 === 0
    ) {
      setFetching(true)
      // setKey(data.posts.length)
      socket.emit(
        "data",
        {
          cursor:
            data.posts[
              data.posts.length -
                (data.posts.length % 20 == 0 ? 1 : (data.posts.length % 20) - 1)
            ].id,
          type: "bottom",
        },
        (response) => {
          if ((response.status = "ok")) {
            const first20 = data.posts.slice(20, data.posts.length)
            console.log(first20)
            const newArray = [...first20, ...response.data.posts]
            console.log(newArray)
            console.log(lastItem.index)
            const array =
              lastItem.index + 2 >= 40 &&
              Array(
                lastItem.index + 2 - 40 == 0 || lastItem.index + 2 - 40 < 20
                  ? 20
                  : roundDownTo20(lastItem.index + 2 - 40)
              ).fill(null)
            console.log(array)
            const newPosts =
              lastItem.index + 2 >= 40
                ? [...array, ...newArray]
                : [...data.posts, ...response.data.posts]
            console.log(newPosts)
            setData({ ...response.data, posts: newPosts })
            setFetching(false)
          }
          console.log(response)
        }
      )
    }

    return () => {
      socket.off("123")
    }
  }, [virtualItem])

  return (
    <>
      {!data ? (
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
        <div className="scrollbar-track-gray-100/10 scrollbar-thumb-gray-500  bg-black text-white   flex align-middle grow gap-0.5">
          {/* {postNotification && (
            <div
              className={`absolute top-11/12 left-6/12 bg-blue-600 p-3  text-white shadow-lg transition-opacity duration-1000 ease-in-out ${
                postNotification ? "opacity-100" : "opacity-0"
              } `}
            >
              Post created!!
            </div>
          )} */}
          <Sidebar
            data={{
              picture: data.picture,
              username: data.user.username,
              receivedNotifications: data.user.receivedNotifications,
            }}
          ></Sidebar>
          <div
            ref={parentRef}
            className=" flex-col text-white grow-2 max-w-180   max-h-full"
          >
            <div
              ref={listRef}
              className="border box-border  border-[#16181C]"
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const element = data.posts[virtualItem.index]

                return (
                  <div
                    className=" box-border"
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
                    {/* {virtualItem.index % 20 === 0 && virtualItem.index !== 0 ? (
                      setFetching(element.id) // handleUpdateFeed(element.id)
                    ) : ( */}
                    {element && (
                      <div
                        className="hover:bg-white/3 transition-colors border-b border-[#16181C]  wrap-anywhere duration-200"
                        key={element.id}
                      >
                        <div
                          ref={rowVirtualizer.measureElement}
                          data-index={virtualItem.index}
                          className="flex grow overflow-hidden  pt-1 "
                          onClick={(e) =>
                            handlePostLink(element.id, element.username)
                          }
                          key={element.id}
                        >
                          <img
                            className="max-h-10 rounded-full m-2  ml-4 mr-4 mt-2.5 aspect-square object-cover"
                            src={element.avatarUrl}
                            alt=""
                          />
                          <div className="flex-col grow mr-4 mt-2">
                            <div className=" flex gap-3 font-bold">
                              <p
                                onClick={(e) => {
                                  e.stopPropagation()
                                  navigate(`/${element.username}`)
                                }}
                                className="hover:text-red-500 hover:underline"
                              >
                                {element.username}
                              </p>
                              <p className="text-[#71767b] font-extralight">
                                {handleTime(element.CreatedAt)}
                              </p>
                            </div>
                            <p className="font-light grow-0 ">
                              {handleMention(element.text)}
                            </p>
                            {element.imageUrl && (
                              <div
                                className="bg-cover rounded-2xl aspect-square border border-gray-900 mb-1 mt-2"
                                style={{
                                  backgroundImage: `url(${element.imageUrl})`,
                                }}
                              >
                                {/* <img
                                  className="border  object-cover border-black rounded-2xl"
                                  src={element.imageUrl}
                                  alt=""
                                /> */}
                              </div>
                            )}
                            <div className="flex  pb-1 justify-evenly  ">
                              <div>
                                <p
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleLike(element.id)
                                  }}
                                  className={`${
                                    element.max !== null
                                      ? "hover:text-red-500 "
                                      : "hover:text-red-500 "
                                  } flex font-extralight flex-row-reverse transition-colors duration-200   items-center
                                  ${
                                    element.max !== null
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
                                      element.max !== null && " text-red-500/0"
                                    } transition-all"`}
                                    fill={element.max !== null && "red"}
                                    size={"2.5em"}
                                  />
                                </p>
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
                                  {element.count != 0 && element.count}
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
                        {/* {index == 19 && (
                        <button onClick={() => handleUpdateFeed(element.id)}>
                          Add more posts
                        </button>
                      )} */}
                      </div>
                    )}
                    {/* )} */}
                  </div>
                )
              })}
            </div>
            {/* {data.posts.map((element, index) => {
              return (
                <div key={element.id}>
                  <div
                    onClick={(e) =>
                      handlePostLink(element.id, element.username)
                    }
                    key={element.id}
                  >
                    <div>{element.username}</div>
                    <p>{element.CreatedAt}</p>
                    <p>{element.text}</p>
                    <div>
                      <p
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(element.id)
                        }}
                        className={
                          element.max !== null ? "text-red-400" : undefined
                        }
                      >
                        {element.likes}
                      </p>
                    </div>

                    <div>
                      <button onClick={(e) => handleComment(e, element.id)}>
                        Comment here
                      </button>
                    </div>
                  </div>
                  {index == 19 && (
                    <button onClick={() => handleUpdateFeed(element.id)}>
                      Add more posts
                    </button>
                  )}
                </div>
              )
            })} */}
            <Footer
              data={{
                picture: data.picture,
                username: data.user.username,
                receivedNotifications: data.user.receivedNotifications,
              }}
            ></Footer>
          </div>
          <SearchSidebar />
          <CreatePost
            isOpen={openModal}
            setOpenModal={setOpenModal}
            data={data.picture}
          />

          <NotificationListener />
          {/* <CreateComment
            isOpen={openModal}
            setOpenModal={setOpenModal}
          ></CreateComment> */}
        </div>
      )}
    </>
  )
}

export default MainPage
