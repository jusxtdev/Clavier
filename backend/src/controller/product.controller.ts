import { prisma } from "@/config/db.js";
import {
  CreateProductInput,
  UpdateProductInput,
} from "@/schema/product.schema.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

const getProducts = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (page <= 0 || limit <= 0){
    throw new AppError("Invalid Pagination Data", 411)
  }

  const totalProductsCount = await prisma.product.count();

  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      stock: true,
      category: true,
      images: true,
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  const paginationData = {
    page,
    limit,
    totalItems: totalProductsCount,
  };
  res
    .status(200)
    .json(
      jsonResponse(
        true,
        "All products fetched successfully",
        allProducts,
        paginationData,
      ),
    );
};

const getProductById = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError(`Product with id ${productId} not found`, 404);
  }

  return res
    .status(200)
    .json(jsonResponse(true, `Product with id ${productId}`, product));
};

const createProduct = async (req: Request, res: Response) => {
  const data: CreateProductInput = req.body;

  const productExists = await prisma.product.findUnique({
    where: {
      title: data.title,
    },
  });

  if (productExists) {
    throw new AppError(`Title : ${data.title} already exists`, 409);
  }

  // create new Product
  const newProduct = await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      stock: data.stock,
    },
  });
  // respond
  return res
    .status(201)
    .json(jsonResponse(true, "Successfully added new product", newProduct));
};

const updateProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  const data: UpdateProductInput = req.body;

  let updatedProduct;
  try {
    updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: data,
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  if (!updatedProduct) {
    throw new AppError(`Product with id : ${productId} not found`, 404);
  }

  return res
    .status(200)
    .json(jsonResponse(true, "Update successfully", updatedProduct));
};

const deleteProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  
  let deleted;
  try {
    deleted = await prisma.product.delete({
      where: {
        id: productId,
      },
    });
  } catch (error) {
    throw new AppError("Internal Server Error", 500);
  }
  if (!deleted) {
    throw new AppError(`Product with id : ${productId} not found`, 404);
  }

  return res.status(204).send();
};

const ProductController = {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
};

export default ProductController;
