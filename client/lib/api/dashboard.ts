import api from "../axios";
import { DashboardSummary } from "../types";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const res = await api.get("/dashboard/summary");
  return res.data.data;
};
