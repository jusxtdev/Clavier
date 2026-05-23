import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import { promoteUserRoleInput } from "@/schema/user.schema.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

const getCurrentUser = async (req: Request, res: Response) => {
  const userId = Number(req.user?.userId);

  let user;
  try {
    user = await prisma.user.findUnique({
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
  return res
    .status(200)
    .json(jsonResponse(true, `User with id ${userId}`, user));
};

const getUserById = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

  let user;
  try {
    user = await prisma.user.findUnique({
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
  return res
    .status(200)
    .json(jsonResponse(true, `User with id ${userId}`, user));
};

const getUsers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const totalUserCount = await prisma.user.count();
  let allUsers;
  try {
    allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  const paginationData = {
    page,
    limit,
    totalItems: totalUserCount,
  };

  res
    .status(200)
    .json(
      jsonResponse(
        true,
        "All users fetched successfully",
        allUsers,
        paginationData,
      ),
    );
};

const promoteUserRole = async (req: Request, res: Response) => {
  const { userId, role }: promoteUserRoleInput = req.body;

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

  res
    .status(200)
    .json(jsonResponse(true, "User Promoted Successfully", updated));
};

const delteUserById = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);

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

  return res.status(204).send();
};

const deleteCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

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

  res.status(204).send();
};

const UserController = {
  getCurrentUser,
  getUserById,
  getUsers,
  delteUserById,
  deleteCurrentUser,
  promoteUserRole,
};

export default UserController;
