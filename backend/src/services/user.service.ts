import { prisma } from "@/config/db.js";
import { Prisma, Role } from "@/generated/prisma/client.js";
import { signupInput } from "@/schema/auth.schema.js";
import { AppError } from "@/utils/AppError.js";
import { PrismaClient } from "@prisma/client/extension";

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Get all users with pagination and optional filters.
 * @param page Page number to retrieve.
 * @param limit Number of users to retrieve per page.
 * @param where Prisma filter object to apply to the user query.
 * @returns Object containing users and total user count.
 * @throws AppError if there is an internal server error during the database query.
 */
const getAllUsers = async (page: number, limit: number, where: any) => {
  let totalUserCount;
  let allUsers;
  try {
    allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      where,
      skip: (page - 1) * limit,
      take: limit,
    });
    totalUserCount = await prisma.user.count();
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return { allUsers, totalUserCount };
};

/**
 * Find a user by their email address.
 * @param email User's email address to search for.
 * @returns The user if found, or null if not found.
 * @throws AppError if there is an internal server error during the database query.
 */
const findUserByEmail = async (email: string) => {
  let user;
  try {
    user = await prisma.user.findUniqueOrThrow({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code === "P2025") {
        return null;
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return user;
};

/**
 * Find a user by their ID.
 * @param userId User's ID to search for.
 * @returns The user if found.
 * @throws AppError if the user is not found or if there is an internal server error.
 */
const findUserById = async (userId: number) => {
  let user;
  try {
    user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("User Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return user;
};

/**
 * Create a new user.
 * @param data User signup data.
 * @param hashedPass Hashed password to store for the user.
 * @returns The newly created user without password.
 * @throws AppError if the user already exists or if there is an internal server error.
 */
const createNewUser = async (data: signupInput, hashedPass: string) => {
  let newUser;
  try {
    newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPass,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record already exists
      if (error.code == "P2002") {
        throw new AppError("User already exists", 409);
      }
      console.error(error);
      throw new AppError("Internal Server Error", 500);
    }
  }

  return newUser;
};

/**
 * Update a user's password by their ID.
 * @param userId User's ID to update.
 * @param hashedPass New hashed password to store.
 * @returns The updated user without password.
 * @throws AppError if there is an internal server error during the database query.
 */
const updatePassById = async (
  db : DbClient,
  userId: number, 
  hashedPass: string) => {
  let updated;
  try {
    updated = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPass,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return updated;
};

/**
 * Update a user's role by their ID.
 * @param userId User's ID to update.
 * @param role New role to assign to the user.
 * @returns The updated user.
 * @throws AppError if the user is not found or if there is an internal server error.
 */
const updateRoleById = async (userId: number, role: Role) => {
  let updated;
  try {
    updated = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        role: role,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("User Not Found", 404);
      }
    }

    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return updated;
};

/**
 * Delete a user by their ID.
 * @param userId User's ID to delete.
 * @returns void
 * @throws AppError if the user is not found or if there is an internal server error.
 */
const deleteUserById = async (userId: number) => {
  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("User Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

const UserService = {
  createNewUser,
  findUserByEmail,
  updatePassById,
  findUserById,
  getAllUsers,
  updateRoleById,
  deleteUserById,
};

export default UserService;
