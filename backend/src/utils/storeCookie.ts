import { env } from "@/env.js";
import { Response, type CookieOptions } from "express";

const isProduction = env.NODE_ENV === "production";

const isHttpsRequest = (res?: Response) =>
  res?.req.secure || res?.req.headers["x-forwarded-proto"] === "https";

export const getAuthCookieOptions = (res?: Response): CookieOptions => {
  const needsCrossSiteCookie = isProduction || isHttpsRequest(res);

  return {
    httpOnly: true,
    secure: needsCrossSiteCookie,
    sameSite: needsCrossSiteCookie ? "none" : "lax",
  };
};

/**
 * Store a cookie in the response with the given title and data,
 * The cookie is configured to be HTTP-only, secure in production, and
 * SameSite=None in production so cross-site frontend requests can send it.
 * @param title Title of the cookie to be stored ("jwt" for authentication tokens).
 * @param data The value to be stored in the cookie (e.g., JWT token).
 * @param res The Express Response object used to set the cookie.
 */
const storeCookie = (title: string, data: any, res: Response) => {
  res.cookie(title, data, {
    ...getAuthCookieOptions(res),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

export default storeCookie;
