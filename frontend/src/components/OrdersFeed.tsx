import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText,
  Chip,
  Box,
  CircularProgress
} from '@mui/material';
import { Order } from '../types';
import { apiService } from '../services/api';

interface OrdersFeedProps {
  storeId: string;
}

export const OrdersFeed: React.FC<OrdersFeedProps> = ({ storeId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    
    // Optional: Set up WebSocket for real-time updates
    // const ws = apiService.connectToOrderStream((order) => {
    //   if (order.store_id === storeId) {
    //     setOrders(prev => [order, ...prev].slice(0, 20));
    //   }
    // });
    // 
    // return () => ws.close();
  }, [storeId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiService.getOrders(storeId, 20);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card sx={{ height: '400px' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Orders
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: '320px', overflow: 'auto' }}>
            {orders.length === 0 ? (
              <Typography color="textSecondary" align="center">
                No recent orders
              </Typography>
            ) : (
              orders.map((order) => (
                <ListItem 
                  key={order.id}
                  sx={{ 
                    borderBottom: '1px solid #e0e0e0',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    width: '100%',
                    mb: 1
                  }}>
                    <Typography variant="body2" fontWeight="bold">
                      Order #{order.id.slice(-6)}
                    </Typography>
                    <Chip 
                      label={order.status} 
                      size="small"
                      color={getStatusColor(order.status) as any}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                    <Typography variant="body2" color="textSecondary">
                      {formatTime(order.created_at)}
                    </Typography>
                    <Typography variant="body2">
                      ${order.total_amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {order.items_count} items
                    </Typography>
                    {order.processing_time_seconds && (
                      <Typography variant="body2" color="textSecondary">
                        {Math.round(order.processing_time_seconds / 60)} min
                      </Typography>
                    )}
                  </Box>

                  {order.has_error && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      Error: {order.error_type}
                    </Typography>
                  )}
                </ListItem>
              ))
            )}
          </List>
        )}
      </CardContent>
    </Card>
  );
};