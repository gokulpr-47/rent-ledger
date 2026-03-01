import { Request, Response } from "express";
import { createMongoDump, uploadToDrive } from "../services/backup.services";

export const manualBackup = async (req: Request, res: Response) => {
  try {
    console.log("Starting backup process...");

    const filePath = await createMongoDump();
    console.log("Dump created at:", filePath);

    const driveFile = await uploadToDrive(filePath);

    res.status(200).json({
      success: true,
      message: "Backup completed successfully",
      driveFile,
    });
  } catch (err) {
    console.error("Backup process failed:", err);

    res.status(500).json({
      success: false,
      message: "Backup failed",
      error: err instanceof Error ? err.message : err,
    });
  }
};
