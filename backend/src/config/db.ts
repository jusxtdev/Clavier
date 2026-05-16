import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { env } from "@/env.js"
import { PrismaClient } from "@/generated/prisma/client.js"

const connectionString = env.DATABASE_URL

const adapter = new PrismaPg({
    connectionString
})

const prisma = new PrismaClient({ adapter })

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("DB Connected via prisma")
    } catch (error) {
        console.error(`DB Connection error : ${error}`)
        process.exit(1)
    }
}

const disconnectDB = async () => {
    await prisma.$disconnect();
}

export {prisma, connectDB, disconnectDB}