import { OrderStatus } from "@/generated/prisma/enums.js";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(OrderStatus),
});
export type updateStatusInput = z.infer<typeof updateStatusSchema>;

const OrderSchema = { updateStatusSchema };

export default OrderSchema;
