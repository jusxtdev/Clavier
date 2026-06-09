import { AppError } from "@/utils/AppError.js";
import CartService from "./cart.service.js";
import { prisma } from "@/config/db.js";
import { OrderStatus, Prisma, Role } from "@/generated/prisma/client.js";
import { PrismaClient } from "@prisma/client/extension";

const createOrder = async (userId: number) => {
  // get the cart for current users
  const cart = await CartService.getUserCart(prisma, userId);

  if (!cart || cart.cartItems.length == 0) {
    // return if cart is empty
    throw new AppError("Cart is empty", 400);
  }

  // validate stocks of each item
  for (const item of cart.cartItems) {
    // if out of stock, return with message
    if (item.quantity > item.product.stock) {
      throw new AppError(`Not enough stock for ${item.product.title}`, 400);
    }
  }

  // transaction
  const order = await prisma.$transaction(async (tx) => {
    // order entry for user
    const newOrder = await tx.order.create({
      data: {
        userId: userId,
      },
    });

    // add items form the user's cart to the OrderItem
    await addOrderItemsFromCart(tx, cart, newOrder.id);

    // decrement stock
    await decrementStockFromCart(tx, cart);

    // clear user's cart
    await CartService.emptyCart(tx, userId);

    // update the order status to CONFIRMED
    await updateStatus(tx, newOrder.id, "CONFIRMED");

    return newOrder;
  });
  return order;
};

const addOrderItemsFromCart = async (
  tx: Prisma.TransactionClient | PrismaClient,
  cart: NonNullable<Awaited<ReturnType<typeof CartService.getUserCart>>>,
  orderId: number,
) => {
  const data = [];
  for (const item of cart.cartItems) {
    data.push({
      orderId,
      productId: item.product.id,
      productTitle: item.product.title,
      productPrice: item.product.price,
      quantity: item.quantity,
    });
  }

  try {
    await tx.orderItem.createMany({
      data: data,
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

const decrementStockFromCart = async (
  tx: Prisma.TransactionClient,
  cart: NonNullable<Awaited<ReturnType<typeof CartService.getUserCart>>>,
) => {
  // for each item
  for (const item of cart.cartItems) {
    // calculate new stock
    try {
      await tx.product.update({
        where: { id: item.product.id },
        data: { stock: { decrement: item.quantity } },
      });
    } catch (error) {
      console.error(error);
      throw new AppError("Interna Server Error", 500);
    }
  }
};

const updateStatus = async (
  tx: Prisma.TransactionClient | PrismaClient,
  orderId: number,
  status: OrderStatus,
) => {
  try {
    await tx.order.update({
      where: { id: orderId },
      data: { status: status },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

const getOrders = async (
  tx: Prisma.TransactionClient | PrismaClient,
  userId: number,
  role: Role,
) => {
  let orders;
  try {
    orders = await tx.order.findMany({
      where: role == "BUYER" ? userId : {},
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        orderItems: {
          select: {
            id: true,
            productId: true,
            productTitle: true,
            productPrice: true,
            quantity: true,
          },
        },
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return orders;
};

const getOrderById = async (
  tx: Prisma.TransactionClient | PrismaClient,
  orderId: number,
) => {
  let order;
  try {
    order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        orderItems: {
          select: {
            id: true,
            productId: true,
            productTitle: true,
            productPrice: true,
            quantity: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError(`Order with id ${orderId} not found`, 404)
      }

      console.error(error);
      throw new AppError("Internal Server Error", 500);
    }
  }

  return order;
};

const OrderService = { createOrder, getOrders, getOrderById };

export default OrderService;
