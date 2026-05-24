import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import { promoteUserRoleInput } from "@/schema/user.schema.js";
import ProductService from "@/services/product.service.js";
import UserService from "@/services/user.service.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

const getCurrentUser = async (req: Request, res: Response) => {
  const userId = Number(req.user?.userId);

  if (!userId) {
    throw new AppError("Invalid Id", 400);
  }

  const user = await UserService.findUserById(userId);

  return res
    .status(200)
    .json(jsonResponse(true, `User with id ${userId}`, user));
};

const getUserById = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (!userId) {
    throw new AppError("Invalid Id", 400);
  }
  const user = await UserService.findUserById(userId);

  return res
    .status(200)
    .json(jsonResponse(true, `User with id ${userId}`, user));
};

const getUsers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  if (page <= 0 || limit <= 0) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  if (limit > 50) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  const { allUsers, totalUserCount } = await UserService.getAllUsers(
    page,
    limit,
  );

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

  const updated = await UserService.updateRoleById(userId, role);

  res
    .status(200)
    .json(jsonResponse(true, "User Promoted Successfully", updated));
};

const delteUserById = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (!userId) {
    throw new AppError("Invalid Id", 400);
  }

  await UserService.deleteUserById(userId);

  return res.status(204).send();
};

const deleteCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError("Invalid Id", 400);
  }
  await UserService.deleteUserById(userId);

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
