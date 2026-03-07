"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualBackup = void 0;
const backup_services_1 = require("../services/backup.services");
const manualBackup = async (req, res) => {
    try {
        console.log("Starting backup process...");
        const filePath = await (0, backup_services_1.createMongoDump)();
        console.log("Dump created at:", filePath);
        const driveFile = await (0, backup_services_1.uploadToDrive)(filePath);
        res.status(200).json({
            success: true,
            message: "Backup completed successfully",
            driveFile,
        });
    }
    catch (err) {
        console.error("Backup process failed:", err);
        res.status(500).json({
            success: false,
            message: "Backup failed",
            error: err instanceof Error ? err.message : err,
        });
    }
};
exports.manualBackup = manualBackup;
