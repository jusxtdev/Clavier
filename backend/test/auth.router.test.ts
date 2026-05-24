import express, { Request, Response } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler.middleware.js";

const mockAuthController = vi.hoisted(() => ({
  signup: vi.fn(async (_req: Request, res: Response) => {
    res.status(201).json({ status: true, msg: "signup ok" });
  }),
  login: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "login ok" });
  }),
  logout: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "logout ok" });
  }),
  forgotpass: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "forgotpass ok" });
  }),
  resetpass: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "resetpass ok" });
  }),
}));

vi.mock("@/controller/auth.controller.js", () => ({
  default: mockAuthController,
}));

const createTestApp = async () => {
  const { default: authRouter } = await import("../src/routes/auth.router.js");
  const app = express();

  app.use(express.json());
  app.use("/api/auth", authRouter);
  app.use(errorHandler);

  return app;
};

describe("/api/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /signup", () => {
    it("passes a valid signup request to AuthController.signup", async () => {
      const app = await createTestApp();
      const payload = {
        name: "Test User",
        email: "test@example.com",
        password: "secret",
      };

      const response = await request(app).post("/api/auth/signup").send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ status: true, msg: "signup ok" });
      expect(mockAuthController.signup).toHaveBeenCalledTimes(1);
      expect(mockAuthController.signup).toHaveBeenCalledWith(
        expect.objectContaining({ body: payload }),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("rejects invalid signup payloads", async () => {
      const app = await createTestApp();

      const response = await request(app).post("/api/auth/signup").send({
        name: "Te",
        email: "invalid-email",
        password: "pw",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(mockAuthController.signup).not.toHaveBeenCalled();
    });
  });

  describe("POST /login", () => {
    it("passes a valid login request to AuthController.login", async () => {
      const app = await createTestApp();
      const payload = {
        email: "test@example.com",
        password: "secret",
      };

      const response = await request(app).post("/api/auth/login").send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: true, msg: "login ok" });
      expect(mockAuthController.login).toHaveBeenCalledTimes(1);
      expect(mockAuthController.login).toHaveBeenCalledWith(
        expect.objectContaining({ body: payload }),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("rejects invalid login payloads", async () => {
      const app = await createTestApp();

      const response = await request(app).post("/api/auth/login").send({
        email: "not-an-email",
        password: "no",
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(mockAuthController.login).not.toHaveBeenCalled();
    });
  });

  describe("POST /logout", () => {
    it("passes logout requests to AuthController.logout", async () => {
      const app = await createTestApp();

      const response = await request(app).post("/api/auth/logout").send();

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: true, msg: "logout ok" });
      expect(mockAuthController.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /forgotpass", () => {
    it("passes a valid forgot password request to AuthController.forgotpass", async () => {
      const app = await createTestApp();
      const payload = { email: "test@example.com" };

      const response = await request(app)
        .post("/api/auth/forgotpass")
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: true, msg: "forgotpass ok" });
      expect(mockAuthController.forgotpass).toHaveBeenCalledTimes(1);
      expect(mockAuthController.forgotpass).toHaveBeenCalledWith(
        expect.objectContaining({ body: payload }),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("rejects invalid forgot password payloads", async () => {
      const app = await createTestApp();

      const response = await request(app)
        .post("/api/auth/forgotpass")
        .send({ email: "bad-email" });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(mockAuthController.forgotpass).not.toHaveBeenCalled();
    });
  });

  describe("POST /resetpass", () => {
    it("passes a valid reset password request to AuthController.resetpass", async () => {
      const app = await createTestApp();
      const payload = { password: "new-secret" };

      const response = await request(app)
        .post("/api/auth/resetpass?token=1.reset-token")
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: true, msg: "resetpass ok" });
      expect(mockAuthController.resetpass).toHaveBeenCalledTimes(1);
      expect(mockAuthController.resetpass).toHaveBeenCalledWith(
        expect.objectContaining({ body: payload }),
        expect.any(Object),
        expect.any(Function),
      );
    });

    it("rejects invalid reset password payloads", async () => {
      const app = await createTestApp();

      const response = await request(app)
        .post("/api/auth/resetpass?token=1.reset-token")
        .send({ password: "no" });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe(false);
      expect(mockAuthController.resetpass).not.toHaveBeenCalled();
    });
  });
});
