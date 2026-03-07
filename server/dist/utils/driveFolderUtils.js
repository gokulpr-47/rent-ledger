"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const drive = googleapis_1.google.drive({ version: "v3" });
const getFolderIfExists = async (folderName) => {
    const response = await drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
        fields: "files(id, name)",
    });
    return response.data.files?.[0] || null;
};
const createFolder = async (folderName) => {
    const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
    };
    const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: "id",
    });
    return folder.data.id;
};
const ensureBackupFolder = async () => {
    const folderName = "RentLedgerBackups";
    let folder = await getFolderIfExists(folderName);
    if (!folder) {
        console.log("Backup folder not found. Creating...");
        const folderId = await createFolder(folderName);
        console.log("Folder created:", folderId);
        return folderId;
    }
    console.log("Using existing folder:", folder.id);
    return folder.id;
};
exports.default = ensureBackupFolder;
