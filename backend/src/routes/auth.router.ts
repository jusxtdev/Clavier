import AuthController from "@/controller/auth.controller.js";
import { validate } from "@/middleware/validate.middleware.js";
import AuthSchema from "@/schema/auth.schema.js";
import express from "express";

const router = express.Router();

router.post("/signup", validate(AuthSchema.signupSchema), AuthController.signup);

router.post("/login", validate(AuthSchema.loginSchema), AuthController.login);

router.post("/logout", AuthController.logout);

router.post("/forgotpass", validate(AuthSchema.forgotpassSchema), AuthController.forgotpass)

router.post("/resetpass", validate(AuthSchema.resetpassSchema), AuthController.resetpass)

export default router;
