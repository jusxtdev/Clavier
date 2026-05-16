import ProductController from "@/controller/product.controller.js";
import { validate } from "@/middleware/validate.middleware.js";
import ProductSchema from "@/schema/product.schema.js";
import express from "express";

const router = express.Router();

router.get("/", ProductController.getProducts);

router.post("/", validate(ProductSchema.newProduct), ProductController.createProduct)

export default router;
