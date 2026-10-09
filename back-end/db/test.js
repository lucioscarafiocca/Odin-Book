import "dotenv/config"
import { PrismaClient } from "../generated/prisma/index.js"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const AllFiles = await prisma.post.count({
    where: {
      author: {
        username: "sam",
      },
      parent: null,
    },
  })

  console.log(AllFiles)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
