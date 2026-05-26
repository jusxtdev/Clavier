import {
  CreateProductInput,
  UpdateProductInput,
} from "@/schema/product.schema.js";
import ProductService from "@/services/product.service.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

let VALID_SORT_FIELDS = ["price", "stock", "title", "createdAt"]
let VALID_SORT_ORDER = ["asc", "desc"]

const getProducts = async (req: Request, res: Response) => {
  // pagination query params
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  if (page <= 0 || limit <= 0) {
    throw new AppError("Invalid Pagination Data", 422);
  }
  if (limit > 50) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  // Sorting query params
  const sortBy = String(req.query.sortBy || "createdAt");
  const sortOrder = String(req.query.sortOrder || "desc");

  if (!VALID_SORT_FIELDS.includes(sortBy) || !VALID_SORT_ORDER.includes(sortOrder)){
    throw new AppError("Invalid Sort Fields", 400)
  }

  let { allProducts, totalProductsCount } = await ProductService.getAllProducts(
    page,
    limit,
    sortBy,
    sortOrder
  );

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

  if (!productId) {
    throw new AppError("Invalid Id", 400);
  }

  const product = await ProductService.getProductById(productId);

  return res
    .status(200)
    .json(jsonResponse(true, `Product with id ${productId}`, product));
};

const createProduct = async (req: Request, res: Response) => {
  const data: CreateProductInput = req.body;


  // create new Product
  const newProduct = await ProductService.createProduct(data);

  // respond
  return res
    .status(201)
    .json(jsonResponse(true, "Successfully added new product", newProduct));
};

const updateProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  if (!productId) {
    throw new AppError("Invalid Id", 400);
  }

  const data: UpdateProductInput = req.body;

  const updatedProduct = await ProductService.updateProductById(
    productId,
    data,
  );

  return res
    .status(200)
    .json(jsonResponse(true, "Update successfully", updatedProduct));
};

const deleteProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);
  if (!productId) {
    throw new AppError("Invalid Id", 400);
  }

  await ProductService.deleteProductById(productId);

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
