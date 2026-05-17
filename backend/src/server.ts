import { config } from "dotenv";
import express, { Request, Response } from "express";
import { env } from "./env.js";
import { connectDB, disconnectDB } from "./config/db.js";

import rootRouter from "./routes/root.router.js";
import { AppError } from "./utils/AppError.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";

config();
connectDB();

const app = express();
app.use(express.json());

const PORT = env.PORT;

app.use("/api", rootRouter);

// All route catcher for undefined routees
app.all("/{*splat}", (req: Request, _res: Response) => {
  throw new AppError(`${req.method} ${req.originalUrl} Not found`, 404)
});

// gloabal error handler
app.use(errorHandler);

const server = app.listen(PORT, () =>
  console.log(`Server running on PORT ${PORT}`),
);

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
