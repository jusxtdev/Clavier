import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { env } from "@/env.js"
import { PrismaClient } from "@/generated/prisma/client.js"

const connectionString = env.DATABASE_URL

const adapter = new PrismaPg({
    connectionString
})

const prisma = new PrismaClient({ adapter })

/**
 * Connects to the database using Prisma. 
 * If the connection is successful, it logs a success message. 
 * If there is an error during the connection, it logs the error and exits the process with a failure code.
 * @returns {Promise<void>} A promise that resolves when the connection is established or rejects if there is an error.
 * @throws {Error} If there is an error during the database connection, it throws an error with the message "DB Connection error" along with the original error details.
 */
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