import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import { AppError } from "@/utils/AppError.js";
import { PrismaClient } from "@prisma/client/extension";

/**
 * Get a specific product in the user's cart by cart ID and product ID.
 * @param cartId The ID of the cart to check for the product.
 * @param productId The ID of the product to check in the cart.
 * @returns The cart item if found, or null if not found.
 * @throws AppError if there is an internal server error during the database query.
 */
const productInCart = async (cartId: number, productId: number) => {
  let exists;
  try {
    exists = await prisma.cartItem.findUniqueOrThrow({
      where: {
        cartId_productId: {
          cartId: cartId,
          productId: productId,
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        return null;
      }
    }

    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return exists;
};

/**
 * Add a product to the user's cart.
 * It creates a new cart item with the specified cart ID, product ID, and quantity.
 * @param cartId
 * @param productId
 * @param quantity
 * @returns
 */
const addItem = async (cartId: number, productId: number, quantity: number) => {
  let newItem;
  try {
    newItem = await prisma.cartItem.create({
      data: {
        cartId: cartId,
        productId: productId,
        quantity: quantity,
      },
      select: {
        cartId: true,
        productId: true,
        quantity: true,
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return newItem;
};

/**
 * Update the quantity of a specific product in the user's cart.
 * It validates the cart item existence and updates the quantity if found.
 * @param cartId
 * @param productId
 * @param newQuantity
 * @returns updated cart item if successful, or null if the cart item is not found.
 */
const updateItem = async (
  cartId: number,
  productId: number,
  newQuantity: number,
) => {
  let updated;
  try {
    updated = await prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cartId,
          productId: productId,
        },
      },
      data: {
        quantity: newQuantity,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        return null;
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return updated;
};

/**
 * Delete a specific product from the user's cart by cart ID and product ID.
 * It validates the cart item existence and deletes it if found.
 * @param cartId
 * @param productId
 * @returns deleted cart item if successful
 */
const deleteItem = async (cartId: number, productId: number) => {
  let deleted;
  try {
    deleted = await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cartId,
          productId: productId,
        },
      },
      select: {
        cartId: true,
        product: true,
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return deleted;
};

/**
 * Delete all items from the user's cart.
 * It retrieves the user's cart, validates its existence, and deletes all items from it.
 * @param userId User's ID to clear the cart for.
 * @returns void
 * @throws AppError if the cart is not found for the user.
 */
const deleteAllItems = async (
  tx: Prisma.TransactionClient | PrismaClient,
  cartId: number,
) => {
  try {
    await tx.cartItem.deleteMany({
      where: {
        cartId: cartId,
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

const CartItemService = {
  productInCart,
  addItem,
  updateItem,
  deleteItem,
  deleteAllItems,
};

export default CartItemService;
