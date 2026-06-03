import ProductController from "@/controller/product.controller.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import authorize from "@/middleware/authorize.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import ProductSchema from "@/schema/product.schema.js";
import express from "express";

const router = express.Router();

// Anyone can get the products but only authenticated users can interact with it

router.get("/", ProductController.getProducts);

router.get("/:id", ProductController.getProductById);

// only ADMIN can CREATE new products
router.post("/", authenticate, authorize(["ADMIN"]), validate(ProductSchema.newProduct), ProductController.createProduct)

// only ADMIN and STAFF can UPDATE a product (stock / price etc.)
router.patch("/:id", authenticate, authorize(["ADMIN", "STAFF"]), validate(ProductSchema.updateProduct), ProductController.updateProduct)

// only ADMIN can DELETE products
router.delete("/:id", authenticate, authorize(["ADMIN"]), ProductController.deleteProduct)

export default router;
