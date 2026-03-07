"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { Plus, CreditCard, X } from "lucide-react";
import { CustomerRentalData, Product } from "@/lib/types";
import RentalItemsTable from "./RentalItemsTable";
import AddItemsModal from "./AddItemsModal";
import AddPaymentModal from "./AddPaymentModal";
import CloseRentalModal from "./CloseRentalModal";
import {
  addItemsToRental,
  updateReturnedTime,
  updateRentalItemPrice,
  closeRental,
} from "@/lib/api/rentals";
import { addPayment } from "@/lib/api/payments";

interface OpenRentalPanelProps {
  customerId: string;
  data: CustomerRentalData;
  products: Product[];
  onRefresh: () => void;
}

export default function OpenRentalPanel({
  customerId,
  data,
  products,
  onRefresh,
}: OpenRentalPanelProps) {
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [closeOpen, setCloseOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const { rental, items, totalPaid, remainingBalance } = data;

  const pendingItems = items.filter((i) => !i.returnedTime);

  const handleAddItems = async (formItems: any[]) => {
    setActionLoading(true);
    setError("");
    try {
      await addItemsToRental({
        customerId,
        items: formItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          takenTime: i.takenTime,
          returnedTime: i.returnedTime || null,
          notes: i.notes,
          pricePerDay: i.pricePerDay || undefined,
        })),
      });
      onRefresh();
      setAddItemsOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add items");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async (amount: number) => {
    setActionLoading(true);
    setError("");
    try {
      await addPayment({ rentalId: rental._id, amount });
      onRefresh();
      setPaymentOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async (discount: number) => {
    setActionLoading(true);
    setError("");
    try {
      await closeRental(rental._id, discount);
      onRefresh();
      setCloseOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to close rental");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async (itemId: string, returnedTime: string) => {
    await updateReturnedTime(itemId, returnedTime);
    onRefresh();
  };

  const handleEditPrice = async (itemId: string, price: number) => {
    await updateRentalItemPrice(itemId, price);
    onRefresh();
  };

  return (
    <>
      <Card
        elevation={0}
        sx={{
          border: "2px solid var(--color-primary)",
          borderRadius: "12px",
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography variant="h5" fontWeight={700}>
                Open Rental
              </Typography>
              <Chip
                label={`${items.length} item${items.length !== 1 ? "s" : ""}`}
                size="small"
                sx={{
                  backgroundColor: "var(--color-primary-light)",
                  color: "var(--color-primary)",
                  fontWeight: 600,
                }}
              />
              {pendingItems.length > 0 && (
                <Chip
                  label={`${pendingItems.length} pending return`}
                  size="small"
                  sx={{
                    backgroundColor: "#FEF3C7",
                    color: "#92400E",
                    fontWeight: 600,
                  }}
                />
              )}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Plus size={14} />}
                onClick={() => setAddItemsOpen(true)}
              >
                Add Items
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CreditCard size={14} />}
                onClick={() => setPaymentOpen(true)}
              >
                Add Payment
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<X size={14} />}
                onClick={() => setCloseOpen(true)}
              >
                Close
              </Button>
            </Stack>
          </div>

          {error && (
            <Alert
              severity="error"
              sx={{ mx: 3, mb: 2 }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          {/* Items Table */}
          <RentalItemsTable
            items={items}
            onReturn={handleReturn}
            onEditPrice={handleEditPrice}
          />

          <Divider />

          {/* Summary */}
          <div className="flex items-center justify-between px-5 py-4">
            <Stack direction="row" spacing={4}>
              <div>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                  ₹{rental.finalAmount.toLocaleString("en-IN")}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  Paid
                </Typography>
                <Typography variant="h6" fontWeight={700} color="success.main">
                  ₹{totalPaid.toLocaleString("en-IN")}
                </Typography>
              </div>
              <div>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 600,
                  }}
                >
                  Balance
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={remainingBalance > 0 ? "error.main" : "success.main"}
                >
                  ₹{remainingBalance.toLocaleString("en-IN")}
                </Typography>
              </div>
              {rental.discount > 0 && (
                <div>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 600,
                    }}
                  >
                    Discount
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="warning.main"
                  >
                    -₹{rental.discount.toLocaleString("en-IN")}
                  </Typography>
                </div>
              )}
            </Stack>

            {data.payments.length > 0 && (
              <Stack spacing={0.5} alignItems="flex-end">
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  Payments ({data.payments.length})
                </Typography>
                {data.payments.map((p) => (
                  <Typography
                    key={p._id}
                    variant="caption"
                    color="text.secondary"
                  >
                    ₹{p.amount.toLocaleString("en-IN")} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString("en-IN")}
                  </Typography>
                ))}
              </Stack>
            )}
          </div>
        </CardContent>
      </Card>

      <AddItemsModal
        open={addItemsOpen}
        products={products}
        onClose={() => setAddItemsOpen(false)}
        onSubmit={handleAddItems}
        loading={actionLoading}
      />
      <AddPaymentModal
        open={paymentOpen}
        remainingBalance={remainingBalance}
        onClose={() => setPaymentOpen(false)}
        onSubmit={handlePayment}
        loading={actionLoading}
      />
      <CloseRentalModal
        open={closeOpen}
        rental={rental}
        pendingItemsCount={pendingItems.length}
        onClose={() => setCloseOpen(false)}
        onConfirm={handleClose}
        loading={actionLoading}
      />
    </>
  );
}
