import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "@/env.js";
import { jwtPayload } from "@/utils/generateToken.js";
import { AppError } from "@/utils/AppError.js";
import UserService from "@/services/user.service.js";

/**
 * Middleware to authenticate users using JWT tokens.
 * @param req Request object containing the JWT token in the Authorization header or cookies.
 * @param _res Response object.
 * @param next Next function for the middleware chain.
 * @throws AppError if the token is missing, invalid, expired, or if the user does not exist.
 */
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

  let decoded: jwtPayload;
  try {
    // extract user data
    decoded = jwt.verify(token, env.JWT_SECRET) as jwtPayload;
  } catch (error) {
    throw new AppError("Invalid or expired token", 401);
  }
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
};

export default authenticate;
