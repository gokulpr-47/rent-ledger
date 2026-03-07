"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleToken = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GoogleTokenSchema = new mongoose_1.default.Schema({
    access_token: String,
    refresh_token: String,
    scope: String,
    expiry_date: Number,
}, { timestamps: true });
exports.GoogleToken = mongoose_1.default.model("GoogleToken", GoogleTokenSchema);
