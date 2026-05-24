import { env } from "@/env.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.SENDER_EMAIL,
    pass: env.SENDER_EMAIL_PASS,
  },
});

export const passwordResetEmail = async (receiverEmail: string, resetLink: string) => {
  await transporter.sendMail({
    from: env.SENDER_EMAIL,
    to: receiverEmail,
    subject: "Reset your password",
    html: `
            <h2>Password Reset</h2>
            <p>Click below to reset password:</p>
            <a href="${resetLink}">${resetLink}</a>
        `,
  });
};

