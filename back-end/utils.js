import jsonwebtoken from "jsonwebtoken"
import "dotenv/config"

function issueJWT(user) {
  const id = user.id

  const expiresIn = "1d"

  const payload = {
    sub: id,
    iat: Date.now(),
  }

  const signedToken = jsonwebtoken.sign(payload, process.env.PRIVATE_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  })

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  }
}

export default issueJWT
