'use client';

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
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import { Rental } from '@/lib/types';

const schema = z.object({
  discount: z.number({ invalid_type_error: 'Must be a number' }).min(0).optional(),
});

type FormData = z.infer<typeof schema>;

interface CloseRentalModalProps {
  open: boolean;
  rental: Rental | null;
  pendingItemsCount?: number;
  onClose: () => void;
  onConfirm: (discount: number) => Promise<void>;
  loading?: boolean;
}

export default function CloseRentalModal({
  open,
  rental,
  pendingItemsCount = 0,
  onClose,
  onConfirm,
  loading = false,
}: CloseRentalModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { discount: 0 },
  });

  const handleClose = () => {
    reset({ discount: 0 });
    onClose();
  };

  const handleFormSubmit = async (data: FormData) => {
    await onConfirm(data.discount || 0);
    reset({ discount: 0 });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Close Rental</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {pendingItemsCount > 0 && (
              <Alert severity="warning">
                {pendingItemsCount} item{pendingItemsCount > 1 ? 's' : ''} have not been returned. Please mark all items as returned before closing.
              </Alert>
            )}
            {rental && pendingItemsCount === 0 && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F1F5F9' }}>
                <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                <Typography variant="h5" fontWeight={700}>
                  ₹{rental.finalAmount.toLocaleString('en-IN')}
                </Typography>
              </div>
            )}
            <TextField
              label="Discount (optional)"
              type="number"
              {...register('discount', { valueAsNumber: true })}
              error={!!errors.discount}
              helperText={errors.discount?.message}
              size="small"
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
              disabled={pendingItemsCount > 0}
            />
          </Stack>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={handleClose} disabled={loading} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || pendingItemsCount > 0}
            variant="contained"
            color="primary"
          >
            {loading ? 'Closing...' : 'Close Rental'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
