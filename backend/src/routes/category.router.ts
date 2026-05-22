import CategoryController from "@/controller/category.controller.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import authorize from "@/middleware/authorize.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import CategorySchema from "@/schema/category.schema.js";
import express from "express";

const router = express.Router();

router.use(authenticate)

router.get("/", CategoryController.getCategories)

router.get("/:id", CategoryController.getCategoryById)

router.post("/", authorize(["ADMIN"]), validate(CategorySchema.newCategory), CategoryController.createCategory)

router.patch("/:id", authorize(["ADMIN"]), validate(CategorySchema.updateCategory), CategoryController.updateCategory)

router.delete("/:id", authorize(["ADMIN"]), CategoryController.deleteCategroy)

export default router;
