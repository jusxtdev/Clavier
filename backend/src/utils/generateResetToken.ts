import { randomBytes } from "node:crypto";

/**
 * Generate a secure random token for password reset functionality.
 * @returns A hexadecimal string representing the generated token.
 */
const generateResetToken = async () => {
  return Buffer.from(randomBytes(128)).toString("hex");
};

export default generateResetToken;
