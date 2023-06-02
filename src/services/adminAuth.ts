import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { getUserAdmin } from "../utils/querys";
import { createToken } from "../utils/jwt";


export const adminAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { email, password } = req.body;
  !email || !password
    ? res
        .status(404)
        .json({ status: "error", message: "email and password are required" })
    : null;

  try {
    let user = await getUserAdmin(email);
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = createToken(user);
        user.password = undefined;

        

        res.status(200).json({ status: "success", jwt: token });
      } else {
        res
          .status(404)
          .json({ status: "error", message: "user or password invalid" });
      }
    } else {
      res
        .status(404)
        .json({ status: "error", message: "user or password invalid" });
    }
  } catch (error) {
    return next(error);
  }
};
