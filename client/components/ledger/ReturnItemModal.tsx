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
import { RentalItem } from '@/lib/types';

const schema = z.object({
  returnedTime: z.string().min(1, 'Return date/time is required'),
});

type FormData = z.infer<typeof schema>;

interface ReturnItemModalProps {
  open: boolean;
  item: RentalItem | null;
  onClose: () => void;
  onSubmit: (itemId: string, returnedTime: string) => Promise<void>;
  loading?: boolean;
}

export default function ReturnItemModal({
  open,
  item,
  onClose,
  onSubmit,
  loading = false,
}: ReturnItemModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { returnedTime: new Date().toISOString().slice(0, 16) },
  });

  const handleClose = () => {
    reset({ returnedTime: new Date().toISOString().slice(0, 16) });
    onClose();
  };

  const handleFormSubmit = async (data: FormData) => {
    if (!item) return;
    await onSubmit(item._id, data.returnedTime);
    reset({ returnedTime: new Date().toISOString().slice(0, 16) });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>Mark Item Returned</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {item && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#F1F5F9' }}>
                <Typography variant="body2" fontWeight={600}>{item.productName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Qty: {item.quantity} · ₹{item.pricePerDay}/day
                </Typography>
              </div>
            )}
            <TextField
              label="Return Date & Time"
              type="datetime-local"
              {...register('returnedTime')}
              error={!!errors.returnedTime}
              helperText={errors.returnedTime?.message}
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={handleClose} disabled={loading} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} variant="contained" color="success">
            {loading ? 'Saving...' : 'Mark Returned'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
