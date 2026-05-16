import { prisma } from "@/config/db.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

const getProducts = async (req: Request, res: Response) => {
  const allProducts = await prisma.product.findMany();
  res
    .status(200)
    .json(jsonResponse(true, "All products fetched successfully", allProducts));
};

const ProductController = {
  getProducts,
};

export default ProductController;
