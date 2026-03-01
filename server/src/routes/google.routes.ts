import { Router } from "express";
import {
  connectGoogle,
  googleCallback,
} from "../controllers/google.controller";

const router = Router();

router.get("/connect", connectGoogle);
router.get("/callback", googleCallback);

export default router;
