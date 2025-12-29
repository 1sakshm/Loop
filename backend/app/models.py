from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class OrderStatus(str, Enum):
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PROCESSING = "processing"

class Platform(str, Enum):
    DOORDASH = "doordash"
    UBEREATS = "ubereats"
    GRUBHUB = "grubhub"

class StoreStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    BUSY = "busy"

class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"

class Store(BaseModel):
    id: str
    name: str
    slug: str
    platform: Platform
    status: StoreStatus
    location: Dict[str, Any]
    created_at: datetime

class OrderItem(BaseModel):
    name: str
    quantity: int
    price: float
    total: float

class Order(BaseModel):
    id: str
    store_id: str
    platform: Platform
    status: OrderStatus
    total_amount: float
    platform_fee: float
    items_count: int
    items: Optional[List[OrderItem]] = []
    customer: Optional[Dict[str, Any]] = {}
    delivery: Optional[Dict[str, Any]] = {}
    has_error: bool = False
    error_type: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    processing_time_seconds: Optional[int] = None

class StoreMetrics(BaseModel):
    store_id: str
    total_orders_24h: int = 0
    total_orders_1h: int = 0
    success_rate: float = Field(ge=0, le=100)
    failure_rate: float = Field(ge=0, le=100)
    avg_processing_time_minutes: float = 0
    total_revenue_24h: float = 0
    avg_order_value: float = 0
    orders_per_hour: float = 0
    peak_hour: Optional[Dict[str, Any]] = None
    error_breakdown: Dict[str, int] = {}
    timestamp: datetime = Field(default_factory=datetime.now)

class HealthScore(BaseModel):
    store_id: str
    score: float = Field(ge=0, le=100)
    status: HealthStatus
    factors: Dict[str, float] = {}
    recommendations: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.now)

class Anomaly(BaseModel):
    id: str
    store_id: str
    type: str  # "high_failure_rate", "slow_processing", "no_orders"
    severity: str  # "low", "medium", "high"
    description: str
    detected_at: datetime
    metrics: Dict[str, Any] = {}
    resolved: bool = False

class OrderSummary(BaseModel):
    total_orders: int
    completed: int
    failed: int
    cancelled: int
    total_revenue: float
    avg_order_value: float
    anomalies: List[Anomaly] = []
    time_range: Dict[str, datetime]