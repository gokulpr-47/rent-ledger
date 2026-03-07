'use client';

import { ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBg: string;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  iconBg,
  subtitle,
}: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
        transition: 'box-shadow 150ms ease',
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <div>
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mt: 0.5, lineHeight: 1.2 }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </div>
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}
