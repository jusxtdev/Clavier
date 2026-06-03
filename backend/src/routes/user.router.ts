import UserController from "@/controller/user.controller.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import authorize from "@/middleware/authorize.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import UserSchema from "@/schema/user.schema.js";
import express from "express";

const router = express.Router();

router.use(authenticate);


router.get("/me", UserController.getCurrentUser);

router.delete("/me", UserController.deleteCurrentUser)

// ADMIN Only can interact with Other users' data

router.get("/:id", authorize(["ADMIN"]), UserController.getUserById);

router.patch("/promote", authorize(["ADMIN"]), validate(UserSchema.promoteUserRoleSchema), UserController.promoteUserRole)

router.get("/", authorize(["ADMIN"]), UserController.getUsers);

router.delete("/:id", authorize(["ADMIN"]), UserController.deleteUserById)

export default router;
