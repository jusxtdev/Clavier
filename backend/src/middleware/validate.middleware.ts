import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError.js";

/**
 * Zod validation middleware to validate incoming request bodies against a defined schema.
 * @param schema 
 * @returns A middleware function that validates the request body and either passes control to the next middleware or throws an error if validation fails.
 * @throws AppError if the validation fails, resulting in a 400 Bad Request error with details about the validation issues.
*/
export const validate =
  (schema: ZodSchema) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    const body = req.body;

    const valid = schema.safeParse(body);
    
    if (!valid.success) {
      const errorMessage = valid.error.issues
        .map((issue) => issue.message)
        .join(" | ");

      throw new AppError(errorMessage, 400);
    }

    next();
  };
