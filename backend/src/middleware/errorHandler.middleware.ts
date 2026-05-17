import { AppError } from "@/utils/AppError.js"
import { Request, Response, NextFunction } from "express"

export const errorHandler = (err: AppError, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    status : false,
    msg : err.message || "Internal Server Error"
  })
}