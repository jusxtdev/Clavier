import { addToCartInput, updateCartInput } from "@/schema/cart.schema.js";
import CartService from "@/services/cart.service.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

/**
 * Add a product to the user's cart.
 * It retrieves the user ID from the request, validates the input data, 
 * checks if the product exists and if the quantity is valid,
 * then calls the CartService to add the item to the cart 
 * and responds with the new cart item data.
 * 
 * Throws 404 if the product is not found, and 409 if the requested quantity exceeds available stock.
 * @param req 
 * @param res 
 * @returns 
 * @throws AppError if the product is not found, not in stock, or if the quantity exceeds stock.
 */
const addToCart = async (req: Request, res: Response) => {
  const userId = Number(req.user?.userId);
  const data: addToCartInput = req.body;
  const newItem = await CartService.addToCart(userId, data);

  return res
    .status(201)
    .json(jsonResponse(true, "Product added to Cart", newItem));
};

/**
 * Get current authenticated user's cart
 * @param req 
 * @param res 
 * @returns 
 */
const getCart = async (req: Request, res: Response) => {
  const userId = Number(req.user?.userId);
  const cart = await CartService.getUserCart(userId);
  if (!cart) {
    return res.status(200).json(jsonResponse(true, "Empty Cart", []));
  }
  return res
    .status(200)
    .json(jsonResponse(true, "Cart Fetched Successfully", cart));
};


/**
 * Delete cart item controller that handles removing a product from the user's cart.
 * It retrieves the user ID from the request, validates the product ID from the request parameters,
 * calls the CartService to remove the item from the cart, and responds with the updated cart data.
 * 
 * Throws 400 if the product ID is invalid, and 404 if the item to delete is not found in the cart.
 * @param req 
 * @param res 
 * @returns 
 * @throws AppError if the product ID is invalid or if the item to delete is not found in the cart.
 */
const deleteCartItem = async (req: Request, res: Response) => {
  const userId = Number(req.user?.userId);
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new AppError("Invalid Product Id", 400);
  }

  const updatedCart = await CartService.removeFromCart(userId, productId);
  return res
    .status(200)
    .json(jsonResponse(true, "Item Removed Successfully", updatedCart));
};

/**
 * Update cart controller that handles updating the quantity of a product in the user's cart.
 * It retrieves the user ID from the request, validates the input data, checks if the product exists and if the new quantity is valid,
 * then calls the CartService to update the cart and responds with the updated cart data.
 * 
 * Throws 404 if the product is not found or if the item to update is not found in the cart,
 * and 409 if the new quantity exceeds the available stock.
 * @param req 
 * @param res 
 * @returns 
 * @throws AppError if the product is not found, if the item to update is not found in the cart, or if the new quantity exceeds stock.
 */
const updateCart = async (req: Request, res: Response) => {
  const userId = Number(req.user?.userId);
  const data: updateCartInput = req.body;

  const updated = await CartService.updateCart(userId, data);

  return res
    .status(200)
    .json(jsonResponse(true, "Updated Successfully", updated));
};

/**
 * Controller to empty the user's cart. 
 * It retrieves the user ID from the request, 
 * calls the CartService to empty the cart, 
 * and responds with a 204 No Content status.
 * @param req 
 * @param res 
 * @throws AppError if there is an error during the process (e.g., cart not found)
 */
const emptyCart = async (req: Request, res: Response) => {
  const userId = Number(req.user?.userId);
  await CartService.emptyCart(userId);

  res.status(204).send()
};

const CartController = {
  addToCart,
  getCart,
  deleteCartItem,
  updateCart,
  emptyCart,
};

export default CartController;
