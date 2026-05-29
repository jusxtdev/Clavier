import CartController from "@/controller/cart.controller.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import CartSchema from "@/schema/cart.schema.js";
import express from "express";

const router = express.Router();

router.use(authenticate)

router.post('/items', validate(CartSchema.addToCartSchema), CartController.addToCart)

router.get('/items', CartController.getCart)

export default router;
