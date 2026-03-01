import { exec } from "child_process";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { getDriveClient } from "./google.services";

dotenv.config();

const BACKUP_FOLDER_NAME =
  process.env.GOOGLE_DRIVE_BACKUP_FOLDER_NAME ?? "RentLedgerBackups";

const BACKUP_RETENTION_DAYS = Number(
  process.env.GOOGLE_BACKUP_RETENTION_DAYS ?? 7,
);
const UPLOAD_RETRY_COUNT = Number(process.env.GOOGLE_UPLOAD_RETRY_COUNT ?? 3);

const backupDir = path.join(__dirname, "../../backups");

/* ------------------------------------------------ */
/* Create MongoDB Dump */
/* ------------------------------------------------ */

export const createMongoDump = async (): Promise<string> => {
  try {
    console.log("📦 Starting MongoDB dump...");

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log("📁 Backup directory created:", backupDir);
    }

    const fileName = `backup-${Date.now()}.gz`;
    const filePath = path.join(backupDir, fileName);

    await new Promise<void>((resolve, reject) => {
      exec(`mongodump --archive=${filePath} --gzip`, (err, stdout, stderr) => {
        if (err) {
          console.error("❌ MongoDump Error:", err);
          reject(err);
          return;
        }

        if (stderr) console.warn("⚠️ MongoDump Warning:", stderr);

        console.log("✅ MongoDB dump created:", filePath);
        resolve();
      });
    });

    return filePath;
  } catch (error) {
    console.error("❌ Failed to create MongoDB dump:", error);
    throw error;
  }
};

/* ------------------------------------------------ */
/* Backup Retention */
/* ------------------------------------------------ */

export const cleanupOldBackups = () => {
  try {
    console.log("🧹 Running backup retention cleanup...");

    if (!fs.existsSync(backupDir)) return;

    const files = fs.readdirSync(backupDir);

    const retentionTime =
      Date.now() - BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000;

    files.forEach((file) => {
      const filePath = path.join(backupDir, file);
      const stat = fs.statSync(filePath);

      if (stat.mtime.getTime() < retentionTime) {
        fs.unlinkSync(filePath);
        console.log("🗑 Deleted old backup:", file);
      }
    });

    console.log("✅ Backup retention cleanup complete");
  } catch (error) {
    console.error("❌ Backup cleanup failed:", error);
  }
};

/* ------------------------------------------------ */
/* Get or Create Google Drive Folder */
/* ------------------------------------------------ */

const getOrCreateBackupFolder = async (): Promise<string> => {
  const drive = await getDriveClient();

  console.log("🔍 Checking Google Drive backup folder...");

  const res = await drive.files.list({
    q: `name='${BACKUP_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id,name)",
    spaces: "drive",
  });

  if (res.data.files && res.data.files.length > 0) {
    const folderId = res.data.files[0].id as string;
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

  const folderId = folder.data.id as string;

  console.log("✅ Backup folder created:", folderId);

  return folderId;
};

/* ------------------------------------------------ */
/* Upload with Progress */
/* ------------------------------------------------ */

const uploadFileWithProgress = async (filePath: string) => {
  const drive = await getDriveClient();
  const folderId = await getOrCreateBackupFolder();

  const fileSize = fs.statSync(filePath).size;
  let uploadedBytes = 0;

  const stream = fs.createReadStream(filePath);

  stream.on("data", (chunk) => {
    uploadedBytes += chunk.length;

    const progress = ((uploadedBytes / fileSize) * 100).toFixed(2);

    process.stdout.write(`⬆ Upload Progress: ${progress}%\r`);
  });

  const response = await drive.files.create({
    requestBody: {
      name: path.basename(filePath),
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

export const uploadToDrive = async (filePath: string) => {
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
    } catch (error) {
      console.error(`❌ Upload attempt ${attempt} failed`);

      if (attempt === UPLOAD_RETRY_COUNT) {
        console.error("❌ All upload retries failed");
        throw error;
      }

      console.log("🔄 Retrying upload...");
    }
  }
};

/* ------------------------------------------------ */
/* Full Backup Process */
/* ------------------------------------------------ */

export const backupDatabase = async () => {
  try {
    console.log("\n=================================");
    console.log("🚀 BACKUP PROCESS STARTED");
    console.log("=================================");

    cleanupOldBackups();

    const filePath = await createMongoDump();

    const driveFile = await uploadToDrive(filePath);

    console.log("=================================");
    console.log("🎉 BACKUP COMPLETED SUCCESSFULLY");
    console.log("=================================");

    return {
      success: true,
      file: driveFile,
    };
  } catch (error) {
    console.error("❌ Backup process failed:", error);

    return {
      success: false,
      error,
    };
  }
};

/* ------------------------------------------------ */
/* Automatic Backup on Server Start */
/* ------------------------------------------------ */

export const startAutomaticBackup = async () => {
  try {
    console.log("⚡ Server started → running automatic backup");

    await backupDatabase();
  } catch (error) {
    console.error("❌ Automatic backup failed:", error);
  }
};
