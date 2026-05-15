import { config } from "dotenv";
import express from "express";
import { env } from "./env.js";

config();

const app = express();

const PORT = env.PORT;

app.get('/', (req, res) => {
    res.send('Test Route')
})

const server = app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`))