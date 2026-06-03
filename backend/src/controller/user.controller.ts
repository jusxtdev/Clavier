import { promoteUserRoleInput } from "@/schema/user.schema.js";
import UserService from "@/services/user.service.js";
import { AppError } from "@/utils/AppError.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import { Request, Response } from "express";

/**
 * Get current authenticated user's data.
 * It retrieves the user ID from the request, validates it, 
 * calls the UserService to fetch the user data, and responds with the user information.
 * 
 * Throws 400 if the user ID is invalid.
 * @param req 
 * @param res 
 * @returns 
 * @throws AppError if the user ID is invalid
 */
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

/**
 * Get a user by their ID.
 * It validates the user ID from the request parameters,
 * calls the UserService to fetch the user,
 * and responds with the user data.
 * 
 * Throws 400 if the user ID is invalid.
 * @param req 
 * @param res 
 * @returns 
 * @throws AppError if the user ID is invalid
 */
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

// Allowed Roles for User
const VALID_ROLES = ["BUYER", "STAFF", "ADMIN"];

/**
 * Get all users with pagination, filtering, and search capabilities.
 * It validates the query parameters, constructs a filter object based on the provided criteria,
 * calls the UserService to fetch the users, and responds with the user data and pagination info.
 * 
 * Throws 400 if any of the query parameters are invalid.
 * @param req 
 * @param res 
 * @throws AppError if any of the query parameters are invalid (e.g., pagination, filtering, search)
 */
const getUsers = async (req: Request, res: Response) => {
  const page = req.query.page === undefined ? 1 : Number(req.query.page);
  const limit = req.query.limit === undefined ? 10 : Number(req.query.limit);

  if (!Number.isInteger(page) || !Number.isInteger(limit)) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  if (page <= 0 || limit <= 0) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  if (limit > 50) {
    throw new AppError("Invalid Pagination Data", 411);
  }

  const where: any = {};

  // filter by role
  let role = req.query.role || null;
  if (role !== null) {
    role = String(role).toUpperCase();
    if (!VALID_ROLES.includes(role)) {
      throw new AppError("Invalid Role Field", 400);
    }
    where.role = role;
  }

  // search by name
  let name = req.query.name || null;
  if (name) {
    name = String(name).toLowerCase();
    where.name = { contains: name, mode: "insensitive" };
  }

  const { allUsers, totalUserCount } = await UserService.getAllUsers(
    page,
    limit,
    where,
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

/**
 * Promote a user's role by their ID.
 * It validates the input data,
 * calls the UserService to update the user's role,
 * and responds with the updated user data.
 * 
 * Throws 400 if the input data is invalid.
 * @param req 
 * @param res 
 * @throws AppError if the input data is invalid
 */
const promoteUserRole = async (req: Request, res: Response) => {
  const { userId, role }: promoteUserRoleInput = req.body;

  const updated = await UserService.updateRoleById(userId, role);

  res
    .status(200)
    .json(jsonResponse(true, "User Promoted Successfully", updated));
};

/**
 * Delete a user by their ID.
 * It validates the user ID from the request parameters,
 * calls the UserService to delete the user,
 * and responds with a 204 No Content status.
 * 
 * Throws 400 if the user ID is invalid.
 * @param req 
 * @param res 
 * @returns 
 * @throws AppError if the user ID is invalid
 */
const deleteUserById = async (req: Request, res: Response) => {
  const userId = Number(req.params.id);
  if (!userId) {
    throw new AppError("Invalid Id", 400);
  }

  await UserService.deleteUserById(userId);

  return res.status(204).send();
};

/**
 * Delete the currently authenticated user.
 * It retrieves the user ID from the request, validates it,
 * calls the UserService to delete the user, and responds with a 204 No Content status.
 * 
 * Throws 400 if the user ID is invalid.
 * @param req 
 * @param res 
 * @throws AppError if the user ID is invalid
 */
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
  deleteUserById,
  deleteCurrentUser,
  promoteUserRole,
};

export default UserController;
