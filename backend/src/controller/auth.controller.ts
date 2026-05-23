import { prisma } from "@/config/db.js";
import {
  forgotpassInput,
  loginInput,
  resetpassInput,
  signupInput,
} from "@/schema/auth.schema.js";
import { AppError } from "@/utils/AppError.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import generateToken, { jwtPayload } from "@/utils/generateToken.js";
import storeCookie from "@/utils/storeCookie.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import generateResetToken from "@/utils/generateResetToken.js";
import { passwordResetEmail } from "@/services/email.services.js";
import { env } from "@/env.js";
import { Prisma } from "@/generated/prisma/client.js";

const signup = async (req: Request, res: Response) => {
  const data: signupInput = req.body;

  // hash password
  const SALT = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(data.password, SALT);

  // create user
  let newUser;
  try {
    newUser = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPass,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record already exists
      if (error.code == "P2002") {
        throw new AppError("Product already exists", 409);
      }
      console.error(error);
      throw new AppError("Internal Server Error", 500);
    }
  }

  // generate token
  const jwtPayload: jwtPayload = {
    userId: newUser!.id,
    role: newUser!.role,
  };
  const token = generateToken(jwtPayload);

  // store token in cookie
  storeCookie("jwt", token, res);

  return res
    .status(201)
    .json(jsonResponse(true, "Signup Successfull", newUser));
};

const login = async (req: Request, res: Response) => {
  const data: loginInput = req.body;

  // check if user exists
  let user;
  try {
    user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("Product Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  // check password
  const isValidPassword = await bcrypt.compare(data.password, user!.password);
  if (!isValidPassword) {
    throw new AppError("Incorrect Password", 400);
  }

  // generate token
  const payload: jwtPayload = {
    userId: user!.id,
    role: user!.role,
  };
  const token = generateToken(payload);

  // store token in cookie
  storeCookie("jwt", token, res);

  return res.status(200).json(jsonResponse(true, "Logged in successfully"));
};

const logout = async (_req: Request, res: Response) => {
  res.clearCookie("jwt");
  res.status(200).json(jsonResponse(true, "Logged out successfully"));
};

const forgotpass = async (req: Request, res: Response) => {
  const { email }: forgotpassInput = req.body;

  // check if email exists
  let existingUser;
  try {
    existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("Product Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  // generate token
  const resetToken = await generateResetToken();

  // hash reset token
  const SALT = await bcrypt.genSalt(10);
  const hashedToken = await bcrypt.hash(resetToken, SALT);

  // store hashed token in DB
  const userId = existingUser!.id;
  const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 60 mins

  try {
    await prisma.password_reset_token.create({
      data: {
        token: hashedToken,
        token_expiry: tokenExpiry,
        userId: userId,
      },
    });
  } catch (error) {
    console.error(error)
    throw new AppError("Internal Server Error", 500);
  }

  // --- send password reset link to email

  // Currently no frontend, therefore using backend only
  const baseFrontendURL = env.FRONTEND_URL || `http://localhost:${env.PORT}`;
  const resetLink =
    baseFrontendURL + `/api/auth/resetpass?token=${userId}.${resetToken}`;
  await passwordResetEmail(email, resetLink);

  // repsond
  res
    .status(200)
    .json(jsonResponse(true, "Password Reset link sent to your email"));
};

const resetpass = async (req: Request, res: Response) => {
  const [userId, resetToken] = String(req.query.token).split(".");
  const { password }: resetpassInput = req.body;

  // compare the token and check expiry
  let tokenRow;
  try {
    tokenRow = await prisma.password_reset_token.findFirst({
      where: {
        userId: Number(userId),
      },
      orderBy: {
        token_expiry: "desc",
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError){
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("Product Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  // compare token
  const matches = await bcrypt.compare(resetToken, tokenRow!.token);
  if (!matches) {
    throw new AppError("Invalid Token", 401);
  }

  const now = new Date(Date.now());
  if (now > tokenRow?.token_expiry!) {
    // token is expired
    throw new AppError("Token Expired", 401);
  }

  //-- update password

  // hash the new password
  const SALT = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, SALT);

  let updated;
  try {
    updated = await prisma.user.update({
      where: {
        id: tokenRow!.userId!,
      },
      data: {
        password: hashedPass,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  // delete the token after updating the password
  try {
    console.log(userId, "-----", resetToken);
    await prisma.password_reset_token.delete({
      where: {
        userId_token: {
          userId: Number(userId),
          token: tokenRow!.token,
        },
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  res
    .status(200)
    .json(jsonResponse(true, "Updated Password Successfully", updated));
};

const AuthController = {
  signup,
  login,
  logout,
  forgotpass,
  resetpass,
};

export default AuthController;
