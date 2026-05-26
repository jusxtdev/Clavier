import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/utils/AppError.js";

const mocks = vi.hoisted(() => ({
  userService: {
    findUserById: vi.fn(),
    getAllUsers: vi.fn(),
    updateRoleById: vi.fn(),
    deleteUserById: vi.fn(),
  },
}));

vi.mock("@/services/user.service.js", () => ({
  default: mocks.userService,
}));

const { default: UserController } = await import(
  "../src/controller/user.controller.js"
);

const createResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };

  return res as unknown as Response;
};

describe("UserController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userService.getAllUsers.mockResolvedValue({
      allUsers: [],
      totalUserCount: 0,
    });
  });

  describe("getUsers", () => {
    it("rejects non-numeric pagination instead of silently defaulting", async () => {
      const req = {
        query: { page: "abc", limit: "10" },
      } as unknown as Request;
      const res = createResponse();

      await expect(UserController.getUsers(req, res)).rejects.toMatchObject({
        statusCode: 411,
      } satisfies Partial<AppError>);

      expect(mocks.userService.getAllUsers).not.toHaveBeenCalled();
    });

    it("normalizes role filters and builds a case-insensitive name search", async () => {
      const req = {
        query: { role: "staff", name: "Ali" },
      } as unknown as Request;
      const res = createResponse();

      await UserController.getUsers(req, res);

      expect(mocks.userService.getAllUsers).toHaveBeenCalledWith(
        1,
        10,
        {
          role: "STAFF",
          name: { contains: "ali", mode: "insensitive" },
        },
      );
    });

    it("rejects invalid role filters before calling the service", async () => {
      const req = {
        query: { role: "OWNER" },
      } as unknown as Request;
      const res = createResponse();

      await expect(UserController.getUsers(req, res)).rejects.toMatchObject({
        statusCode: 400,
      } satisfies Partial<AppError>);

      expect(mocks.userService.getAllUsers).not.toHaveBeenCalled();
    });
  });

  it("rejects invalid route ids before calling the service", async () => {
    const req = { params: { id: "abc" } } as unknown as Request;
    const res = createResponse();

    await expect(UserController.getUserById(req, res)).rejects.toMatchObject({
      statusCode: 400,
    } satisfies Partial<AppError>);

    expect(mocks.userService.findUserById).not.toHaveBeenCalled();
  });

  it("deletes the current user from the authenticated request", async () => {
    const req = { user: { userId: 5, role: "BUYER" } } as unknown as Request;
    const res = createResponse();

    await UserController.deleteCurrentUser(req, res);

    expect(mocks.userService.deleteUserById).toHaveBeenCalledWith(5);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
