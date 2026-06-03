import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import {
  CreateProductInput,
  UpdateProductInput,
} from "@/schema/product.schema.js";
import { AppError } from "@/utils/AppError.js";
import CategoryService from "./category.service.js";

/**
 * Get all products with pagination, sorting, and filtering capabilities.
 * It constructs a filter object based on the provided criteria, calls the Prisma client to fetch the products,
 * and returns the product data along with the total count of products matching the criteria.
 * @param page Page number for pagination.
 * @param limit Number of products to return per page.
 * @param sortBy Field to sort by (e.g., "price", "stock", "title", "createdAt").
 * @param sortOrder Sort order ("asc" for ascending, "desc" for descending).
 * @param where Filter criteria for products (e.g., price range, stock range, category).
 * @returns An object containing the list of products and the total count of products matching the criteria.
 * @throws AppError if there is an internal server error during the database query.
 */
const getAllProducts = async (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: string,
  where : any
) => {
  let totalProductsCount;
  let allProducts;
  try {
    totalProductsCount = await prisma.product.count({where});

    allProducts = await prisma.product.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        categories: {
          select: {
            category: true,
          },
        },
      },
      where,
      orderBy: {
        [sortBy]: sortOrder
      },

      skip: (page - 1) * limit,
      take: limit,
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return { allProducts, totalProductsCount };
};

/**
 * Get a product by its ID.
 * It calls the Prisma client to fetch the product with the specified ID and returns the product data.
 * If the product is not found, it returns null.
 * @param productId The ID of the product to retrieve.
 * @returns The product data if found, or null if not found.
 * @throws AppError if there is an internal server error during the database query.
 */
const getProductById = async (productId: number) => {
  let product;
  try {
    product = await prisma.product.findUniqueOrThrow({
      where: {
        id: productId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        categories: {
          select: {
            category: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        return null
      }
    }

    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return product;
};

/**
 * Create a new product with the provided data.
 * It first creates or fetches the associated categories, then calls the Prisma client to create the product with the specified data and categories.
 * If a product with the same unique fields already exists, it throws a conflict error.
 * @param data The data for creating the product, including title, description, price, stock, images, and categories.
 * @returns The newly created product data.
 * @throws AppError if a product with the same unique fields already exists or if there is an internal server error during the database query.
 */
const createProduct = async (data: CreateProductInput) => {
  let newProduct;

  const categories = await CategoryService.createAndFetchCategories(
    data.categories,
  );

  try {
    newProduct = await prisma.product.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock,
        images: data.images,
        categories: {
          create: categories,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        categories: {
          select: {
            category: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record already exists
      if (error.code == "P2002") {
        throw new AppError("Product already exists", 409);
      }
    }

    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return newProduct;
};

/**
 * Update a product by its ID.
 * It calls the Prisma client to update the product with the specified ID and data, and returns the updated product data.
 * If the product is not found, it throws a not found error.
 * @param productId The ID of the product to update.
 * @param data The data for updating the product, including title, description, price, stock, images, and categories.
 * @returns The updated product data.
 * @throws AppError if the product is not found or if there is an internal server error during the database query.
 */
const updateProductById = async (
  productId: number,
  data: UpdateProductInput,
) => {
  const categories = await CategoryService.createAndFetchCategories(
    data.categories,
  );

  delete data.categories;

  let updatedProduct;
  try {
    updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock,
        images: data.images,
        categories: {
          create: categories,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        categories: {
          select: {
            category: true,
          },
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record already exists
      if (error.code == "P2002") {
        throw new AppError("Product already exists", 409);
      }

      // Record not found
      if (error.code == "P2025") {
        throw new AppError("Product Not Found", 404);
      }
    }

    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return updatedProduct;
};

/**
 * Delete a product by its ID.
 * It calls the Prisma client to delete the product with the specified ID.
 * If the product is not found, it throws a not found error.
 * @param productId The ID of the product to delete.
 * @throws AppError if the product is not found or if there is an internal server error during the database query.
 */
const deleteProductById = async (productId: number) => {
  try {
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("Product Not Found", 404);
      }
    }

    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return;
};

const ProductService = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
};

export default ProductService;
