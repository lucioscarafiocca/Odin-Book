import axios from "axios"
import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router"
function WaitingRoom() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  function handleasd() {
    const code = params.get("code")

    axios
      .get(`http://localhost:3000/auth/github/callback?code=${code}`, {
        withCredentials: true,
      })
      .then((response) => {
        navigate("/")
      })
      .catch((error) => {})
  }

  useEffect(() => {
    const code = params.get("code")

    axios
      .get(
        `${import.meta.env.VITE_URL}/auth/auth/github/callback?code=${code}` ||
          `http://localhost:3000/auth/github/callback?code=${code}`
      )
      .then((response) => {
        navigate("/")
      })
      .catch((error) => {})
  }, [])

  return (
    <>
      <button onClick={() => handleasd()}>Click me</button>
      <h3>PLEASE HOLD WHILE WE WAIT</h3>
    </>
  )
}

export default WaitingRoom
