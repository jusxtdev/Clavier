import { Request, Response } from "express";

const placeOrder = async (req: Request, res: Response) => {};

const getOrders = async (req: Request, res: Response) => {};

const getOrderById = async (req: Request, res: Response) => {};

const updateOrderStatus = async (req: Request, res: Response) => {};

const OrderController = {
  placeOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};

export default OrderController;
