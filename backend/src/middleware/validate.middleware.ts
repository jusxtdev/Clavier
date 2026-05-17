import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError.js";
// import { jsonErrorResponse } from "@/utils/jsonResponse.js";

export const validate =
  (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    const valid = schema.safeParse(body);
    
    if (!valid.success) {
      const errorMessage = valid.error.issues
        .map((issue) => issue.message)
        .join(" | ");
      
      throw new AppError(errorMessage, 411)
    }

    next();
  };
