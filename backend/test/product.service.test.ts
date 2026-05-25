import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  product: {
    count: vi.fn(),
    findMany: vi.fn(),
    findUniqueOrThrow: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockCategoryService = vi.hoisted(() => ({
  createAndFetchCategories: vi.fn(),
}));

vi.mock("@/config/db.js", () => ({
  prisma: mockPrisma,
}));

vi.mock("../src/services/category.service.js", () => ({
  default: mockCategoryService,
}));

const { default: ProductService } = await import(
  "../src/services/product.service.js"
);

describe("ProductService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches paginated products with category relations", async () => {
    const products = [
      {
        id: 1,
        title: "Running Shoe",
        description: "Lightweight shoe",
        price: 99.99,
        stock: 25,
        images: "shoe.jpg",
        categories: [{ category: { id: 1, title: "shoes" } }],
      },
    ];
    mockPrisma.product.count.mockResolvedValue(1);
    mockPrisma.product.findMany.mockResolvedValue(products);

    const result = await ProductService.getAllProducts(2, 5);

    expect(result).toEqual({
      allProducts: products,
      totalProductsCount: 1,
    });
    expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        select: expect.objectContaining({
          categories: {
            select: {
              category: true,
            },
          },
        }),
      }),
    );
  });

  it("creates products with category connections from CategoryService", async () => {
    const payload = {
      title: "Running Shoe",
      description: "Lightweight shoe",
      price: 99.99,
      stock: 25,
      images: "shoe.jpg",
      categories: ["shoes", "fitness"],
    };
    const categoryConnections = [
      {
        category: {
          connect: {
            id: 1,
          },
        },
      },
    ];
    const createdProduct = {
      id: 1,
      ...payload,
      categories: [{ category: { id: 1, title: "shoes" } }],
    };
    mockCategoryService.createAndFetchCategories.mockResolvedValue(
      categoryConnections,
    );
    mockPrisma.product.create.mockResolvedValue(createdProduct);

    const result = await ProductService.createProduct(payload);

    expect(result).toBe(createdProduct);
    expect(mockCategoryService.createAndFetchCategories).toHaveBeenCalledWith(
      payload.categories,
    );
    expect(mockPrisma.product.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: payload.title,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          images: payload.images,
          categories: {
            create: categoryConnections,
          },
        }),
        select: expect.objectContaining({
          categories: {
            select: {
              category: true,
            },
          },
        }),
      }),
    );
  });

  it("updates products with category connections from CategoryService", async () => {
    const payload = {
      price: 79.99,
      stock: 30,
      categories: ["sale"],
    };
    const categoryConnections = [
      {
        category: {
          connect: {
            id: 2,
          },
        },
      },
    ];
    const updatedProduct = {
      id: 1,
      title: "Running Shoe",
      description: "Lightweight shoe",
      price: 79.99,
      stock: 30,
      images: "shoe.jpg",
      categories: [{ category: { id: 2, title: "sale" } }],
    };
    mockCategoryService.createAndFetchCategories.mockResolvedValue(
      categoryConnections,
    );
    mockPrisma.product.update.mockResolvedValue(updatedProduct);

    const result = await ProductService.updateProductById(1, payload);

    expect(result).toBe(updatedProduct);
    expect(mockCategoryService.createAndFetchCategories).toHaveBeenCalledWith([
      "sale",
    ]);
    expect(mockPrisma.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 1,
        },
        data: expect.objectContaining({
          price: payload.price,
          stock: payload.stock,
          categories: {
            create: categoryConnections,
          },
        }),
      }),
    );
  });

  it("deletes products by id", async () => {
    mockPrisma.product.delete.mockResolvedValue({ id: 1 });

    await ProductService.deleteProductById(1);

    expect(mockPrisma.product.delete).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    });
  });
});
