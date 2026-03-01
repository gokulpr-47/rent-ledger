import { google } from "googleapis";

const drive = google.drive({ version: "v3" });

const getFolderIfExists = async (folderName: string) => {
  const response = await drive.files.list({
    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
    fields: "files(id, name)",
  });

  return response.data.files?.[0] || null;
};

const createFolder = async (folderName: string) => {
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id",
  });

  return folder.data.id!;
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
  return folder.id!;
};

export default ensureBackupFolder;
