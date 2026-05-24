import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler.middleware.js";

const mockCategoryController = vi.hoisted(() => ({
  getCategories: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "categories ok" });
  }),
  getCategoryById: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "category ok" });
  }),
  createCategory: vi.fn(async (_req: Request, res: Response) => {
    res.status(201).json({ status: true, msg: "create category ok" });
  }),
  updateCategory: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "update category ok" });
  }),
  deleteCategroy: vi.fn(async (_req: Request, res: Response) => {
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

vi.mock("@/controller/category.controller.js", () => ({
  default: mockCategoryController,
}));

vi.mock("@/middleware/authenticate.middleware.js", () => ({
  default: mockAuthenticate,
}));

vi.mock("@/middleware/authorize.middleware.js", () => ({
  default: mockAuthorize,
}));

const createTestApp = async () => {
  const { default: categoryRouter } = await import(
    "../src/routes/category.router.js"
  );
  const app = express();

  app.use(express.json());
  app.use("/api/categories", categoryRouter);
  app.use(errorHandler);

  return app;
};

describe("/api/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes list requests to CategoryController.getCategories", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/categories?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "categories ok" });
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    expect(mockCategoryController.getCategories).toHaveBeenCalledTimes(1);
  });

  it("passes get-by-id requests to CategoryController.getCategoryById", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/categories/12");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "category ok" });
    expect(mockCategoryController.getCategoryById).toHaveBeenCalledTimes(1);
    expect(mockCategoryController.getCategoryById).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "12" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("passes valid create requests to CategoryController.createCategory", async () => {
    const app = await createTestApp();
    const payload = {
      title: "Shoes",
      description: "Footwear category",
    };

    const response = await request(app).post("/api/categories").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      status: true,
      msg: "create category ok",
    });
    expect(mockCategoryController.createCategory).toHaveBeenCalledTimes(1);
    expect(mockCategoryController.createCategory).toHaveBeenCalledWith(
      expect.objectContaining({ body: payload }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("rejects invalid create payloads", async () => {
    const app = await createTestApp();

    const response = await request(app)
      .post("/api/categories")
      .send({ title: "No" });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(false);
    expect(mockCategoryController.createCategory).not.toHaveBeenCalled();
  });

  it("passes valid update requests to CategoryController.updateCategory", async () => {
    const app = await createTestApp();
    const payload = { title: "Accessories" };

    const response = await request(app).patch("/api/categories/12").send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: true,
      msg: "update category ok",
    });
    expect(mockCategoryController.updateCategory).toHaveBeenCalledTimes(1);
    expect(mockCategoryController.updateCategory).toHaveBeenCalledWith(
      expect.objectContaining({ body: payload, params: { id: "12" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("rejects invalid update payloads", async () => {
    const app = await createTestApp();

    const response = await request(app)
      .patch("/api/categories/12")
      .send({ title: "No" });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(false);
    expect(mockCategoryController.updateCategory).not.toHaveBeenCalled();
  });

  it("passes delete requests to CategoryController.deleteCategroy", async () => {
    const app = await createTestApp();

    const response = await request(app).delete("/api/categories/12");

    expect(response.status).toBe(204);
    expect(mockCategoryController.deleteCategroy).toHaveBeenCalledTimes(1);
    expect(mockCategoryController.deleteCategroy).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "12" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });
});
