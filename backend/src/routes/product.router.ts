import ProductController from "@/controller/product.controller.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import authorize from "@/middleware/authorize.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import ProductSchema from "@/schema/product.schema.js";
import express from "express";

const router = express.Router();

// Each route is accessible to logged in users only
router.use(authenticate)

router.get("/",  ProductController.getProducts);

router.get("/:id", ProductController.getProductById);

// only ADMIN can CREATE new products
router.post("/", authorize(["ADMIN"]), validate(ProductSchema.newProduct), ProductController.createProduct)

// only ADMIN and STAFF can UPDATE a product (stock / price etc.)
router.patch("/:id", authorize(["ADMIN", "STAFF"]), validate(ProductSchema.updateProduct), ProductController.updateProduct)

// only ADMIN can DELETE products
router.delete("/:id", authorize(["ADMIN"]), ProductController.deleteProduct)

export default router;
