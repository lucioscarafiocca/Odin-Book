import { useEffect, useState, useRef } from "react"
import socket from "../socket"
import { useNavigate, useLocation } from "react-router"
import { Search } from "lucide-react"

function SearchSidebar() {
  const [data, setData] = useState()
  const [users, setUsers] = useState()
  const [client, setClient] = useState()
  const [search, setSearch] = useState()
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    socket.emit("suggestion", (res) => {
      console.log(res)
      setData(res.data)
      setClient(res.client)
    })
    const handleClickOutside = (event) => {
      console.log(event)
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        console.log("asdasdasd")
        setUsers(null)
      }
    }
    if (users) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [users])

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

  function handleSearch(name) {
    console.log(name !== "")
    if (name !== "") {
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

  function handleSearching() {
    navigate(`/search?q=${search}`)
  }

  return (
    <div className="flex-col max-sm:hidden  flex grow-2 p-5 mr-5  pl-7 text-white">
      <div className="grid  grid-cols-[35%_65%]">
        <div className="flex-col w-90 fixed grow items-start">
          <div className="relative  grow w-full flex ">
            <div
              className={` ${
                location.pathname.includes("search") ? "hidden" : ""
              } flex pl-3   grow border-2 border-[#16181C] mb-5 items-center gap-1  has-focus:border-blue-500/90 rounded-full p-2`}
            >
              <Search size={"1.1em"} color="gray" />
              <input
                onChange={(e) => {
                  handleSearch(e.target.value)
                }}
                className="outline-0 grow peer flex pt-0.5 font-light"
                placeholder="Search"
                id="search"
                type="text"
                autoComplete="off"
              />
            </div>
            {users && (
              <div
                ref={menuRef}
                className="  border-0 top-11.5 w-full left-0  text-white rounded-xl bg-black"
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
                    onClick={() => handleSearching()}
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

          <div className="flex-col items-start flex pb-4 pt-3 grow w-full  rounded-2xl border  border-[#16181C]  text-2xl  ">
            <div className="font-bold text-2xl pl-6 pb-5">
              Following suggestions
            </div>
            {data &&
              data.map((element) => {
                return (
                  <div
                    className="flex items-center w-full pl-4 pr-4  hover:bg-white/10 transition-colors duration-200 font-bold text-xl  "
                    onClick={() => navigate(`/${element.username}`)}
                    key={element.id}
                  >
                    <img
                      className="max-h-10 rounded-full m-2 w  mr-4 aspect-square object-cover"
                      src={element.avatarUrl}
                      alt=""
                    />
                    <div className="flex justify-between grow">
                      <div>{element.username}</div>
                      {element.username == client.username ? null : !element
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
                )
              })}
          </div>
        </div>
        <div className="flex-row  flex grow "></div>
      </div>
    </div>
  )
}

// <div className="text-white">
//   {users.map((element) => {
//     return (
//       <div key={element.id}>
//         <div onClick={() => navigate(`/${element.username}`)}>
//           {element.username}
//         </div>
//       </div>
//     )
//   })}
//   <div onClick={() => handleSearching()}>Search {search}</div>
// </div>

export default SearchSidebar
