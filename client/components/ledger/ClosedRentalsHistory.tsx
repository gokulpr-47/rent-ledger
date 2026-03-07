'use client';

import { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { ChevronDown } from 'lucide-react';
import { CustomerRentalData } from '@/lib/types';
import RentalItemsTable from './RentalItemsTable';
import { format } from 'date-fns';

interface ClosedRentalsHistoryProps {
  rentals: CustomerRentalData[];
}

export default function ClosedRentalsHistory({ rentals }: ClosedRentalsHistoryProps) {
  const [expanded, setExpanded] = useState<string | false>(false);

  if (rentals.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Typography color="text.secondary" variant="body2">
          No closed rentals found for this customer
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rentals.map(({ rental, items, payments, totalPaid, remainingBalance }) => {
        const isOpen = expanded === rental._id;
        return (
          <Accordion
            key={rental._id}
            expanded={isOpen}
            onChange={(_, exp) => setExpanded(exp ? rental._id : false)}
            elevation={0}
            sx={{
              border: '1px solid var(--color-border)',
              borderRadius: '10px !important',
              '&:before': { display: 'none' },
              '&.Mui-expanded': { margin: 0 },
            }}
          >
            <AccordionSummary
              expandIcon={<ChevronDown size={16} />}
              sx={{ px: 3, py: 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 2 }}>
                <div>
                  <Typography variant="body2" fontWeight={600}>
                    {format(new Date(rental.createdAt), 'dd MMM yyyy')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </Typography>
                </div>

                <Chip
                  label="CLOSED"
                  size="small"
                  sx={{ fontSize: '0.65rem', backgroundColor: '#DCFCE7', color: '#166534', fontWeight: 700 }}
                />

                <Stack direction="row" spacing={3} sx={{ ml: 'auto' }}>
                  <div>
                    <Typography variant="caption" color="text.secondary">Total</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      ₹{rental.finalAmount.toLocaleString('en-IN')}
                    </Typography>
                  </div>
                  {rental.discount > 0 && (
                    <div>
                      <Typography variant="caption" color="text.secondary">Discount</Typography>
                      <Typography variant="body2" fontWeight={600} color="warning.main">
                        -₹{rental.discount.toLocaleString('en-IN')}
                      </Typography>
                    </div>
                  )}
                  <div>
                    <Typography variant="caption" color="text.secondary">Paid</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      ₹{totalPaid.toLocaleString('en-IN')}
                    </Typography>
                  </div>
                  {remainingBalance !== 0 && (
                    <div>
                      <Typography variant="caption" color="text.secondary">Balance</Typography>
                      <Typography variant="body2" fontWeight={700} color="error.main">
                        ₹{remainingBalance.toLocaleString('en-IN')}
                      </Typography>
                    </div>
                  )}
                </Stack>
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
              <Divider />
              <div className="mt-2">
                <RentalItemsTable items={items} readOnly />
              </div>
              {payments.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <div className="px-4">
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Payment History
                    </Typography>
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      {payments.map((p) => (
                        <Stack key={p._id} direction="row" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            {format(new Date(p.createdAt), 'dd MMM yyyy')}
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            ₹{p.amount.toLocaleString('en-IN')}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </div>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
}
