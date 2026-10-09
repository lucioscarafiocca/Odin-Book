import express from "express"
import { createServer } from "node:http"
import cors from "cors"
import controller from "./controller/controller.js"
import { Server } from "socket.io"
import passport from "passport"
import "dotenv/config"
import GitHubStrategy from "passport-github2"
import session from "express-session"
import passportjwt from "./passport.js"
import db from "./db/queries.js"
import multer from "multer"
import { createClient } from "@supabase/supabase-js"
passportjwt(passport)

const storage = multer.memoryStorage()
const upload = multer({ storage })

const app = express()
const server = createServer(app)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://127.0.0.1:5173"],
    credentials: true,
  })
)
app.use(express.json())

const sessionMiddleware = session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: "none",
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 365,
  },
})

passport.serializeUser(function (user, done) {
  done(null, user.id)
})

passport.deserializeUser(async function (id, done) {
  // console.log("obj")
  // console.log(obj)
  try {
    const user = await db.GetUser(id)
    if (user) {
      done(null, user)
    } else {
      done(null, false)
    }
  } catch (error) {
    done(error)
  }
})

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:5173/auth",
    },
    async function (accessToken, refreshToken, profile, done) {
      process.nextTick(async function () {
        const user = await db.FindOrCreate(profile)
        //  console.log(user)
        return done(null, user)

        // console.log(user)
        // return done(null, user)
      })
    }
  )
)

app.use(
  session({
    secret: "secret_ttt",
    resave: false,
    saveUninitialized: false,
    cookie: {
      sameSite: false,
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    },
  })
)
app.use(passport.initialize())
app.use(passport.session())

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL || "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
  },
})

async function isUserConnected(userId) {
  const sockets = await io.in(userId).fetchSockets()
  return sockets.length > 0
}

function onlyForHandshake(middleware) {
  return (req, res, next) => {
    const isHandshake = req._query.sid === undefined
    if (isHandshake) {
      middleware(req, res, next)
    } else {
      next()
    }
  }
}

io.engine.use(onlyForHandshake(sessionMiddleware))
io.engine.use(onlyForHandshake(passport.session()))

// io.engine.use(
//   onlyForHandshake((req, res, next) => {
//     console.log(req.user)
//     if (req.user) {
//       next()
//     } else {
//       res.writeHead(401)cd
//       res.end()
//     }
//   })
// )

io.engine.use((req, res, next) => {
  const isHandshake = req._query.sid === undefined
  if (isHandshake) {
    passport.authenticate("jwt", { session: false })(req, res, next)
  } else {
    next()
  }
})

io.on("connection", (socket) => {
  io.emit("connection")
  socket.join(socket.request.user.id)
  // console.log(socket.id)
  // console.log(socket.request.user)
  // console.log("asdasd")

  // socket.on("code", (code) => {
  //   console.log(code)
  //   // const url = `https://github.com/login/oauth/access_token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${code}`
  //   const response = fetch("https://github.com/login/oauth/access_token", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //     },
  //     body: JSON.stringify({
  //       client_id: process.env.CLIENT_ID,
  //       client_secret: process.env.CLIENT_SECRET,
  //       code,
  //     }),
  //   })
  //     .then((response) => {
  //       if (response.status >= 400) {
  //         throw new Error("server error")
  //       } else {
  //         return response.json()
  //       }
  //     })
  //     .then((response) => {
  //       console.log(response)
  //     })
  //     .catch((error) => {
  //       console.log("error is " + error)
  //     })
  // })
  socket.on("login", (email, password, callback) => {
    controller.loginPost(email, password, callback)
  })
  socket.on("data", async (cursor, callback) => {
    const user = socket.request.user
    const bucket = await supabase.storage.from("AvatarUrls")
    console.log(user.receivedNotifications.post)
    const { data, error } = user.avatarUrl
      ? bucket.getPublicUrl(user.avatarUrl)
      : bucket.getPublicUrl("default-user-pic.jpg")
    const postsNoImg =
      cursor.type == "top"
        ? await db.SearchHomepagePostsTop(user.id, cursor.cursor)
        : await db.SearchHomepagePostsBottom(user.id, cursor.cursor)
    const posts = postsNoImg.map((element) => {
      console.log(element)
      const { data, error } = element.avatarUrl
        ? bucket.getPublicUrl(element.avatarUrl)
        : bucket.getPublicUrl("default-user-pic.jpg")
      return { ...element, avatarUrl: data.publicUrl }
    })
    // console.log(posts)
    callback({
      status: "ok",
      data: { user, posts, picture: data.publicUrl },
    })
    // console.log(socket.id)
    // console.log(socket.request.user)
  })
  socket.on("userpost", async (username, replies, page, callback) => {
    const clientId = socket.request.user.id
    const client = socket.request.user.username
    const posts = replies
      ? await db.GetReplies(username, clientId, page)
      : await db.GetPosts(username, clientId, page)
    const user = await db.GetUserByName(username, clientId)
    const bucket = supabase.storage.from("AvatarUrls")
    if (user) {
      console.log(user)
      const { data, error } = user.avatarUrl
        ? bucket.getPublicUrl(user.avatarUrl)
        : bucket.getPublicUrl("default-user-pic.jpg")

      console.log(clientId)
      callback({
        status: "ok",
        data: {
          posts: posts,
          user: user,
          client: {
            username: client,
            receivedNotifications: socket.request.user.receivedNotifications,
            avatarUrl: socket.request.user.avatarUrl
              ? bucket.getPublicUrl(socket.request.user.avatarUrl)
              : bucket.getPublicUrl("default-user-pic.jpg"),
          },
          picture: `${data.publicUrl}?t=${new Date().getTime()}`,
        },
      })
    } else {
      callback({
        status: "Error",
        error: {
          code: "NO USER FOUND",
        },
        client: {
          username: client,
          receivedNotifications: socket.request.user.receivedNotifications,
          avatarUrl: socket.request.user.avatarUrl
            ? bucket.getPublicUrl(socket.request.user.avatarUrl)
            : bucket.getPublicUrl("default-user-pic.jpg"),
        },
      })
    }
    // console.log(posts)
    // console.log(socket.id)
    // console.log(socket.request.user)
  })
  socket.on("createPost", async (text, postId, publicUrl) => {
    const userId = socket.request.user.id
    const username = socket.request.user.username
    if (text.length < 240) {
      const post = await controller.createPost(text, userId, postId, publicUrl)
      if (post) {
        console.log(post)
        const mentionMatch = text.match(/(?:^|\s)(@[^\s]+)/g)
        mentionMatch &&
          mentionMatch.forEach(async (element) => {
            const match = await db.GetUserByName(element.slice(2).toLowerCase())
            if (match && match.username !== username) {
              const connected = await isUserConnected(match.id)
              await db.CreateNotifications("mention", post.id, userId, match.id)
              connected &&
                socket.to(match.id).emit("newNotification", "youve got mail")
            }
          })
        console.log(post)
        socket.emit(
          "postNotification",
          post && { username: username, id: post.id }
        )
      } else {
        socket.emit("errorNotification", "Looks like you already posted that!")
      }
    }
    // const matchId =
    //   mentionMatch && (await db.GetUserByName(mentionMatch[0].slice(2)))
    // if (matchId) {
    // connected
    //   ? socket.to(matchId.id).emit("notification", "youve got mail")
    //   : await db.CreateNotifications("mention", post.id, userId, matchId.id)
    // }

    // io.to(socket.id).emit("123", "hello")
  })
  socket.on("likedpost", async (postId) => {
    const userId = socket.request.user.id
    const liked = await db.UserHasLiked(postId, userId)
    const matchId = await db.GetPost(postId)
    const connected = await isUserConnected(matchId.authorId)
    if (liked) {
      const post = await db.DislikePost(postId, userId)
      if (matchId.authorId != userId) {
        await db.RemoveNotification("like", postId, userId, matchId.authorId)
        connected &&
          socket
            .to(matchId.authorId)
            .emit("removeNotification", "youve got like")
      }
      console.log(post)
    } else {
      const post = await db.LikePost(postId, userId)
      if (matchId.authorId != userId) {
        await db.CreateNotifications("like", postId, userId, matchId.authorId)
        connected &&
          socket.to(matchId.authorId).emit("newNotification", "youve got like")
        console.log(post)
      }
    }
  })
  socket.on("post", async (postId, callback) => {
    const id = socket.request.user.id
    const post = await db.GetPost(postId, id)
    const bucket = supabase.storage.from("AvatarUrls")
    if (post) {
      const replies = post.replies.map((element) => {
        const { data, error } = element.author.avatarUrl
          ? bucket.getPublicUrl(element.author.avatarUrl)
          : bucket.getPublicUrl("default-user-pic.jpg")
        return {
          ...element,
          author: { ...element.author, avatarUrl: data.publicUrl },
        }
      })
      const { data, error } = post.author.avatarUrl
        ? bucket.getPublicUrl(post.author.avatarUrl)
        : bucket.getPublicUrl("default-user-pic.jpg")
      console.log(post)
      if (post.parent) {
        callback({
          status: "ok",
          data: {
            post: {
              ...post,
              author: { ...post.author, avatarUrl: data.publicUrl },
              replies: replies,
              parent: {
                ...post.parent,
                author: {
                  ...post.parent.author,
                  avatarUrl: post.parent.author.avatarUrl
                    ? bucket.getPublicUrl(post.parent.author.avatarUrl)
                    : bucket.getPublicUrl("default-user-pic.jpg"),
                },
              },
            },
            client: {
              username: socket.request.user.username,
              picture: socket.request.user.avatarUrl
                ? bucket.getPublicUrl(socket.request.user.avatarUrl)
                : bucket.getPublicUrl("default-user-pic.jpg"),
              receivedNotifications: socket.request.user.receivedNotifications,
            },
          },
        })
      } else {
        callback({
          status: "ok",
          data: {
            post: {
              ...post,
              author: { ...post.author, avatarUrl: data.publicUrl },
              replies: replies,
              parent: null,
            },
            client: {
              username: socket.request.user.username,
              picture: socket.request.user.avatarUrl
                ? bucket.getPublicUrl(socket.request.user.avatarUrl)
                : bucket.getPublicUrl("default-user-pic.jpg"),
              receivedNotifications: socket.request.user.receivedNotifications,
            },
          },
        })
      }
    } else {
      callback({
        status: "Error",
        error: {
          code: "NO USER FOUND",
        },
        client: {
          username: socket.request.user.username,
          receivedNotifications: socket.request.user.receivedNotifications,
          picture: socket.request.user.avatarUrl
            ? bucket.getPublicUrl(socket.request.user.avatarUrl)
            : bucket.getPublicUrl("default-user-pic.jpg"),
        },
      })
    }
  })
  socket.on("createComment", async (text, postId, publicUrl, callback) => {
    const userId = socket.request.user.id
    const username = socket.request.user.username
    const comment = await db.CreateComment(text, userId, postId, publicUrl)
    const author = await db.GetPost(postId)
    const connected = await isUserConnected(author.author.id)
    const mentionMatch = text.match(/(?:^|\s)(@[^\s]+)/)
    if (comment) {
      if (author.author.id != userId) {
        await db.CreateNotifications(
          "comment",
          comment.id,
          userId,
          author.author.id
        )
        connected &&
          socket
            .to(author.author.id)
            .emit("newNotification", "youve got comment")
      }
      if (mentionMatch) {
        mentionMatch.forEach(async (element) => {
          const match = await db.GetUserByName(element.slice(2).toLowerCase())
          if (
            match &&
            match.username !== username &&
            match.id != author.author.id
          ) {
            const connected = await isUserConnected(match.id)
            await db.CreateNotifications(
              "mention",
              comment.id,
              userId,
              match.id
            )
            connected &&
              socket.to(match.id).emit("notification", "youve got mail")
          }
        })
      }

      socket.emit(
        "postNotification",
        comment && { username: username, id: comment.id }
      )
      callback && callback("")
    } else {
      socket.emit("errorNotification", "Looks like you already posted that!")
      callback && callback("error")
    }
  })
  socket.on("searchUser", async (name, callback) => {
    const username = socket.request.user.id
    console.log(username)
    const users = await db.GetUsersByName(name, username)
    const bucket = supabase.storage.from("AvatarUrls")
    const fullUsers = users.map((element) => {
      const { data, error } = element.avatarUrl
        ? bucket.getPublicUrl(element.avatarUrl)
        : bucket.getPublicUrl("default-user-pic.jpg")
      return { ...element, avatarUrl: data.publicUrl }
    })
    console.log(users)
    callback({
      status: "ok",
      data: {
        fullUsers,
      },
    })
  })

  socket.on("follow", async (id) => {
    const userId = socket.request.user.id
    const follows = await db.UserHasFollowed(id, userId)
    const connected = await isUserConnected(id)
    if (follows && id !== userId) {
      const follow = await db.UnfollowUser(follows.id)
      await db.RemoveNotification("follow", null, userId, id)
      connected && socket.to(id).emit("removeNotification", "youve got follow")
      console.log(follow)
    } else if (id !== userId) {
      const follow = await db.FollowUser(id, userId)
      await db.CreateNotifications("follow", null, userId, id)
      connected && socket.to(id).emit("newNotification", "youve got follow")

      console.log(follow)
    }
  })
  socket.on("follows", async (following, username, callback) => {
    const { id } = await db.GetUserByName(username)
    const res = following
      ? await db.GetFollowing(id)
      : await db.GetFollowers(id)
    const fullres = []
    const bucket = supabase.storage.from("AvatarUrls")
    res.forEach((element) => {
      const { data, error } = element.avatarUrl
        ? bucket.getPublicUrl(element.avatarUrl)
        : bucket.getPublicUrl("default-user-pic.jpg")
      fullres.push({ ...element, avatarUrl: data.publicUrl })
    })
    console.log(socket.request.user)
    callback({
      status: "ok",
      data: {
        fullres,
        client: {
          receivedNotifications: socket.request.user.receivedNotifications,
          avatarUrl: socket.request.user.avatarUrl
            ? bucket.getPublicUrl(socket.request.user.avatarUrl)
            : bucket.getPublicUrl("default-user-pic.jpg"),
          username: socket.request.user.username,
        },
      },
    })
  })
  socket.on("userSave", async (username, status) => {
    const userId = socket.request.user.id
    const user = await db.UpdateUser(username, status, userId)
    console.log(user)
  })
  socket.on("searchData", async (search, page, callback) => {
    const userId = socket.request.user.id
    const data =
      search == false ? [] : await db.SearchPosts(search, userId, page)
    const bucket = supabase.storage.from("AvatarUrls")
    console.log(data)
    const fullData = data.map((element) => {
      const { data, error } = element.author.avatarUrl
        ? bucket.getPublicUrl(element.author.avatarUrl)
        : bucket.getPublicUrl("default-user-pic.jpg")
      return {
        ...element,
        author: { ...element.author, avatarUrl: data.publicUrl },
      }
    })
    callback({
      status: "ok",
      data: {
        fullData,
        client: {
          username: socket.request.user.username,
          receivedNotifications: socket.request.user.receivedNotifications,
          avatarUrl: socket.request.user.avatarUrl
            ? bucket.getPublicUrl(socket.request.user.avatarUrl)
            : bucket.getPublicUrl("default-user-pic.jpg"),
        },
      },
    })
  })
  socket.on("getNotifications", async (callback) => {
    const userId = socket.request.user.id
    const notifications = await db.GetNotifications(userId)
    // const backupNotifications =
    //   notifications.length == 0 && (await db.GetBackupNotifications(userId))
    // const mapvar =
    //   backupNotifications.length == 0 ? notifications : backupNotifications
    // console.log(mapvar)
    const bucket = supabase.storage.from("AvatarUrls")
    const fullNotifications = notifications.map((element) => {
      const { data, error } = element.sender.avatarUrl
        ? bucket.getPublicUrl(element.sender.avatarUrl)
        : bucket.getPublicUrl("default-user-pic.jpg")
      return {
        ...element,
        sender: { ...element.sender, avatarUrl: data.publicUrl },
      }
    })
    console.log(fullNotifications)
    socket.emit("cleanNotifications")
    // data: {
    //   ...notifications,
    //   avatarUrl: notifications.receiver.avatarUrl
    //     ? bucket.getPublicUrl(notifications.receiver.avatarUrl)
    //     : bucket.getPublicUrl("default-user-pic.jpg"),
    //   receivedNotifications: fullNotifications,
    // },

    callback({
      status: "ok",
      data: {
        fullNotifications,
        user: {
          username: socket.request.user.username,
          receivedNotifications: notifications,
          avatarUrl: socket.request.user.avatarUrl
            ? bucket.getPublicUrl(socket.request.user.avatarUrl)
            : bucket.getPublicUrl("default-user-pic.jpg"),
        },
      },
    })
  })
  socket.on("removePost", async (postId) => {
    // socket.emit("deleteNotification")
    const userId = socket.request.user.id
    await db.RemovePost(postId, userId)
    await db.RemoveNotification(undefined, postId, undefined, undefined)
  })
  socket.on("suggestion", async (callback) => {
    const userId = socket.request.user.id
    const suggestions = await db.GetSuggestions(userId)
    const bucket = supabase.storage.from("AvatarUrls")
    const fullSuggestions = suggestions.map((element) => {
      const { data, error } = element.avatarUrl
        ? bucket.getPublicUrl(element.avatarUrl)
        : bucket.getPublicUrl("default-user-pic.jpg")
      return { ...element, avatarUrl: data.publicUrl }
    })
    console.log(suggestions)
    callback({
      status: "ok",
      data: fullSuggestions,
      client: { username: socket.request.user.username },
    })
  })
})

io.on("hello", async (params) => {
  // console.log(params)
})

app.get("/", (req, res) => {
  console.log("asdasd")
  res.json("heyyy")
})

app.post("/users", controller.NewUserPost)
app.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log(req.user)
    console.log("IOASDHAIOSHDAS")
  }
)
app.post("/login", controller.loginPost)
app.get("/auth", (req, res) => {
  res.json("asdasd")
})

app.get(
  "/auth/github/callback",
  passport.authenticate("github"),
  (req, res) => {
    // console.log(req.isAuthenticated())
    // console.log(req.user)
    req.session.save(() => {
      res.json("succes")
    })
  }
)
app.post(
  "/upload",
  upload.single("file"),
  passport.authenticate("jwt", { session: false }),
  controller.storeFilePost
)
app.post(
  "/upload/post",
  upload.single("file"),
  passport.authenticate("jwt", { session: false }),
  controller.storeFilesPost
)

app.get("/test", (req, res) => {
  // console.log(req.isAuthenticated())
  res.json("faasd")
})
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`)
})
