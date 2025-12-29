from typing import Dict, List, Optional
from datetime import datetime, timedelta
from .models import HealthScore, HealthStatus, Anomaly, StoreMetrics

class HealthScoreService:
    """
    Service to calculate store health scores.
    THIS IS WHERE YOU IMPLEMENT YOUR ALGORITHM!
    """
    
    def calculate_health_score(
        self, 
        store_id: str, 
        metrics: StoreMetrics,
        order_history: List[Dict]
    ) -> HealthScore:
        """
        Calculate health score based on various factors.
        
        TODO: Implement your custom algorithm here!
        Consider factors like:
        - Success rate (higher is better)
        - Processing time vs average
        - Revenue trends
        - Order volume consistency
        - Error patterns
        
        Args:
            store_id: Store identifier
            metrics: Current store metrics
            order_history: Recent order history
            
        Returns:
            HealthScore object with score (0-100) and breakdown
        """
        
        # PLACEHOLDER IMPLEMENTATION - REPLACE WITH YOUR LOGIC
        score = 75.0
        
        # Example factor calculation (implement your own!)
        factors = {
            "success_rate": metrics.success_rate,
            "processing_efficiency": 80.0,  # Calculate based on processing time
            "revenue_performance": 70.0,    # Calculate based on revenue trends
            "consistency": 75.0              # Calculate based on order patterns
        }
        
        # Determine status based on score
        if score >= 80:
            status = HealthStatus.HEALTHY
        elif score >= 60:
            status = HealthStatus.WARNING
        else:
            status = HealthStatus.CRITICAL
        
        # Generate recommendations
        recommendations = self._generate_recommendations(factors)
        
        return HealthScore(
            store_id=store_id,
            score=score,
            status=status,
            factors=factors,
            recommendations=recommendations,
            timestamp=datetime.now()
        )
    
    def _generate_recommendations(self, factors: Dict[str, float]) -> List[str]:
        """
        Generate actionable recommendations based on factor scores.
        """
        recommendations = []
        
        # Add recommendations based on low-scoring factors
        if factors.get("success_rate", 100) < 80:
            recommendations.append("Investigate high failure rate - check store availability")
        
        if factors.get("processing_efficiency", 100) < 70:
            recommendations.append("Processing times are slow - review kitchen operations")
        
        return recommendations


class AnomalyDetectionService:
    """
    Service to detect operational anomalies.
    """
    
    # Thresholds for anomaly detection
    FAILURE_RATE_THRESHOLD = 20.0  # %
    PROCESSING_TIME_MULTIPLIER = 2.0  # 2x average
    NO_ORDERS_THRESHOLD_MINUTES = 10
    
    def detect_anomalies(
        self, 
        store_id: Optional[str] = None,
        metrics: Optional[StoreMetrics] = None
    ) -> List[Dict]:
        """
        Detect anomalies in store operations.
        
        TODO: Implement anomaly detection logic
        Check for:
        - High failure rates
        - Slow processing times
        - No recent orders
        - Unusual patterns
        
        Args:
            store_id: Optional store ID to check specific store
            metrics: Store metrics to analyze
            
        Returns:
            List of detected anomalies
        """
        
        anomalies = []
        
        # PLACEHOLDER - Implement actual detection logic
        
        # Example: Check failure rate
        if metrics and metrics.failure_rate > self.FAILURE_RATE_THRESHOLD:
            anomalies.append({
                "type": "high_failure_rate",
                "severity": "high",
                "description": f"Failure rate is {metrics.failure_rate}%, above threshold of {self.FAILURE_RATE_THRESHOLD}%",
                "store_id": store_id,
                "detected_at": datetime.now().isoformat()
            })
        
        return anomalies
    
    def check_processing_time_anomaly(
        self, 
        current_time: float, 
        average_time: float
    ) -> bool:
        """
        Check if processing time is anomalous.
        """
        return current_time > (average_time * self.PROCESSING_TIME_MULTIPLIER)
    
    def check_order_volume_anomaly(
        self, 
        last_order_time: datetime
    ) -> bool:
        """
        Check if there's been a suspicious lack of orders.
        """
        time_since_last_order = datetime.now() - last_order_time
        return time_since_last_order > timedelta(minutes=self.NO_ORDERS_THRESHOLD_MINUTES)


class MetricsAggregationService:
    """
    Service to aggregate and calculate metrics from order data.
    """
    
    @staticmethod
    def calculate_success_rate(orders: List[Dict]) -> float:
        """
        Calculate order success rate.
        """
        if not orders:
            return 0.0
        
        completed = sum(1 for o in orders if o.get("status") == "completed")
        return (completed / len(orders)) * 100
    
    @staticmethod
    def calculate_average_processing_time(orders: List[Dict]) -> float:
        """
        Calculate average processing time in minutes.
        """
        completed_orders = [o for o in orders if o.get("status") == "completed"]
        if not completed_orders:
            return 0.0
        
        total_time = sum(o.get("processing_time_seconds", 0) for o in completed_orders)
        return (total_time / len(completed_orders)) / 60  # Convert to minutes
    
    @staticmethod
    def calculate_revenue(orders: List[Dict]) -> float:
        """
        Calculate total revenue from completed orders.
        """
        completed_orders = [o for o in orders if o.get("status") == "completed"]
        return sum(o.get("total_amount", 0) for o in completed_orders)