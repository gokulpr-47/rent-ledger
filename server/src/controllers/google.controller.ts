import { Request, Response } from "express";
import { getAuthUrl, saveTokens } from "../services/google.services";

export const connectGoogle = (req: Request, res: Response) => {
  const url = getAuthUrl();
  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  await saveTokens(code);
  res.send("Google Connected Successfully");
};
