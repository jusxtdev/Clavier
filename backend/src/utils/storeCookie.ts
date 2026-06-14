import { env } from "@/env.js";
import { Response } from "express";

/**
 * Store a cookie in the response with the given title and data,
 * The cookie is configured to be HTTP-only, secure in production,
 * with a max age of 7 days, and same-site policy set to "lax" for cross-origin support.
 * @param title Title of the cookie to be stored ("jwt" for authentication tokens).
 * @param data The value to be stored in the cookie (e.g., JWT token).
 * @param res The Express Response object used to set the cookie.
 */
const storeCookie = (title: string, data: any, res: Response) => {
  res.cookie(title, data, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: "lax",
  });
};

export default storeCookie;
