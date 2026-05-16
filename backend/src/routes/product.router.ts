import ProductController from "@/controller/product.controller.js";
import express from "express";

const router = express.Router();

router.get("/", ProductController.getProducts);

export default router;
