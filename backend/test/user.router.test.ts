import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorHandler } from "../src/middleware/errorHandler.middleware.js";

const mockUserController = vi.hoisted(() => ({
  getUsers: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "users ok" });
  }),
  getCurrentUser: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "current user ok" });
  }),
  getUserById: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "user ok" });
  }),
  promoteUserRole: vi.fn(async (_req: Request, res: Response) => {
    res.status(200).json({ status: true, msg: "promote user ok" });
  }),
  deleteCurrentUser: vi.fn(async (_req: Request, res: Response) => {
    res.status(204).send();
  }),
  deleteUserById: vi.fn(async (_req: Request, res: Response) => {
    res.status(204).send();
  }),
}));

const mockAuthenticate = vi.hoisted(() =>
  vi.fn((req: Request, _res: Response, next: NextFunction) => {
    req.user = { userId: 1, role: "ADMIN" };
    next();
  }),
);

const mockAuthorize = vi.hoisted(() =>
  vi.fn(
    (roles: string[]) =>
      (req: Request, res: Response, next: NextFunction) => {
        if (roles.includes(req.user!.role)) {
          return next();
        }

        res.status(403).json({ status: false, msg: "Forbidden" });
      },
  ),
);

vi.mock("@/controller/user.controller.js", () => ({
  default: mockUserController,
}));

vi.mock("@/middleware/authenticate.middleware.js", () => ({
  default: mockAuthenticate,
}));

vi.mock("@/middleware/authorize.middleware.js", () => ({
  default: mockAuthorize,
}));

const createTestApp = async () => {
  const { default: userRouter } = await import("../src/routes/user.router.js");
  const app = express();

  app.use(express.json());
  app.use("/api/users", userRouter);
  app.use(errorHandler);

  return app;
};

describe("/api/users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes list requests to UserController.getUsers", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/users?page=1&limit=10");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "users ok" });
    expect(mockAuthenticate).toHaveBeenCalledTimes(1);
    expect(mockAuthorize).toHaveBeenCalledWith(["ADMIN"]);
    expect(mockUserController.getUsers).toHaveBeenCalledTimes(1);
  });

  it("passes current-user requests to UserController.getCurrentUser", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/users/me");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "current user ok" });
    expect(mockUserController.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("passes get-by-id requests to UserController.getUserById", async () => {
    const app = await createTestApp();

    const response = await request(app).get("/api/users/4");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "user ok" });
    expect(mockUserController.getUserById).toHaveBeenCalledTimes(1);
    expect(mockUserController.getUserById).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "4" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("passes valid promote requests to UserController.promoteUserRole", async () => {
    const app = await createTestApp();
    const payload = {
      userId: 4,
      role: "STAFF",
    };

    const response = await request(app).patch("/api/users/promote").send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: true, msg: "promote user ok" });
    expect(mockUserController.promoteUserRole).toHaveBeenCalledTimes(1);
    expect(mockUserController.promoteUserRole).toHaveBeenCalledWith(
      expect.objectContaining({ body: payload }),
      expect.any(Object),
      expect.any(Function),
    );
  });

  it("rejects invalid promote payloads", async () => {
    const app = await createTestApp();

    const response = await request(app).patch("/api/users/promote").send({
      userId: "4",
      role: "OWNER",
    });

    expect(response.status).toBe(400);
    expect(response.body.status).toBe(false);
    expect(mockUserController.promoteUserRole).not.toHaveBeenCalled();
  });

  it("passes delete-current-user requests to UserController.deleteCurrentUser", async () => {
    const app = await createTestApp();

    const response = await request(app).delete("/api/users/me");

    expect(response.status).toBe(204);
    expect(mockUserController.deleteCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("passes delete-by-id requests to UserController.deleteUserById", async () => {
    const app = await createTestApp();

    const response = await request(app).delete("/api/users/4");

    expect(response.status).toBe(204);
    expect(mockUserController.deleteUserById).toHaveBeenCalledTimes(1);
    expect(mockUserController.deleteUserById).toHaveBeenCalledWith(
      expect.objectContaining({ params: { id: "4" } }),
      expect.any(Object),
      expect.any(Function),
    );
  });
});
