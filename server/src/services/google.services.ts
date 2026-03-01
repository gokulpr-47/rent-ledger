import { google } from "googleapis";
import dotenv from "dotenv";
import { GoogleToken } from "../models/googleToken.model";

dotenv.config();

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive.file"],
  });
};

export const saveTokens = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  await GoogleToken.deleteMany({});
  await GoogleToken.create(tokens);

  return tokens;
};

import { Credentials } from "google-auth-library";

export const getDriveClient = async () => {
  const tokenDoc = await GoogleToken.findOne();
  if (!tokenDoc) throw new Error("Google not connected");

  const token = tokenDoc.toObject();

  const credentials: Credentials = {
    access_token: token.access_token ?? undefined,
    refresh_token: token.refresh_token ?? undefined,
    scope: token.scope ?? undefined,
    expiry_date: token.expiry_date ?? undefined,
  };

  oauth2Client.setCredentials(credentials);

  return google.drive({ version: "v3", auth: oauth2Client });
};
