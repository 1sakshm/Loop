import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, CircularProgress, Alert, Typography } from '@mui/material';
import { apiService } from '../services/api';
import { Order } from '../types';

interface Props {
  storeId: string;
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const OrdersTable: React.FC<Props> = ({ storeId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getDashboardStore(storeId);
        if (mounted) setOrders(data.orders || []);
      } catch (e) {
        setError('Failed to load orders');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [storeId]);

  const statusColor = (status: string) => {
    if (status === 'completed') return 'success';
    if (status === 'failed') return 'error';
    if (status === 'cancelled') return 'warning';
    return 'default';
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!orders.length) return <Typography>No orders available</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Items</TableCell>
            <TableCell>Processing (s)</TableCell>
            <TableCell>Created</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(o => (
            <TableRow key={o.id}>
              <TableCell>{o.id}</TableCell>
              <TableCell><Chip label={o.status} color={statusColor(o.status)} size="small" /></TableCell>
              <TableCell>{currency.format(o.total_amount)}</TableCell>
              <TableCell>{o.items_count}</TableCell>
              <TableCell>{o.processing_time_seconds ?? '-'}</TableCell>
              <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
