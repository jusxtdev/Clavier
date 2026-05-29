import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import { addToCartInput } from "@/schema/cart.schema.js";
import { AppError } from "@/utils/AppError.js";
import ProductService from "./product.service.js";
import CartItemService from "./cartItem.service.js";


const getUserCart = async (userId: number) => {
  let cart;
  try {
    cart = await prisma.cart.findUniqueOrThrow({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        userId: true,
        cartItems: {
          select: {
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

const addToCart = async (userId: number, data: addToCartInput) => {
  // find current users' cart
  let cart = await getUserCart(userId);

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

const CartService = { addToCart, getUserCart };

export default CartService;
