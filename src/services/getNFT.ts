import { Request, Response, NextFunction } from "express";
import { getUserNft } from "../utils/querys";

export const getNFT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const { email } = req.body;
  !email
    ? res.status(404).json({ status: "error", message: "email is required" })
    : null;

  try {
    const nfts = await getUserNft(email);
    res.status(200).json({ status: "success", nfts });
  } catch (error) {
    return next(error);
  }
};
