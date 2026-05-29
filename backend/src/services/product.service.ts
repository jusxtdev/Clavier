import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import {
  CreateProductInput,
  UpdateProductInput,
} from "@/schema/product.schema.js";
import { AppError } from "@/utils/AppError.js";
import CategoryService from "./category.service.js";

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
