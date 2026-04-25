"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

const schema = z.object({
  amount: z
    .number({ invalid_type_error: "Amount is required" })
    .positive("Amount must be greater than 0"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface AddPaymentModalProps {
  open: boolean;
  remainingBalance: number;
  onClose: () => void;
  onSubmit: (
    amount: number,
    isAdvance?: boolean,
    notes?: string,
  ) => Promise<void>;
  loading?: boolean;
}

export default function AddPaymentModal({
  open,
  remainingBalance,
  onClose,
  onSubmit,
  loading = false,
}: AddPaymentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0 },
  });

  const [isAdvance, setIsAdvance] = useState(false);
  const currentAmount = Number(watch("amount") || 0);

  const handleClose = () => {
    reset({ amount: 0, notes: "" });
    setIsAdvance(false);
    onClose();
  };

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data.amount, isAdvance, data.notes);
    reset({ amount: 0, notes: "" });
    setIsAdvance(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: "var(--color-primary-light)" }}
            >
              <Typography variant="caption" color="text.secondary">
                Outstanding Balance
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary">
                ₹{remainingBalance.toLocaleString("en-IN")}
              </Typography>
            </div>

            <FormControlLabel
              control={
                <Checkbox
                  checked={isAdvance}
                  onChange={(event) => setIsAdvance(event.target.checked)}
                  size="small"
                />
              }
              label="Advance payment"
            />

            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <Typography variant="caption" color="text.secondary">
                New balance after this payment
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                ₹{(remainingBalance - currentAmount).toLocaleString("en-IN")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Negative value indicates credit to customer
              </Typography>
            </div>

            <TextField
              label="Payment Amount"
              type="number"
              {...register("amount", { valueAsNumber: true })}
              error={!!errors.amount}
              helperText={errors.amount?.message}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">₹</InputAdornment>
                ),
              }}
              inputProps={{ min: 0.01, step: 0.01 }}
              autoFocus
              InputLabelProps={{
                shrink: true,
              }}
            />

            <TextField
              label="Notes (optional)"
              placeholder="Add any payment notes here..."
              {...register("notes")}
              size="small"
              fullWidth
              multiline
              rows={2}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button
            onClick={handleClose}
            disabled={loading}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            color="success"
          >
            {loading ? "Recording..." : "Record Payment"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
