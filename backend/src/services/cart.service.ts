import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import { addToCartInput, updateCartInput } from "@/schema/cart.schema.js";
import { AppError } from "@/utils/AppError.js";
import ProductService from "./product.service.js";
import CartItemService from "./cartItem.service.js";
import { PrismaClient } from "@prisma/client/extension";

/**
 * Get a user's cart by their ID.
 * @param userId User's ID to retrieve the cart for.
 * @returns The user's cart or null if not found.
 */
const getUserCart = async (
  tx: Prisma.TransactionClient | PrismaClient,
  userId: number
) => {
  let cart;
  try {
    cart = await tx.cart.findUniqueOrThrow({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
        cartItems: {
          select: {
            quantity: true,
            product: true,
          },
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

  return cart;
};

/**
 * Create a new cart for a user.
 * @param userId User's ID to create the cart for.
 * @returns The newly created cart.
 */
const createCart = async (userId: number) => {
  let newCart;
  try {
    newCart = await prisma.cart.create({
      data: {
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
        cartItems: {
          select: {
            quantity: true,
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return newCart;
};

/**
 * Add a product to the user's cart.
 * If the cart doesn't exist, it will be created.
 * If the product is already in the cart, its quantity will be updated.
 * @param userId User's ID to add the product to their cart.
 * @param data Products ID and quantity to add to the cart.
 * @returns Newly added or updated cart item.
 * @throws AppError if the product is not found, not in stock, or if the quantity exceeds stock.
 */
const addToCart = async (userId: number, data: addToCartInput) => {
  // find current users' cart
  let cart = await getUserCart(prisma, userId);

  if (!cart) {
    // if no cart then create one
    cart = await createCart(userId);
  }

  // validate Product
  const product = await ProductService.getProductById(data.productId);
  if (!product) {
    // if not Exists
    throw new AppError("Product Not found", 404);
  }

  if (product.stock <= 0) {
    // not inStock
    throw new AppError("Not in stock", 400);
  }

  // check if product already in cart
  const productInCart = await CartItemService.productInCart(
    cart.id,
    product.id,
  );

  let newItem;
  if (productInCart) {
    // error if final quantity > stock
    if (productInCart?.quantity + data.quantity > product.stock) {
      throw new AppError("Quantity greater than Stock", 409);
    }

    // increment qty
    const currentQty = productInCart.quantity;
    const newQuantity = currentQty + data.quantity;
    newItem = await CartItemService.updateItem(
      cart.id,
      product.id,
      newQuantity,
    );
  } else {
    // else add

    // error if final quantity > stock
    if (data.quantity > product.stock) {
      throw new AppError("Quantity greater than Stock", 409);
    }
    newItem = await CartItemService.addItem(cart.id, product.id, data.quantity);
  }

  return newItem;
};

/**
 * Update the quantity of a product in the user's cart.
 * It validates the cart and product existence, checks stock availability,
 * and updates the cart item quantity accordingly.
 * @param userId
 * @param data
 * @returns
 * @throws AppError if the cart is not found for the user,
 *         if the product is not found,
 *         if the requested quantity exceeds available stock,
 *         or if the item to update is not found in the cart.
 */
const updateCart = async (userId: number, data: updateCartInput) => {
  // find cart for user
  const cart = await getUserCart(prisma, userId);

  if (!cart) {
    // respond with 404 if cart not found
    throw new AppError(`Cart not found for user with id  : ${userId}`, 404);
  }

  // updateCartItem(cartId, productId, newQty)
  const productId = data.productId;
  const newQuantity = data.quantity;
  const product = await ProductService.getProductById(productId);
  if (!product) {
    throw new AppError("Product Not found", 404);
  }
  if (newQuantity > product.stock) {
    throw new AppError("Quantity greater than Stock", 409);
  }
  const updatedCart = await CartItemService.updateItem(
    cart.id,
    productId,
    newQuantity,
  );
  if (!updatedCart) {
    throw new AppError("Item to update not found", 404);
  }

  return updatedCart;
};

/**
 * Remove a product from the user's cart.
 * It validates the product ID,
 * checks if the product exists in the cart, and removes it if found.
 * @param userId User's ID to remove the product from their cart.
 * @param productId Product's ID to be removed from the cart.
 * @returns The updated cart after removing the item.
 * @throws AppError if the product ID is invalid or if the item to delete is not found in the cart.
 */
const removeFromCart = async (userId: number, productId: number) => {
  // check if cart exists for user
  const cart = await getUserCart(prisma, userId);
  if (!cart) {
    return [];
  }

  // get cart id
  const cartId = cart.id;

  // check if product exists
  const productInCart = await CartItemService.productInCart(cartId, productId);
  if (!productInCart) {
    return cart;
  }

  // delete the cartItem
  await CartItemService.deleteItem(cartId, productId);

  // updated cart
  const updatedCart = await getUserCart(prisma, userId);

  return updatedCart;
};

/**
 * Clear all items from the user's cart.
 * It retrieves the user's cart, validates its existence, and deletes all items from it.
 * @param userId User's ID to clear the cart for.
 * @returns void
 * @throws AppError if the cart is not found for the user.
 */
const emptyCart = async (
  tx: Prisma.TransactionClient | PrismaClient,
  userId: number,
) => {
  const cart = await getUserCart(tx, userId);

  if (!cart) {
    // respond with 404 if cart not found
    throw new AppError(`Cart not found for user with id  : ${userId}`, 404);
  }

  await CartItemService.deleteAllItems(tx, cart.id);
  return;
};

const CartService = {
  addToCart,
  getUserCart,
  removeFromCart,
  updateCart,
  emptyCart,
};

export default CartService;
