import {
  CreateProductInput,
  UpdateProductInput,
} from "@/schema/product.schema.js";
import CategoryService from "@/services/category.service.js";
import ProductService from "@/services/product.service.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

// Allowed Sort Fields and Order
let VALID_SORT_FIELDS = ["price", "stock", "title", "createdAt"];
let VALID_SORT_ORDER = ["asc", "desc"];

/**
 * Get all products with pagination, sorting, filtering, and search capabilities.
 * It validates the query parameters, constructs a filter object based on the provided criteria,
 * calls the ProductService to fetch the products, and responds with the product data and pagination info.
 *
 * Throws 400 if any of the query parameters are invalid.
 *
 * @param req
 * @param res
 * @throws AppError if any of the query parameters are invalid (e.g., pagination, sorting, filtering)
 */
const getProducts = async (req: Request, res: Response) => {
  // pagination query params 1
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (!Number.isInteger(page) || !Number.isInteger(limit)) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  if (page <= 0 || limit <= 0) {
    throw new AppError("Invalid Pagination Data", 422);
  }
  if (limit > 50) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  // Sorting query params
  const sortBy = String(req.query.sortBy || "createdAt");
  const sortOrder = String(req.query.sortOrder || "desc");

  if (
    !VALID_SORT_FIELDS.includes(sortBy) ||
    !VALID_SORT_ORDER.includes(sortOrder)
  ) {
    throw new AppError("Invalid Sort Fields", 400);
  }

  // filtering query params
  let { maxPrice, minPrice, minStock, maxStock, category } = req.query;
  const where: any = {};
  if (maxPrice || minPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  if (maxStock || minStock) {
    where.stock = {};
    if (minStock) where.stock.gte = Number(minStock);
    if (maxStock) where.stock.lte = Number(maxStock);
  }

  if (category) {
    category = String(category).toLowerCase();
    const exists = await CategoryService.getCategoryByTitle(String(category));
    if (exists) {
      where.categories = {
        some: {
          category: {
            title: String(category),
          },
        },
      };
    }
  }

  // search query params (by title and description)
  const searchStr = String(req.query.search || "");
  if (searchStr) {
    where.title = { contains: searchStr, mode: "insensitive" };
  }

  let { allProducts, totalProductsCount } = await ProductService.getAllProducts(
    page,
    limit,
    sortBy,
    sortOrder,
    where,
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

/**
 * Get a product by its ID.
 * It validates the product ID from the request parameters,
 * calls the ProductService to fetch the product,
 * and responds with the product data.
 *
 * Throws 400 if the product ID is invalid.
 * @param req
 * @param res
 * @returns
 * @throws AppError if the product ID is invalid
 */
const getProductById = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    throw new AppError("Invalid Id", 400);
  }

  const product = await ProductService.getProductById(productId);

  return res
    .status(200)
    .json(jsonResponse(true, `Product with id ${productId}`, product));
};

/**
 * Create a new product.
 * It validates the input data,
 * calls the ProductService to create the product,
 * and responds with the created product data.
 *
 * Throws 400 if the input data is invalid.
 * @param req
 * @param res
 * @throws AppError if the input data is invalid
 */
const createProduct = async (req: Request, res: Response) => {
  const data: CreateProductInput = req.body;

  // create new Product
  const newProduct = await ProductService.createProduct(data);

  // respond
  return res
    .status(201)
    .json(jsonResponse(true, "Successfully added new product", newProduct));
};

/**
 * Update a product by its ID.
 * It validates the input data and product ID,
 * calls the ProductService to update the product,
 * and responds with the updated product data.
 *
 * Throws 400 if the product ID or input data is invalid.
 * @param req
 * @param res
 * @returns
 * @throws AppError if the product ID or input data is invalid
 */
const updateProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
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

/**
 * Delete a product by its ID.
 * It validates the product ID from the request parameters,
 * calls the ProductService to delete the product,
 * and responds with a 204 No Content status.
 *
 * Throws 400 if the product ID is invalid.
 * @param req
 * @param res
 * @throws AppError if the product ID is invalid
 */
const deleteProduct = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
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
