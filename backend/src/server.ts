import { config } from "dotenv";
import express from "express";
import { env } from "./env.js";
import { prisma } from "./config/db.js";

config();

const app = express();

const PORT = env.PORT;

app.get('/', async (req, res) => {
    const testProduct = await prisma.product.create({
        data : {
            title : "test product",
            description : "This is to test the newly created prisma DB connection",
            price : 100,
            stock : 10,
        }
    })
    
    res.send(testProduct)
})

const server = app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))