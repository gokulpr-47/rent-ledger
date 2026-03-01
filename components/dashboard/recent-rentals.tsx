import { Rental } from '@/lib/types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'

interface RecentRentalsProps {
  rentals: Rental[]
}

export function RecentRentals({ rentals }: RecentRentalsProps) {
  if (!rentals || rentals.length === 0) {
    return (
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Rentals</h3>
        <p className="text-muted-foreground text-center py-8">No rentals yet</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h3 className="font-semibold text-lg mb-4">Recent Rentals</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Total Price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentals.map(rental => (
            <TableRow key={rental._id}>
              <TableCell>{rental.customerId}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
