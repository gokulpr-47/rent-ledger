"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const backup_controller_1 = require("../controllers/backup.controller");
const router = (0, express_1.Router)();
router.post("/manual", backup_controller_1.manualBackup);
exports.default = router;
