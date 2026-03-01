'use client'

import { useState } from 'react'
import { useRentals } from '@/lib/hooks'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { RentalDialog } from '@/components/rentals/rental-dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Trash2, Edit2 } from 'lucide-react'

export default function RentalsPage() {
  const { rentals, isLoading, mutate } = useRentals()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rental?')) {
      await apiClient.deleteRental(id)
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
          <h1 className="text-3xl font-bold text-foreground">Rentals</h1>
          <p className="text-muted-foreground">Manage your rental contracts</p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null)
            setIsDialogOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Rental
        </Button>
      </div>

      <RentalDialog
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
              <TableHead>Customer ID</TableHead>
              <TableHead>Product ID</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rentals?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No rentals yet. Create one to get started!
                </TableCell>
              </TableRow>
            ) : (
              rentals?.map(rental => (
                <TableRow key={rental._id}>
                  <TableCell className="font-medium">{rental.customerId}</TableCell>
                  <TableCell>{rental.productId}</TableCell>
                  <TableCell>{formatDate(rental.startDate)}</TableCell>
                  <TableCell>{formatDate(rental.endDate)}</TableCell>
                  <TableCell>{formatCurrency(rental.totalPrice)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      rental.status === 'active'
                        ? 'bg-accent/20 text-accent'
                        : rental.status === 'completed'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {rental.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingId(rental._id)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rental._id)}
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
