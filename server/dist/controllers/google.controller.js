"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleDisconnect = exports.googleStatus = exports.googleCallback = exports.connectGoogle = void 0;
const google_services_1 = require("../services/google.services");
const connectGoogle = (req, res) => {
    const url = (0, google_services_1.getAuthUrl)();
    res.redirect(url);
};
exports.connectGoogle = connectGoogle;
const googleCallback = async (req, res) => {
    const code = req.query.code;
    await (0, google_services_1.saveTokens)(code);
    res.send("Google Connected Successfully");
};
exports.googleCallback = googleCallback;
const googleStatus = async (req, res) => {
    try {
        const status = await (0, google_services_1.getGoogleStatus)();
        res.json({ success: true, connected: status });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.googleStatus = googleStatus;
const googleDisconnect = async (req, res) => {
    try {
        await (0, google_services_1.revokeTokens)();
        res.json({ success: true, message: "Disconnected from Google" });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.googleDisconnect = googleDisconnect;
