import { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/utils/AppError.js";

const mocks = vi.hoisted(() => ({
  bcrypt: {
    genSalt: vi.fn(),
    hash: vi.fn(),
    compare: vi.fn(),
  },
  generateToken: vi.fn(),
  storeCookie: vi.fn(),
  generateResetToken: vi.fn(),
  passwordResetEmail: vi.fn(),
  userService: {
    createNewUser: vi.fn(),
    findUserByEmail: vi.fn(),
    updatePassById: vi.fn(),
  },
  resetTokenService: {
    addNewToken: vi.fn(),
    findTokenByUserId: vi.fn(),
    deleteTokenByUserIdAndToken: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: mocks.bcrypt,
}));

vi.mock("@/env.js", () => ({
  env: {
    FRONTEND_URL: "http://frontend.test",
    JWT_EXPIRES_IN: 3600,
    JWT_SECRET: "test-secret",
    NODE_ENV: "test",
    PORT: 3000,
  },
}));

vi.mock("@/utils/generateToken.js", () => ({
  default: mocks.generateToken,
}));

vi.mock("@/utils/storeCookie.js", () => ({
  default: mocks.storeCookie,
}));

vi.mock("@/utils/generateResetToken.js", () => ({
  default: mocks.generateResetToken,
}));

vi.mock("@/services/email.service.js", () => ({
  passwordResetEmail: mocks.passwordResetEmail,
}));

vi.mock("@/services/user.service.js", () => ({
  default: mocks.userService,
}));

vi.mock("@/services/resetToken.service.js", () => ({
  default: mocks.resetTokenService,
}));

const { default: AuthController } = await import(
  "../src/controller/auth.controller.js"
);

const createResponse = () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  };

  return res as unknown as Response;
};

describe("AuthController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.bcrypt.genSalt.mockResolvedValue("salt");
    mocks.bcrypt.hash.mockImplementation(async (value: string) => `hashed:${value}`);
    mocks.generateToken.mockReturnValue("jwt-token");
  });

  describe("login", () => {
    it("rejects unknown email without comparing password or issuing a token", async () => {
      mocks.userService.findUserByEmail.mockResolvedValue(null);
      const req = {
        body: { email: "missing@example.com", password: "secret" },
      } as Request;
      const res = createResponse();

      await expect(AuthController.login(req, res)).rejects.toMatchObject({
        statusCode: 404,
      } satisfies Partial<AppError>);

      expect(mocks.bcrypt.compare).not.toHaveBeenCalled();
      expect(mocks.generateToken).not.toHaveBeenCalled();
      expect(mocks.storeCookie).not.toHaveBeenCalled();
    });

    it("rejects an invalid password without issuing a token", async () => {
      mocks.userService.findUserByEmail.mockResolvedValue({
        id: 1,
        role: "BUYER",
        password: "hashed-password",
      });
      mocks.bcrypt.compare.mockResolvedValue(false);
      const req = {
        body: { email: "buyer@example.com", password: "wrong" },
      } as Request;
      const res = createResponse();

      await expect(AuthController.login(req, res)).rejects.toMatchObject({
        statusCode: 400,
      } satisfies Partial<AppError>);

      expect(mocks.generateToken).not.toHaveBeenCalled();
      expect(mocks.storeCookie).not.toHaveBeenCalled();
    });
  });

  describe("forgotpass", () => {
    it("does not create or email a token when the email is not registered", async () => {
      mocks.userService.findUserByEmail.mockResolvedValue(null);
      const req = { body: { email: "missing@example.com" } } as Request;
      const res = createResponse();

      await AuthController.forgotpass(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mocks.generateResetToken).not.toHaveBeenCalled();
      expect(mocks.resetTokenService.addNewToken).not.toHaveBeenCalled();
      expect(mocks.passwordResetEmail).not.toHaveBeenCalled();
    });

    it("stores only the hashed reset token but emails the raw token", async () => {
      mocks.userService.findUserByEmail.mockResolvedValue({ id: 7 });
      mocks.generateResetToken.mockResolvedValue("raw-reset-token");
      mocks.resetTokenService.addNewToken.mockResolvedValue({
        userId: 7,
        token: "hashed:raw-reset-token",
      });
      const req = { body: { email: "buyer@example.com" } } as Request;
      const res = createResponse();

      await AuthController.forgotpass(req, res);

      expect(mocks.resetTokenService.addNewToken).toHaveBeenCalledWith(
        "hashed:raw-reset-token",
        expect.any(Date),
        7,
      );
      expect(mocks.passwordResetEmail).toHaveBeenCalledWith(
        "buyer@example.com",
        "http://frontend.test/api/auth/resetpass?token=7.raw-reset-token",
      );
    });
  });

  describe("resetpass", () => {
    it("rejects malformed reset token before looking up a token row", async () => {
      const req = {
        query: { token: "not-a-valid-token" },
        body: { password: "new-secret" },
      } as unknown as Request;
      const res = createResponse();

      await expect(AuthController.resetpass(req, res)).rejects.toMatchObject({
        statusCode: 401,
      } satisfies Partial<AppError>);

      expect(mocks.resetTokenService.findTokenByUserId).not.toHaveBeenCalled();
      expect(mocks.userService.updatePassById).not.toHaveBeenCalled();
    });

    it("updates password and deletes token when raw token matches stored hash", async () => {
      const expiresAt = new Date(Date.now() + 60_000);
      mocks.resetTokenService.findTokenByUserId.mockResolvedValue({
        userId: 7,
        token: "hashed:raw-reset-token",
        token_expiry: expiresAt,
      });
      mocks.bcrypt.compare.mockResolvedValue(true);
      mocks.userService.updatePassById.mockResolvedValue({ id: 7 });
      const req = {
        query: { token: "7.raw-reset-token" },
        body: { password: "new-secret" },
      } as unknown as Request;
      const res = createResponse();

      await AuthController.resetpass(req, res);

      expect(mocks.bcrypt.compare).toHaveBeenCalledWith(
        "raw-reset-token",
        "hashed:raw-reset-token",
      );
      expect(mocks.userService.updatePassById).toHaveBeenCalledWith(
        7,
        "hashed:new-secret",
      );
      expect(
        mocks.resetTokenService.deleteTokenByUserIdAndToken,
      ).toHaveBeenCalledWith(7, "hashed:raw-reset-token");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
