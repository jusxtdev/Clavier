import ProductController from "@/controller/product.controller.js";
import authMiddleware from "@/middleware/auth.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import ProductSchema from "@/schema/product.schema.js";
import express from "express";

const router = express.Router();

router.get("/", authMiddleware, ProductController.getProducts);

router.get("/:id", authMiddleware, ProductController.getProductById);

router.post("/", authMiddleware, validate(ProductSchema.newProduct), ProductController.createProduct)

router.patch("/:id", authMiddleware, validate(ProductSchema.updateProduct), ProductController.updateProduct)

router.delete("/:id", authMiddleware, ProductController.deleteProduct)

export default router;
