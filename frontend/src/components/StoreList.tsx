import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert } from '@mui/material';
import { Store } from '../types';
import { apiService } from '../services/api';

interface Props {
  onSelect?: (store: Store) => void;
  selectedId?: string | null;
}

export const StoreList: React.FC<Props> = ({ onSelect, selectedId }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const s = await apiService.getStores();
        if (mounted) setStores(s);
      } catch (e) {
        setError('Failed to load stores');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Platform</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>City</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stores.map(s => (
            <TableRow key={s.id} hover selected={selectedId === s.id} onClick={() => onSelect && onSelect(s)} style={{ cursor: 'pointer' }}>
              <TableCell>{s.name}</TableCell>
              <TableCell>{s.platform}</TableCell>
              <TableCell>{s.status}</TableCell>
              <TableCell>{s.location?.city}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
