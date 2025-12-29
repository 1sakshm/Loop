import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Skeleton } from '@mui/material';
import { StoreMetrics } from '../types';

interface MetricsCardsProps {
  metrics: StoreMetrics | null;
  loading: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ metrics, loading }) => {
  const cards = [
    {
      title: 'Success Rate',
      value: metrics?.success_rate ? `${metrics.success_rate.toFixed(1)}%` : '0%',
      color: metrics?.success_rate && metrics.success_rate > 80 ? '#4caf50' : '#ff9800'
    },
    {
      title: 'Orders (24h)',
      value: metrics?.total_orders_24h || 0,
      color: '#2196f3'
    },
    {
      title: 'Avg Processing',
      value: metrics?.avg_processing_time_minutes 
        ? `${metrics.avg_processing_time_minutes.toFixed(0)} min` 
        : '0 min',
      color: '#9c27b0'
    },
    {
      title: 'Revenue (24h)',
      value: metrics?.total_revenue_24h 
        ? `$${metrics.total_revenue_24h.toFixed(2)}` 
        : '$0',
      color: '#4caf50'
    }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="80%" height={40} />
                </>
              ) : (
                <>
                  <Typography color="textSecondary" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    component="h2"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};