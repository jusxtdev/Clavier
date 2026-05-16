import express, { Request, Response } from "express";
import productRouter from "./product.router.js"

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server Working",
    data: [],
  });
});

router.use('/products', productRouter)

export default router;
