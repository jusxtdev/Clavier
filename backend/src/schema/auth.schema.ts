import {z} from "zod"

const signupSchema = z.object({
    name : z.string().min(3),
    email : z.email(),
    password : z.string().min(3)
})
export type signupInput = z.infer<typeof signupSchema>

const loginSchema = z.object({
    email : z.email(),
    password : z.string().min(3)
})
export type loginInput = z.infer<typeof loginSchema>

const AuthSchema = {
    signupSchema, loginSchema
}

export default AuthSchema;