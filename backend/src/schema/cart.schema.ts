import { z } from "zod";

const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});
export type addToCartInput = z.infer<typeof addToCartSchema>

const updateCartSchema = addToCartSchema
export type updateCartInput = z.infer<typeof updateCartSchema>

const CartSchema = {
  addToCartSchema,
  updateCartSchema
};

export default CartSchema;
