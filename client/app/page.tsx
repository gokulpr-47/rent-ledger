"use client";

import useSWR from "swr";
import { getDashboardSummary } from "@/lib/api/dashboard";
import StatCard from "@/components/dashboard/StatCard";
import TopBar from "@/components/layout/TopBar";
import { IndianRupee, AlertCircle, FileText, Users } from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR(
    "dashboard/summary",
    getDashboardSummary,
    {
      refreshInterval: 30000,
    },
  );

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" />

      <div className="flex-1 p-6">
        {isLoading && (
          <div className="flex items-center justify-center h-48">
            <CircularProgress />
          </div>
        )}

        {error && (
          <Alert severity="error" className="mb-4">
            Failed to load dashboard data. Make sure the server is running.
          </Alert>
        )}

        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Today's Revenue"
              value={formatCurrency(data.todaysRevenue)}
              icon={<IndianRupee size={20} color="#16A34A" />}
              iconBg="#DCFCE7"
              subtitle="Payments collected today"
            />
            <StatCard
              title="Total Outstanding"
              value={formatCurrency(data.totalOutstanding)}
              icon={<AlertCircle size={20} color="#D97706" />}
              iconBg="#FEF3C7"
              subtitle="Across all open rentals"
            />
            <StatCard
              title="Open Rentals"
              value={data.openRentalsCount}
              icon={<FileText size={20} color="#1E40AF" />}
              iconBg="#DBEAFE"
              subtitle="Currently active rentals"
            />
            <StatCard
              title="Customers with Dues"
              value={data.customersWithOutstanding}
              icon={<Users size={20} color="#DC2626" />}
              iconBg="#FEE2E2"
              subtitle="Customers with balance due"
            />
          </div>
        )}

        {!isLoading && !error && !data && (
          <div className="flex items-center justify-center h-48">
            <p className="text-slate-400 text-sm">No data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
