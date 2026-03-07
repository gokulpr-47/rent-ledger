'use client';

import Chip from '@mui/material/Chip';

interface StatusBadgeProps {
  status: 'OPEN' | 'CLOSED';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.7rem',
        letterSpacing: '0.05em',
        backgroundColor: status === 'OPEN' ? '#FEF3C7' : '#DCFCE7',
        color: status === 'OPEN' ? '#92400E' : '#166534',
        border: `1px solid ${status === 'OPEN' ? '#FCD34D' : '#86EFAC'}`,
      }}
    />
  );
}
