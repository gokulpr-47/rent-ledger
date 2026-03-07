'use client';

import { ReactNode } from 'react';
import Typography from '@mui/material/Typography';

interface TopBarProps {
  title: string;
  actions?: ReactNode;
}

export default function TopBar({ title, actions }: TopBarProps) {
  return (
    <header
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
