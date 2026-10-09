import { useNavigate } from "react-router"
import socket from "../socket"
import {
  Heart,
  MessageCircle,
  Repeat,
  Trash,
  CalendarDays,
  User,
} from "lucide-react"

function Notification({ element, setOpenModal, setData, data }) {
  // const location = useLocation()
  const navigate = useNavigate()

  function handlePostLink(postId, username) {
    navigate(`/${username}/status/${postId}`)
  }

  function handleProfileLink(username) {
    navigate(`/${username}`)
  }

  function handleComment(e, postId) {
    e.stopPropagation()
    setOpenModal(postId)
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

  console.log(element)

  return element.type === "mention" || element.type === "comment" ? (
    <div className="transition-colors border-b  border-[#16181C] wrap-anywhere duration-200">
      <div
        onClick={(e) =>
          handlePostLink(element.post.id, element.sender.username)
        }
        className="flex grow overflow-hidden hover:bg-white/3 box-border transition-colors  wrap-anywhere duration-200  pt-1 "
        // onClick={(e) => handlePostLink(element.id, element.username)}
      >
        <img
          className="max-h-10 rounded-full m-2 ml-4 mr-4 mt-2.5 aspect-square object-cover"
          src={element.sender.avatarUrl}
          alt=""
        />
        <div className="flex-col grow mr-4 mt-2">
          <div className=" flex justify-between items-center">
            <div className=" flex gap-3 items-center font-bold">
              <p
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/${element.sender.username}`)
                }}
                className="hover:text-red-500 hover:underline"
              >
                {element.sender.username}
              </p>
              <p className="text-[#71767b] font-extralight">
                {handleTime(element.post.CreatedAt)}
              </p>
            </div>
            {/* {client.username == data.author.username && (
              <Trash
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(element.post.id, true)
                }}
                className="hover:scale-110 transition-transform duration-200"
                color="red"
                size={"1.3em"}
              />
            )} */}
          </div>
          {element.post.parent && (
            <div className="text-[#71767b]  pb-1 ">
              Replying to
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/${element.receiver.username}`)
                }}
                className="text-[#1d9bf0] pl-1 hover:underline"
              >
                {element.post.parent.author.username}
              </span>
            </div>
          )}
          <p className="font-light grow-0  ">
            {handleMention(element.post.text)}
          </p>

          {element.post.imageUrl && (
            <div
              className="bg-cover bg-center rounded-2xl aspect-square border border-gray-900 mb-1 mt-2"
              style={{
                backgroundImage: `url(${element.post.imageUrl})`,
              }}
            ></div>
          )}
          <div className="flex    justify-evenly  ">
            <div>
              <p
                onClick={(e) => {
                  e.stopPropagation()
                  handleLike(element.post.id)
                }}
                className={`${
                  element.post.likedBy[0]
                    ? "hover:text-red-500 "
                    : "hover:text-red-500 "
                } flex font-extralight flex-row-reverse transition-colors duration-200   items-center
                                  ${
                                    element.post.likedBy[0]
                                      ? "text-red-400"
                                      : undefined
                                  }
                                    `}
              >
                <p className="pt-1 select-none  peer">
                  {element.post.likes != 0 && element.post.likes}
                </p>
                <Heart
                  className={`peer-hover:bg-red-500/20 hover:text-red-500   peer-hover:text-red-500 p-2.5 overflow-visible justify-self-end-safe text-gray-700 hover:bg-red-500/20 transition-colors duration-200   rounded-full ${
                    element.post.likedBy[0] && " text-red-500/0"
                  } transition-all"`}
                  fill={element.post.likedBy[0] && "red"}
                  size={"2.5em"}
                />
              </p>
            </div>

            <div
              onClick={(e) => handleComment(e, element.post.id)}
              className={`${
                element.post.likedBy[0]
                  ? "hover:text-blue-500 "
                  : "hover:text-blue-500 "
              } flex select-none transition-colors duration-200 flex-row-reverse "`}
            >
              <p className="place-self-center peer select-none hover:text-blue-500 transition-colors duration-200  font-extralight  pt-1">
                {element.post._count != 0 && element.post._count.replies}
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
  ) : // <div
  //   onClick={(e) => handlePostLink(element.post.id, element.sender.username)}
  //   key={element.id}
  // >
  //   {element.post.parent && (
  //     <p>Replying to {element.post.parent.author.username}</p>
  //   )}
  //   <img className="max-h-5" src={element.sender.avatarUrl} alt="" />
  //   {element.post.imageUrl && <img src={element.post.imageUrl} alt="" />}
  //   <div
  //     onClick={(e) => {
  //       e.stopPropagation()
  //       navigate(`/${element.sender.username}`)
  //     }}
  //     className="hover:text-red-500"
  //   >
  //     {element.sender.username}
  //   </div>
  //   <p>{element.post.CreatedAt}</p>
  //   <p>{element.post.text}</p>
  //   <div>
  //     <p
  //       onClick={(e) => {
  //         e.stopPropagation()
  //         handleLike(element.post.id)
  //       }}
  //       className={element.post.likedBy[0] ? "text-red-400" : undefined}
  //     >
  //       {element.post.likes}
  //     </p>
  //   </div>
  //   <div>
  //     <div> Comments {element.post._count.replies}</div>
  //     <button onClick={(e) => handleComment(e, element.postId)}>
  //       Comment here
  //     </button>
  //   </div>
  // </div>
  // element.type == "comment" ? (
  //   <div
  //     onClick={(e) => handlePostLink(element.post.id, element.sender.username)}
  //     key={element.post.id}
  //   >
  //     <p>Replying to {data[0].receiver.username}</p>
  //     <img className="max-h-5" src={element.sender.avatarUrl} alt="" />
  //     {element.post.imageUrl && <img src={element.post.imageUrl} alt="" />}
  //     <div
  //       onClick={(e) => {
  //         e.stopPropagation()
  //         navigate(`/${element.sender.username}`)
  //       }}
  //       className="hover:text-red-500"
  //     >
  //       {element.sender.username}
  //     </div>
  //     <p>{element.post.CreatedAt}</p>
  //     <p>{element.post.text}</p>
  //     <div>
  //       <p
  //         onClick={(e) => {
  //           e.stopPropagation()
  //           handleLike(element.post.id)
  //         }}
  //         className={element.post.likedBy[0] ? "text-red-400" : undefined}
  //       >
  //         {element.post.likes}
  //       </p>
  //     </div>
  //     <div>
  //       <div> Comments {element.post._count.replies}</div>
  //       <button onClick={(e) => handleComment(e, element.postId)}>
  //         Comment here
  //       </button>
  //     </div>
  //   </div>
  element.type == "like" ? (
    <div
      className="border-b flex pl-5.5 pt-1 hover:bg-white/3 border-[#16181C]"
      onClick={() => handlePostLink(element.post.id, element.sender.username)}
    >
      <Heart
        className={`peer-hover:bg-red-500/20 hover:text-red-500  mr-2 peer-hover:text-red-500  overflow-visible justify-self-end-safe   hover:bg-red-500/20 transition-colors duration-200  mt-2.5 rounded-full  text-red-500/0 transition-all"`}
        fill={"red"}
        size={"2.2em"}
      />
      <div className=" flex-col pl-2">
        <img
          className="max-h-10 rounded-full m-2 ml-0  mr-4 mt-2.5 aspect-square object-cover"
          src={element.sender.avatarUrl}
          alt=""
        />
        <div className="flex gap-1">
          <p
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/${element.sender.username}`)
            }}
            className="font-bold hover:text-red-500"
          >
            {element.sender.username}
          </p>
          <p> liked your post</p>
        </div>
        <div className="text-[#71767b] pb-2 pt-1 font-extralight">
          {element.post.text}
        </div>
      </div>
      {/* <div>Comments {element.post._count.replies}</div> */}
    </div>
  ) : element.type == "follow" ? (
    <div
      className="border-b flex pl-5.5 pt-1 hover:bg-white/3 transition-all duration-200 border-[#16181C]"
      onClick={(e) => handleProfileLink(element.sender.username)}
    >
      <User
        size="2.2em"
        fill="#1d9bf0"
        color="#1d9bf0"
        className="border mr-0.5 mt-2.5 border-black"
      />
      <div className="pl-2">
        <img
          className="max-h-10 rounded-full m-2 ml-0  mr-4 mt-2.5 aspect-square object-cover"
          src={element.sender.avatarUrl}
          alt=""
        />
        <p className="pb-2 pl-1 font-extralight">
          <span className="font-bold ">{element.sender.username}</span> followed
          you
        </p>
      </div>
    </div>
  ) : (
    <p>No notifications </p>
  )
}

export default Notification
