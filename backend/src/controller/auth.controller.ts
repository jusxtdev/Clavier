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
import { passwordResetEmail } from "@/services/email.service.js";
import { env } from "@/env.js";
import UserService from "@/services/user.service.js";
import ResetTokenService from "@/services/resetToken.service.js";

const signup = async (req: Request, res: Response) => {
  const data: signupInput = req.body;

  // hash password
  const SALT = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(data.password, SALT);

  // create user
  const newUser = await UserService.createNewUser(data, hashedPass);

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
  const user = await UserService.findUserByEmail(data.email);

  if (!user) {
    throw new AppError("User not found", 404);
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
  let existingUser = await UserService.findUserByEmail(email);

  if (!existingUser) {
    return res
      .status(200)
      .json(jsonResponse(true, "Password Reset link sent to your email"));
  }

  // generate token
  const resetToken = await generateResetToken();

  // hash reset token
  const SALT = await bcrypt.genSalt(10);
  const hashedToken = await bcrypt.hash(resetToken, SALT);

  // store hashed token in DB
  const userId = existingUser!.id;
  const tokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 60 mins

  const newToken = await ResetTokenService.addNewToken(
    hashedToken,
    tokenExpiry,
    userId,
  );

  // --- send password reset link to email

  // Currently no frontend, therefore using backend only
  const baseFrontendURL = env.FRONTEND_URL || `http://localhost:${env.PORT}`;
  const resetLink =
    baseFrontendURL +
    `/api/auth/resetpass?token=${newToken.userId}.${resetToken}`;
  await passwordResetEmail(email, resetLink);

  // repsond
  res
    .status(200)
    .json(jsonResponse(true, "Password Reset link sent to your email"));
};

const resetpass = async (req: Request, res: Response) => {
  const [userId, resetToken] = String(req.query.token).split(".");
  const { password }: resetpassInput = req.body;

  // verify reset token
  if (typeof resetToken !== "string") {
    throw new AppError("Invalid Token", 401);
  }

  // compare the token and check expiry
  const tokenRow = await ResetTokenService.findTokenByUserId(Number(userId));

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

  const updated = await UserService.updatePassById(
    tokenRow!.userId,
    hashedPass,
  );

  // delete the token after updating the password
  await ResetTokenService.deleteTokenByUserIdAndToken(
    Number(userId),
    tokenRow!.token,
  );

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
