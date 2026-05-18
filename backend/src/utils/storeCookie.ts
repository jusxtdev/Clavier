import { env } from "@/env.js";
import { Response } from "express";

const storeCookie = (title: string, data: any, res: Response) => {
  res.cookie(title, data, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
};

export default storeCookie;
