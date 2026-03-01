'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { usePayment } from '@/lib/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const paymentSchema = z.object({
  rentalId: z.string().min(1, 'Rental ID is required'),
  amount: z.coerce.number().min(0, 'Amount must be positive'),
  method: z.enum(['credit_card', 'debit_card', 'cash', 'bank_transfer']).default('credit_card'),
  status: z.enum(['pending', 'completed', 'failed']).default('pending'),
  transactionId: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingId: string | null
  onSuccess: () => void
}

export function PaymentDialog({
  open,
  onOpenChange,
  editingId,
  onSuccess,
}: PaymentDialogProps) {
  const { payment } = usePayment(editingId || '')
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    values: payment ? {
      rentalId: payment.rentalId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transactionId: payment.transactionId || '',
    } : undefined,
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async (data: PaymentFormData) => {
    setIsLoading(true)
    try {
      if (editingId) {
        await apiClient.updatePayment(editingId, data)
      } else {
        await apiClient.createPayment(data)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving payment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingId ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Rental ID</label>
            <Input {...register('rentalId')} placeholder="Rental ID" />
            {errors.rentalId && <p className="text-destructive text-sm mt-1">{errors.rentalId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input {...register('amount')} placeholder="0.00" type="number" step="0.01" />
              {errors.amount && <p className="text-destructive text-sm mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Method</label>
              <select
                {...register('method')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                {...register('status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Transaction ID</label>
              <Input {...register('transactionId')} placeholder="TXN-000000" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
