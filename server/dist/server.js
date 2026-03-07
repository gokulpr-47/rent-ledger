"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const error_middleware_1 = require("./middleware/error.middleware");
const backup_services_1 = require("./services/backup.services");
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await (0, db_1.connectDB)();
    }
    catch (err) {
        console.error("Failed to connect to database. Server not started.", err);
        process.exit(1);
    }
    app_1.default.listen(PORT, async () => {
        console.log(`Server running on port ${PORT}`);
        await (0, backup_services_1.startAutomaticBackup)();
    });
};
app_1.default.use(error_middleware_1.errorHandler);
startServer();
