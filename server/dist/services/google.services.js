"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDriveClient = exports.revokeTokens = exports.getGoogleStatus = exports.saveTokens = exports.getAuthUrl = exports.oauth2Client = void 0;
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const googleToken_model_1 = require("../models/googleToken.model");
dotenv_1.default.config();
exports.oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
const getAuthUrl = () => {
    return exports.oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: ["https://www.googleapis.com/auth/drive.file"],
    });
};
exports.getAuthUrl = getAuthUrl;
const saveTokens = async (code) => {
    const { tokens } = await exports.oauth2Client.getToken(code);
    exports.oauth2Client.setCredentials(tokens);
    await googleToken_model_1.GoogleToken.deleteMany({});
    await googleToken_model_1.GoogleToken.create(tokens);
    return tokens;
};
exports.saveTokens = saveTokens;
const getGoogleStatus = async () => {
    const tokenDoc = await googleToken_model_1.GoogleToken.findOne();
    return !!tokenDoc;
};
exports.getGoogleStatus = getGoogleStatus;
const revokeTokens = async () => {
    // remove stored tokens and revoke with Google if possible
    const tokenDoc = await googleToken_model_1.GoogleToken.findOne();
    if (tokenDoc) {
        const token = tokenDoc.toObject();
        if (token.access_token) {
            try {
                await exports.oauth2Client.revokeToken(token.access_token);
            }
            catch (err) {
                console.warn("Failed to revoke access token", err);
            }
        }
        if (token.refresh_token) {
            try {
                await exports.oauth2Client.revokeToken(token.refresh_token);
            }
            catch (err) {
                console.warn("Failed to revoke refresh token", err);
            }
        }
    }
    await googleToken_model_1.GoogleToken.deleteMany({});
};
exports.revokeTokens = revokeTokens;
const getDriveClient = async () => {
    const tokenDoc = await googleToken_model_1.GoogleToken.findOne();
    if (!tokenDoc)
        throw new Error("Google not connected");
    const token = tokenDoc.toObject();
    const credentials = {
        access_token: token.access_token ?? undefined,
        refresh_token: token.refresh_token ?? undefined,
        scope: token.scope ?? undefined,
        expiry_date: token.expiry_date ?? undefined,
    };
    exports.oauth2Client.setCredentials(credentials);
    // Listen for refreshed tokens
    exports.oauth2Client.on("tokens", async (tokens) => {
        if (tokens.refresh_token) {
            await googleToken_model_1.GoogleToken.updateOne({}, { refresh_token: tokens.refresh_token });
        }
        if (tokens.access_token) {
            await googleToken_model_1.GoogleToken.updateOne({}, tokens);
        }
    });
    return googleapis_1.google.drive({ version: "v3", auth: exports.oauth2Client });
};
exports.getDriveClient = getDriveClient;
