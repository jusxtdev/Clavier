import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "@/env.js";
import { jwtPayload } from "@/utils/generateToken.js";
import { prisma } from "@/config/db.js";
import { AppError } from "@/utils/AppError.js";
import UserService from "@/services/user.service.js";

const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  let token;

  // extract jwt token from auth header or Cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) token = req.cookies.jwt;

  try {
    // extract user data
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwtPayload;

    if (!decoded.userId) {
      throw new AppError("Invalid Token Payload", 401);
    }

    // check if user exists (service will respond with 404 if not found)
    await UserService.findUserById(decoded.userId);

    // attach user jwt info to req
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    throw new AppError(`${error!}`, 401);
  }
};

export default authenticate;
