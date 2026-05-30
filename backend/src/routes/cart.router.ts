import CartController from "@/controller/cart.controller.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import CartSchema from "@/schema/cart.schema.js";
import express from "express";

const router = express.Router();

router.use(authenticate)

router.post('/items', validate(CartSchema.addToCartSchema), CartController.addToCart)

router.get('/', CartController.getCart)

router.patch('/', validate(CartSchema.updateCartSchema), CartController.updateCart)

router.delete('/items/:id', CartController.deleteCartItem)

//TODO - Add empty Cart route

export default router;
