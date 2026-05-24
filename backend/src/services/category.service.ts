import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import {
  newCategoryInput,
  updateCategoryInput,
} from "@/schema/category.schema.js";
import { AppError } from "@/utils/AppError.js";

const getAllCategories = async (page: number, limit: number) => {
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
  return { allCategories, totalCategories };
};

const getCategoryById = async (categoryId: number) => {
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

  return category;
};

const createCategory = async (data: newCategoryInput) => {
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
  return newCategory;
};

const updateCategoryById = async (
  categoryId: number,
  data: updateCategoryInput,
) => {
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

  return updatedCategory;
};

const deleteCategoryById = async (categoryId: number) => {
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
};

const CategoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};

export default CategoryService;
