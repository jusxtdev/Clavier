import { Role } from "@/generated/prisma/enums.js";
import { z } from "zod";

const promoteUserRoleSchema = z.object({
  userId: z.number(),
  role: z.enum(Role),
});
export type promoteUserRoleInput = z.infer<typeof promoteUserRoleSchema>;

const UserSchema = {
  promoteUserRoleSchema,
};

export default UserSchema;
