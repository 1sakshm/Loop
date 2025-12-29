import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, Alert } from '@mui/material';
import { StoreSelector } from './components/StoreSelector';
import { MetricsCards } from './components/MetricsCards';
import { HealthIndicator } from './components/HealthIndicator';
import { OrdersFeed } from './components/OrdersFeed';
import { AnomalyAlerts } from './components/AnomalyAlerts';
import { SummaryCards } from './components/SummaryCards';
import { StoreList } from './components/StoreList';
import { OrdersTable } from './components/OrdersTable';
import { apiService } from './services/api';
import { Store, StoreMetrics, HealthScore } from './types';
import './App.css';

function App() {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [metrics, setMetrics] = useState<StoreMetrics | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics when store is selected
  useEffect(() => {
    if (selectedStore) {
      fetchStoreData(selectedStore.id);
      // Set up interval to refresh data every 30 seconds
      const interval = setInterval(() => {
        fetchStoreData(selectedStore.id);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [selectedStore]);

  const fetchStoreData = async (storeId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const metricsData = await apiService.getStoreMetrics(storeId);
      const healthData = await apiService.getHealthScore(storeId);
      setMetrics(metricsData);
      setHealthScore(healthData);
    } catch (err) {
      setError('Failed to fetch store data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Restaurant Dashboard
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Summary */}
          <Grid item xs={12}>
            <SummaryCards />
          </Grid>

          {/* Store List */}
          <Grid item xs={12}>
            <StoreList onSelect={setSelectedStore} selectedId={selectedStore?.id ?? null} />
          </Grid>
          {/* Store Selector */}
          <Grid item xs={12}>
            <StoreSelector 
              onStoreSelect={setSelectedStore}
              selectedStore={selectedStore}
            />
          </Grid>

          {/* Health Score */}
          {selectedStore && (
            <Grid item xs={12} md={4}>
              <HealthIndicator 
                storeId={selectedStore.id}
                healthScore={healthScore}
                loading={loading}
              />
            </Grid>
          )}

          {/* Metrics Cards */}
          {selectedStore && (
            <Grid item xs={12} md={8}>
              <MetricsCards 
                metrics={metrics}
                loading={loading}
              />
            </Grid>
          )}

          {/* Anomaly Alerts */}
          {selectedStore && (
            <Grid item xs={12} md={6}>
              <AnomalyAlerts 
                storeId={selectedStore.id}
              />
            </Grid>
          )}

          {/* Orders Table (replaces OrdersFeed) */}
          {selectedStore && (
            <Grid item xs={12} md={6}>
              <OrdersTable storeId={selectedStore.id} />
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
}

export default App;