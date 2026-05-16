import { z } from "zod";

const newProduct = z.object({
    title : z.string().max(200),
    description : z.string(),
    price : z.coerce.number(),
    stock : z.int(),
    category : z.string().optional(),
    images : z.string().optional()
})
export type CreateProductInput = z.infer<typeof newProduct>

const updateProduct = newProduct.partial()
export type UpdateProductInput = z.infer<typeof updateProduct>

const ProductSchema = {
    newProduct
}

export default ProductSchema;