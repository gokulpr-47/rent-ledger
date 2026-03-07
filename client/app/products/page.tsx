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
import ProductTable from '@/components/products/ProductTable';
import ProductFormModal from '@/components/products/ProductFormModal';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api/products';
import { Product } from '@/lib/types';
import { useDebounce } from '@/lib/hooks/useDebounce';

export default function ProductsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { data, isLoading, mutate } = useSWR(
    ['products', page + 1, rowsPerPage, debouncedSearch],
    () => getProducts({ page: page + 1, limit: rowsPerPage, search: debouncedSearch })
  );

  const handleOpenAdd = () => {
    setEditProduct(null);
    setModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditProduct(null);
    setError('');
  };

  const handleSubmit = async (formData: { name: string; pricePerDay: number }) => {
    setSubmitting(true);
    setError('');
    try {
      if (editProduct) {
        await updateProduct(editProduct._id, formData);
      } else {
        await createProduct(formData);
      }
      await mutate();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = useCallback(async (product: Product) => {
    await deleteProduct(product._id);
    await mutate();
  }, [mutate]);

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Products"
        actions={
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={handleOpenAdd}
            size="small"
          >
            Add Product
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            size="small"
            placeholder="Search products..."
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

          <ProductTable
            products={data?.data || []}
            total={data?.pagination?.total || 0}
            page={page}
            rowsPerPage={rowsPerPage}
            loading={isLoading}
            onPageChange={setPage}
            onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setPage(0); }}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Stack>
      </div>

      <ProductFormModal
        open={modalOpen}
        product={editProduct}
        onClose={handleClose}
        onSubmit={handleSubmit}
        loading={submitting}
      />
    </div>
  );
}
