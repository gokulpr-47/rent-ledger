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
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { OpenRental } from "@/lib/api/dashboard";

interface OpenRentalsModalProps {
  open: boolean;
  onClose: () => void;
  rentals: OpenRental[];
  loading?: boolean;
}

export default function OpenRentalsModal({
  open,
  onClose,
  rentals,
  loading = false,
}: OpenRentalsModalProps) {
  const router = useRouter();

  const handleRentalClick = (customerId: string) => {
    router.push(`/ledger?customerId=${customerId}`);
    onClose();
  };

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
                    Customer Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="center">
                    Items
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }} align="right">
                    Total Amount
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                    align="right"
                  >
                    Outstanding
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                    Rental Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentals.map((rental) => (
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
                      <Typography variant="body2">{rental.itemCount}</Typography>
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
                          "en-IN"
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
                          }
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
