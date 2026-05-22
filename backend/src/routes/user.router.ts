import UserController from "@/controller/user.controller.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import authorize from "@/middleware/authorize.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import UserSchema from "@/schema/user.schema.js";
import express from "express";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize(["ADMIN"]), UserController.getUsers);

router.get("/me", UserController.getCurrentUser);

router.get("/:id", authorize(["ADMIN"]), UserController.getUserById);

router.patch("/promote", authorize(["ADMIN"]), validate(UserSchema.promoteUserRoleSchema), UserController.promoteUserRole)

router.delete("/me", UserController.deleteCurrentUser)

router.delete("/:id", authorize(["ADMIN"]), UserController.delteUserById)

export default router;
