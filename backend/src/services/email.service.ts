import { env } from "@/env.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.SENDER_EMAIL,
    pass: env.SENDER_EMAIL_PASS,
  },
});

/**
 * Send a password reset email to a user.
 * @param receiverEmail User's email address to send the reset link to.
 * @param resetLink Password reset link to include in the email.
 * @returns void
 */
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
