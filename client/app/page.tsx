"use client";

import { Suspense, useState } from "react";
import useSWR from "swr";
import { getDashboardSummary, getOpenRentals } from "@/lib/api/dashboard";
import StatCard from "@/components/dashboard/StatCard";
import OpenRentalsModal from "@/components/dashboard/OpenRentalsModal";
import TopBar from "@/components/layout/TopBar";
import {
  IndianRupee,
  AlertCircle,
  FileText,
  Users,
  ArrowUpDown,
} from "lucide-react";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import {
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/dashboard/SkeletonCards";

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

type SortField = "name" | "amount";
type SortOrder = "asc" | "desc";

type OpenRentalsSortField =
  | "customerName"
  | "itemCount"
  | "totalAmount"
  | "outstandingBalance"
  | "rentalDate";

// Separate component for stat cards
function StatCardsSection({
  onOpenRentalsClick,
}: {
  onOpenRentalsClick: () => void;
}) {
  const { data, error } = useSWR("/", getDashboardSummary, {
    refreshInterval: 30000,
  });

  if (error) {
    return (
      <Alert severity="error" className="mb-4">
        Failed to load dashboard data. Make sure the server is running.
      </Alert>
    );
  }

  if (!data) {
    return null; // Suspense will show skeleton
  }

  return (
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
        onClick={onOpenRentalsClick}
      />
      <StatCard
        title="Customers with Dues"
        value={data.customersWithOutstanding}
        icon={<Users size={20} color="#DC2626" />}
        iconBg="#FEE2E2"
        subtitle="Customers with balance due"
      />
    </div>
  );
}

// Separate component for outstanding credits table
function OutstandingCreditsSection() {
  const [sortField, setSortField] = useState<SortField>("amount");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const { data, error } = useSWR("/", getDashboardSummary, {
    refreshInterval: 30000,
  });

  if (error) {
    return (
      <Alert severity="error" className="mt-8">
        Failed to load credits data. Make sure the server is running.
      </Alert>
    );
  }

  if (!data) {
    return null; // Suspense will show skeleton
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedCredits = data?.runningCredits
    ? [...data.runningCredits].sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        if (sortField === "name") {
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
        } else {
          aValue = a.totalOutstanding;
          bValue = b.totalOutstanding;
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      })
    : [];

  if (!data?.runningCredits || data.runningCredits.length === 0) {
    return (
      <div className="mt-8">
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          <Typography variant="body2">
            🎉 All customers are up to date with their payments!
          </Typography>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle size={20} color="#DC2626" />
          <Typography variant="h6" fontWeight={600}>
            Customers with Outstanding Balances ({data.runningCredits.length})
          </Typography>
        </div>

        <ButtonGroup size="small" variant="outlined">
          <Button
            onClick={() => handleSort("name")}
            startIcon={<ArrowUpDown size={14} />}
            variant={sortField === "name" ? "contained" : "outlined"}
          >
            Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>
          <Button
            onClick={() => handleSort("amount")}
            startIcon={<IndianRupee size={14} />}
            variant={sortField === "amount" ? "contained" : "outlined"}
          >
            Amount {sortField === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
          </Button>
        </ButtonGroup>
      </div>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: "1px solid var(--color-border)",
          borderRadius: 2,
          maxHeight: "60vh",
          overflow: "auto",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                Customer Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                align="right"
              >
                Outstanding Amount
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedCredits.map((credit) => (
              <TableRow key={credit.customerId} hover>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Typography variant="body2" fontWeight={500}>
                      {credit.customerName}
                    </Typography>
                    <Chip
                      label="Outstanding"
                      size="small"
                      sx={{
                        fontSize: "0.65rem",
                        height: 18,
                        backgroundColor: "#FEE2E2",
                        color: "#DC2626",
                      }}
                    />
                  </div>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="error.main"
                  >
                    ₹{credit.totalOutstanding.toLocaleString("en-IN")}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default function DashboardPage() {
  const [openRentalsModalOpen, setOpenRentalsModalOpen] = useState(false);
  const [openRentalsSortField, setOpenRentalsSortField] =
    useState<OpenRentalsSortField>("outstandingBalance");
  const [openRentalsSortOrder, setOpenRentalsSortOrder] =
    useState<SortOrder>("desc");

  const { data: rentalsData, isLoading: rentalsLoading } = useSWR(
    openRentalsModalOpen
      ? ["open-rentals", openRentalsSortField, openRentalsSortOrder]
      : null,
    getOpenRentals,
    { revalidateOnFocus: false },
  );

  const handleOpenRentalsClick = () => {
    setOpenRentalsModalOpen(true);
  };

  const handleOpenRentalsSort = (field: OpenRentalsSortField) => {
    if (openRentalsSortField === field) {
      setOpenRentalsSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOpenRentalsSortField(field);
      setOpenRentalsSortOrder("asc");
    }
  };

  const handleCloseModal = () => {
    setOpenRentalsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" />

      <div className="flex-1 p-6">
        {/* Stat Cards with Suspense */}
        <Suspense fallback={<StatCardsSkeleton />}>
          <StatCardsSection onOpenRentalsClick={handleOpenRentalsClick} />
        </Suspense>

        {/* Outstanding Credits Table with Suspense */}
        <Suspense fallback={<TableSkeleton />}>
          <OutstandingCreditsSection />
        </Suspense>
      </div>

      {/* Open Rentals Modal */}
      <OpenRentalsModal
        open={openRentalsModalOpen}
        onClose={handleCloseModal}
        rentals={rentalsData || []}
        loading={rentalsLoading}
        sortField={openRentalsSortField}
        sortOrder={openRentalsSortOrder}
        onSort={handleOpenRentalsSort}
      />
    </div>
  );
}
