import {
  newCategoryInput,
  updateCategoryInput,
} from "@/schema/category.schema.js";
import CategoryService from "@/services/category.service.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

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

const getCategoryById = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);

  if (!categoryId) {
    throw new AppError("Invalid Id", 400);
  }

  const category = await CategoryService.getCategoryById(categoryId);

  res.status(200).json(jsonResponse(true, `Category Found`, category));
};

const createCategory = async (req: Request, res: Response) => {
  const data: newCategoryInput = req.body;

  const newCategory = await CategoryService.createCategory(data);
  res
    .status(201)
    .json(jsonResponse(true, "Category Created Successfully", newCategory));
};

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

const deleteCategroy = async (req: Request, res: Response) => {
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
  deleteCategroy,
};

export default CategoryController;
