import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./config/db";
import { errorHandler } from "./middleware/error.middleware";
import { startAutomaticBackup } from "./services/backup.services";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect to database. Server not started.", err);
    process.exit(1);
  }

  app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);

    await startAutomaticBackup();
  });
};

app.use(errorHandler);

startServer();
