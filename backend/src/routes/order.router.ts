import OrderController from "@/controller/order.conroller.js";
import authenticate from "@/middleware/authenticate.middleware.js";
import authorize from "@/middleware/authorize.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import OrderSchema from "@/schema/order.schema.js";
import express from "express";

const router = express.Router();

router.use(authenticate);

router.post("/", OrderController.placeOrder);

router.get("/", OrderController.getOrders);

router.get("/:id", OrderController.getOrderById);

router.patch(
  "/:id",
  authorize(["ADMIN", "STAFF"]),
  validate(OrderSchema.updateStatusSchema),
  OrderController.updateOrderStatus,
);

export default router;
