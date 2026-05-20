import { AppError } from "@/utils/AppError.js";
import { Request, Response, NextFunction } from "express";

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
