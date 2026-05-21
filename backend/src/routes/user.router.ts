import UserController from "@/controller/user.controller.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import authorize from "@/middleware/authorize.middleware.js";
import express from "express";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize(["ADMIN"]), UserController.getUsers);

router.get("/me", UserController.getCurrentUser);

router.get("/:id", authorize(["ADMIN"]), UserController.getUserById);

router.delete("/me", UserController.deleteCurrentUser)

router.delete("/:id", authorize(["ADMIN"]), UserController.delteUserById)

export default router;
