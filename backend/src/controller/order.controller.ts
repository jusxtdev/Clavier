import { prisma } from "@/config/db.js";
import { Role } from "@/generated/prisma/enums.js";
import { updateStatusInput } from "@/schema/order.schema.js";
import OrderService from "@/services/order.service.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

const placeOrder = async (req: Request, res: Response) => {
  const userId = Number(req.user?.userId);

  const newOrder = await OrderService.createOrder(userId);

  res
    .status(201)
    .json(jsonResponse(true, "Order Placed Successfully", newOrder));
};

const getOrders = async (req: Request, res: Response) => {
  const userId = Number(req.user?.userId);
  const role = req.user?.role;

  const allOrders = await OrderService.getOrders(prisma, userId, role!);

  res
    .status(200)
    .json(
      jsonResponse(
        true,
        role == "BUYER" ? "Your Orders" : "All orders",
        allOrders,
      ),
    );
};

const getOrderById = async (req: Request, res: Response) => {
  const orderId = Number(req.params.id);
  const userId = Number(req.user?.userId)
  const role : Role = req.user?.role! 

  if (Number.isNaN(orderId)) {
    throw new AppError("Invalid Order Id", 422)
  }

  const order = await OrderService.getOrderById(prisma, orderId, userId, role);

  res.status(200).json(jsonResponse(true, "Order Fetched Successfully", order));
};

const updateOrderStatus = async (req: Request, res: Response) => {
  const { status }: updateStatusInput = req.body;
  const orderId = Number(req.params.id);

  if (Number.isNaN(orderId)){
    throw new AppError("Invalid Order Id", 422)
  }

  await OrderService.updateStatus(prisma, orderId, status);

  res
    .status(201)
    .json(jsonResponse(true, `Updated Status to ${status} successfully`));
};

const OrderController = {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};

export default OrderController;
