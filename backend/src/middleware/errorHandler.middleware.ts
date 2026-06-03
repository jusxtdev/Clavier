import { AppError } from "@/utils/AppError.js";
import { Request, Response, NextFunction } from "express";

/**
 * Global Express error-handling middleware.
 *
 * Catches application errors and sends a standardized JSON response
 * containing the error message and HTTP status code.
 *
 * @param err The application error instance.
 * @param _req The incoming Express request object (unused).
 * @param res The Express response object used to send the error response.
 * @param _next The Express next middleware function (unused).
 * @returns Sends a JSON error response to the client.
 * @throws AppError if the error is an instance of AppError, otherwise sends a generic 500 Internal Server Error response.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  res.status(err.statusCode || 500).json({
    status: false,
    msg: err.message || "Internal Server Error",
  });
};
