"use client";

import { useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import { Plus, Trash2 } from "lucide-react";
import { Product } from "@/lib/types";

const itemSchema = z.object({
  productId: z.string().min(1, "Select a product"),
  quantity: z.number({ invalid_type_error: "Required" }).min(1, "Min 1"),
  takenTime: z.string().min(1, "Required"),
  returnedTime: z.string().optional(),
  pricePerDay: z.number().optional(),
  notes: z.string().optional(),
});

const schema = z.object({
  items: z.array(itemSchema).min(1),
});

type FormData = z.infer<typeof schema>;

interface AddItemsModalProps {
  open: boolean;
  products: Product[];
  onClose: () => void;
  onSubmit: (items: FormData["items"]) => Promise<void>;
  loading?: boolean;
}

const defaultItem = () => ({
  productId: "",
  quantity: 1,
  takenTime: new Date().toISOString().slice(0, 16),
  returnedTime: "",
  pricePerDay: undefined as number | undefined,
  notes: "",
});

export default function AddItemsModal({
  open,
  products,
  onClose,
  onSubmit,
  loading = false,
}: AddItemsModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { items: [defaultItem()] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  // refs to product input elements so we can manage focus when adding new rows
  const productInputs = useRef<Array<HTMLInputElement | null>>([]);

  const handleAppend = () => {
    append(defaultItem());
    // focus the newly added product field after DOM updates
    setTimeout(() => {
      const idx = productInputs.current.length - 1;
      const el = productInputs.current[idx];
      el?.focus();
    }, 0);
  };

  const handleClose = () => {
    reset({ items: [defaultItem()] });
    onClose();
  };

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit(data.items);
    reset({ items: [defaultItem()] });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Add Rental Items</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {fields.map((field, idx) => (
              <div key={field.id}>
                {idx > 0 && <Divider sx={{ mb: 2 }} />}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 1.5 }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Item {idx + 1}
                  </Typography>
                  {fields.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => remove(idx)}
                      color="error"
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  )}
                </Stack>

                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    name={`items.${idx}.productId`}
                    control={control}
                    defaultValue=""
                    rules={{ required: "Select a product" }}
                    render={({ field }) => (
                      <Autocomplete
                        options={products}
                        getOptionLabel={(p) =>
                          `${p.name} — ₹${p.pricePerDay}/day`
                        }
                        onChange={(_, value) => {
                          field.onChange(value?._id ?? "");
                          // when product chosen, initialize price override to product price
                          if (value) {
                            setValue(
                              `items.${idx}.pricePerDay`,
                              value.pricePerDay,
                            );
                          }
                        }}
                        value={
                          products.find((p) => p._id === field.value) || null
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Product"
                            size="small"
                            error={!!errors.items?.[idx]?.productId}
                            helperText={errors.items?.[idx]?.productId?.message}
                            inputRef={(el) => (productInputs.current[idx] = el)}
                          />
                        )}
                        fullWidth
                        // allow typing to filter
                        freeSolo={false}
                        disableClearable={false}
                        sx={{ maxWidth: "100%" }}
                      />
                    )}
                  />

                  <TextField
                    label="Quantity"
                    type="number"
                    size="small"
                    {...register(`items.${idx}.quantity`, {
                      valueAsNumber: true,
                    })}
                    error={!!errors.items?.[idx]?.quantity}
                    helperText={errors.items?.[idx]?.quantity?.message}
                    inputProps={{ min: 1 }}
                    fullWidth
                  />

                  <TextField
                    label="Taken Date & Time"
                    type="datetime-local"
                    size="small"
                    {...register(`items.${idx}.takenTime`)}
                    error={!!errors.items?.[idx]?.takenTime}
                    helperText={errors.items?.[idx]?.takenTime?.message}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <TextField
                    label="Returned Date & Time (optional)"
                    type="datetime-local"
                    size="small"
                    {...register(`items.${idx}.returnedTime`)}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />

                  <TextField
                    label="Price Override / Day (optional)"
                    type="number"
                    size="small"
                    {...register(`items.${idx}.pricePerDay`, {
                      valueAsNumber: true,
                    })}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                    fullWidth
                  />

                  <TextField
                    label="Notes (optional)"
                    size="small"
                    {...register(`items.${idx}.notes`)}
                    fullWidth
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outlined"
              startIcon={<Plus size={15} />}
              onClick={handleAppend}
              size="small"
              sx={{ alignSelf: "flex-start" }}
            >
              Add Another Item
            </Button>
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
            color="primary"
          >
            {loading
              ? "Adding..."
              : `Add ${fields.length} Item${fields.length > 1 ? "s" : ""}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
