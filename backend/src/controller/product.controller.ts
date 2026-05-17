import { prisma } from "@/config/db.js";
import {
  CreateProductInput,
  UpdateProductInput,
} from "@/schema/product.schema.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

const getProducts = async (req: Request, res: Response) => {
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
  });

  res
    .status(200)
    .json(jsonResponse(true, "All products fetched successfully", allProducts));
};

const getProductById = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError(`Product with id ${productId} not found`, 404)
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
    throw new AppError(`Title : ${data.title} already exists`, 409)
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

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: data,
  });

  return res
    .status(200)
    .json(jsonResponse(true, "Update successfully", updatedProduct));
};

const deleteProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  await prisma.product.delete({
    where: {
      id: productId,
    },
  });

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
