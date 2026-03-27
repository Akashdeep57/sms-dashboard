# 📱 SMS Management Dashboard

A full-stack SMS Record Management & Intelligence System built with **FastAPI + MongoDB** (backend) and **React + TypeScript + Tailwind CSS** (frontend). Modelled after the CDR Dashboard architecture.

---

## 🗂️ Project Structure

```
sms-dashboard/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py              # FastAPI app + lifespan (auto-seeds DB)
│   ├── db.py                # MongoDB layer (queries, indexes, analytics)
│   ├── models.py            # Pydantic models
│   ├── sms_seed_data.json   # 238 pre-processed SMS records from CSV
│   └── routes/
│       └── sms.py           # All REST API endpoints
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── tsconfig.json
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── index.css
        ├── types/
        │   └── sms.ts           # TypeScript interfaces
        ├── data/
        │   └── dummySms.ts      # Fallback data when API is offline
        ├── hooks/
        │   └── useSMSData.ts    # Data fetching hook with dummy fallback
        ├── components/
        │   ├── Header.tsx           # Top bar with KPI pills
        │   ├── Filters.tsx          # Full filter panel (collapsible)
        │   ├── SMSTable.tsx         # Sortable paginated table
        │   ├── SMSMap.tsx           # Leaflet map with status-coloured markers
        │   ├── SMSCharts.tsx        # Pie, bar, radar analytics charts
        │   ├── SMSTimeline.tsx      # Area/bar chart over time + grouping
        │   ├── RecordDetailPanel.tsx # Slide-in detail for selected record
        │   └── index.ts
        └── pages/
            └── Dashboard.tsx        # Main layout / view orchestrator
```

---

## 🚀 Quick Start — Docker Compose (Recommended)

```bash
# Clone / place project
cd sms-dashboard

# Start everything
docker compose up --build

# Access:
#   Frontend  → http://localhost:3001
#   Backend   → http://localhost:8001
#   API Docs  → http://localhost:8001/docs
```

The backend **auto-seeds** MongoDB with the 238 SMS records from `sms_seed_data.json` on first start.

---

## 🛠️ Local Development

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run MongoDB locally (or update MONGO_URL in .env)
# Default URL: mongodb://root:password@localhost:27017/sms_dashboard?authSource=admin

# Start dev server
python main.py
# or
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

npm install
npm run dev
# Runs on http://localhost:3000
```

Set `VITE_API_URL` in a `.env` file if your backend is on a different port:

```env
VITE_API_URL=http://localhost:8000
```

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sms` | Get all SMS records (with optional filters) |
| GET | `/api/sms/{number}` | Get records by phone number |
| GET | `/api/sms/stats/dashboard` | Full dashboard stats |
| GET | `/api/sms/stats/frequency` | Top senders by volume |
| GET | `/api/sms/stats/timeline` | SMS over time (hour/day/month) |
| GET | `/api/sms/stats/count` | Total record count |
| POST | `/api/sms` | Create a new SMS record |
| POST | `/api/sms/bulk/insert` | Insert multiple SMS records |
| DELETE | `/api/sms/admin/clear` | Clear all records (dev/test) |
| GET | `/health` | Health check + record count |
| GET | `/docs` | Swagger UI |

### Filter Query Parameters (`GET /api/sms`)

| Param | Type | Description |
|-------|------|-------------|
| `number` | string | Filter by sender / receiver / MSISDN |
| `start_date` | ISO string | Start of date range |
| `end_date` | ISO string | End of date range |
| `status` | string | Sent / Delivered / Received / Pending / Failed |
| `operator` | string | Airtel / Jio / BSNL / Vodafone |
| `network` | string | 3G / 4G / LTE / 5G |
| `lat` | float | Latitude for radius search |
| `lng` | float | Longitude for radius search |
| `radius` | float | Radius in km |
| `limit` | int | Max records (default 1000) |
| `skip` | int | Pagination offset |

---

## 📊 Dashboard Features

### 4 Views

| View | Description |
|------|-------------|
| **Table** | Sortable, paginated table with status badges, operator colours, click to inspect |
| **Map** | Leaflet map — each SMS plotted as a colour-coded circle by delivery status |
| **Analytics** | Status pie, operator bar, top senders, network distribution |
| **Timeline** | Area/bar chart of SMS volume over time — group by hour/day/month, toggle chart type |

### Filters Panel
- Phone number search (sender / receiver / MSISDN)
- Date range (start + end datetime)
- SMS status dropdown
- Operator dropdown
- Network type dropdown
- Location radius (lat/lng/km)
- Active filter count badge

### Record Detail Panel
Clicking any row (table) or marker (map) opens a detail panel showing:
- Status badge + timestamp
- Sender / Receiver / MSISDN / Target / Group
- Network info: Operator, RAN, Band, LAC/TAC, Rx Level
- Location: Place, City, Region, Coordinates
- Device: Model, IMSI, IMEI
- Encryption flags: A5/1, A5/2, A5/3
- Content & description notes

---

## 📦 Dataset

The seed data (`sms_seed_data.json`) was extracted from the uploaded telecom CSV (`telecom_trend_test_data_1002rows.csv`).

- **238 SMS records** (Type = SMS rows only)
- Date range: April 2025 – March 2026
- 4 operators: Airtel, Jio, BSNL, Vodafone
- 4 network types: 3G, 4G, LTE, 5G
- 10 Indian cities: Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Chandigarh, Jaipur, Lucknow, Kochi
- 5 status values: Sent, Delivered, Received, Pending, Failed

### Phone Number Parsing
The CSV stores phone numbers in scientific notation (`9.96629E+11`). The pre-processing pipeline resolves these to valid 10-digit Indian mobile numbers by dividing by 100 after float conversion.

---

## 🔧 Environment Variables

### Backend `.env`
```env
MONGO_URL=mongodb://root:password@sms-mongodb:27017/sms_dashboard?authSource=admin&directConnection=true
DB_NAME=sms_dashboard
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:8000
```

---

## 🏗️ Architecture

```
Browser
  │
  ▼
React Frontend (Vite + Tailwind + Recharts + Leaflet)
  │  HTTP REST
  ▼
FastAPI Backend (Python 3.11)
  │  PyMongo
  ▼
MongoDB 7.0
  └─ sms_records collection
       ├─ Indexes: sender, receiver, msisdn, timestamp, status, operator, network, group, target
       └─ Geospatial index: geo_location (GeoJSON Point) for radius searches
```

---

## 🧩 Extending the System

**Add new filter** → update `Filters.tsx` + `useSMSData.ts` + `db.py:get_sms_with_filters()`

**Add new chart** → add to `SMSCharts.tsx` or `SMSTimeline.tsx` using Recharts

**Add new API route** → add to `routes/sms.py` and register in `main.py`

**Ingest more data** → POST to `/api/sms/bulk/insert` or add rows to `sms_seed_data.json`
