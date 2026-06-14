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
import storeCookie, { getAuthCookieOptions } from "@/utils/storeCookie.js";
import { jsonResponse } from "@/utils/jsonResponse.js";
import generateResetToken from "@/utils/generateResetToken.js";
import { passwordResetEmail } from "@/services/email.service.js";
import { env } from "@/env.js";
import UserService from "@/services/user.service.js";
import ResetTokenService from "@/services/resetToken.service.js";
import { prisma } from "@/config/db.js";

/**
 * Handles user signup logic.
 * Throws 409 if email already exists,
 * otherwise creates a new user,
 * generates a JWT token,
 * stores it in a cookie,
 * and responds with the new user data.
 * @param req
 * @param res
 * @returns
 * @throws AppError if email already exists
 */
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

/**
 * Login controller that handles user authentication.
 * Throws 404 if user is not found,
 * 400 if password is incorrect,
 * otherwise generates a JWT token,
 * stores it in a cookie,
 * and responds with a success message.
 *
 * @param req
 * @param res
 * @returns
 * @throws AppError if user not found or password is incorrect
 */
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

/**
 * Logout controller that clears the JWT cookie and responds with a success message.
 * @param _req
 * @param res
 *
 */
const logout = async (_req: Request, res: Response) => {
  res.clearCookie("jwt", getAuthCookieOptions(res));
  res.status(200).json(jsonResponse(true, "Logged out successfully"));
};

/**
 * Forgot password controller that handles password reset requests.
 * If the email exists, it generates a reset token, stores it in the database,
 * and sends a password reset link to the user's email.
 * If the email does not exist, it still responds with a success message to prevent email enumeration.
 * @param req
 * @param res
 * @returns
 * @throws AppError 500 if there is an error during the process (e.g., email sending failure)
 */
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

/**
 * Reset password controller that handles password reset requests.
 * It verifies the reset token, checks for expiry, hashes the new password,
 * updates it in the database, deletes the reset token, and responds with a success message.
 * If the token is invalid or expired, it throws an AppError with a 401 status code.
 *
 * @param req
 * @param res
 * @throws AppError if the token is invalid or expired
 */
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

  let updated;
  await prisma.$transaction(async (tx) => {
    updated = await UserService.updatePassById(tx, tokenRow!.userId, hashedPass);

    // delete the token after updating the password
    await ResetTokenService.deleteTokenByUserIdAndToken(
      tx,
      Number(userId),
      tokenRow!.token,
    );
  });

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
