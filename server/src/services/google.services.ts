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

export const getGoogleStatus = async (): Promise<boolean> => {
  const tokenDoc = await GoogleToken.findOne();
  return !!tokenDoc;
};

export const revokeTokens = async () => {
  // remove stored tokens and revoke with Google if possible
  const tokenDoc = await GoogleToken.findOne();
  if (tokenDoc) {
    const token = tokenDoc.toObject();
    if (token.access_token) {
      try {
        await oauth2Client.revokeToken(token.access_token);
      } catch (err) {
        console.warn("Failed to revoke access token", err);
      }
    }
    if (token.refresh_token) {
      try {
        await oauth2Client.revokeToken(token.refresh_token);
      } catch (err) {
        console.warn("Failed to revoke refresh token", err);
      }
    }
  }
  await GoogleToken.deleteMany({});
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

  // Listen for refreshed tokens
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      await GoogleToken.updateOne({}, { refresh_token: tokens.refresh_token });
    }

    if (tokens.access_token) {
      await GoogleToken.updateOne({}, tokens);
    }
  });

  return google.drive({ version: "v3", auth: oauth2Client });
};
