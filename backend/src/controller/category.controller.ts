import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import {
  newCategoryInput,
  updateCategoryInput,
} from "@/schema/category.schema.js";
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

  let totalCategories;
  let allCategories;
  try {
    allCategories = await prisma.category.findMany({
      select: {
        id: true,
        title: true,
        description: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    totalCategories = await prisma.category.count();
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
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

  let category;
  try {
    category = await prisma.category.findUniqueOrThrow({
      where: {
        id: categoryId,
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("Category Not Found", 404);
      }
    }

    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  res.status(200).json(jsonResponse(true, `Category Found`, category));
};

const createCategory = async (req: Request, res: Response) => {
  const data: newCategoryInput = req.body;

  let newCategory;
  try {
    newCategory = await prisma.category.create({
      data: {
        title: data.title.toLowerCase(),
        description: data.description,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record already exists
      if (error.code == "P2002") {
        throw new AppError("Category already exists", 409);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

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
  let updatedCategory;
  try {
    updatedCategory = await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: data,
      select: {
        id: true,
        title: true,
        description: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record already exists
      if (error.code == "P2002") {
        throw new AppError("Category already exists", 409);
      }

      // Record not found
      if (error.code == "P2025") {
        throw new AppError("Category Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  res
    .status(200)
    .json(jsonResponse(true, "Updated Successfully", updatedCategory));
};

const deleteCategroy = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.id);
if (!categoryId){
    throw new AppError("Invalid Id", 400)
  }
  try {
    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("Category Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  res.status(204).json(jsonResponse(true, "Deleted Successfully"));
};

const CategoryController = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategroy,
};

export default CategoryController;
