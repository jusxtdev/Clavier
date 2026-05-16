import { prisma } from "@/config/db.js";
import { Request, Response } from "express";

const getProducts = async (req: Request, res: Response) => {
  const allProducts = await prisma.product.findMany();
  res.status(200).json({
    status: true,
    messgae: "All products fetched successfully",
    data: allProducts,
  });
};

const ProductController = {
  getProducts,
};

export default ProductController;
