import { AppError } from "@/utils/AppError.js";
import { Request, Response, NextFunction } from "express";

/**
 * Authorization middleware to restrict access to certain routes based on user roles.
 * @param roles 
 * @returns
 * @throws AppError if the user's role does not match any of the allowed roles, resulting in a 403 Forbidden error. 
 */
const authorize = (roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // compare the role provided in the route and the role current user has (stored in req.user)
    const userRole = req.user?.role;
    for (let role of roles) {
      if (userRole!.valueOf() === role) {
        return next();
      }
    }
    throw new AppError("Forbidden", 403);
  };
};

export default authorize;
