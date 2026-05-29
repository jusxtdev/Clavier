import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});
export type addToCartInput = z.infer<typeof addToCartSchema>

const CartSchema = {
  addToCartSchema,
};

export default CartSchema;
