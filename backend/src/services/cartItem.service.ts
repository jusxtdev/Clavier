import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import { AppError } from "@/utils/AppError.js";

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

const updateItem = async (
  cartId: number,
  productId: number,
  newQuantity: number,
) => {
  let updated;
  try {
    updated = await prisma.cartItem.update({
        where : {
            cartId_productId : {
                cartId : cartId,
                productId : productId
            }
        },
        data : {
            quantity : newQuantity
        }
    })
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
  return updated
};

const CartItemService = {
  productInCart,
  addItem,
  updateItem
};

export default CartItemService;
