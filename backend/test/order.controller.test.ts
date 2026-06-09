import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  orderService: {
    createOrder: vi.fn(),
    getOrders: vi.fn(),
    getOrderById: vi.fn(),
    updateStatus: vi.fn(),
  },
  prisma: {},
}));

vi.mock("@/services/order.service.js", () => ({
  default: mocks.orderService,
}));

vi.mock("@/config/db.js", () => ({
  prisma: mocks.prisma,
}));

const { default: OrderController } = await import(
  "../src/controller/order.conroller.js"
);

const createResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };

  return res as unknown as Response;
};

describe("OrderController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("places an order for the authenticated user", async () => {
    const order = { id: 11, userId: 5, status: "CONFIRMED" };
    mocks.orderService.createOrder.mockResolvedValue(order);
    const req = { user: { userId: 5, role: "BUYER" } } as unknown as Request;
    const res = createResponse();

    await OrderController.placeOrder(req, res);

    expect(mocks.orderService.createOrder).toHaveBeenCalledWith(5);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      msg: "Order Placed Successfully",
      data: order,
    });
  });

  it("fetches buyer orders with the buyer-scoped response message", async () => {
    const orders = [{ id: 11, userId: 5, status: "CONFIRMED" }];
    mocks.orderService.getOrders.mockResolvedValue(orders);
    const req = { user: { userId: 5, role: "BUYER" } } as unknown as Request;
    const res = createResponse();

    await OrderController.getOrders(req, res);

    expect(mocks.orderService.getOrders).toHaveBeenCalledWith(
      mocks.prisma,
      5,
      "BUYER",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      msg: "Your Orders",
      data: orders,
    });
  });

  it("fetches all orders for staff/admin roles", async () => {
    const orders = [{ id: 11, userId: 5, status: "CONFIRMED" }];
    mocks.orderService.getOrders.mockResolvedValue(orders);
    const req = { user: { userId: 1, role: "ADMIN" } } as unknown as Request;
    const res = createResponse();

    await OrderController.getOrders(req, res);

    expect(mocks.orderService.getOrders).toHaveBeenCalledWith(
      mocks.prisma,
      1,
      "ADMIN",
    );
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      msg: "All orders",
      data: orders,
    });
  });

  it("fetches one order by route id", async () => {
    const order = { id: 11, userId: 5, status: "CONFIRMED" };
    mocks.orderService.getOrderById.mockResolvedValue(order);
    const req = { params: { id: "11" } } as unknown as Request;
    const res = createResponse();

    await OrderController.getOrderById(req, res);

    expect(mocks.orderService.getOrderById).toHaveBeenCalledWith(
      mocks.prisma,
      11,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      msg: "Order Fetched Successfully",
      data: order,
    });
  });

  it("updates an order status by route id", async () => {
    const req = {
      params: { id: "11" },
      body: { status: "SHIPPED" },
    } as unknown as Request;
    const res = createResponse();

    await OrderController.updateOrderStatus(req, res);

    expect(mocks.orderService.updateStatus).toHaveBeenCalledWith(
      mocks.prisma,
      11,
      "SHIPPED",
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      msg: "Updated Status to SHIPPED successfully",
    });
  });
});
