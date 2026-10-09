import { useEffect, useState, useRef, useLayoutEffect } from "react"
import { useParams, useNavigate } from "react-router"
import socket from "../socket"
import axios from "axios"
import CreateComment from "./CreateComment"
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { MentionNode } from "../lexical/MentionNode"
import { MentionPlugin } from "../lexical/MentionPlugin"
import { CustomTypeaheadPlugin } from "../lexical/CustomMenuPlugin"
import { $getRoot } from "lexical"
import { attachInterceptor } from "../jwtlib"
import CreatePost from "./CreatePost"
import Sidebar from "./Sidebar"
import NotificationListener from "./NotificationListener"
import SearchSidebar from "./SearchSidebar"
import {
  Heart,
  MessageCircle,
  Repeat,
  Trash,
  CalendarDays,
  ArrowLeft,
} from "lucide-react"
import { X, Image } from "lucide-react"
import Footer from "./Footer"

function Post({ dataProp = null, userProp }) {
  const params = useParams()
  const [data, setData] = useState()
  const [user, setUser] = useState()
  const [text, setText] = useState("")
  const [users, setUsers] = useState()
  const [search, setSearch] = useState()
  const [publicUrl, setPublicUrl] = useState()
  const [imageUrl, setImageUrl] = useState()
  const [openModal, setOpenModal] = useState()
  const [client, setClient] = useState()
  const [loading, setLoading] = useState(true)
  const [cords, setCords] = useState()
  const postRef = useRef(null)
  const navigate = useNavigate()
  const dialog = useRef(null)

  function handleCommentBut(e, postId) {
    e.stopPropagation()
    setOpenModal(postId)
  }

  function handleDelete(postId, redirect) {
    socket.emit("removePost", postId)
    redirect ? navigate("/home") : setLoading(true)
  }

  function handleTimeSince(timestamp) {
    const currentDate = new Date()
    const date = new Date(timestamp)

    return date.toLocaleString()
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

  function handleLike(postId, element) {
    if (data.parent && data.parent.id == postId) {
      element.likedBy[0]
        ? setData({
            ...data,
            parent: { ...data.parent, likes: element.likes - 1, likedBy: [] },
          })
        : setData({
            ...data,
            parent: {
              ...data.parent,
              likes: element.likes + 1,
              likedBy: [user],
            },
          })
      socket.emit("likedpost", postId)
    } else if (data.id !== postId) {
      const replies = data.replies
      const newReplies = replies.map((element) => {
        return element.id == postId
          ? element.likedBy[0]
            ? { ...element, likes: element.likes - 1, likedBy: [] }
            : { ...element, likes: element.likes + 1, likedBy: [user] }
          : element
      })
      setData({ ...data, replies: newReplies })
      socket.emit("likedpost", postId)
    } else {
      element.likedBy[0]
        ? setData({ ...data, likes: element.likes - 1, likedBy: [] })
        : setData({ ...data, likes: data.likes + 1, likedBy: [user] })
      socket.emit("likedpost", postId)
    }
  }

  function handleComment(postId) {
    socket.emit("createComment", text, postId, publicUrl, (data) => {
      setImageUrl(null)
      setPublicUrl(null)
      console.log(data)
      data != "error" && setLoading(true)
    })
  }

  // function handlePost() {
  //   if (isOpen) {
  //     socket.emit("createPost", text, isOpen, publicUrl)
  //     setOpenModal(false)
  //   } else {
  //     socket.emit("createPost", text, null, publicUrl)
  //     setOpenModal(false)
  //   }
  // }

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
      .then((res) => setPublicUrl(res.data))
      .catch((err) => console.log(err))

    const url = URL.createObjectURL(files)
    setImageUrl(url)
    console.log(url)
  }

  function handleCommentLink(postId, username) {
    navigate(`/${username}/status/${postId}`)
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
    // editorState: ParagraphWithSpaceInitialState,
    onError,
  }
  useEffect(() => {
    const timer =
      postRef.current &&
      setTimeout(() => {
        postRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 20)

    if (dataProp) {
      setData(dataProp)
      setUser(userProp)
    } else {
      const { username, postId } = params
      socket.emit("post", postId, (res) => {
        if (res.status == "ok") {
          setData(res.data.post)
          setUser(username)
          setClient(res.data.client)
        } else {
          setClient(res.client)
        }
        setLoading(false)
        console.log(res)
      })
    }
    // socket.on("commentSuccess", (data) => {
    //   console.log(data)
    // })
    socket.on("connect_error", (err) => {
      console.log(err)
      navigate("/")
    })

    return () => {
      clearTimeout(timer)
    }
  }, [params, loading])

  return (
    <>
      {console.log(data)}
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
        <div className=" h-full max-sm:min-h-lvh bg-black max-sm:flex-col   text-white flex align-middle grow gap-0.5 ">
          <Sidebar
            data={{
              picture: client.picture.data.publicUrl,
              username: client.username,
              receivedNotifications: client.receivedNotifications,
            }}
          ></Sidebar>
          {data ? (
            <div
              className={`flex-col text-white ${
                data.parentId || data.replies[1]
                  ? "pb-250 max-sm:pb-100"
                  : "pb-0"
              } grow-2  max-w-170 max-h-full border-b-black border border-[#16181C] max-sm:border-black max-sm:border-0`}
            >
              <div className=" flex font-bold grow text-xl sticky top-0 bg-black/70 backdrop-blur-md gap-7 p-3  ">
                <button className="pl-2" onClick={() => navigate(-1)}>
                  <ArrowLeft className="hover:scale-130 transition-transform duration-200" />
                </button>
                Post
              </div>
              {data.parent && (
                <div
                  className="hover:bg-white/3 transition-colors  wrap-anywhere duration-200"
                  key={data.parent.id}
                >
                  <div
                    className="flex grow overflow-hidden  pt-1 "
                    onClick={(e) =>
                      handleCommentLink(
                        data.parent.id,
                        data.parent.author.username
                      )
                    }
                    key={data.parent.id}
                  >
                    <div className="flex-col flex items-center">
                      <img
                        className="max-h-10 rounded-full m-2 ml-4 mr-4 mt-2.5 aspect-square object-cover"
                        src={data.parent.author.avatarUrl.data.publicUrl}
                        alt=""
                      />
                      <div className="  border border-[#2f3336] grow"> </div>
                    </div>

                    <div className="flex-col grow mr-4 mt-2">
                      <div className="flex justify-between">
                        <div className=" flex gap-3 font-bold ">
                          <p
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/${data.parent.author.username}`)
                            }}
                            className="hover:text-red-500 hover:underline"
                          >
                            {data.parent.author.username}
                          </p>
                          <p className="text-[#71767b] font-extralight">
                            {handleTime(data.parent.CreatedAt)}
                          </p>
                        </div>
                        {client.username == data.parent.author.username && (
                          <Trash
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(data.parent.id, true)
                            }}
                            className="hover:scale-110 transition-transform duration-200"
                            color="red"
                            size={"1.3em"}
                          />
                        )}
                      </div>
                      <p className="font-light grow-0 ">
                        {handleMention(data.parent.text)}
                      </p>
                      {data.parent.imageUrl && (
                        <div
                          className="bg-cover bg-center rounded-2xl aspect-square border border-gray-900 mb-1 mt-2"
                          style={{
                            backgroundImage: `url(${data.parent.imageUrl})`,
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
                              handleLike(data.parent.id, data.parent)
                            }}
                            className={`${
                              data.parent.likedBy[0]
                                ? "hover:text-red-500 "
                                : "hover:text-red-500 "
                            } flex font-extralight flex-row-reverse transition-colors duration-200   items-center
                        ${data.parent.likedBy[0] ? "text-red-400" : undefined}
                          `}
                          >
                            <p className="pt-1 select-none  peer">
                              {data.parent.likes != 0 && data.parent.likes}
                            </p>
                            <Heart
                              className={`peer-hover:bg-red-500/20 hover:text-red-500   peer-hover:text-red-500 p-2.5 overflow-visible justify-self-end-safe text-gray-700 hover:bg-red-500/20 transition-colors duration-200   rounded-full ${
                                data.parent.likedBy[0] && " text-red-500/0"
                              } transition-all"`}
                              fill={data.parent.likedBy[0] && "red"}
                              size={"2.5em"}
                            />
                          </p>
                        </div>

                        <div
                          onClick={(e) => handleCommentBut(e, data.parent.id)}
                          className={`${
                            data.parent.likedBy[0]
                              ? "hover:text-blue-500 "
                              : "hover:text-blue-500 "
                          } flex select-none transition-colors duration-200 flex-row-reverse "`}
                        >
                          <p className="place-self-center peer select-none hover:text-blue-500 transition-colors duration-200  font-extralight  pt-1">
                            {data.parent._count != 0 &&
                              data.parent._count.replies}
                          </p>
                          <MessageCircle
                            size={"2.5em"}
                            className=" text-gray-700 peer-hover:bg-blue-500/20 peer-hover:text-blue-500 hover:text-blue-500 p-2.5 overflow-visible pt-3 transition-colors duration-200  hover:bg-blue-500/20 rounded-full "
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <div className="transition-colors  wrap-anywhere duration-200">
                  <div
                    ref={postRef}
                    className="flex grow overflow-hidden scroll-mt-13   "
                    // onClick={(e) => handlePostLink(element.id, element.username)}
                  >
                    <div className="flex-col grow mr-4 ">
                      <div className=" flex justify-between items-center">
                        <div className=" flex  items-center font-bold">
                          <div className="flex-col flex items-center ">
                            <img
                              className="max-h-10 rounded-full m-2 ml-4  mr-4 mt-2.5 aspect-square object-cover"
                              src={data.author.avatarUrl}
                              alt=""
                            />
                          </div>
                          <p
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/${data.author.username}`)
                            }}
                            className="hover:text-red-500 hover:underline"
                          >
                            {data.author.username}
                          </p>
                        </div>
                        {client.username == data.author.username && (
                          <Trash
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(data.id, true)
                            }}
                            className="hover:scale-110 transition-transform duration-200"
                            color="red"
                            size={"1.3em"}
                          />
                        )}
                      </div>
                      <p className="font-light grow pl-4.5 text-[1.2em]">
                        {handleMention(data.text)}
                      </p>

                      {data.imageUrl && (
                        <div
                          className="bg-cover ml-4 bg-center rounded-2xl aspect-square border border-gray-900 mb-1 mt-2"
                          style={{
                            backgroundImage: `url(${data.imageUrl})`,
                          }}
                        ></div>
                      )}
                      <p className="text-[#71767b] font-extralight pl-4.5 pb-3 pt-2">
                        {handleTimeSince(data.CreatedAt)}
                      </p>
                      <div className="flex border border-black border-b-[#16181C] ml-3 border-t-[#16181C] pb-1 justify-evenly  ">
                        <div>
                          <p
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLike(data.id, data)
                            }}
                            className={`${
                              data.likedBy[0]
                                ? "hover:text-red-500 "
                                : "hover:text-red-500 "
                            } flex font-extralight flex-row-reverse transition-colors duration-200   items-center
                                  ${
                                    data.likedBy[0] ? "text-red-400" : undefined
                                  }
                                    `}
                          >
                            <p className="pt-1 select-none  peer">
                              {data.likes != 0 && data.likes}
                            </p>
                            <Heart
                              className={`peer-hover:bg-red-500/20 hover:text-red-500   peer-hover:text-red-500 p-2.5 overflow-visible justify-self-end-safe text-gray-700 hover:bg-red-500/20 transition-colors duration-200   rounded-full ${
                                data.likedBy[0] && " text-red-500/0"
                              } transition-all"`}
                              fill={data.likedBy[0] && "red"}
                              size={"2.5em"}
                            />
                          </p>
                        </div>

                        <div
                          onClick={(e) => handleCommentBut(e, data.id)}
                          className={`${
                            data.likedBy[0]
                              ? "hover:text-blue-500 "
                              : "hover:text-blue-500 "
                          } flex select-none transition-colors duration-200 flex-row-reverse "`}
                        >
                          <p className="place-self-center peer select-none hover:text-blue-500 transition-colors duration-200  font-extralight  pt-1">
                            {data._count != 0 && data._count.replies}
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
                {/* <div
                ref={postRef}
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/${data.author.username}`)
                }}
                className="hover:text-red-500"
              >
                {data.author.username}
              </div>
              <img className="max-h-5" src={data.author.avatarUrl} alt="" />
              {data.imageUrl && <img src={data.imageUrl} alt="" />}
              <p>{data.CreatedAt}</p>
              <p>{data.text}</p>
              {client.username == data.author.username && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(data.id, true)
                  }}
                >
                  Delete
                </button>
              )}
              <div>
                <button onClick={() => handleLike(element.likes, element.id)}>
                    Like
                  </button>
                <p
                  onClick={() => handleLike(data.id, data)}
                  className={data.likedBy[0] && "text-red-400"}
                >
                  {data.likes}
                </p>
                <div>Comments {data._count.replies}</div>
              </div> */}
                <div className="grow  flex mt-3 ml-2">
                  <img
                    className="max-h-10 rounded-full m-2 ml-2 mr-4 aspect-square object-cover "
                    src={client.picture.data.publicUrl}
                    alt=""
                  />

                  <div
                    ref={dialog}
                    className={`flex-col max-h-250 ${
                      text.length >= 240 && "overflow-y-auto"
                    } scrollbar-track-gray-950 scrollbar-thumb-gray-800 pr-5  grow pt-3 pb-5`}
                  >
                    <div
                      className={`relative mb-2  max-h-150 ${
                        text.length >= 240 && "overflow-y-auto"
                      } scrollbar-track-gray-950  scrollbar-thumb-gray-800 wrap-break-word   z-10 editor-container`}
                    >
                      <LexicalComposer initialConfig={initialConfig}>
                        <RichTextPlugin
                          contentEditable={
                            <ContentEditable
                              autoFocus
                              className=" overflow-x-auto text-xl   outline-0 "
                              placeholder={
                                <div className="absolute text-gray-600 wrap-break-word text-xl top-0 pointer-events-none">
                                  Post your answer
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
                        <CustomTypeaheadPlugin
                          dialog={dialog}
                          cords={cords}
                          post={true}
                        />

                        <HistoryPlugin />
                      </LexicalComposer>
                    </div>
                    {imageUrl && (
                      <div className="relative  ">
                        <img
                          className="bg-center place-self-center bg-cover rounded-2xl "
                          src={imageUrl}
                        ></img>
                        <button
                          onClick={() => {
                            setImageUrl(null)
                            setPublicUrl(null)
                          }}
                        >
                          <X className="absolute top-1 right-3 m-2 p-1 rounded-full bg-gray-900/70 hover:bg-white/30" />
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
                <div className="flex items-center   border-b pb-4 justify-between pr-5 pl-16  border-[#2f3336] grow">
                  <form action="" onSubmit={(e) => handlePicture(e)}>
                    <label htmlFor="uploaded_file">
                      <input
                        className="hidden"
                        onChange={(e) => {
                          handlePicture(e.target.files[0])
                        }}
                        type="file"
                        name="uploaded_file"
                        id="uploaded_file"
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
                      text.length > 0 &&
                      text.length < 240 &&
                      handleComment(data.id)
                    }
                  >
                    Post
                  </button>
                </div>
                <div>
                  {data.replies &&
                    data.replies.map((element) => {
                      return (
                        <div
                          className="hover:bg-white/3 transition-colors border-b  border-b-[#16181C] wrap-anywhere duration-200"
                          key={element.id}
                        >
                          <div
                            className="flex grow overflow-hidden  pt-1 "
                            onClick={(e) => handleCommentLink(element.id, user)}
                            key={element.id}
                          >
                            <img
                              className="max-h-10 rounded-full m-2 ml-4 mr-4 mt-2.5 aspect-square object-cover"
                              src={element.author.avatarUrl}
                              alt=""
                            />
                            <div className="flex-col grow mr-4 mt-2">
                              <div className="flex justify-between">
                                <div className=" flex gap-3 font-bold ">
                                  <p
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      navigate(`/${element.author.username}`)
                                    }}
                                    className="hover:text-red-500 hover:underline"
                                  >
                                    {element.author.username}
                                  </p>
                                  <p className="text-[#71767b] font-extralight">
                                    {handleTime(element.CreatedAt)}
                                  </p>
                                </div>
                                {client.username == element.author.username && (
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
                                  className="bg-cover bg-center rounded-2xl aspect-square border border-gray-900 mb-1 mt-2"
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
                                  </p>
                                </div>

                                <div
                                  onClick={(e) =>
                                    handleCommentBut(e, element.id)
                                  }
                                  className={`${
                                    element.likedBy[0]
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
                              </div>
                            </div>
                          </div>
                        </div>

                        // <div
                        //   onClick={() => handleCommentLink(element.id, user)}
                        //   key={element.id}
                        // >
                        //   {element.author.avatarUrl && (
                        //     <img
                        //       className="max-h-5"
                        //       src={element.author.avatarUrl}
                        //       alt=""
                        //     />
                        //   )}
                        //   <p>{element.text}</p>
                        //   <div>{element.CreatedAt}</div>
                        //   <div
                        //     onClick={(e) => {
                        //       e.stopPropagation()
                        //       handleLike(element.id, element)
                        //     }}
                        //     className={element.likedBy[0] && "text-red-400"}
                        //   >
                        //     {element.likes}
                        //   </div>
                        //   {element.imageUrl && <img src={element.imageUrl}></img>}
                        //   <div
                        //     onClick={(e) => {
                        //       e.stopPropagation()
                        //       navigate(`/${element.author.username}`)
                        //     }}
                        //     className="hover:text-red-500"
                        //   >
                        //     {element.author.username}
                        //   </div>
                        //   {element.author.username == client.username && (
                        //     <button
                        //       onClick={(e) => {
                        //         e.stopPropagation()
                        //         handleDelete(element.id)
                        //       }}
                        //     >
                        //       Delete
                        //     </button>
                        //   )}

                        //   <div>Comments {element._count.replies}</div>
                        //   <button
                        //     onClick={(e) => handleCommentBut(e, element.id)}
                        //   >
                        //     Comment
                        //   </button>
                        // </div>
                      )
                    })}
                  <CreatePost
                    isOpen={openModal}
                    setOpenModal={setOpenModal}
                    data={client.picture.data.publicUrl}
                  />
                  {/* <CreateComment
                isOpen={openModal}
                setOpenModal={setOpenModal}
              ></CreateComment> */}
                </div>

                {/* <div>
              <input
                onChange={(e) => setText(e.target.value)}
                type="text"
                name="text"
                id="text"
                placeholder="comment here..."
              />
              <button onClick={() => handleComment(data.id)}>Comment</button>
            </div> */}
              </div>
            </div>
          ) : (
            <p className="text-white text-center text-3xl p-10 grow border max-w-170 border-[#16181C] flex justify-center font-bold">
              This page doesnt exist, try searching something else
            </p>
          )}

          <SearchSidebar />
          <NotificationListener />
          <Footer
            data={{
              picture: client.picture.data.publicUrl,
              username: client.username,
              receivedNotifications: client.receivedNotifications,
            }}
          ></Footer>
        </div>
      )}
    </>
  )
}

export default Post
