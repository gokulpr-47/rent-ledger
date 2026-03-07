"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardSummary = void 0;
const dashboard_services_1 = require("../services/dashboard.services");
const getDashboardSummary = async (req, res) => {
    try {
        const summary = await (0, dashboard_services_1.calculateDashboardSummary)();
        res.status(200).json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load dashboard summary",
        });
    }
};
exports.getDashboardSummary = getDashboardSummary;
