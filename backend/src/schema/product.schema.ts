import { z } from "zod";

const newProduct = z.object({
  title: z.string().max(200).min(3),
  description: z.string(),
  price: z.float64().min(1),
  stock: z.int().min(0),
  categories: z.preprocess((val) => {
    if (!Array.isArray(val)) return val;

    return val.map((item) =>
      typeof item === "string" ? item.toLowerCase() : item,
    );
  }, z.array(z.string()).optional()),
  images: z.string().optional(),
});
export type CreateProductInput = z.infer<typeof newProduct>;

const updateProduct = newProduct.partial();
export type UpdateProductInput = z.infer<typeof updateProduct>;

const ProductSchema = {
  newProduct,
  updateProduct,
};

export default ProductSchema;
