import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "@/env.js";
import { jwtPayload } from "@/utils/generateToken.js";
import { prisma } from "@/config/db.js";
import { AppError } from "@/utils/AppError.js";

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

    // console.log(
    //   `ID : ${decoded.userId} Role : ${decoded.role}\nToken : ${token}`,
    // );

    // check if user exists
    const userExists = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });
    if (!userExists) {
      throw new AppError(`User with id : ${decoded.userId} not found`, 404);
    }

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
