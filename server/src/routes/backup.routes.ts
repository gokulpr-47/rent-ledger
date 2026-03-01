import { Router } from "express";
import { manualBackup } from "../controllers/backup.controller";

const router = Router();

router.post("/manual", manualBackup);

export default router;
