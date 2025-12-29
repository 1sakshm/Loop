export interface Store {
  id: string;
  name: string;
  slug: string;
  platform: 'doordash' | 'ubereats' | 'grubhub';
  status: 'online' | 'offline' | 'busy';
  location: {
    address: string;
    city: string;
    state: string;
    zip: string;
    lat: number;
    lng: number;
  };
  metrics?: {
    avg_order_time: number;
    avg_order_value: number;
    daily_orders: number;
    success_rate: number;
  };
}

export interface Order {
  id: string;
  store_id: string;
  store_name?: string;
  platform: string;
  status: 'completed' | 'failed' | 'cancelled' | 'processing';
  total_amount: number;
  items_count: number;
  has_error: boolean;
  error_type?: string;
  created_at: string;
  completed_at?: string;
  processing_time_seconds?: number;
}

export interface StoreMetrics {
  store_id: string;
  total_orders_24h: number;
  total_orders_1h: number;
  success_rate: number;
  failure_rate: number;
  avg_processing_time_minutes: number;
  total_revenue_24h: number;
  avg_order_value: number;
  orders_per_hour: number;
  peak_hour?: {
    hour: number;
    order_count: number;
  };
  error_breakdown: Record<string, number>;
  timestamp: string;
}

export interface HealthScore {
  store_id: string;
  score: number;
  status: 'healthy' | 'warning' | 'critical';
  factors: {
    success_rate: number;
    processing_time: number;
    revenue_trend: number;
    [key: string]: number;
  };
  recommendations?: string[];
  timestamp: string;
}

export interface Anomaly {
  id: string;
  store_id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detected_at: string;
  metrics?: Record<string, any>;
  resolved: boolean;
}