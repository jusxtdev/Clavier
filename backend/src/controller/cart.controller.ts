import { addToCartInput } from "@/schema/cart.schema.js";
import CartService from "@/services/cart.service.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

const addToCart = async (req: Request, res: Response) => {
    const userId = Number(req.user?.userId)
    const data : addToCartInput= req.body
    const newItem = await CartService.addToCart(userId, data)

    return res
      .status(201)
      .json(jsonResponse(
        true,
        "Product added to Cart",
        newItem
      ))
};

const getCart = async (req : Request, res : Response) => {
  const userId = Number(req.user?.userId)
  const cart = await CartService.getUserCart(userId)
  if (!cart){
    return res.status(200).json(jsonResponse(true, "Empty Cart", []))
  }
  return res.status(200).json(jsonResponse(true, "Cart Fetched Successfully", cart))
}

const CartController = {
  addToCart,getCart
};

export default CartController;
