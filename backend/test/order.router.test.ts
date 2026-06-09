import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler.middleware.js";

const mockOrderController = vi.hoisted(() => ({
  placeOrder: vi.fn(async (_req: Request, res: Response) => {
    res.status(201).json({ status: true, msg: "place order ok" });
  }),
  getOrders: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "orders ok" });
  }),
  getOrderById: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "order ok" });
  }),
  updateOrderStatus: vi.fn(async (_req: Request, res: Response) => {
    res.status(201).json({ status: true, msg: "update order ok" });
  }),
}));

const mockAuthenticate = vi.hoisted(() =>
  vi.fn((req: Request, _res: Response, next: NextFunction) => {
    req.user = { userId: 1, role: "ADMIN" };
    next();
  }),
);

const mockAuthorize = vi.hoisted(() =>
  vi.fn(
    () =>
      (_req: Request, _res: Response, next: NextFunction) =>
        next(),
  ),
);

vi.mock("@/controller/order.conroller.js", () => ({
  default: mockOrderController,
}));

vi.mock("@/middleware/authenticate.middleware.js", () => ({
  default: mockAuthenticate,
}));

vi.mock("@/middleware/authorize.middleware.js", () => ({
  default: mockAuthorize,
}));

const createTestApp = async () => {
  const { default: orderRouter } = await import("../src/routes/order.router.js");
  const app = express();

  app.use(express.json());
  app.use("/api/orders", orderRouter);
  app.use(errorHandler);

  return app;
};

describe("/api/orders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes place-order requests to OrderController.placeOrder", async () => {
    const app = await createTestApp();

    const response = await request(app).post("/api/orders").send();

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ status: true, msg: "place order ok" });
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    expect(mockOrderController.placeOrder).toHaveBeenCalledTimes(1);
  });

  it("passes list requests to OrderController.getOrders", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/orders");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "orders ok" });
    expect(mockOrderController.getOrders).toHaveBeenCalledTimes(1);
  });

  it("passes get-by-id requests to OrderController.getOrderById", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/orders/9");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "order ok" });
    expect(mockOrderController.getOrderById).toHaveBeenCalledTimes(1);
    expect(mockOrderController.getOrderById).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "9" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("passes valid status updates to OrderController.updateOrderStatus", async () => {
    const app = await createTestApp();
    const payload = { status: "SHIPPED" };

    const response = await request(app).patch("/api/orders/9").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ status: true, msg: "update order ok" });
    expect(mockOrderController.updateOrderStatus).toHaveBeenCalledTimes(1);
    expect(mockOrderController.updateOrderStatus).toHaveBeenCalledWith(
      expect.objectContaining({ body: payload, params: { id: "9" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("rejects invalid status updates", async () => {
    const app = await createTestApp();

    const response = await request(app)
      .patch("/api/orders/9")
      .send({ status: "DELIVERED" });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(false);
    expect(mockOrderController.updateOrderStatus).not.toHaveBeenCalled();
  });
});
