import { Router } from "express";
import {
  connectGoogle,
  googleCallback,
  googleStatus,
  googleDisconnect,
} from "../controllers/google.controller";

const router = Router();

router.get("/connect", connectGoogle);
router.get("/callback", googleCallback);
router.get("/status", googleStatus);
router.post("/disconnect", googleDisconnect);

export default router;
