from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
import httpx
from datetime import datetime

from .models import Store, Order, StoreMetrics, HealthScore
from .services import HealthScoreService, AnomalyDetectionService, MetricsAggregationService

app = FastAPI(title="Restaurant Dashboard API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock API base URL
MOCK_API_URL = "https://assessment-6xdhr.ondigitalocean.app"

# Initialize services
health_service = HealthScoreService()
anomaly_service = AnomalyDetectionService()

@app.get("/api/test-fetch")
async def test_fetch():
    """Debug endpoint to test fetch_from_mock_api"""
    response = await fetch_from_mock_api("/api/stores?limit=1")
    return {
        "type": str(type(response)),
        "keys": list(response.keys()) if isinstance(response, dict) else "not a dict",
        "response_sample": response if isinstance(response, dict) else str(response)[:100]
    }

@app.get("/api/metrics/store/{store_id}")
async def get_store_metrics(store_id: str) -> StoreMetrics:
    """
    Get performance metrics for a specific store.
    Should fetch data from mock API and calculate metrics.
    """
    try:
        orders_response = await fetch_from_mock_api(f"/api/stores/{store_id}/orders")
        if isinstance(orders_response, dict) and "orders" in orders_response:
            orders = orders_response["orders"]
        elif isinstance(orders_response, list):
            orders = orders_response
        else:
            orders = []
        orders = [o for o in orders if isinstance(o, dict)]
        total_orders_24h = len(orders)
        completed_orders = [o for o in orders if o.get("status") == "completed"]
        if total_orders_24h > 0:
            success_rate = (len(completed_orders) / total_orders_24h) * 100.0
        else:
            success_rate = 0.0
        failure_rate = 100.0 - success_rate
        
        if completed_orders:
            total_time = sum(float(o.get("processing_time_seconds", 0)) for o in completed_orders if isinstance(o.get("processing_time_seconds"), (int, float, str)))
            avg_processing_time = (total_time / len(completed_orders)) / 60.0
        else:
            avg_processing_time = 0.0
        
        total_revenue = 0.0
        for o in completed_orders:
            amount = o.get("total_amount", 0)
            if isinstance(amount, (int, float)):
                total_revenue += float(amount)
            elif isinstance(amount, str):
                try:
                    total_revenue += float(amount)
                except:
                    pass
        
        avg_order_value = (total_revenue / total_orders_24h) if total_orders_24h else 0.0

        metrics = StoreMetrics(
            store_id=store_id,
            total_orders_24h=total_orders_24h,
            total_orders_1h=0,
            success_rate=round(success_rate, 2),
            failure_rate=round(failure_rate, 2),
            avg_processing_time_minutes=round(avg_processing_time, 2),
            total_revenue_24h=round(total_revenue, 2),
            avg_order_value=round(avg_order_value, 2),
            orders_per_hour=0,
            peak_hour=None,
            error_breakdown={},
        )

        return metrics
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/store/{store_id}")
async def dashboard_store(store_id: str) -> Dict:
    """
    Combined endpoint for dashboard: returns store details, recent orders, and computed metrics.
    """
    try:
        store = await fetch_from_mock_api(f"/api/stores/{store_id}")
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Store not found: {e}")

    try:
        orders_response = await fetch_from_mock_api(f"/api/stores/{store_id}/orders")
        if isinstance(orders_response, dict) and "orders" in orders_response:
            orders = orders_response["orders"]
        elif isinstance(orders_response, list):
            orders = orders_response
        else:
            orders = []
        orders = [o for o in orders if isinstance(o, dict)]
    except Exception:
        orders = []

    total_orders = len(orders)
    completed_orders = [o for o in orders if isinstance(o, dict) and o.get("status") == "completed"]
    failed_orders = [o for o in orders if isinstance(o, dict) and o.get("status") == "failed"]
    
    if total_orders > 0:
        success_rate = (len(completed_orders) / total_orders) * 100.0
    else:
        success_rate = 0.0
    failure_rate = 100.0 - success_rate
    
    if completed_orders:
        total_time = sum(float(o.get("processing_time_seconds", 0)) for o in completed_orders if isinstance(o.get("processing_time_seconds"), (int, float, str)))
        avg_processing_time = (total_time / len(completed_orders)) / 60.0
    else:
        avg_processing_time = 0.0
    
    total_revenue = 0.0
    for o in completed_orders:
        amount = o.get("total_amount", 0)
        if isinstance(amount, (int, float)):
            total_revenue += float(amount)
        elif isinstance(amount, str):
            try:
                total_revenue += float(amount)
            except:
                pass

    metrics = {
        "store_id": store_id,
        "total_orders_24h": total_orders,
        "success_rate": round(success_rate, 2),
        "failure_rate": round(failure_rate, 2),
        "avg_processing_time_minutes": round(avg_processing_time, 2),
        "total_revenue_24h": round(total_revenue, 2),
        "avg_order_value": round((total_revenue / total_orders) if total_orders else 0.0, 2)
    }

    return {"store": store, "orders": orders, "metrics": metrics}


@app.get("/api/dashboard/stores")
async def dashboard_stores() -> Dict:
    """Return list of stores from mock API (proxy through our backend)."""
    try:
        response = await fetch_from_mock_api("/api/stores")
        return response
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health-score/{store_id}")
async def get_health_score(store_id: str) -> HealthScore:
    """
    Calculate and return health score for a store based on actual performance metrics.
    """
    try:
        try:
            orders_response = await fetch_from_mock_api(f"/api/stores/{store_id}/orders")
        except Exception as fetch_error:
            print(f"Error fetching orders for {store_id}: {fetch_error}")
            return HealthScore(
                store_id=store_id,
                score=60,
                status="warning",
                factors={"success_rate": 50, "processing_time": 60, "revenue_trend": 60},
                timestamp=datetime.now()
            )
        
        if isinstance(orders_response, dict) and "orders" in orders_response:
            orders = orders_response["orders"]
        elif isinstance(orders_response, list):
            orders = orders_response
        else:
            orders = []
        orders = [o for o in orders if isinstance(o, dict)]
        if not orders:
            return HealthScore(
                store_id=store_id,
                score=60,
                status="warning",
                factors={"success_rate": 50, "processing_time": 60, "revenue_trend": 0},
                timestamp=datetime.now()
            )
        
        completed_orders = [o for o in orders if o.get("status") == "completed"]
        total_orders = len(orders)
        if total_orders > 0:
            success_rate_pct = (len(completed_orders) / total_orders) * 100.0
        else:
            success_rate_pct = 0.0
        if completed_orders:
            try:
                times = []
                for o in completed_orders:
                    try:
                        t = float(o.get("processing_time_seconds", 0))
                        if t > 0:
                            times.append(t)
                    except (ValueError, TypeError):
                        pass
                
                if times:
                    avg_time = sum(times) / len(times)
                    avg_time_minutes = avg_time / 60.0
                    if avg_time_minutes <= 15:
                        processing_time_score = 100.0
                    elif avg_time_minutes <= 30:
                        processing_time_score = 100.0 - ((avg_time_minutes - 15) / 15) * 40
                    else:
                        processing_time_score = max(20.0, 60.0 - ((avg_time_minutes - 30) / 10) * 20)
                else:
                    processing_time_score = 50.0
            except Exception as time_error:
                print(f"Error calculating processing time: {time_error}")
                processing_time_score = 50.0
        else:
            processing_time_score = 50.0
        revenue_orders = len(completed_orders)
        revenue_score = min(100.0, (revenue_orders / 10.0) * 100.0) if revenue_orders > 0 else 0.0
        
        overall_score = (success_rate_pct * 0.5 + processing_time_score * 0.3 + revenue_score * 0.2)
        overall_score = round(overall_score, 1)
        
        if overall_score >= 80:
            status = "healthy"
        elif overall_score >= 60:
            status = "warning"
        else:
            status = "critical"
        
        return HealthScore(
            store_id=store_id,
            score=int(overall_score),
            status=status,
            factors={
                "success_rate": int(success_rate_pct),
                "processing_time": int(processing_time_score),
                "revenue_trend": int(revenue_score)
            },
            timestamp=datetime.now()
        )
    except Exception as e:
        print(f"Unexpected error in health score for {store_id}: {e}")
        import traceback
        traceback.print_exc()
        return HealthScore(
            store_id=store_id,
            score=60,
            status="warning",
            factors={"success_rate": 50, "processing_time": 60, "revenue_trend": 50},
            timestamp=datetime.now()
        )

@app.get("/api/orders/summary")
async def get_orders_summary(
    store_id: Optional[str] = None,
    platform: Optional[str] = None,
    hours: int = 24
) -> Dict:
    try:
        stores_response = await fetch_from_mock_api("/api/stores")
        if isinstance(stores_response, dict) and "stores" in stores_response:
            stores = stores_response["stores"]
        elif isinstance(stores_response, list):
            stores = stores_response
        else:
            stores = []
        stores = [s for s in stores if isinstance(s, dict)]

        total_stores = len(stores)
        total_orders = 0
        total_revenue = 0.0
        status_counts = {"completed": 0, "failed": 0, "cancelled": 0}
        for s in stores:
            sid = s.get("id")
            if not sid:
                continue
            try:
                orders_response = await fetch_from_mock_api(f"/api/stores/{sid}/orders")
                if isinstance(orders_response, dict) and "orders" in orders_response:
                    orders = orders_response["orders"]
                elif isinstance(orders_response, list):
                    orders = orders_response
                else:
                    orders = []
                orders = [o for o in orders if isinstance(o, dict)]
            except Exception:
                orders = []

            total_orders += len(orders)
            for o in orders:
                st = o.get("status")
                if st in status_counts:
                    status_counts[st] += 1
                if st == "completed":
                    total_revenue += float(o.get("total_amount", 0))

        avg_order_value = (total_revenue / total_orders) if total_orders else 0.0

        summary = {
            "total_stores": total_stores,
            "total_orders": total_orders,
            "total_revenue": round(total_revenue, 2),
            "avg_order_value": round(avg_order_value, 2),
            "status_counts": status_counts,
            "time_range_hours": hours,
        }

        return summary
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/summary")
async def dashboard_summary(hours: int = 24) -> Dict:
    """Dashboard summary endpoint."""
    try:
        stores_response = await fetch_from_mock_api("/api/stores")
        stores = []
        if isinstance(stores_response, dict):
            stores = stores_response.get("stores", [])
        elif isinstance(stores_response, list):
            stores = stores_response
        if not isinstance(stores, list):
            stores = []
        stores = [s for s in stores if isinstance(s, dict)]

        total_stores = len(stores)
        total_orders_count = 0
        total_revenue_amount = 0.0
        status_count = {"completed": 0, "failed": 0, "cancelled": 0}
        for store_item in stores:
            if not isinstance(store_item, dict):
                continue
                
            store_id = store_item.get("id")
            if not store_id or not isinstance(store_id, str):
                continue
            try:
                orders_resp = await fetch_from_mock_api(f"/api/stores/{store_id}/orders")
                orders_list = []
                
                if isinstance(orders_resp, dict):
                    orders_list = orders_resp.get("orders", [])
                elif isinstance(orders_resp, list):
                    orders_list = orders_resp
                    
                if not isinstance(orders_list, list):
                    orders_list = []
                for order_item in orders_list:
                    if not isinstance(order_item, dict):
                        continue
                        
                    total_orders_count = total_orders_count + 1
                    
                    status_val = order_item.get("status")
                    if status_val in status_count:
                        status_count[status_val] = status_count[status_val] + 1
                    
                    if status_val == "completed":
                        amount = order_item.get("total_amount", 0)
                        if isinstance(amount, (int, float)):
                            total_revenue_amount = total_revenue_amount + float(amount)
                        elif isinstance(amount, str):
                            try:
                                total_revenue_amount = total_revenue_amount + float(amount)
                            except:
                                pass
                                
            except Exception as order_error:
                pass

        if total_orders_count > 0:
            avg_value = total_revenue_amount / float(total_orders_count)
        else:
            avg_value = 0.0

        return {
            "total_stores": int(total_stores),
            "total_orders": int(total_orders_count),
            "total_revenue": round(total_revenue_amount, 2),
            "avg_order_value": round(avg_value, 2),
            "status_counts": status_count,
            "time_range_hours": hours,
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws/orders")
async def websocket_orders(websocket: WebSocket):
    
    await websocket.accept()
    try:
        while True:
            await websocket.receive_text()
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await websocket.close()

@app.get("/api/anomalies/detect")
async def detect_anomalies(store_id: Optional[str] = None) -> List[Dict]:
    
    anomalies = anomaly_service.detect_anomalies(store_id)
    return anomalies

async def fetch_from_mock_api(endpoint: str) -> Dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{MOCK_API_URL}{endpoint}")
        response.raise_for_status()
        return response.json()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)