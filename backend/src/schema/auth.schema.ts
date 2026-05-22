import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(3),
});
export type signupInput = z.infer<typeof signupSchema>;

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(3),
});
export type loginInput = z.infer<typeof loginSchema>;

const forgotpassSchema = z.object({
  email: z.email(),
});
export type forgotpassInput = z.infer<typeof forgotpassSchema>;

const resetpassSchema = z.object({
    password : z.string().min(3)
})
export type resetpassInput = z.infer<typeof resetpassSchema>

const AuthSchema = {
  signupSchema,
  loginSchema,
  forgotpassSchema,
  resetpassSchema
};

export default AuthSchema;
