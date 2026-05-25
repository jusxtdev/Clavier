import { prisma } from "@/config/db.js";
import { Prisma } from "@/generated/prisma/client.js";
import { AppError } from "@/utils/AppError.js";

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
        throw new AppError("Product Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return tokenRow;
};

const deleteTokenByUserIdAndToken = async (userId: number, token: string) => {
  let deleted;
  try {
    deleted = await prisma.password_reset_token.delete({
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
