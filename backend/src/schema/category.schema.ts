import { z } from "zod";

const newCategory = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
});
export type newCategoryInput = z.infer<typeof newCategory>;

const updateCategory = newCategory.partial();
export type updateCategoryInput = z.infer<typeof updateCategory>;

const CategorySchema = {
  newCategory,
  updateCategory,
};

export default CategorySchema;
