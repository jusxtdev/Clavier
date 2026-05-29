import CartController from "@/controller/cart.router.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import express from "express";

const router = express.Router();

router.use(authenticate)

router.post('/items', CartController.addToCart)

export default router;
