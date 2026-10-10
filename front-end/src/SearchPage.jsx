import { useEffect, useState, useRef } from "react"
import socket from "./socket"
import { useSearchParams, useNavigate } from "react-router"
import Sidebar from "./components/Sidebar"
import CreatePost from "./components/CreatePost"
import SearchSidebar from "./components/SearchSidebar"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useInView } from "react-intersection-observer"
import { Heart, MessageCircle, Trash, ArrowLeft, Search } from "lucide-react"
import NotificationListener from "./components/NotificationListener"
import Footer from "./components/Footer"

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState()
  const [client, setClient] = useState(false)
  const [openModal, setOpenModal] = useState()
  const [users, setUsers] = useState()
  const [search, setSearch] = useState()
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [suggestions, setSuggestions] = useState()
  const [loadingPosts, setLoadingPosts] = useState(false)
  const navigate = useNavigate()
  const parentRef = useRef()
  const menuRef = useRef()

  const { ref, inView, entry } = useInView({
    triggerOnce: true,
  })

  const rowVirtualizer = useVirtualizer({
    count: page == 0 ? 20 + 1 : 20 * page + 20 + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 150,
    overscan: 5,
  })

  function handleMorePosts(key) {
    const search = searchParams.get("q")
    if (data.length == key && !loadingPosts) {
      setLoadingPosts(true)
      console.log(data)
      socket.emit("searchData", search, page + 1, (posts) => {
        // setLoadingPosts(false)
        setClient(posts.data.client)
        setData([...data, ...posts.data.fullData])
        setPage((prevPage) => prevPage + 1)
        setLoadingPosts(false)
      })
      // socket.emit("userpost", username, replies, page + 1, (res) => {
      //   console.log(res)
      //   if (res.status == "ok") {
      //     console.log(posts)
      //     setLoadingPosts(false)
      //     setPosts([...posts, ...res.data.posts])
      //     setPage((prevPage) => prevPage + 1)
      //   } else {
      //     setError(res.error.code)
      //   }
      // })
    }
  }

  function handleSearching() {
    navigate(`/search?q=${search}`)
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

  function handleDelete(postId) {
    socket.emit("removePost", postId)
    setLoading(true)
  }

  function handlePostLink(postId, username) {
    navigate(`/${username}/status/${postId}`)
  }

  function handleComment(e, postId) {
    e.stopPropagation()
    setOpenModal(postId)
  }

  function handleSearch(name) {
    if (name != "") {
      socket.emit(
        "searchUser",
        name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]/g, ""),
        (res) => {
          setUsers(res.data.fullUsers)
          setSearch(name)
          // res.data[0] ? setUsers(res.data.users) : setUsers(["no user found"])
          console.log(res)
        }
      )
    } else {
      setUsers(undefined)
    }
  }

  function handleFollow(id) {
    const newUsers = suggestions.map((element) => {
      return element.id == id
        ? !element.followers[0]
          ? { ...element, followers: [element.username] }
          : { ...element, followers: [] }
        : element
    })
    console.log(newUsers)
    setSuggestions(newUsers)

    socket.emit("follow", id)
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
    const newPosts = data.map((element) => {
      return element.id == postId
        ? element.likedBy[0]
          ? { ...element, likes: element.likes - 1, likedBy: [] }
          : { ...element, likes: element.likes + 1, likedBy: [client.username] }
        : element
    })
    console.log(newPosts)
    setData(newPosts)
    socket.emit("likedpost", postId)
  }

  useEffect(() => {
    const search = searchParams.get("q")
    console.log(search)
    console.log(search == false)
    // rowVirtualizer.measure()
    rowVirtualizer.scrollToOffset(0)
    socket.emit("searchData", search.toLowerCase(), 0, (data) => {
      console.log(data)
      setPage(0)
      setClient(data.data.client)
      setData(data.data.fullData)
      searchParams.get("q") == false &&
        setSuggestions(data.data.fullSuggestions)
      setLoading(false)
      setSearch(search)
    })
    const handleClickOutside = (event) => {
      console.log(event)
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        console.log("asdasdasd")
        setUsers(undefined)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    socket.on("connect_error", (err) => {
      console.log(err)
      navigate("/")
    })
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [searchParams, loading])

  return (
    <>
      {console.log(client)}
      {loading ? (
        <div
          className="h-lvh bg-black flex  items-center justify-center grow  "
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
        <div className=" bg-black text-white  flex  align-middle grow gap-0.5">
          <Sidebar
            data={{
              picture: client.avatarUrl.data.publicUrl,
              username: client.username,
              receivedNotifications: client.receivedNotifications,
            }}
            setLoading={setLoading}
          ></Sidebar>

          <div
            ref={parentRef}
            className="border  border-[#16181C] max-sm:border-black max-sm:border-0 grow-2  flex-col text-white max-w-170    max-h-full"
          >
            <div className=" flex font-bold grow text-2xl z-20 sticky top-0 max-sm:border-b max-sm:border-[#16181C]  bg-black/90 backdrop-blur-md gap-7 p-3  ">
              <button className="pl-2" onClick={() => navigate(-1)}>
                <ArrowLeft className="hover:scale-130 transition-transform duration-200" />
              </button>

              <div
                ref={menuRef}
                className=" flex relative mr-10 text-base grow border-2 border-[#16181C]  items-center gap-1 has-focus:border-blue-500/90 rounded-full p-2"
              >
                <Search size={"1.1em"} className="ml-1" color="gray" />
                <input
                  onChange={(e) => {
                    handleSearch(e.target.value)
                  }}
                  className="outline-0 peer grow flex pt-0.5 font-light"
                  placeholder="Search"
                  id="search"
                  type="text"
                  defaultValue={search}
                  autoComplete="off"
                />
                {users && (
                  <div
                    className="  border-0 top-11 w-full left-0  text-white rounded-xl bg-black"
                    style={{
                      boxShadow:
                        "rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px",
                      position: "absolute",
                    }}
                  >
                    <ul>
                      <li
                        className="flex gap-3 wrap-anywhere hover:bg-white/10 transition-colors duration-200 text-md border-b-[#16181C] font-light border items-end border-transparent   "
                        style={{
                          padding: "16px",
                          paddingLeft: "14px",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          handleSearching()
                          setUsers(null)
                        }}
                      >
                        Search "{search}"
                      </li>
                      {users.map((element) => {
                        // const isSelected = selectedIndex === index
                        return (
                          <li
                            onFocus={() => "bg-blue-500"}
                            className="flex hover:bg-white/10 transition-colors duration-200 items-center   "
                            key={element.username}
                            style={{
                              padding: "2px",
                              paddingLeft: "8px",
                              paddingBottom: "0px",
                              cursor: "pointer",
                            }}
                            onClick={() => navigate(`/${element.username}`)}
                          >
                            <img
                              className="max-h-10 rounded-full m-3 ml-2   aspect-square object-cover "
                              src={element.avatarUrl}
                              alt=""
                            />
                            <p>
                              {element.username}

                              {element.followers[0] && (
                                <p className="text-[0.8em] text-gray-500/70 font-extralight">
                                  following
                                </p>
                              )}
                            </p>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            {data[0] ? (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const element = data[virtualItem.index]
                  // console.log(element)
                  // console.log(posts.length)
                  // console.log(virtualItem.index)
                  return (
                    <div
                      key={virtualItem.index}
                      ref={rowVirtualizer.measureElement}
                      data-index={virtualItem.index}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        minHeight: `${virtualItem.size}px`,
                        // height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      {virtualItem.index != 0 &&
                      virtualItem.index % 20 == 0 &&
                      data[virtualItem.index - 1] &&
                      virtualItem.index == data.length ? (
                        <div
                          ref={ref}
                          // onClick={() => {
                          //   setPage((prevPage) => prevPage + 1)
                          //   setMorePosts(true)
                          // }}
                        >
                          {console.log(entry)}
                          {inView
                            ? handleMorePosts(virtualItem.index)
                            : "asdasd"}
                        </div>
                      ) : element == undefined ? null : (
                        <div
                          className="hover:bg-white/3 box-border transition-colors  wrap-anywhere duration-200"
                          key={element.id}
                        >
                          <div
                            ref={rowVirtualizer.measureElement}
                            data-index={virtualItem.index}
                            className="flex grow overflow-hidden border-b border-[#16181C]  pt-1 "
                            onClick={(e) =>
                              handlePostLink(
                                element.id,
                                element.author.username
                              )
                            }
                            key={element.id}
                          >
                            <img
                              className="max-h-10 rounded-full m-2 ml-4 mr-4 mt-2.5 aspect-square object-cover"
                              src={element.author.avatarUrl}
                              alt=""
                            />
                            <div className="flex-col grow mr-4 mt-2">
                              <div className=" flex justify-between">
                                <div className="flex gap-3 font-bold">
                                  <p className="hover:text-red-500 hover:underline">
                                    {element.author.username}
                                  </p>
                                  <p
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(`/${element.author.username}`)
                                    }}
                                    className="text-[#71767b] font-extralight"
                                  >
                                    {handleTime(element.CreatedAt)}
                                  </p>
                                </div>
                                {element.author.username == client.username && (
                                  <Trash
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(element.id)
                                    }}
                                    className="hover:scale-110 transition-transform duration-200"
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
                        // <div
                        //   onClick={(e) =>
                        //     handlePostLink(element.id, element.author.username)
                        //   }
                        //   key={element.id}
                        // >
                        //   {console.log(element)}
                        //   {element.author.username == client.username && (
                        //     <button
                        //       onClick={(e) => {
                        //         e.stopPropagation()
                        //         handleDelete(element.id)
                        //       }}
                        //     >
                        //       Delete post
                        //     </button>
                        //   )}
                        //   <img
                        //     className="max-h-5"
                        //     src={element.author.avatarUrl}
                        //     alt=""
                        //   />
                        //   <div>{element.author.username}</div>
                        //   <p>{element.CreatedAt}</p>
                        //   <p>{element.text}</p>
                        //   {element.imageUrl && (
                        //     <img src={element.imageUrl} alt="" />
                        //   )}
                        //   <div>
                        //     <p
                        //       onClick={(e) => {
                        //         e.stopPropagation()
                        //         handleLike(element.id)
                        //       }}
                        //       className={element.likedBy[0] && "text-red-400"}
                        //     >
                        //       {element.likes}
                        //     </p>
                        //   </div>
                        //   <div>
                        //     <div>Comments {element._count.replies}</div>
                        //     <button
                        //       onClick={(e) => handleComment(e, element.id)}
                        //     >
                        //       Comment here
                        //     </button>
                        //   </div>
                        // </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-white text-3xl  grow  max-sm:min-h-lvh  max-w-170 wrap-anywhere flex justify-center font-bold">
                {searchParams.get("q") == false ? (
                  <div>
                    <p className="p-10">"Use the searchbar to explore posts"</p>

                    <div className="flex-col items-start  pb-4 hidden max-sm:flex pt-20 grow w-full  rounded-2xl   text-2xl  ">
                      <div className="font-bold text-2xl pl-6 pb-3">
                        Following suggestions
                      </div>
                      {suggestions &&
                        suggestions.map((element) => {
                          console.log("asdasdasdasdasd")
                          return (
                            <div
                              className="flex-col items-center w-full pl-4 pr-4 border-b border-[#16181C]  hover:bg-white/10 transition-colors duration-200 font-bold text-xl  "
                              onClick={() => navigate(`/${element.username}`)}
                              key={element.id}
                            >
                              <div className="flex items-center">
                                <img
                                  className="max-h-10 rounded-full m-2 w  mr-4 aspect-square object-cover"
                                  src={element.avatarUrl}
                                  alt=""
                                />
                                <div className="flex justify-between grow">
                                  <div>{element.username}</div>
                                  {element.username ==
                                  client.username ? null : !element
                                      .followers[0] ? (
                                    <button
                                      className="bg-white  text-sm hover:bg-white/90 flex  rounded-full pl-3 pr-3 p-1.5   text-black transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleFollow(element.id, element)
                                      }}
                                    >
                                      Follow
                                    </button>
                                  ) : (
                                    <button
                                      className="bg-white text-black text-sm rounded-full  pl-3 pr-3 p-1.5  hover:bg-white/90 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleFollow(element.id, element)
                                      }}
                                    >
                                      Unfollow
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="font-extralight text-base pl-16 pb-2">
                                {element.status}
                              </p>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ) : (
                  <p className="p-10">
                    "No post found for {searchParams.get("q")}"
                  </p>
                )}
              </div>
            )}
            <Footer
              data={{
                picture: client.avatarUrl.data.publicUrl,
                username: client.username,
                receivedNotifications: client.receivedNotifications,
              }}
              setLoading={setLoading}
            ></Footer>
          </div>

          <SearchSidebar />

          <CreatePost
            isOpen={openModal}
            setOpenModal={setOpenModal}
            data={client.avatarUrl.data.publicUrl}
            client={client}
            setLoading={setLoading}
          />
          <NotificationListener />
        </div>
      )}
    </>
  )
}

export default SearchPage
