import { useEffect, useState } from "react"
import { useParams, useNavigate, Link, useLocation } from "react-router"
import socket from "./socket"
import Sidebar from "./components/Sidebar"
import SearchSidebar from "./components/SearchSidebar"
import { ArrowLeft } from "lucide-react"
import NotificationListener from "./components/NotificationListener"
import Footer from "./components/Footer"

function Follow() {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [username, setUsername] = useState()
  const [users, setUsers] = useState()
  const [search, setSearch] = useState()
  const [data, setData] = useState()
  const [client, setClient] = useState(false)

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

  function handleFollow(id) {
    const newUsers = data.map((element) => {
      return element.id == id
        ? !element.followers[0]
          ? { ...element, followers: [element.username] }
          : { ...element, followers: [] }
        : element
    })
    console.log(newUsers)
    setData(newUsers)

    socket.emit("follow", id)
  }

  useEffect(() => {
    const following = location.pathname.includes("/following")
    const { username } = params
    socket.emit("follows", following, username, (res) => {
      console.log(res)
      setData(res.data.fullres)
      setClient(res.data.client)
    })
    setUsername(username)
  }, [params])

  return (
    <>
      <div className="h-lvh  bg-black text-white flex align-middle gap-0.5">
        <Sidebar
          data={{
            picture: client && client.avatarUrl.data.publicUrl,
            username: username,
            receivedNotifications: client && client.receivedNotifications,
          }}
        ></Sidebar>
        <div className=" flex-col   border border-[#16181C] max-w-160  grow overflow-y-auto  max-h-full">
          <div className="max-sm:h-full">
            <div className="flex sticky bg-black/70 backdrop-blur-md gap-5 ">
              <button className="pl-4" onClick={() => navigate(`/${username}`)}>
                <ArrowLeft className="hover:scale-130 transition-transform duration-200" />
              </button>
              <p className="text-2xl p-2 font-bold">{username}</p>
            </div>

            <div className=" border-b  border-[#16181C]  flex text-xl  ">
              <div
                onClick={() => navigate(`/${username}/followers`)}
                className="grow p-5 duration-200 hover:bg-white/7 box-border transition-colors text-center"
              >
                <Link
                  className={`${
                    !location.pathname.includes("/following") &&
                    "border-b-3 pb-4.5 rounded-sm font-bold  border-blue-500"
                  }`}
                  to={`/${username}/followers`}
                >
                  Followers
                </Link>
              </div>
              <div
                onClick={() => navigate(`/${username}/following`)}
                className="grow p-5 duration-200 hover:bg-white/7 box-border transition-colors text-center"
              >
                <Link
                  className={`${
                    location.pathname.includes("/following") &&
                    "border-b-3 pb-4.5 rounded-sm font-bold border-blue-500"
                  }`}
                  to={`/${username}/following`}
                >
                  Following
                </Link>
              </div>
            </div>
            {data &&
              (data[0] ? (
                data.map((element) => {
                  return (
                    <div
                      className="hover:bg-white/3 box-border p-2 pr-4 transition-colors flex wrap-anywhere duration-200"
                      onClick={() => navigate(`/${username}`)}
                    >
                      <img
                        className="max-h-11 rounded-full m-2 ml-4 mr-4 mt-1 aspect-square object-cover"
                        src={element.avatarUrl}
                        alt=""
                      />
                      <div className="flex-col flex grow">
                        <div className="flex justify-between   grow">
                          <p
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/${element.username}`)
                            }}
                            className=" text-[1.1em] place-self-center pt-1 font-bold hover:text-red-500 hover:underline"
                          >
                            {element.username}
                          </p>
                          {!element.followers[0] ? (
                            <button
                              className="bg-white text-black    mt-2   rounded-full p-1 pl-10 pr-10 hover:bg-white/80 transition-colors duration-150"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFollow(element.id, element)
                              }}
                            >
                              Follow
                            </button>
                          ) : (
                            <button
                              className="bg-black text-white  mt-2   border border-gray-600   rounded-full p-1 pl-5 pr-5 hover:bg-white/10 transition-colors duration-150"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleFollow(element.id, element)
                              }}
                            >
                              Unfollow
                            </button>
                          )}
                        </div>
                        <p className="pb-4  font-extralight pt-1">
                          {element.status}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : location.pathname.includes("/following") ? (
                <p className="p-10 text-center font-bold text-3xl">
                  {username != client.username
                    ? `@${username} doesnt follow anyone yet!`
                    : "You dont follow anyone yet!"}
                </p>
              ) : (
                <p className="p-10 text-center font-bold text-3xl">
                  {username != client.username
                    ? `@${username} has no followers yet!`
                    : "You dont have any followers yet!"}
                </p>
              ))}
          </div>
          <Footer
            data={{
              picture: client && client.avatarUrl.data.publicUrl,
              username: username,
              receivedNotifications: client && client.receivedNotifications,
            }}
          ></Footer>
        </div>

        <SearchSidebar />
        <NotificationListener />
      </div>
    </>
  )
}

export default Follow
