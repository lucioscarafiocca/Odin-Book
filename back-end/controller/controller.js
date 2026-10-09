import { body, validationResult } from "express-validator"
import db from "../db/queries.js"
import bcrypt from "bcrypt"
import issueJWT from "../utils.js"
import "dotenv/config"
import { decode } from "base64-arraybuffer"
import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

const lengthErr = "must be between 4 and 15 characters"
const passErr = "must be the same"
const emailErr = "must contain @ and have the right format"
const validateUser = [
  body("username")
    .trim()
    .isLength({ max: 15, min: 4 })
    .withMessage(`Name ${lengthErr}`),
  body("password")
    .trim()
    .isLength({ max: 15, min: 3 })
    .withMessage(`Passwords ${lengthErr}`),

  body("email").trim().isEmail().withMessage(`Email ${emailErr}`),
]

const NewUserPost = [
  validateUser,
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(422).json(errors)
    } else {
      const { username, email, password } = req.body
      const hashedpassword = await bcrypt.hash(password, 10)
      const user = await db.CreateUser(username, hashedpassword, email)
      const jwt = issueJWT(user)
      res.json({ user, token: jwt.token, exp: jwt.expires })
    }
  },
]

async function indexGet(req, res) {
  res.json("hello friend")
}

// async function LoginPost(email, password, callback) {
//   const user = await db.GetUserByEmail(email)
//   if (user) {
//     const match = await bcrypt.compare(
//       password.toString(),
//       user.password.toString()
//     )
//     if (match) {
//       const jwt = issueJWT(user)
//       console.log(jwt)
//       callback({
//         status: "ok",
//         data: { user, token: jwt.token, exp: jwt.expires },
//       })
//     } else {
//       callback({
//         status: "Error",
//         error: {
//           code: "VALIDATION FAILED",
//           message: "password do not match lol",
//         },
//       })
//     }
//   } else {
//     callback({
//       status: "Error",
//       error: {
//         code: "VALIDATION FAILED",
//         message: "uesrname does not match",
//       },
//     })
//   }
// }

async function loginPost(req, res) {
  const { email, password } = req.body
  const user = await db.GetUserByEmail(email)
  if (user) {
    const match = await bcrypt.compare(
      password.toString(),
      user.password.toString()
    )
    if (match) {
      const jwt = issueJWT(user)
      res.json({ user, token: jwt.token, exp: jwt.expires })
    } else {
      res.status(400).json("password is wrong")
    }
  } else {
    res.status(400).json("user doesnt exist")
  }
}

async function githubAuth(req, res) {
  const { code } = req.query
  fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code,
    }),
  })
    .then((response) => {
      if (response.status >= 400) {
        throw new Error("server error")
      } else {
        return response.json()
      }
    })
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log("error is " + error)
    })
}

async function createPost(text, authorId, postId, publicUrl) {
  const post = await db.CreatePost(text, authorId, postId, publicUrl)
  return post
}
async function storeFilePost(req, res) {
  const { id } = req.user
  const file = req.file
  const fileBase64 = decode(file.buffer.toString("base64"))
  const bucket = await supabase.storage.from("AvatarUrls")
  const splice = file.mimetype.slice(6)
  console.log(file)

  const response = await bucket.upload(id + "." + splice, fileBase64, {
    upsert: true,
  })
  const image = await db.UpdateUserImage(id, id + "." + splice)
  console.log(response)
  res.json("success")
}
async function storeFilesPost(req, res) {
  const file = req.file

  console.log(file)
  const fileBase64 = decode(file.buffer.toString("base64"))
  const bucket = await supabase.storage.from("PostImages")
  const id = randomUUID()
  const response = await bucket.upload(id, fileBase64, {
    upsert: true,
    contentType: file.mimetype,
  })
  const { data, error } = bucket.getPublicUrl(id)

  console.log(data.publicUrl)
  res.json(data.publicUrl)
}
export default {
  indexGet,
  NewUserPost,
  loginPost,
  githubAuth,
  createPost,
  storeFilePost,
  storeFilesPost,
}
