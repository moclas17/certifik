import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const createToken = (user: any) => {
  const payload = {
    sub: user.id,
    email: user.email,
    expiresIn: "7d",
  };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY);
};
