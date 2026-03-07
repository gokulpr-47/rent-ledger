'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';
import { Product } from '@/lib/types';

const schema = z.object({
  name: z.string().min(1, 'Product name is required'),
  pricePerDay: z
    .number({ invalid_type_error: 'Price must be a number' })
    .min(0, 'Price must be 0 or more'),
});

type FormData = z.infer<typeof schema>;

interface ProductFormModalProps {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function ProductFormModal({
  open,
  product,
  onClose,
  onSubmit,
  loading = false,
}: ProductFormModalProps) {
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', pricePerDay: 0 },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: product?.name || '',
        pricePerDay: product?.pricePerDay || 0,
      });
    }
  }, [open, product, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Product Name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              size="small"
              fullWidth
            />
            <TextField
              label="Price Per Day"
              type="number"
              {...register('pricePerDay', { valueAsNumber: true })}
              error={!!errors.pricePerDay}
              helperText={errors.pricePerDay?.message}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={onClose} disabled={loading} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} variant="contained" color="primary">
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
