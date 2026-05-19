import { jwtPayload } from "@/utils/generateToken.ts"
import "express"

declare global {
    namespace Express {
        interface Request {
            user?: jwtPayload
        }
    }
}