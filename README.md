# Restaurant Dashboard

A full-stack restaurant order monitoring dashboard that displays store performance metrics and real-time order data.

## Features

- **Store Metrics**: View success/failure rates, average processing time, revenue, and average order value per store
- **Dashboard Summary**: See totals across all stores including total orders, revenue, and order status breakdown
- **Mock API Integration**: Connects to mock restaurant API for realistic data

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React (TypeScript)
- **Mock API**: Running on port 3001

## Prerequisites

- Python 3.11
- Node.js 14+
- Mock API server running on `http://localhost:3001`

## Getting Started Locally

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Backend Endpoints Implimented in main.py

- `GET /api/dashboard/store/{store_id}` - Get metrics for a specific store
- `GET /api/dashboard/summary` - Get summary metrics across all stores

### Mock API Endpoints used

- `GET /api/stores` - List of restaurant stores
- `GET /api/stores/:storeId` - Single store details
- `GET /api/stores/:storeId/orders` - Store's orders
- `GET /api/stores/:storeId/metrics` - Store metrics
- `GET /api/orders/history` - Historical orders
- `POST /api/orders/generate` - Generate test orders
- `WS ws://localhost:3001` - WebSocket for real-time orders

## Project Structure

```
loop/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # API endpoints
│   │   ├── models.py    # Pydantic models
│   │   └── services.py  # Business logic (MetricsAggregationService)
│   └── requirements.txt
└── frontend/            # React frontend
    ├── src/
    │   ├── App.tsx
    │   ├── components/
    │   └── services/
    └── package.json
```

## Implementation Details

### Metrics Calculation

The `MetricsAggregationService` in `backend/app/services.py` calculates:
- **Success Rate**: Percentage of completed orders vs failed orders
- **Average Processing Time**: Mean time from order creation to completion
- **Revenue**: Total from completed orders only
- **Average Order Value**: Revenue divided by number of completed orders