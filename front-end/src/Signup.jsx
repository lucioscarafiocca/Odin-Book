import { useState, useEffect } from "react"
import { Eye, EyeOff, ArrowLeft, CircleAlert } from "lucide-react"
import axios from "axios"
import { setLocalStorage } from "./jwtlib"
import { useNavigate } from "react-router"
import socket from "./socket"

function Signup() {
  const [emailError, setEmailError] = useState()
  const [usernameError, setUsernameError] = useState()
  const [passwordError, setPasswordError] = useState()
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [type, setType] = useState("password")
  const navigate = useNavigate()

  function handleSignup(e) {
    e.preventDefault()
    axios
      .post(
        import.meta.env.VITE_API_URL
          ? `${import.meta.env.VITE_API_URL}/users`
          : "http://localhost:3000/users",
        {
          headers: { "Content-Type": "application/json" },
          username: userData.username.toLowerCase(),
          password: userData.password,
          confirmPassword: userData.confirmPassword,
          email: userData.email.toLowerCase(),
        }
      )
      .then((response) => {
        console.log(response)
        setLocalStorage(response.data)
        window.location.reload()
      })
      .catch((error) => {
        const errors = ["username", "password", "email"]
        if (error.response.status == 422) {
          error.response.data.errors.forEach((element) => {
            if (element.path == "password") {
              setPasswordError(element.msg)
              errors.splice(errors.indexOf("password"), 1)
            }
            if (element.path == "username") {
              setUsernameError(element.msg)
              errors.indexOf("username") != -1 &&
                errors.splice(errors.indexOf("username"), 1)
            }
            if (element.path == "email") {
              setEmailError(element.msg)
              errors.splice(errors.indexOf("email"), 1)
            }
          })
          console.log(errors)
          errors.forEach((element) => {
            element == "password"
              ? setPasswordError(null)
              : element == "username"
              ? setUsernameError(null)
              : element == "email"
              ? setEmailError(null)
              : null
          })
          console.log(error.response.data.errors)
        }
        console.log(error.response)
      })
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id)
      // setIsConnected(true)
      navigate("/home")
    })
  })
  return (
    <>
      <div className="h-lvh  flex-col p-4  bg-black  text-white flex  items-center ">
        <div className="flex-col w-130 grow-2 flex mt-30 justify-center ">
          <div className="flex pb-10 gap-8">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="hover:scale-130 transition-transform duration-200" />
            </button>
            <p className="text-3xl font-extralight text-shadow-white text-shadow-2xs/50">
              Create your account
            </p>
          </div>

          <form
            className="flex gap-10   flex-col"
            action=""
            onSubmit={(e) => handleSignup(e)}
          >
            <div>
              <label className="relative  flex flex-col   " htmlFor="username">
                <input
                  className={`bg-white peer outline-0 ${
                    usernameError && "border-red-500 hover:border-red-500"
                  }  border-2 border-gray-900/60 pr-6 align-text-bottom rounded-md  pl-3 text-md pt-4 pb-1  text-black hover:border-gray-800/30 transition-colors duration-200`}
                  onChange={(e) =>
                    setUserData({ ...userData, username: e.target.value })
                  }
                  placeholder=""
                  type="text"
                  name="username"
                  id="username"
                />
                <div
                  className={`absolute pointer-events-none  ${
                    usernameError && "text-red-500"
                  } left-3.5 top-[0.7em]  peer-focus:translate-y-[-0.4em] peer-focus:scale-75  origin-top-left  peer-not-placeholder-shown:scale-75   peer-not-placeholder-shown:translate-y-[-0.4em] transition-transform text-gray-400/70`}
                >
                  Username
                </div>
              </label>
              {usernameError && (
                <div className="flex pt-2 gap-2">
                  <CircleAlert size={"1.3em"} color="red" />
                  <p className=" text-red-500">{usernameError}</p>
                </div>
              )}
            </div>
            <div>
              <label className="relative flex flex-col " htmlFor="email">
                <input
                  className={`bg-white peer outline-0 ${
                    emailError && "border-red-500 hover:border-red-500"
                  } border-2  pr-6 align-text-bottom rounded-md pl-3 text-md pt-4 pb-1  text-black hover:border-gray-800/30  transition-colors duration-200`}
                  onChange={(e) =>
                    setUserData({ ...userData, email: e.target.value })
                  }
                  placeholder=""
                  type="text"
                  name="email"
                  id="email"
                  autoComplete="email"
                />
                <div
                  className={`absolute pointer-events-none  ${
                    emailError && "text-red-500"
                  }  left-3.5 top-[0.7em]  peer-focus:translate-y-[-0.4em] peer-focus:scale-75  origin-top-left  peer-not-placeholder-shown:scale-75   peer-not-placeholder-shown:translate-y-[-0.4em] transition-transform text-gray-400/70`}
                >
                  Email
                </div>
              </label>
              {emailError && (
                <div className="flex pt-2 gap-2">
                  <CircleAlert size={"1.3em"} color="red" />
                  <p className=" text-red-500">{emailError}</p>
                </div>
              )}
            </div>

            <div>
              <label className="relative flex flex-col " htmlFor="password">
                <input
                  className={`bg-white peer outline-0  ${
                    passwordError && "border-red-500 hover:border-red-500"
                  } border-2 border-gray-400/20 pr-6 align-text-bottom rounded-md  text-md pl-3 pt-4 pb-1  text-black hover:border-gray-800/30 transition-colors duration-200`}
                  onChange={(e) =>
                    setUserData({ ...userData, password: e.target.value })
                  }
                  placeholder=" "
                  type={type}
                  name="password"
                  id="password"
                />
                {type == "password" ? (
                  <EyeOff
                    onClick={(e) =>
                      type == "password" ? setType("text") : setType("password")
                    }
                    className="absolute z-10  right-2 top-3  hidden peer-not-placeholder-shown:block"
                    color="black"
                    size={"1.5em"}
                  />
                ) : (
                  <Eye
                    onClick={() =>
                      type == "password" ? setType("text") : setType("password")
                    }
                    className="absolute z-10 right-2 top-3 hidden peer-not-placeholder-shown:block"
                    color="black"
                    size={"1.5em"}
                  />
                )}

                <div
                  className={`absolute pointer-events-none  ${
                    passwordError && "text-red-500"
                  } left-3.5 top-[0.7em]  peer-focus:translate-y-[-0.4em] peer-focus:scale-75  origin-top-left  peer-not-placeholder-shown:scale-75   peer-not-placeholder-shown:translate-y-[-0.4em] transition-transform text-gray-400/70`}
                >
                  Password
                </div>
              </label>
              {passwordError && (
                <div className="flex pt-2 gap-2">
                  <CircleAlert size={"1.3em"} color="red" />
                  <p className=" text-red-500">{passwordError}</p>
                </div>
              )}
            </div>

            <button className="bg-blue-700 mt-5  rounded-full p-2 pl-10 pr-10 hover:bg-blue-700/70 transition-opacity">
              Sign up
            </button>
          </form>
        </div>
        <div className="flex grow"></div>
      </div>
    </>
  )
}

export default Signup
