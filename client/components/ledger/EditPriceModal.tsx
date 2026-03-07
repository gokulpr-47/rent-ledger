"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import { RentalItem } from "@/lib/types";

const schema = z.object({
  total: z
    .number({ invalid_type_error: "Total is required" })
    .min(0, "Total must be 0 or more"),
});

type FormData = z.infer<typeof schema>;

// helper to calculate day count used server-side as well
const calcDays = (taken: string, returned?: string | null): number => {
  if (!returned) return 0;
  const diff = new Date(returned).getTime() - new Date(taken).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
};

interface EditPriceModalProps {
  open: boolean;
  item: RentalItem | null;
  onClose: () => void;
  onSubmit: (itemId: string, price: number) => Promise<void>;
  loading?: boolean;
}

export default function EditPriceModal({
  open,
  item,
  onClose,
  onSubmit,
  loading = false,
}: EditPriceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { total: 0 },
  });

  useEffect(() => {
    if (open && item) {
      // show total price; if item not yet returned compute estimated
      const days = calcDays(item.takenTime, item.returnedTime);
      const totalValue =
        item.total || item.pricePerDay * item.quantity * (days || 1);
      reset({ total: totalValue });
    }
  }, [open, item, reset]);

  const handleClose = () => {
    onClose();
  };

  const handleFormSubmit = async (data: FormData) => {
    if (!item) return;
    // convert entered total back to per-day price before sending
    // const days = calcDays(item.takenTime, item.returnedTime) || 1;
    // const perDay = data.total / (item.quantity * days);
    await onSubmit(item._id, data.total);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Edit Total Price — {item?.productName}</DialogTitle>
        <DialogContent>
          <TextField
            label="Total Price"
            type="number"
            {...register("total", { valueAsNumber: true })}
            error={!!errors.total}
            helperText={errors.total?.message}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ mt: 1 }}
            autoFocus
          />
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
            color="primary"
          >
            {loading ? "Saving..." : "Update Price"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
