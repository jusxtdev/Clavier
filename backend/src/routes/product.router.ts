import ProductController from "@/controller/product.controller.js";
import { validate } from "@/middleware/validate.middleware.js";
import ProductSchema from "@/schema/product.schema.js";
import express from "express";

const router = express.Router();

router.get("/", ProductController.getProducts);

router.get("/:id", ProductController.getProductById);

router.post("/", validate(ProductSchema.newProduct), ProductController.createProduct)

router.patch("/:id", validate(ProductSchema.updateProduct), ProductController.updateProduct)

router.delete("/:id", ProductController.deleteProduct)

export default router;
