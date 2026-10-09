import axios from "axios"
import moment from "moment"
import io from "socket.io-client"

// const axiosInstance = axios.create({ baseURL: "http://localhost:3000/" })

function attachInterceptor() {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("jwtToken")
      const notExpired = moment().isBefore(checkExpiration())
      if (token && notExpired) {
        config.headers.Authorization = token
      } else {
        logOut()
      }
      return config
    },
    (error) => {
      console.log(error)
      return Promise.reject(error)
    }
  )
}

function attachToken() {
  const token = localStorage.getItem("jwtToken")
  console.log(token)
  const notExpired = moment().isBefore(checkExpiration())
  if (token && notExpired) {
    return io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      extraHeaders: {
        Authorization: token,
      },
    })
  } else {
    logOut()
    return io(import.meta.env.VITE_API_URL || "http://localhost:3000")
  }
}

function setLocalStorage(response) {
  console.log(response)
  const amount = response.exp.charAt(0)
  const type = response.exp.charAt(1)
  const expires = moment().add(amount, type)

  localStorage.setItem("jwtToken", response.token)
  localStorage.setItem("expires", JSON.stringify(expires.valueOf()))
}

function checkExpiration() {
  const expiration = localStorage.getItem("expires")
  const expiresAt = JSON.parse(expiration)
  return moment(expiresAt)
}

function loggedIn() {
  const token = localStorage.getItem("jwtToken")
  if (token) {
    return true
  }
  return false
}

function logOut() {
  localStorage.removeItem("jwtToken")
  localStorage.removeItem("expires")
}
export { setLocalStorage, attachInterceptor, loggedIn, logOut, attachToken }
