import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/utils/AppError.js";

const mocks = vi.hoisted(() => ({
  productService: {
    getAllProducts: vi.fn(),
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProductById: vi.fn(),
    deleteProductById: vi.fn(),
  },
  categoryService: {
    getCategoryByTitle: vi.fn(),
  },
}));

vi.mock("@/services/product.service.js", () => ({
  default: mocks.productService,
}));

vi.mock("@/services/category.service.js", () => ({
  default: mocks.categoryService,
}));

const { default: ProductController } = await import(
  "../src/controller/product.controller.js"
);

const createResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };

  return res as unknown as Response;
};

describe("ProductController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.productService.getAllProducts.mockResolvedValue({
      allProducts: [],
      totalProductsCount: 0,
    });
  });

  describe("getProducts", () => {
    it("rejects non-numeric pagination instead of silently defaulting", async () => {
      const req = {
        query: { page: "abc", limit: "10" },
      } as unknown as Request;
      const res = createResponse();

      await expect(ProductController.getProducts(req, res)).rejects.toMatchObject({
        statusCode: 411,
      } satisfies Partial<AppError>);

      expect(mocks.productService.getAllProducts).not.toHaveBeenCalled();
    });

    it("passes both min and max price filters to the service", async () => {
      const req = {
        query: { minPrice: "10", maxPrice: "100" },
      } as unknown as Request;
      const res = createResponse();

      await ProductController.getProducts(req, res);

      expect(mocks.productService.getAllProducts).toHaveBeenCalledWith(
        1,
        10,
        "createdAt",
        "desc",
        expect.objectContaining({
          price: {
            gte: 10,
            lte: 100,
          },
        }),
      );
    });

    it("passes both min and max stock filters to the service", async () => {
      const req = {
        query: { minStock: "3", maxStock: "15" },
      } as unknown as Request;
      const res = createResponse();

      await ProductController.getProducts(req, res);

      expect(mocks.productService.getAllProducts).toHaveBeenCalledWith(
        1,
        10,
        "createdAt",
        "desc",
        expect.objectContaining({
          stock: {
            gte: 3,
            lte: 15,
          },
        }),
      );
    });

    it("rejects invalid sort fields before calling the service", async () => {
      const req = {
        query: { sortBy: "password", sortOrder: "asc" },
      } as unknown as Request;
      const res = createResponse();

      await expect(ProductController.getProducts(req, res)).rejects.toMatchObject({
        statusCode: 400,
      } satisfies Partial<AppError>);

      expect(mocks.productService.getAllProducts).not.toHaveBeenCalled();
    });
  });

  it("rejects invalid product ids", async () => {
    const req = { params: { id: "abc" } } as unknown as Request;
    const res = createResponse();

    await expect(ProductController.getProductById(req, res)).rejects.toMatchObject({
      statusCode: 400,
    } satisfies Partial<AppError>);

    expect(mocks.productService.getProductById).not.toHaveBeenCalled();
  });
});
