import {
  newCategoryInput,
  updateCategoryInput,
} from "@/schema/category.schema.js";
import CategoryService from "@/services/category.service.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";


/**
 * Get all categories with pagination. 
 * It validates the pagination parameters,
 * calls the CategoryService to fetch the categories,
 * and responds with the category data and pagination info.
 * 
 * Throws 411 if the pagination parameters are invalid.
 * 
 * @param req 
 * @param res 
 * @throws AppError if the pagination parameters are invalid
 */
const getCategories = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (limit > 50) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  if (page <= 0 || limit <= 0) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  const { allCategories, totalCategories } =
    await CategoryService.getAllCategories(page, limit);

  const paginationData = {
    page,
    limit,
    totalItems: totalCategories,
  };

  res
    .status(200)
    .json(jsonResponse(true, "All Categories", allCategories, paginationData));
};


/**
 * Get a category by its ID. 
 * It validates the category ID from the request parameters,
 * calls the CategoryService to fetch the category, 
 * and responds with the category data.
 * 
 * Throws 400 if the category ID is invalid.
 * @param req 
 * @param res 
 * @throws AppError if the category ID is invalid
 */
const getCategoryById = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);

  if (!categoryId) {
    throw new AppError("Invalid Id", 400);
  }

  const category = await CategoryService.getCategoryById(categoryId);

  res.status(200).json(jsonResponse(true, `Category Found`, category));
};

/**
 * Create a new category.
 * It validates the input data, 
 * calls the CategoryService to create the category,
 * and responds with the created category data.
 * 
 * Throws 400 if the input data is invalid.
 * @param req 
 * @param res 
 * @throws AppError if the input data is invalid
 */
const createCategory = async (req: Request, res: Response) => {
  const data: newCategoryInput = req.body;

  const newCategory = await CategoryService.createCategory(data);
  res
    .status(201)
    .json(jsonResponse(true, "Category Created Successfully", newCategory));
};

/**
 * Update a category by its ID.
 * It validates the input data and category ID,
 * calls the CategoryService to update the category,
 * and responds with the updated category data.
 * 
 * Throws 400 if the category ID or input data is invalid.
 * @param req 
 * @param res 
 * @throws AppError if the category ID or input data is invalid
 */
const updateCategory = async (req: Request, res: Response) => {
  const data: updateCategoryInput = req.body;

  const categoryId = Number(req.params.id);
  if (!categoryId) {
    throw new AppError("Invalid Id", 400);
  }
  const updatedCategory = await CategoryService.updateCategoryById(
    categoryId,
    data,
  );

  res
    .status(200)
    .json(jsonResponse(true, "Updated Successfully", updatedCategory));
};

/**
 * Delete a category by its ID.
 * It validates the category ID, 
 * calls the CategoryService to delete the category,
 * and responds with a 204 No Content status.
 * 
 * Throws 400 if the category ID is invalid.
 * @param req 
 * @param res 
 * @throws AppError if the category ID is invalid
 */
const deleteCategory = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);
  if (!categoryId) {
    throw new AppError("Invalid Id", 400);
  }
  await CategoryService.deleteCategoryById(categoryId);

  res.status(204).send();
};

const CategoryController = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default CategoryController;
