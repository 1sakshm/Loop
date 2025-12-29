import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, LinearProgress } from '@mui/material';
import { HealthScore } from '../types';
import { apiService } from '../services/api';

interface HealthIndicatorProps {
  storeId: string;
  healthScore: HealthScore | null;
  loading: boolean;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ 
  storeId, 
  healthScore: propHealthScore, 
  loading 
}) => {
  const [healthScore, setHealthScore] = useState<HealthScore | null>(propHealthScore);

  useEffect(() => {
    if (!propHealthScore) {
      fetchHealthScore();
    } else {
      setHealthScore(propHealthScore);
    }
  }, [storeId, propHealthScore]);

  const fetchHealthScore = async () => {
    try {
      const score = await apiService.getHealthScore(storeId);
      setHealthScore(score);
    } catch (error) {
      console.error('Failed to fetch health score:', error);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const getHealthEmoji = (status: string) => {
    switch(status) {
      case 'healthy': return '😊';
      case 'warning': return '😐';
      case 'critical': return '😟';
      default: return '❓';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Store Health Score
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : healthScore ? (
          <>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              py: 2 
            }}>
              <Typography 
                variant="h2" 
                style={{ color: getHealthColor(healthScore.score) }}
              >
                {healthScore.score.toFixed(0)}
                <Typography component="span" variant="h4">/100</Typography>
              </Typography>
              <Typography variant="h3" sx={{ mt: 1 }}>
                {getHealthEmoji(healthScore.status)}
              </Typography>
              <Typography 
                variant="h6" 
                style={{ 
                  color: getHealthColor(healthScore.score),
                  textTransform: 'uppercase',
                  marginTop: 8
                }}
              >
                {healthScore.status}
              </Typography>
            </Box>

            {/* Factor Breakdown */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Score Factors
              </Typography>
              {Object.entries(healthScore.factors).map(([key, value]) => (
                <Box key={key} sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="body2">
                      {value.toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={value} 
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getHealthColor(value)
                      }
                    }}
                  />
                </Box>
              ))}
            </Box>

            {/* Recommendations */}
            {healthScore.recommendations && healthScore.recommendations.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Recommendations
                </Typography>
                {healthScore.recommendations.map((rec, index) => (
                  <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                    • {rec}
                  </Typography>
                ))}
              </Box>
            )}
          </>
        ) : (
          <Typography>No health data available</Typography>
        )}
      </CardContent>
    </Card>
  );
};