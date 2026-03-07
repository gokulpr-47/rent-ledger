"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAutomaticBackup = exports.backupDatabase = exports.uploadToDrive = exports.cleanupOldBackups = exports.createMongoDump = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const google_services_1 = require("./google.services");
dotenv_1.default.config();
const BACKUP_FOLDER_NAME = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_NAME ?? "RentLedgerBackups";
const BACKUP_RETENTION_DAYS = Number(process.env.GOOGLE_BACKUP_RETENTION_DAYS ?? 7);
const UPLOAD_RETRY_COUNT = Number(process.env.GOOGLE_UPLOAD_RETRY_COUNT ?? 3);
const backupDir = path_1.default.join(__dirname, "../../backups");
/* ------------------------------------------------ */
/* Create MongoDB Dump */
/* ------------------------------------------------ */
const createMongoDump = async () => {
    try {
        console.log("📦 Starting MongoDB dump...");
        if (!fs_1.default.existsSync(backupDir)) {
            fs_1.default.mkdirSync(backupDir, { recursive: true });
            console.log("📁 Backup directory created:", backupDir);
        }
        const fileName = `backup-${Date.now()}.gz`;
        const filePath = path_1.default.join(backupDir, fileName);
        await new Promise((resolve, reject) => {
            (0, child_process_1.exec)(`mongodump --archive=${filePath} --gzip`, (err, stdout, stderr) => {
                if (err) {
                    console.error("❌ MongoDump Error:", err);
                    reject(err);
                    return;
                }
                if (stderr)
                    console.warn("⚠️ MongoDump Warning:", stderr);
                console.log("✅ MongoDB dump created:", filePath);
                resolve();
            });
        });
        return filePath;
    }
    catch (error) {
        console.error("❌ Failed to create MongoDB dump:", error);
        throw error;
    }
};
exports.createMongoDump = createMongoDump;
/* ------------------------------------------------ */
/* Backup Retention */
/* ------------------------------------------------ */
const cleanupOldBackups = () => {
    try {
        console.log("🧹 Running backup retention cleanup...");
        if (!fs_1.default.existsSync(backupDir))
            return;
        const files = fs_1.default.readdirSync(backupDir);
        const retentionTime = Date.now() - BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;
        files.forEach((file) => {
            const filePath = path_1.default.join(backupDir, file);
            const stat = fs_1.default.statSync(filePath);
            if (stat.mtime.getTime() < retentionTime) {
                fs_1.default.unlinkSync(filePath);
                console.log("🗑 Deleted old backup:", file);
            }
        });
        console.log("✅ Backup retention cleanup complete");
    }
    catch (error) {
        console.error("❌ Backup cleanup failed:", error);
    }
};
exports.cleanupOldBackups = cleanupOldBackups;
/* ------------------------------------------------ */
/* Get or Create Google Drive Folder */
/* ------------------------------------------------ */
const getOrCreateBackupFolder = async () => {
    const drive = await (0, google_services_1.getDriveClient)();
    console.log("🔍 Checking Google Drive backup folder...");
    const res = await drive.files.list({
        q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id,name)",
        spaces: "drive",
    });
    if (res.data.files && res.data.files.length > 0) {
        const folderId = res.data.files[0].id;
        console.log("📁 Backup folder found:", folderId);
        return folderId;
    }
    console.log("📁 Backup folder not found. Creating...");
    const folder = await drive.files.create({
        requestBody: {
            name: BACKUP_FOLDER_NAME,
            mimeType: "application/vnd.google-apps.folder",
        },
        fields: "id",
    });
    const folderId = folder.data.id;
    console.log("✅ Backup folder created:", folderId);
    return folderId;
};
/* ------------------------------------------------ */
/* Upload with Progress */
/* ------------------------------------------------ */
const uploadFileWithProgress = async (filePath) => {
    const drive = await (0, google_services_1.getDriveClient)();
    const folderId = await getOrCreateBackupFolder();
    const fileSize = fs_1.default.statSync(filePath).size;
    let uploadedBytes = 0;
    const stream = fs_1.default.createReadStream(filePath);
    stream.on("data", (chunk) => {
        uploadedBytes += chunk.length;
        const progress = ((uploadedBytes / fileSize) * 100).toFixed(2);
        process.stdout.write(`⬆ Upload Progress: ${progress}%\r`);
    });
    const response = await drive.files.create({
        requestBody: {
            name: path_1.default.basename(filePath),
            parents: [folderId],
        },
        media: {
            mimeType: "application/gzip",
            body: stream,
        },
        fields: "id,name,webViewLink",
    });
    console.log("\n✅ Upload completed");
    return response.data;
};
/* ------------------------------------------------ */
/* Upload Retry Wrapper */
/* ------------------------------------------------ */
const uploadToDrive = async (filePath) => {
    for (let attempt = 1; attempt <= UPLOAD_RETRY_COUNT; attempt++) {
        try {
            console.log(`☁ Upload attempt ${attempt}/${UPLOAD_RETRY_COUNT}`);
            const result = await uploadFileWithProgress(filePath);
            console.log("📄 File:", result.name);
            console.log("🆔 File ID:", result.id);
            if (result.webViewLink) {
                console.log("🔗 View:", result.webViewLink);
            }
            return result;
        }
        catch (error) {
            console.error(`❌ Upload attempt ${attempt} failed`);
            if (attempt === UPLOAD_RETRY_COUNT) {
                console.error("❌ All upload retries failed");
                throw error;
            }
            console.log("🔄 Retrying upload...");
        }
    }
};
exports.uploadToDrive = uploadToDrive;
/* ------------------------------------------------ */
/* Full Backup Process */
/* ------------------------------------------------ */
const backupDatabase = async () => {
    try {
        console.log("\n=================================");
        console.log("🚀 BACKUP PROCESS STARTED");
        console.log("=================================");
        (0, exports.cleanupOldBackups)();
        const filePath = await (0, exports.createMongoDump)();
        const driveFile = await (0, exports.uploadToDrive)(filePath);
        console.log("=================================");
        console.log("🎉 BACKUP COMPLETED SUCCESSFULLY");
        console.log("=================================");
        return {
            success: true,
            file: driveFile,
        };
    }
    catch (error) {
        console.error("❌ Backup process failed:", error);
        return {
            success: false,
            error,
        };
    }
};
exports.backupDatabase = backupDatabase;
/* ------------------------------------------------ */
/* Automatic Backup on Server Start */
/* ------------------------------------------------ */
const startAutomaticBackup = async () => {
    try {
        console.log("⚡ Server started → running automatic backup");
        await (0, exports.backupDatabase)();
    }
    catch (error) {
        console.error("❌ Automatic backup failed:", error);
    }
};
exports.startAutomaticBackup = startAutomaticBackup;
