import { randomBytes } from "node:crypto";

const generateResetToken = async () => {
  return Buffer.from(randomBytes(128)).toString("hex");
};

export default generateResetToken;
