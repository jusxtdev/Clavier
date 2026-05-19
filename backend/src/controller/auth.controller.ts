import { prisma } from "@/config/db.js";
import { loginInput, signupInput } from "@/schema/auth.schema.js";
import { AppError } from "@/utils/AppError.js";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import generateToken, { jwtPayload } from "@/utils/generateToken.js";
import storeCookie from "@/utils/storeCookie.js";
import { jsonResponse } from "@/utils/jsonResponse.js";

const signup = async (req: Request, res: Response) => {
  const data: signupInput = req.body;

  // check if user with same email already exists
  const emailExists = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (emailExists) {
    throw new AppError(`User with email : ${data.email} already exists`, 409);
  }

  // hash password
  const SALT = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(data.password, SALT);

  // create user
  const newUser = await prisma.user.create({
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

  // generate token
  const jwtPayload: jwtPayload = {
    userId: newUser.id,
    role: newUser.role,
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
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });
  if (!user) {
    throw new AppError(`User with email : ${data.email} not found`, 404);
  }

  // check password
  const isValidPassword = await bcrypt.compare(data.password, user!.password);
  if (!isValidPassword) {
    throw new AppError("Incorrect Password", 400);
  }

  // generate token
  const payload : jwtPayload = {
    userId : user.id,
    role : user.role
  }
  const token = generateToken(payload)

  // store token in cookie
  storeCookie("jwt", token, res)

  return res
    .status(200)
    .json(jsonResponse(
        true,
        "Logged in successfully"
    ))
};

const logout = async (_req: Request, res: Response) => {
    res.clearCookie("jwt")
    res.status(200).json(jsonResponse(
        true,
        "Logged out successfully"
    ))
};

const AuthController = {
  signup,
  login,
  logout,
};

export default AuthController;
