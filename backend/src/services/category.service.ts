import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import {
  newCategoryInput,
  updateCategoryInput,
} from "@/schema/category.schema.js";
import { AppError } from "@/utils/AppError.js";

/**
 * Get all categories with pagination.
 * @param page Page number to retrieve.
 * @param limit Number of categories to retrieve per page.
 * @returns Object containing categories and total category count.
 * @throws AppError if there is an internal server error during the database query.
 */
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

/**
 * Get a category by its ID.
 * @param categoryId Category's ID to retrieve.
 * @returns The category if found.
 * @throws AppError if the category is not found or if there is an internal server error.
 */
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

/**
 * Get a category by its title.
 * It normalizes the title to lowercase before searching.
 * @param title Category title to search for.
 * @returns The category if found, or null if not found.
 * @throws AppError if there is an internal server error during the database query.
 */
const getCategoryByTitle = async (title: string) => {
  title = title.toLowerCase();

  let category;
  try {
    category = await prisma.category.findUniqueOrThrow({
      where: {
        title: title,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        return null;
      }
    }

    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return category;
};

/**
 * Create a new category.
 * It stores the category title in lowercase.
 * @param data Category title and optional description.
 * @returns The newly created category.
 * @throws AppError if the category already exists or if there is an internal server error.
 */
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

/**
 * Update a category by its ID.
 * @param categoryId Category's ID to update.
 * @param data Category fields to update.
 * @returns The updated category.
 * @throws AppError if the category is not found or if there is an internal server error.
 */
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

/**
 * Delete a category by its ID.
 * @param categoryId Category's ID to delete.
 * @returns void
 * @throws AppError if the category is not found or if there is an internal server error.
 */
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

/**
 * Create missing categories and build product-category connection objects.
 * It returns an array used by Prisma to connect categories to a product.
 * @param categories Category titles to create or fetch.
 * @returns Prisma connection objects for the categories, or undefined if no categories are provided.
 * @throws AppError if a category lookup or creation fails.
 */
const createAndFetchCategories = async (categories: string[] | undefined) => {
  /*
  This function returns an array used to connect categories to products table
  example return object -
    [
      {
          tag: {
            connect: { id: 3}
            },
      },
      {
          tag: {
            connect: { id: 5}
            },
      },
      
    ]
  */

  if (!categories) return undefined; // prisma ignores undefined

  let connnectingArray = [];

  // loop through categories
  for (let categoryTitle of categories) {
    let categoryId: number;

    const exists = await getCategoryByTitle(categoryTitle);

    // if category not exists, create and fetch it
    if (!exists) {
      const newCategory = await createCategory({ title: categoryTitle });
      categoryId = newCategory.id;
    } else {
      // else extract the id from the existing one
      categoryId = exists.id;
    }

    // append connecting object to the array function returns
    connnectingArray.push({
      category: {
        connect: {
          id: categoryId,
        },
      },
    });
  }
  return connnectingArray
};

const CategoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
  createAndFetchCategories,
  getCategoryByTitle,
};

export default CategoryService;
