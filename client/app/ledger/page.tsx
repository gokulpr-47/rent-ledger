"use client";

import { useState } from "react";
import useSWR from "swr";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TopBar from "@/components/layout/TopBar";
import OpenRentalPanel from "@/components/ledger/OpenRentalPanel";
import ClosedRentalsHistory from "@/components/ledger/ClosedRentalsHistory";
import { getAllCustomers } from "@/lib/api/customers";
import { getAllProducts } from "@/lib/api/products";
import {
  getCustomerOpenRental,
  getAllCustomerRentals,
} from "@/lib/api/rentals";
import { Customer, CustomerRentalData } from "@/lib/types";
import { BookOpen } from "lucide-react";
import AddItemsModal from "@/components/ledger/AddItemsModal";
import { addItemsToRental } from "@/lib/api/rentals";

export default function LedgerPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  const { data: customers = [], isLoading: customersLoading } = useSWR(
    "all-customers",
    getAllCustomers,
  );

  const { data: products = [] } = useSWR("all-products", getAllProducts);

  const {
    data: openRental,
    isLoading: openLoading,
    mutate: mutateOpen,
  } = useSWR(
    selectedCustomer ? ["open-rental", selectedCustomer._id] : null,
    () => getCustomerOpenRental(selectedCustomer!._id),
    { revalidateOnFocus: true },
  );

  const {
    data: allRentals = [],
    isLoading: historyLoading,
    mutate: mutateHistory,
  } = useSWR(
    selectedCustomer ? ["all-rentals", selectedCustomer._id] : null,
    () => getAllCustomerRentals(selectedCustomer!._id),
    { revalidateOnFocus: true },
  );

  const handleRefresh = () => {
    mutateOpen();
    mutateHistory();
  };

  // state for creating new ledger (adding items when no open rental exists)
  const [addItemsOpen, setAddItemsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const handleAddItemsForNewRental = async (items: any[]) => {
    setActionLoading(true);
    setPageError("");
    try {
      await addItemsToRental({
        customerId: selectedCustomer!._id,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          takenTime: i.takenTime,
          returnedTime: i.returnedTime || null,
          notes: i.notes,
          pricePerDay: i.pricePerDay || undefined,
        })),
      });
      handleRefresh();
      setAddItemsOpen(false);
    } catch (err: any) {
      setPageError(err.response?.data?.message || "Failed to create rental");
    } finally {
      setActionLoading(false);
    }
  };

  const closedRentals: CustomerRentalData[] = allRentals.filter(
    (r) => r.rental.status === "CLOSED",
  );

  const isLoading = openLoading || historyLoading;

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Rent Ledger" />

      <div className="flex-1 p-6">
        <Stack spacing={4}>
          {/* Customer Search */}
          <Autocomplete
            options={customers}
            loading={customersLoading}
            getOptionLabel={(c) => `${c.name} — ${c.phone}`}
            value={selectedCustomer}
            onChange={(_, val) => setSelectedCustomer(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Customer"
                placeholder="Type customer name or phone..."
                size="small"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {customersLoading && <CircularProgress size={16} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            sx={{ maxWidth: 420 }}
            isOptionEqualToValue={(a, b) => a._id === b._id}
          />

          {/* Empty state */}
          {!selectedCustomer && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "var(--color-primary-light)" }}
              >
                <BookOpen size={28} color="var(--color-primary)" />
              </div>
              <Typography variant="h5" fontWeight={600}>
                Select a Customer
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Search and select a customer to view their rental ledger
              </Typography>
            </div>
          )}

          {/* Loading */}
          {selectedCustomer && isLoading && (
            <div className="flex items-center justify-center py-12">
              <CircularProgress />
            </div>
          )}

          {/* Rental Data */}
          {selectedCustomer && !isLoading && (
            <Stack spacing={4}>
              {/* Open Rental Section */}
              {openRental ? (
                <OpenRentalPanel
                  customerId={selectedCustomer._id}
                  data={openRental}
                  products={products}
                  onRefresh={handleRefresh}
                />
              ) : (
                <div
                  className="rounded-xl border-2 border-dashed p-8 text-center"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <Typography color="text.secondary" variant="body2">
                    No open rental for this customer.
                  </Typography>
                  <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{ mt: 0.5 }}
                  >
                    Add items to create a new rental automatically.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => setAddItemsOpen(true)}
                  >
                    Add Items / Start Rental
                  </Button>
                </div>
              )}

              {/* History Section */}
              {closedRentals.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                      Rental History
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1.5 }}
                      >
                        {closedRentals.length} closed rental
                        {closedRentals.length !== 1 ? "s" : ""}
                      </Typography>
                    </Typography>
                    <ClosedRentalsHistory rentals={closedRentals} />
                  </div>
                </>
              )}

              {/* No rental at all */}
              {!openRental && closedRentals.length === 0 && (
                <Alert severity="info">
                  No rental history found for{" "}
                  <strong>{selectedCustomer.name}</strong>.
                </Alert>
              )}
            </Stack>
          )}
        </Stack>
      </div>

      {/* modal for starting a new rental by adding items */}
      <AddItemsModal
        open={addItemsOpen}
        products={products}
        onClose={() => setAddItemsOpen(false)}
        onSubmit={handleAddItemsForNewRental}
        loading={actionLoading}
      />

      {pageError && (
        <Alert
          severity="error"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClose={() => setPageError("")}
        >
          {pageError}
        </Alert>
      )}
    </div>
  );
}
