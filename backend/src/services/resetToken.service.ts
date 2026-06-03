import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import { AppError } from "@/utils/AppError.js";
import { PrismaClient } from "@prisma/client/extension";

type DbClient = PrismaClient | Prisma.TransactionClient;

/**
 * Add a new password reset token for a user.
 * @param hashedToken Hashed reset token to store.
 * @param tokenExpiry Date and time when the token expires.
 * @param userId User's ID to associate the token with.
 * @returns The newly created reset token row.
 * @throws AppError if there is an internal server error during the database query.
 */
const addNewToken = async (
  hashedToken: string,
  tokenExpiry: Date,
  userId: number,
) => {
  let newToken;
  try {
    newToken = await prisma.password_reset_token.create({
      data: {
        token: hashedToken,
        token_expiry: tokenExpiry,
        userId: userId,
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return newToken;
};

/**
 * Find the latest password reset token for a user by user ID.
 * @param userId User's ID to retrieve the reset token for.
 * @returns The latest reset token row for the user.
 * @throws AppError if the token is not found or if there is an internal server error.
 */
const findTokenByUserId = async (userId: number) => {
  let tokenRow;
  try {
    tokenRow = await prisma.password_reset_token.findFirstOrThrow({
      where: {
        userId: Number(userId),
      },
      orderBy: {
        token_expiry: "desc",
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("Token Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return tokenRow;
};

/**
 * Delete a password reset token by user ID and token value.
 * @param userId User's ID associated with the token.
 * @param token Reset token value to delete.
 * @returns The deleted reset token row.
 * @throws AppError if there is an internal server error during the database query.
 */
const deleteTokenByUserIdAndToken = async (
  db : DbClient,
  userId: number, 
  token: string) => {
  let deleted;
  try {
    deleted = await db.password_reset_token.delete({
      where: {
        userId_token: {
          userId: Number(userId),
          token: token,
        },
      },
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return deleted;
};

const ResetTokenService = {
  addNewToken,
  findTokenByUserId,
  deleteTokenByUserIdAndToken,
};

export default ResetTokenService;
