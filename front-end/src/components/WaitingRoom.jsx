import axios from "axios"
import { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router"
function WaitingRoom() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  function handleasd() {
    const code = params.get("code")
    console.log(code)
    axios
      .get(`http://localhost:3000/auth/github/callback?code=${code}`, {
        withCredentials: true,
      })
      .then((response) => {
        navigate("/")
        console.log(response)
      })
      .catch((error) => {
        console.log(error)
      })
  }
  // useEffect(() => {
  //   const code = params.get("code")
  //   console.log(code)
  //   axios
  //     .get(`http://localhost:3000/auth/github/callback?code=${code}`)
  //     .then((response) => {
  //       navigate("/")
  //       console.log(response)
  //     })
  //     .catch((error) => {
  //       console.log(error)
  //     })
  // }, [])

  return (
    <>
      <button onClick={() => handleasd()}>Click me</button>
      <h3>PLEASE HOLD WHILE WE WAIT</h3>
    </>
  )
}

export default WaitingRoom
