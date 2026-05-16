import { prisma } from "@/config/db.js";
import { CreateProductInput } from "@/schema/product.schema.js";
import { jsonErrorResponse, jsonResponse } from "@/utils/jsonResponse.js";
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

const createProduct = async (req: Request, res: Response) => {
  const data : CreateProductInput = req.body;

  const productExists = await prisma.product.findUnique({
    where: {
      title: data.title,
    },
  });

  if (productExists) {
    return res
      .status(409)
      .json(
        jsonErrorResponse(
          "Use another Title",
          `Title : ${data.title} already exists`,
        ),
      );
  }

  // create new Product
  const newProduct = await prisma.product.create({
    data : {
      title : data.title,
      description : data.description,
      price : data.price,
      stock : data.stock
    }
  })
  console.log(newProduct.price)
  // respond
  return res.status(201).json(
    jsonResponse(true,"Successfully added new product", newProduct)
  )
};

const ProductController = {
  getProducts,createProduct
};

export default ProductController;
