import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import "./App.css"
import socket from "./socket"
import axios from "axios"
import { setLocalStorage } from "./jwtlib"
import { attachInterceptor } from "./jwtlib"
import { CircleAlert } from "lucide-react"
function App() {
  const navigate = useNavigate()
  const [error, setError] = useState()
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [isConnected, setIsConnected] = useState()
  const [email, setEmail] = useState()
  const [password, setPassword] = useState()
  const [text, setText] = useState("hello")
  const client_id = import.meta.env.VITE_CLIENT_ID
  const url = import.meta.env.VITE_URL

  function handleSignup(e) {
    e.preventDefault()
    axios
      .post("http://localhost:3000/users", {
        headers: { "Content-Type": "application/json" },
        username: userData.username.toLowerCase(),
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        email: userData.email.toLowerCase(),
      })
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        if (error.response.status == 422) {
          console.log(error.response.data.errors)
          setError(error.response.data.errors)
        }
        console.log(error.response)
      })
  }

  function handleLogin(e) {
    e.preventDefault()
    if (email && password) {
      axios
        .post("http://localhost:3000/login", {
          headers: { "Content-Type": "application/json" },
          email: email.toLowerCase(),
          password,
        })
        .then((res) => {
          console.log(res)
          setLocalStorage(res.data)
          // socket.disconnect()
          // navigate("/home")
          setIsConnected(true)
          window.location.reload()
          ///retry connection
        })
        .catch((err) => {
          console.log(err.response)
          setError(err.response.data)
        })
      // socket.emit("login", email, password, (response) => {
      //   if (response.status == "ok") {
      //     console.log(response)
      //     setLocalStorage(response.data)
      //   } else {
      //     console.log(response.error.message)
      //   }
      // })
    }
    // socket.emit("login", { auth: { token: jwt } })
  }

  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id)
      // setIsConnected(true)
      navigate("/home")
    })
    // axios
    //   .get("http://localhost:3000/test", {
    //     withCredentials: true,
    //   })
    //   .then((res) => console.log(res))
    //   .catch((err) => console.log(err))
    // attachInterceptor()
    // axios.get("http://localhost:3000/protected")
  }, [])

  return (
    <>
      {/* {isConnected ? (
        navigate("/home")
      ) : ( */}
      {/* <> */}
      <div className="h-lvh  p-4 bg-black    text-white flex  items-center">
        <div className="flex grow-2  justify-center">
          <div className=" grow flex justify-center items-center">
            <svg
              className=" h-full  w-full "
              version="1.1"
              id="Layer_1"
              xmlns:x="&ns_extend;"
              xmlns:i="&ns_ai;"
              xmlns:graph="&ns_graphs;"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              color="white"
              viewBox="0 0 1400 980"
              transform="scale(-1, 1)"
              enableBackground="new 0 0 1400 980"
              xmlSpace="preserve"
            >
              <g>
                <path
                  fill="#1d9bf0"
                  d="M335.757,410.696c0,0,19.46,38.805,64.212,27.967
					c44.869-10.954,46.734-47.898,46.734-47.898l-8.274-20.044L335.757,410.696z"
                />

                <path
                  fill="#1d9bf0"
                  d="M231.919,405.217c3.497-1.516,6.643-3.146,9.905-5.011
					c3.729-2.214,6.994-4.079,11.655-4.079c5.36,0,9.323,2.447,13.401,5.709c4.196,3.148,8.275,6.41,12.471,9.558l45.917,33.912
					c2.563,1.865,5.126,3.846,7.458,6.061c21.793,21.909-26.105,44.17-44.285,55.123c-12.354,7.46-27.621,9.206-43.935,9.322
					c-17.132,0.237-34.147-2.794-51.046-4.895c-17.015-2.211-33.213-3.376-49.996-2.095c-19.927,9.671-33.795,24.94-47.665,52.442
					c-17.014-64.681,4.896-101.274,63.749-128.543c13.053-6.061,26.688-11.071,40.322-15.967
					C210.476,413.142,221.546,409.529,231.919,405.217L231.919,405.217z M304.639,482.249c-25.055,2.331-50.228,4.079-75.167,7.46
					c-17.481,2.33-32.515,4.427-45.568,6.991C228.306,501.13,260.587,513.367,304.639,482.249L304.639,482.249z M237.046,417.105
					c-41.837,17.83-143.577,36.941-135.419,113.51c36.595-55.475,145.559-55.475,214.551-62.699
					c14.566-1.516,9.672-5.944,1.397-12.121l-46.032-33.912C247.302,403.934,259.656,407.548,237.046,417.105L237.046,417.105z"
                />
                <path
                  fill="#1d9bf0"
                  d="M218.866,415.473c24.706-38.109,54.541-72.838,93.116-97.661
					c15.966-10.256,32.865-18.415,50.462-25.523c15.383-6.177,31.116-11.537,46.616-17.481
					c27.387-10.839,49.996-22.958,71.089-43.935l17.25-17.132l4.66,23.658c1.865,8.275,2.214,18.063,1.516,27.504
					c24.356-6.293,48.48-14.335,71.089-24.941c24.824-11.653,48.365-27.854,65.613-49.295c5.478-6.761,12.937-17.482,15.732-25.872
					l18.295-56.755l6.993,59.318c1.399,11.887,1.632,24.938,1.283,36.943c-0.583,25.405-4.081,52.094-12.705,76.101
					c-10.022,28.319-26.104,49.53-47.78,62.464c7.924-0.814,15.499-2.68,22.608-5.825l37.642-16.433l-21.327,35.194
					c-6.992,11.423-17.482,23.775-26.919,33.097c-14.685,14.685-31.817,27.387-51.047,35.313
					c9.09,9.905,16.666,21.561,20.162,32.981l8.274,27.621l-26.223-12.004c-12.351-5.711-25.755-9.323-39.156-11.538
					c-6.644,19.695-16.431,37.76-29.717,53.142c-6.293-10.37-2.682-16.55,3.728-27.386c6.995-11.655,12.587-24.94,16.667-40.091
					c18.411,2.098,37.059,6.293,53.958,13.986c0,0-7.225-24.242-33.797-42.305c57.338-10.955,92.999-69.575,92.999-69.575
					c-35.544,15.5-79.247,3.264-103.02-5.942c2.796,0.233,5.593,0.35,8.389,0.582C690.27,354.29,668.36,168.875,668.36,168.875
					s-15.848,48.946-88.22,82.86c-31.231,14.682-64.681,24.24-92.767,30.417c6.41-22.494,1.982-42.072,1.982-42.072
					c-75.168,74.701-157.794,36.943-250.096,168.518L218.866,415.473z M499.495,602.285
					c-44.403-42.185-78.665-33.328-133.204-39.391c-51.046-5.593-101.974-25.522-146.493-50.692l-10.254-5.713
					c11.071,3.847,22.607,4.661,33.912,3.613c42.305,21.793,84.725,35.428,123.649,39.855
					C403.233,553.922,487.257,549.842,499.495,602.285L499.495,602.285z"
                />
                <path
                  fill="#1d9bf0"
                  d="M427.474,304.061c1.865-1.865,15.266-10.14,59.9-21.909
					c44.635-11.888,52.327-28.087,52.327-28.087C497.979,269.565,449.15,273.993,427.474,304.061L427.474,304.061z"
                />
                <path
                  fill="#1d9bf0"
                  d="M486.443,452.765c0,0,25.64-13.983,77.849-1.049l5.825,15.266
					C570.117,466.982,528.978,455.33,486.443,452.765L486.443,452.765z"
                />
                <path
                  fill="#1d9bf0"
                  d="M295.083,404.984c0,0,112.695-8.392,195.788-78.315
					C456.375,383.541,341.931,425.729,295.083,404.984L295.083,404.984z"
                />
                <path
                  fill="#1d9bf0"
                  d="M386.684,442.743c-24.007,0-53.726-10.605-64.212-33.795
					c4.778-0.117,9.788-0.466,14.565-0.817c8.741,12.82,27.738,21.56,49.647,21.56c30.301,0,54.773-16.78,54.773-37.642
					c0-7.925-3.613-15.383-9.787-21.444c3.262-2.913,6.525-6.061,9.672-8.973c5.827,5.828,10.255,13.052,12.237,21.676
					c0.583,2.913,0.932,5.827,0.932,8.741c0,3.029-0.349,5.944-0.932,8.74C446.936,429.69,413.371,442.743,386.684,442.743
					L386.684,442.743z"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M422.111,379.229c4.312,5.011,6.759,10.954,6.759,17.248
					c0,18.997-22.376,34.38-49.996,34.38c-24.239,0-44.401-11.772-49.062-27.504C349.856,399.506,401.717,389.019,422.111,379.229
					L422.111,379.229z M413.72,392.747c4.313,0,7.926,2.449,7.926,5.478c0,3.029-3.613,5.476-7.926,5.476
					c-4.428,0-8.039-2.447-8.039-5.476C405.681,395.196,409.292,392.747,413.72,392.747L413.72,392.747z"
                />
                <path
                  fill="#1d9bf0"
                  d="M489.355,485.513c0,0,69.69,43.002,2.214,105.936l7.925,10.836
					c18.645-14.915,50.927-60.368,24.007-98.59C516.975,494.488,504.971,488.426,489.355,485.513L489.355,485.513z"
                />
              </g>
            </svg>
          </div>
        </div>
        <div className="flex grow  ">
          <div>
            <p className="text-8xl pb-20 max-sm:text-3xl text-shadow-white text-shadow-2xs/50">
              Welcome
            </p>

            {error && (
              <p className="text-2xl flex text-center border border-white rounded-md p-5 mb-5">
                <CircleAlert color="red" />
                {error}
              </p>
            )}
            <form
              className="flex  flex-col pb-20"
              action=""
              onSubmit={(e) => handleLogin(e)}
            >
              <label
                className="relative flex flex-col text-3xl"
                htmlFor="email"
              >
                <input
                  className="bg-white peer outline-0 border align-text-bottom rounded-md pl-2 text-[0.6em] pt-2 pb-1  text-black hover:border-gray-800/30 transition-colors"
                  placeholder=""
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  name="email"
                  id="email"
                />
                <div className="absolute left-2 top-1.5 text-[0.7em] peer-focus:-translate-y-1.5 peer-focus:scale-75 origin-top-left  peer-not-placeholder-shown:scale-75   peer-not-placeholder-shown:-translate-y-1.5   transition-transform text-gray-400/70">
                  Email
                </div>
              </label>

              <label
                className="relative flex flex-col text-3xl  "
                htmlFor="password"
              >
                <input
                  autoComplete="current-password"
                  className="bg-white peer outline-0 border  align-text-bottom rounded-md pl-2 text-[0.6em] pt-2 pb-1  text-black hover:border-gray-800/30 transition-colors"
                  placeholder=""
                  onChange={(e) => setPassword(e.target.value)}
                  type="text"
                  name="password"
                  id="password"
                />
                <div className="absolute left-2 top-1.5 text-[0.7em] peer-focus:-translate-y-1.5 peer-focus:scale-75 origin-top-left  peer-not-placeholder-shown:scale-75   peer-not-placeholder-shown:-translate-y-1.5   transition-transform text-gray-400/70">
                  Password
                </div>
              </label>
              <button className="bg-blue-700 mt-5 rounded-full p-1 pl-10 pr-10 hover:bg-blue-700/50 transition-opacity">
                Login
              </button>
            </form>

            <div className="flex flex-col mt-5  ">
              <button className="bg-white  text-black rounded-full p-1 pl-10 pr-10 hover:text-black/50 transition-opacity">
                Sign up with github
              </button>
              <div className="flex items-center m-2 ">
                <div className="border-t border border-gray-800 grow"></div>
                <div className="px-3 text-gray-800 font-bold text-xs">OR</div>
                <div className="border-t border border-gray-800 grow"></div>
              </div>
              <button
                onClick={() => navigate("/signup")}
                className=" bg-blue-700 rounded-full p-1 pl-20 pr-20 hover:bg-blue-700/50 transition-opacity"
              >
                Sign up
              </button>
              <p className="mt-5 mb-3 text-xm">already logged in?</p>

              <button className="bg-blue-700 block rounded-full p-1 pl-10 pr-10 hover:bg-blue-700/50 transition-opacity">
                Guest account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
