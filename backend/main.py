"""
SMS Dashboard Backend - FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import json
import os
from datetime import datetime
from db import get_db
from routes.sms import router as sms_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle"""
    print("🚀 Starting SMS Dashboard Backend...")
    db = get_db()

    existing_count = db.count_records()
    print(f"📊 Current records in database: {existing_count}")

    if existing_count == 0:
        seed_file = os.path.join(os.path.dirname(__file__), "sms_seed_data.json")
        if os.path.exists(seed_file):
            print("📥 Loading seed SMS data from file...")
            with open(seed_file) as f:
                seed_records = json.load(f)

            # Convert timestamp strings to datetime objects
            for record in seed_records:
                if isinstance(record.get("timestamp"), str):
                    record["timestamp"] = datetime.fromisoformat(record["timestamp"])

            inserted = db.insert_many_sms(seed_records)
            print(f"✅ Loaded {len(inserted)} SMS records from seed data")
        else:
            print("⚠️  No seed data file found. Database is empty.")

    yield

    print("🛑 Shutting down SMS Dashboard Backend...")
    db.disconnect()


app = FastAPI(
    title="SMS Dashboard API",
    description="SMS Record Management & Analytics Dashboard Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sms_router)


@app.get("/health")
async def health_check():
    try:
        db = get_db()
        count = db.count_records()
        return {"status": "healthy", "records_count": count}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.get("/")
async def root():
    return {
        "name": "SMS Dashboard API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")
