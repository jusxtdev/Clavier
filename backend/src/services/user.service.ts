import { prisma } from "@/config/db.js";
import { Prisma, Role } from "@/generated/prisma/client.js";
import { signupInput } from "@/schema/auth.schema.js";
import { AppError } from "@/utils/AppError.js";

const getAllUsers = async (page: number, limit: number) => {
  let totalUserCount;
  let allUsers;
  try {
    allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
    totalUserCount = await prisma.user.count();
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }

  return { allUsers, totalUserCount };
};

const findUserByEmail = async (email: string) => {
  let user;
  try {
    user = await prisma.user.findUniqueOrThrow({
      where: {
        email: email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
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
  return user;
};

const findUserById = async (userId: number) => {
  let user;
  try {
    user = await prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
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
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("User Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return user;
};

const createNewUser = async (data: signupInput, hashedPass: string) => {
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

  return newUser;
};

const updatePassById = async (userId: number, hashedPass: string) => {
  let updated;
  try {
    updated = await prisma.user.update({
      where: {
        id: userId,
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
  return updated;
};

const updateRoleById = async (userId: number, role: Role) => {
  let updated;
  try {
    updated = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        role: role,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("User Not Found", 404);
      }
    }

    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
  return updated;
};

const deleteUserById = async (userId: number) => {
  try {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Record not found
      if (error.code == "P2025") {
        throw new AppError("User Not Found", 404);
      }
    }
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
};

const UserService = {
  createNewUser,
  findUserByEmail,
  updatePassById,
  findUserById,
  getAllUsers,
  updateRoleById,
  deleteUserById,
};

export default UserService;
