'use client'

import { useState } from 'react'
import { usePayments } from '@/lib/hooks'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { PaymentDialog } from '@/components/payments/payment-dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function PaymentsPage() {
  const { payments, isLoading, mutate } = usePayments()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      await apiClient.deletePayment(id)
      mutate()
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">Manage your rental payments</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null)
            setIsDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Payment
        </Button>
      </div>

      <PaymentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingId={editingId}
        onSuccess={() => {
          setIsDialogOpen(false)
          setEditingId(null)
          mutate()
        }}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rental ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No payments yet. Create one to get started!
                </TableCell>
              </TableRow>
            ) : (
              payments?.map(payment => (
                <TableRow key={payment._id}>
                  <TableCell className="font-medium">{payment.rentalId}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{payment.method.replace('_', ' ').toUpperCase()}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'completed'
                        ? 'bg-primary/20 text-primary'
                        : payment.status === 'pending'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {payment.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{payment.transactionId || '-'}</TableCell>
                  <TableCell>{formatDate(payment.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(payment._id)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(payment._id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
