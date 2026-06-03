import { config } from "dotenv";
import express, { Request, Response } from "express";
import { env } from "./env.js";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import rootRouter from "./routes/root.router.js";
import { AppError } from "./utils/AppError.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

// configure dotenv
config();

await connectDB();

const app = express();

const PORT = env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", rootRouter);

// All route catcher for undefined routees
app.all("/{*splat}", (req: Request, _res: Response) => {
  throw new AppError(`${req.method} ${req.originalUrl} Not found`, 404);
});

// gloabal error handler
app.use(errorHandler);

export { app, PORT };
