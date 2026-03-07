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
import { Customer } from '@/lib/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(6, 'Phone number is required'),
  address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CustomerFormModalProps {
  open: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
}

export default function CustomerFormModal({
  open,
  customer,
  onClose,
  onSubmit,
  loading = false,
}: CustomerFormModalProps) {
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', address: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: customer?.name || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
      });
    }
  }, [open, customer, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{isEdit ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              size="small"
              fullWidth
            />
            <TextField
              label="Phone"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              size="small"
              fullWidth
            />
            <TextField
              label="Address (optional)"
              {...register('address')}
              size="small"
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={onClose} disabled={loading} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} variant="contained" color="primary">
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add Customer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
