'use client';

import React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Box key={i} sx={{ p: 2, backgroundColor: '#fff', borderRadius: 2, boxShadow: 1 }}>
          <Skeleton width="60%" height={20} sx={{ mb: 1 }} />
          <Skeleton width="100%" height={32} sx={{ mb: 1 }} />
          <Skeleton width="80%" height={16} />
        </Box>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
            <TableCell><Skeleton width="80px" /></TableCell>
            <TableCell><Skeleton width="100px" /></TableCell>
            <TableCell align="right"><Skeleton width="80px" /></TableCell>
            <TableCell align="center"><Skeleton width="60px" /></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(8)].map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton width="100%" /></TableCell>
              <TableCell><Skeleton width="100%" /></TableCell>
              <TableCell align="right"><Skeleton width="100%" /></TableCell>
              <TableCell align="center"><Skeleton width="100%" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
