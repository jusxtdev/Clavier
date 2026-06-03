import { env } from "@/env.js"
import { Role } from "@/generated/prisma/enums.js"
import jwt from "jsonwebtoken"

// payload type for jwt token
// stored in req.user inside authenticate middleware
export type jwtPayload = {
    userId : number,
    role : Role
}

/**
 * Generate a JWT token with the given payload, 
 * using the secret and expiration settings from the environment variables.
 * @param payload 
 * @returns JWT token as a string
 */
const generateToken = (payload : jwtPayload) => {
    const token = jwt.sign(
        payload,
        env.JWT_SECRET,
        {
            expiresIn : env.JWT_EXPIRES_IN
        }
    )
    return token
}

export default generateToken