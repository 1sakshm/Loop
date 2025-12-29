import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';
import { apiService } from '../services/api';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const SummaryCards: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getDashboardSummary();
        if (mounted) setSummary(data);
      } catch (e) {
        setError('Failed to load summary');
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
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2">Total Stores</Typography>
            <Typography variant="h5">{summary?.total_stores ?? 0}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2">Total Orders</Typography>
            <Typography variant="h5">{summary?.total_orders ?? 0}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2">Total Revenue</Typography>
            <Typography variant="h5">{currency.format(summary?.total_revenue ?? 0)}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
