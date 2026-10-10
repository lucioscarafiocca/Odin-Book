import { connect } from "http2"
import prisma from "./index.js"
import passport from "../passport.js"
import { userInfo } from "os"
import { DbNull } from "../generated/prisma/runtime/client.js"

async function StoreUser() {}

async function GetUser(id) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
    omit: {
      password: true,
    },
    include: {
      receivedNotifications: {
        where: {
          isRead: false,
        },
        include: {
          post: {
            include: {
              likedBy: {
                where: {
                  id: id,
                },
              },
            },
          },
          sender: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  })
  return user
}

async function GetUserByName(name, clientId) {
  console.log(name)
  const user = await prisma.user.findUnique({
    where: {
      username: name,
    },
    omit: {
      password: true,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
      followers: {
        where: {
          followerId: clientId,
        },
        select: {
          followingId: true,
        },
      },
      receivedNotifications: true,
    },
  })
  return user
}
async function GetUsersByName(name, username) {
  const user = await prisma.user.findMany({
    where: {
      username: {
        startsWith: name,
        not: username,
      },
    },
    select: {
      username: true,
      avatarUrl: true,
      followers: {
        where: {
          followerId: username,
        },
      },
    },
    take: 5,
  })
  return user
}
async function CreateUser(username, password, email) {
  const user = await prisma.user.create({
    data: {
      username: username,
      password: password,
      email: email,
    },
  })
  return user
}

async function GetUserByEmail(email) {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  })
  return user
}

async function FindOrCreate(profile) {
  const existingUser = await prisma.user.findFirst({
    where: {
      githubID: profile.nodeId,
    },
  })
  if (existingUser) {
    return existingUser
  } else {
    const user = await prisma.user.create({
      data: {
        username: profile.username || profile.displayName,
        githubID: profile.nodeId,
        password: null,
        email: profile._json.email || null,
        avatarUrl: profile._json.avatar_url,
      },
    })
    return user
  }
}

async function CreatePost(text, authorId, postId, publicUrl) {
  try {
    const post = await prisma.post.create({
      data: {
        text: text,
        authorId: authorId,
        parentId: Number(postId) || null,
        imageUrl: publicUrl || null,
      },
    })
    console.log(post)
    return post
  } catch (err) {
    console.log(err)
    return null
  }
}

async function GetPosts(username, clientId, page) {
  const posts = await prisma.post.findMany({
    where: {
      author: {
        username: username,
      },
      parentId: null,
    },
    orderBy: {
      id: "desc",
    },
    include: {
      likedBy: {
        where: {
          id: clientId,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    skip: 20 * page,
    take: 20,
  })
  // const posts = await prisma.post.deleteMany({
  //   where: {
  //     text: "LOVES ntr",
  //   },
  // })
  return posts
}

async function GetPost(postId, clientId) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
      include: {
        likedBy: {
          where: {
            id: clientId,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                username: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
            likedBy: true,
          },
        },
        author: {
          select: {
            username: true,
            avatarUrl: true,
            id: true,
          },
        },
        parent: {
          include: {
            likedBy: {
              where: {
                id: clientId,
              },
            },
            author: {
              select: {
                username: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                replies: true,
              },
            },
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
    })
    return post
  } catch (error) {
    console.log(error)
    return null
  }
}

async function LikePost(postId, userId) {
  // const post = await prisma.post.findUnique({
  //   where: {
  //     id: 26,
  //   },
  //   include: {
  //     likedBy: true,
  //   },
  // })
  const post = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      likedBy: { connect: { id: userId } },
      likes: { increment: 1 },
    },
  })
  console.log(post)
  return post
}

async function DislikePost(postId, userId) {
  const post = await prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      likedBy: { disconnect: { id: userId } },
      likes: { decrement: 1 },
    },
  })
}

async function UserHasLiked(postId, userId) {
  const like = await prisma.post.findFirst({
    where: {
      likedBy: {
        some: {
          id: userId,
        },
      },
      AND: {
        id: postId,
      },
    },
  })
  return like
}

async function CreateComment(text, userId, postId, publicUrl) {
  try {
    const comment = await prisma.post.create({
      data: {
        text: text,
        parentId: postId,
        authorId: userId,
        imageUrl: publicUrl || null,
      },
    })
    return comment
  } catch (error) {
    return null
    console.log(error)
  }
}

async function FollowUser(userId, clientId) {
  const follow = await prisma.follow.create({
    data: {
      followerId: clientId,
      followingId: userId,
    },
  })
  return follow
}
async function UnfollowUser(id) {
  const follows = await prisma.follow.delete({
    where: {
      id: id,
    },
  })
  return follows
}
async function UserHasFollowed(userId, clientId) {
  const follows = await prisma.follow.findFirst({
    where: {
      followerId: clientId,
      followingId: userId,
    },
  })
  return follows
}
async function GetReplies(username, clientId, page) {
  const replies = await prisma.post.findMany({
    where: {
      author: {
        username: username,
      },
      parentId: {
        not: null,
      },
    },
    orderBy: {
      id: "desc",
    },
    include: {
      likedBy: {
        where: {
          id: clientId,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
    },
    skip: 20 * page,
    take: 20,
  })
  return replies
}
async function GetFollowers(userId) {
  const followers = await prisma.user.findMany({
    where: {
      following: {
        some: {
          followingId: userId,
        },
      },
    },
    include: {
      followers: {
        where: {
          followerId: userId,
        },
      },
    },
  })
  return followers
}
async function GetFollowing(userId) {
  const following = await prisma.user.findMany({
    where: {
      followers: {
        some: {
          followerId: userId,
        },
      },
    },
    include: {
      followers: {
        where: {
          followerId: userId,
        },
      },
    },
  })
  return following
}
async function UpdateUser(username, status, userId) {
  console.log(status)
  console.log(username)
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      username: username,
      status: status == "" ? "" : status,
    },
  })
  return user
}
async function UpdateUserImage(id, url) {
  const image = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      avatarUrl: url,
    },
  })
}
async function SearchPosts(data, clientId, page) {
  const posts = await prisma.post.findMany({
    where: {
      text: {
        contains: data,
      },
    },
    include: {
      author: {
        omit: {
          password: true,
        },
      },
      _count: {
        select: {
          replies: true,
        },
      },
      likedBy: {
        where: {
          id: clientId,
        },
      },
    },
    orderBy: {
      likes: "desc",
    },
    skip: 20 * page,
    take: 20,
  })
  return posts
}
async function CreateNotifications(type, postId, senderId, receiverId) {
  await prisma.notification.create({
    data: {
      type: type,
      postId: postId || null,
      senderId: senderId,
      receiverId: receiverId,
    },
  })
}
async function GetNotifications(id) {
  const user = prisma.notification.findMany({
    where: {
      receiverId: id,
      isRead: false,
    },
    include: {
      post: {
        include: {
          _count: {
            select: {
              replies: true,
            },
          },
          likedBy: {
            where: {
              id: id,
            },
          },
          parent: {
            include: {
              author: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      },
      sender: {
        omit: {
          password: true,
        },
      },
      receiver: {
        omit: {
          password: true,
        },
      },
    },
    // data: {
    //   isRead: true,
    // },
  })
  if (user.length == 0) {
    const user = prisma.notification.findMany({
      where: {
        receiverId: id,
      },
      include: {
        post: {
          include: {
            likedBy: {
              where: {
                id: id,
              },
            },
            parent: {
              include: {
                author: {
                  select: {
                    username: true,
                  },
                },
              },
            },
          },
        },
        sender: {
          omit: {
            password: true,
          },
        },
        receiver: {
          omit: {
            password: true,
          },
        },
      },
      take: 5,
    })
    return user
  } else {
    return user
  }
}
async function GetBackupNotifications(id) {
  const user = prisma.notification.findMany({
    where: {
      receiverId: id,
    },
    include: {
      post: {
        include: {
          likedBy: {
            where: {
              id: id,
            },
          },
          parent: {
            include: {
              author: {
                select: {
                  username: true,
                },
              },
            },
          },
        },
      },
      sender: {
        omit: {
          password: true,
        },
      },
      receiver: {
        omit: {
          password: true,
        },
      },
    },
    take: 5,
  })
  return user
}
async function RemoveNotification(type, postId, senderId, receiverId) {
  const a = await prisma.notification.deleteMany({
    where: {
      type: type,
      postId: postId,
      senderId: senderId,
      receiverId: receiverId,
    },
  })
  console.log(a)
}
async function RemovePost(postId, userId) {
  console.log(postId)
  console.log(userId)
  await prisma.post.deleteMany({
    where: {
      id: postId,
      authorId: userId,
    },
  })
}
async function GetSuggestions(id) {
  const suggestions = await prisma.user.findMany({
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
    include: {
      followers: {
        where: {
          followerId: id,
        },
      },
    },
    take: 3,
  })
  console.log(suggestions)
  return suggestions
}
async function SearchHomepagePostsTop(id, cursor) {
  const results = await prisma.$queryRaw`SELECT * from (
    (SELECT MAX(CASE WHEN "pt"."B" = ${id} THEN "pt"."B" END) , "post"."id" , "post"."text",  "post"."likes", "username", "post"."CreatedAt", "post"."imageUrl", "user"."avatarUrl" , CAST(COUNT( DISTINCT "reply"."id") AS INT) FROM "Post" "post"  LEFT JOIN "Post" "reply" ON "post"."id" = "reply"."parentId" JOIN "User" "user" ON "post"."authorId" = "user"."id" JOIN "Follow" "follow" ON "followingId" = "user"."id" LEFT JOIN "_PostToUser" "pt" ON "post"."id" = "pt"."A" WHERE "followerId" = ${id}  GROUP BY post.id, username, "user"."avatarUrl" ORDER BY post.id LIMIT 250)
    UNION ALL
    (SELECT MAX(CASE WHEN "pt"."B" = ${id} THEN "pt"."B" END) , "post"."id" , "post"."text",  "post"."likes", "username", "post"."CreatedAt", "post"."imageUrl", "user"."avatarUrl" , CAST(COUNT( DISTINCT "reply"."id") AS INT) FROM "Post" "post" LEFT JOIN "Post" "reply" ON "post"."id" = "reply"."parentId" JOIN "User" "user" ON "post"."authorId" = "user"."id" LEFT JOIN "_PostToUser" "pt" ON "post"."id" = "pt"."A" WHERE "post"."authorId" NOT IN (SELECT "followingId" FROM "Follow" WHERE "followerId" = ${id}) AND "post"."authorId" != ${id}   GROUP BY post.id, username , "user"."avatarUrl" ORDER BY post.id LIMIT 250)) AS a  WHERE (${cursor}::int IS NULL OR id > ${cursor}) ORDER BY id DESC LIMIT 20 
    `
  return results
}
async function SearchHomepagePostsBottom(id, cursor) {
  const results = await prisma.$queryRaw`SELECT * from (
    (SELECT MAX(CASE WHEN "pt"."B" = ${id} THEN "pt"."B" END) , "post"."id" , "post"."text",  "post"."likes",  "username", "post"."CreatedAt", "post"."imageUrl", "user"."avatarUrl" , CAST(COUNT( DISTINCT "reply"."id") AS INT) FROM "Post" "post" LEFT JOIN "Post" "reply" ON "post"."id" = "reply"."parentId" JOIN "User" "user" ON "post"."authorId" = "user"."id" JOIN "Follow" "follow" ON "followingId" = "user"."id" LEFT JOIN "_PostToUser" "pt" ON "post"."id" = "pt"."A" WHERE "followerId" = ${id}  GROUP BY post.id, username , "user"."avatarUrl" ORDER BY post.id LIMIT 250)
    UNION ALL
    (SELECT MAX(CASE WHEN "pt"."B" = ${id} THEN "pt"."B" END) , "post"."id" ,  "post"."text",  "post"."likes",  "username", "post"."CreatedAt" , "post"."imageUrl" , "user"."avatarUrl" , CAST(COUNT( DISTINCT "reply"."id") AS INT) FROM "Post" "post" LEFT JOIN "Post" "reply" ON "post"."id" = "reply"."parentId" JOIN "User" "user" ON "post"."authorId" = "user"."id" LEFT JOIN "_PostToUser" "pt" ON "post"."id" = "pt"."A" WHERE "post"."authorId" NOT IN (SELECT "followingId" FROM "Follow" WHERE "followerId" = ${id}) AND "post"."authorId" != ${id}  GROUP BY post.id, username , "user"."avatarUrl" ORDER BY post.id LIMIT 250)) AS a  WHERE (${cursor}::int IS NULL OR id < ${cursor}) ORDER BY id DESC LIMIT 20 
    `
  return results
}
export default {
  GetUser,
  StoreUser,
  CreateUser,
  GetUserByName,
  GetUsersByName,
  GetUserByEmail,
  FindOrCreate,
  CreatePost,
  GetPosts,
  GetPost,
  LikePost,
  DislikePost,
  UserHasFollowed,
  UserHasLiked,
  CreateComment,
  FollowUser,
  UnfollowUser,
  GetReplies,
  GetFollowers,
  GetFollowing,
  UpdateUser,
  UpdateUserImage,
  SearchPosts,
  SearchHomepagePostsTop,
  SearchHomepagePostsBottom,
  CreateNotifications,
  GetNotifications,
  RemoveNotification,
  RemovePost,
  GetBackupNotifications,
  GetSuggestions,
}

// `SELECT a.text, a.likes from (
//   (SELECT text,likes FROM "Post" "post" JOIN "User" "user" ON "authorId" = "user"."id" JOIN "Follow" ON "followingId" = "user"."id"  WHERE "followerId" = ${id} LIMIT 50)
//   UNION ALL
//   (SELECT text,likes FROM "Post" "post"  WHERE "authorId" NOT IN (SELECT "followingId" FROM "Follow" WHERE "followerId" = ${id}) AND "authorId" != ${id} LIMIT 50)) AS a
//   `

// (SELECT text,likes FROM "Post" "post"  WHERE "authorId" NOT IN (SELECT "followingId" FROM "Follow" WHERE "followerId" = ${id}) AND "authorId" != ${id} LIMIT 50)) AS a
// `
//     (SELECT MAX(CASE WHEN "pt"."B" = ${id} THEN "pt"."B" END) , "post"."id" , "text", "likes", "username", "post"."CreatedAt" FROM "Post" "post"JOIN "User" "user" ON "authorId" = "user"."id" JOIN "Follow" "follow" ON "followingId" = "user"."id" LEFT JOIN "_PostToUser" "pt" ON "post"."id" = "pt"."A" WHERE "followerId" = ${id} GROUP BY post.id, username LIMIT 50)
//     `

// const user = await prisma.user.updateManyAndReturn({
//   // prisma.user.findUnique({
//   where: {
//     id: id,
//   },
//   omit: {
//     password: true,
//   },
//   include: {
//     receivedNotifications: {
//       where: {
//         isRead: false,
//       },
//       include: {
//         post: {
//           include: {
//             likedBy: {
//               where: {
//                 id: id,
//               },
//             },
//             parent: {
//               include: {
//                 author: {
//                   select: {
//                     username: true,
//                   },
//                 },
//               },
//             },
//           },
//         },
//         sender: {
//           omit: {
//             password: true,
//           },
//         },
//       },
//     },
//   },
//   data: {
//     include: {
//       receivedNotifications: {
//         update: {
//           isRead: true,
//         },
//       },
//     },
//   },
// })
