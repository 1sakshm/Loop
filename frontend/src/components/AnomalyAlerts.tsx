import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Alert,
  AlertTitle,
  Box,
  Chip
} from '@mui/material';
import { Anomaly } from '../types';
import { apiService } from '../services/api';

interface AnomalyAlertsProps {
  storeId: string;
}

export const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({ storeId }) => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
    // Refresh anomalies every 30 seconds
    const interval = setInterval(fetchAnomalies, 30000);
    return () => clearInterval(interval);
  }, [storeId]);

  const fetchAnomalies = async () => {
    try {
      const data = await apiService.detectAnomalies(storeId);
      setAnomalies(data);
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch(type) {
      case 'high_failure_rate': return '⚠️';
      case 'slow_processing': return '🐌';
      case 'no_orders': return '📉';
      default: return '❗';
    }
  };

  return (
    <Card sx={{ height: '400px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Anomaly Detection
        </Typography>
        
        {loading ? (
          <Typography color="textSecondary">
            Checking for anomalies...
          </Typography>
        ) : anomalies.length === 0 ? (
          <Alert severity="success">
            <AlertTitle>All Systems Normal</AlertTitle>
            No anomalies detected. Store is operating normally.
          </Alert>
        ) : (
          <Box sx={{ maxHeight: '320px', overflow: 'auto' }}>
            {anomalies.map((anomaly, index) => (
              <Alert 
                key={anomaly.id || index}
                severity={getSeverityColor(anomaly.severity) as any}
                sx={{ mb: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">
                    {getAnomalyIcon(anomaly.type)}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <AlertTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {anomaly.type.replace(/_/g, ' ').toUpperCase()}
                      <Chip 
                        label={anomaly.severity} 
                        size="small"
                        color={getSeverityColor(anomaly.severity) as any}
                      />
                    </AlertTitle>
                    <Typography variant="body2">
                      {anomaly.description}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Detected at {new Date(anomaly.detected_at).toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              </Alert>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};