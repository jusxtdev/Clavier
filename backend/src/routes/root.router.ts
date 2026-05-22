import express, { Request, Response } from "express";
import productRouter from "./product.router.js";
import authRouter from "./auth.router.js"
import userRouter from "./user.router.js"
import categoryRouter from "./category.router.js"

const router = express.Router();

router.get("/", async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server Working",
    data: [],
  });
});

router.use("/products", productRouter);
router.use("/auth", authRouter)
router.use("/users", userRouter)
router.use("/categories", categoryRouter)

export default router;
