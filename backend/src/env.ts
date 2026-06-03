import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import { config } from "dotenv";
config();

/**
 * Used to access environment variables
 * from JS Object
 */
export const env = createEnv({
  server: {
    PORT: z.coerce.number(),
    DATABASE_URL: z.url(),
    JWT_SECRET: z.string(),
    JWT_EXPIRES_IN: z.coerce.number(),
    NODE_ENV: z.string(),
    SENDER_EMAIL_PASS : z.string(),
    SENDER_EMAIL : z.email(),
    FRONTEND_URL : z.url().default(""),
  },
  runtimeEnv: process.env,
});
