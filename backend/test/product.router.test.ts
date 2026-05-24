import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler.middleware.js";

const mockProductController = vi.hoisted(() => ({
  getProducts: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "products ok" });
  }),
  getProductById: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "product ok" });
  }),
  createProduct: vi.fn(async (_req: Request, res: Response) => {
    res.status(201).json({ status: true, msg: "create product ok" });
  }),
  updateProduct: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "update product ok" });
  }),
  deleteProduct: vi.fn(async (_req: Request, res: Response) => {
    res.status(204).send();
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

vi.mock("@/controller/product.controller.js", () => ({
  default: mockProductController,
}));

vi.mock("@/middleware/authenticate.middleware.js", () => ({
  default: mockAuthenticate,
}));

vi.mock("@/middleware/authorize.middleware.js", () => ({
  default: mockAuthorize,
}));

const createTestApp = async () => {
  const { default: productRouter } = await import(
    "../src/routes/product.router.js"
  );
  const app = express();

  app.use(express.json());
  app.use("/api/products", productRouter);
  app.use(errorHandler);

  return app;
};

describe("/api/products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes list requests to ProductController.getProducts", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/products?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "products ok" });
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    expect(mockProductController.getProducts).toHaveBeenCalledTimes(1);
  });

  it("passes get-by-id requests to ProductController.getProductById", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/products/7");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "product ok" });
    expect(mockProductController.getProductById).toHaveBeenCalledTimes(1);
    expect(mockProductController.getProductById).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "7" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("passes valid create requests to ProductController.createProduct", async () => {
    const app = await createTestApp();
    const payload = {
      title: "Running Shoe",
      description: "Lightweight shoe",
      price: 99.99,
      stock: 25,
      images: "shoe.jpg",
    };

    const response = await request(app).post("/api/products").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ status: true, msg: "create product ok" });
    expect(mockProductController.createProduct).toHaveBeenCalledTimes(1);
    expect(mockProductController.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ body: payload }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("rejects invalid create payloads", async () => {
    const app = await createTestApp();

    const response = await request(app).post("/api/products").send({
      title: "Running Shoe",
      description: "Lightweight shoe",
      price: 0,
      stock: 25,
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(false);
    expect(mockProductController.createProduct).not.toHaveBeenCalled();
  });

  it("passes valid update requests to ProductController.updateProduct", async () => {
    const app = await createTestApp();
    const payload = {
      price: 79.99,
      stock: 30,
    };

    const response = await request(app).patch("/api/products/7").send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "update product ok" });
    expect(mockProductController.updateProduct).toHaveBeenCalledTimes(1);
    expect(mockProductController.updateProduct).toHaveBeenCalledWith(
      expect.objectContaining({ body: payload, params: { id: "7" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("rejects invalid update payloads", async () => {
    const app = await createTestApp();

    const response = await request(app)
      .patch("/api/products/7")
      .send({ stock: -1 });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(false);
    expect(mockProductController.updateProduct).not.toHaveBeenCalled();
  });

  it("passes delete requests to ProductController.deleteProduct", async () => {
    const app = await createTestApp();

    const response = await request(app).delete("/api/products/7");

    expect(response.status).toBe(204);
    expect(mockProductController.deleteProduct).toHaveBeenCalledTimes(1);
    expect(mockProductController.deleteProduct).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "7" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });
});
