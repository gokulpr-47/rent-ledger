"use client";

import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { OpenRental } from "@/lib/api/dashboard";

type OpenRentalsSortField =
  | "customerName"
  | "itemCount"
  | "totalAmount"
  | "outstandingBalance"
  | "rentalDate";

type SortOrder = "asc" | "desc";

interface OpenRentalsModalProps {
  open: boolean;
  onClose: () => void;
  rentals: OpenRental[];
  loading?: boolean;
  sortField: OpenRentalsSortField;
  sortOrder: SortOrder;
  onSort: (field: OpenRentalsSortField) => void;
}

export default function OpenRentalsModal({
  open,
  onClose,
  rentals,
  loading = false,
  sortField,
  sortOrder,
  onSort,
}: OpenRentalsModalProps) {
  const router = useRouter();

  const handleRentalClick = (customerId: string) => {
    router.push(`/ledger?customerId=${customerId}`);
    onClose();
  };

  const sortedRentals = [...rentals].sort((a, b) => {
    let aValue: string | number | Date = a[sortField];
    let bValue: string | number | Date = b[sortField];

    if (sortField === "customerName") {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }

    if (sortField === "rentalDate") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Open Rentals ({rentals.length})</DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 300,
            }}
          >
            <CircularProgress />
          </Box>
        ) : rentals.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              No open rentals found
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    <TableSortLabel
                      active={sortField === "customerName"}
                      direction={
                        sortField === "customerName" ? sortOrder : "asc"
                      }
                      onClick={() => onSort("customerName")}
                    >
                      Customer Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                    align="center"
                  >
                    <TableSortLabel
                      active={sortField === "itemCount"}
                      direction={sortField === "itemCount" ? sortOrder : "asc"}
                      onClick={() => onSort("itemCount")}
                    >
                      Items
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                    align="right"
                  >
                    <TableSortLabel
                      active={sortField === "totalAmount"}
                      direction={
                        sortField === "totalAmount" ? sortOrder : "asc"
                      }
                      onClick={() => onSort("totalAmount")}
                    >
                      Total Amount
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                    align="right"
                    sortDirection={
                      sortField === "outstandingBalance" ? sortOrder : false
                    }
                  >
                    <TableSortLabel
                      active={sortField === "outstandingBalance"}
                      direction={
                        sortField === "outstandingBalance" ? sortOrder : "desc"
                      }
                      onClick={() => onSort("outstandingBalance")}
                    >
                      Outstanding
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    <TableSortLabel
                      active={sortField === "rentalDate"}
                      direction={sortField === "rentalDate" ? sortOrder : "asc"}
                      onClick={() => onSort("rentalDate")}
                    >
                      Rental Date
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedRentals.map((rental) => (
                  <TableRow
                    key={rental.rentalId}
                    hover
                    onClick={() => handleRentalClick(rental.customerId)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {rental.customerName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {rental.itemCount}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        ₹{rental.totalAmount.toLocaleString("en-IN")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={
                          rental.outstandingBalance > 0
                            ? "error.main"
                            : "success.main"
                        }
                      >
                        ₹
                        {Math.abs(rental.outstandingBalance).toLocaleString(
                          "en-IN",
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(rental.rentalDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
