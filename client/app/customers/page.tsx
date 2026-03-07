'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Plus, Search } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import CustomerTable from '@/components/customers/CustomerTable';
import CustomerFormModal from '@/components/customers/CustomerFormModal';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/lib/api/customers';
import { Customer } from '@/lib/types';
import { useDebounce } from '@/lib/hooks/useDebounce';

export default function CustomersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading, mutate } = useSWR(
    ['customers', page + 1, rowsPerPage, debouncedSearch],
    () => getCustomers({ page: page + 1, limit: rowsPerPage, search: debouncedSearch })
  );

  const handleOpenAdd = () => {
    setEditCustomer(null);
    setModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditCustomer(null);
    setError('');
  };

  const handleSubmit = async (formData: { name: string; phone: string; address?: string }) => {
    setSubmitting(true);
    setError('');
    try {
      if (editCustomer) {
        await updateCustomer(editCustomer._id, formData);
      } else {
        await createCustomer(formData);
      }
      await mutate();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (customer: Customer) => {
    await deleteCustomer(customer._id);
    await mutate();
  }, [mutate]);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handleRowsChange = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Customers"
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={handleOpenAdd}
            size="small"
          >
            Add Customer
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            size="small"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} color="#64748B" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 320 }}
          />

          <CustomerTable
            customers={data?.data || []}
            total={data?.pagination?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            loading={isLoading}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsChange}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Stack>
      </div>

      <CustomerFormModal
        open={modalOpen}
        customer={editCustomer}
        onClose={handleClose}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}
