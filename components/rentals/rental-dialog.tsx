'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { apiClient } from '@/lib/api-client'
import { useRental } from '@/lib/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const rentalSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalPrice: z.coerce.number().min(0, 'Price must be positive'),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
})

type RentalFormData = z.infer<typeof rentalSchema>

interface RentalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingId: string | null
  onSuccess: () => void
}

export function RentalDialog({
  open,
  onOpenChange,
  editingId,
  onSuccess,
}: RentalDialogProps) {
  const { rental } = useRental(editingId || '')
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RentalFormData>({
    resolver: zodResolver(rentalSchema),
    values: rental ? {
      customerId: rental.customerId,
      productId: rental.productId,
      startDate: rental.startDate.split('T')[0],
      endDate: rental.endDate.split('T')[0],
      totalPrice: rental.totalPrice,
      status: rental.status,
    } : undefined,
  })

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = async (data: RentalFormData) => {
    setIsLoading(true)
    try {
      if (editingId) {
        await apiClient.updateRental(editingId, data)
      } else {
        await apiClient.createRental(data)
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving rental:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingId ? 'Edit Rental' : 'Add Rental'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer ID</label>
            <Input {...register('customerId')} placeholder="Customer ID" />
            {errors.customerId && <p className="text-destructive text-sm mt-1">{errors.customerId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Product ID</label>
            <Input {...register('productId')} placeholder="Product ID" />
            {errors.productId && <p className="text-destructive text-sm mt-1">{errors.productId.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input {...register('startDate')} type="date" />
              {errors.startDate && <p className="text-destructive text-sm mt-1">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input {...register('endDate')} type="date" />
              {errors.endDate && <p className="text-destructive text-sm mt-1">{errors.endDate.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Price</label>
              <Input {...register('totalPrice')} placeholder="0.00" type="number" step="0.01" />
              {errors.totalPrice && <p className="text-destructive text-sm mt-1">{errors.totalPrice.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                {...register('status')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
