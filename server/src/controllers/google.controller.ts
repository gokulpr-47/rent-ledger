import { Request, Response } from "express";
import {
  getAuthUrl,
  saveTokens,
  getGoogleStatus,
  revokeTokens,
} from "../services/google.services";

export const connectGoogle = (req: Request, res: Response) => {
  const url = getAuthUrl();
  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  await saveTokens(code);

  const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
  res.redirect(clientUrl + "/settings");
};

export const googleStatus = async (req: Request, res: Response) => {
  try {
    const status = await getGoogleStatus();
    res.json({ success: true, connected: status });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const googleDisconnect = async (req: Request, res: Response) => {
  try {
    await revokeTokens();
    res.json({ success: true, message: "Disconnected from Google" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
