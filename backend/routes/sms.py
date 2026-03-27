"""
SMS API routes
"""

from fastapi import APIRouter, Query, HTTPException, Depends
from typing import Optional, List
from models import SMSResponse, SMSCreate, SMSFrequencyData
from db import SMSDatabase, get_db

router = APIRouter(prefix="/api/sms", tags=["sms"])


def _serialize(records: list) -> list:
    """Convert MongoDB _id to string id"""
    for r in records:
        if "_id" in r:
            r["id"] = str(r["_id"])
            del r["_id"]
        # Remove geo_location field (internal use only)
        r.pop("geo_location", None)
    return records


@router.get("", response_model=List[SMSResponse])
async def get_sms_records(
    db: SMSDatabase = Depends(get_db),
    number: Optional[str] = Query(None, description="Filter by sender/receiver/MSISDN"),
    start_date: Optional[str] = Query(None, description="Start date ISO format"),
    end_date: Optional[str] = Query(None, description="End date ISO format"),
    status: Optional[str] = Query(None, description="Filter by SMS status"),
    operator: Optional[str] = Query(None, description="Filter by operator"),
    network: Optional[str] = Query(None, description="Filter by network type"),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    radius: Optional[float] = Query(None, description="Radius in km"),
    limit: int = Query(1000, ge=1, le=10000),
    skip: int = Query(0, ge=0),
) -> List[SMSResponse]:
    """Get SMS records with optional filters"""
    try:
        has_filters = any([
            number, start_date, end_date, status, operator, network,
            lat is not None and lng is not None and radius
        ])

        if has_filters:
            records = db.get_sms_with_filters(
                number=number,
                start_date=start_date,
                end_date=end_date,
                status=status,
                operator=operator,
                network=network,
                lat=lat,
                lng=lng,
                radius_km=radius,
                limit=limit + skip,
            )
        else:
            records = db.get_all_sms(limit=limit + skip, skip=0)

        records = records[skip: skip + limit]
        return _serialize(records)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching records: {str(e)}")


@router.get("/stats/dashboard")
async def get_dashboard_stats(db: SMSDatabase = Depends(get_db)):
    """Get overall dashboard statistics"""
    try:
        return db.get_dashboard_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/frequency", response_model=List[SMSFrequencyData])
async def get_sms_frequency(
    db: SMSDatabase = Depends(get_db),
    limit: int = Query(10, ge=1, le=100),
):
    """Get top senders by frequency"""
    try:
        stats = db.get_sms_frequency(limit=limit)
        # Patch: add total_count & received_count for model compatibility
        for s in stats:
            s["received_count"] = 0
            s["total_count"] = s.get("sent_count", 0)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/timeline")
async def get_timeline(
    db: SMSDatabase = Depends(get_db),
    group_by: str = Query("day", description="Group by: hour | day | month"),
):
    """Get SMS activity over time"""
    try:
        return db.get_timeline_data(group_by=group_by)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/count")
async def get_record_count(db: SMSDatabase = Depends(get_db)):
    try:
        return {"total_records": db.count_records()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{number}", response_model=List[SMSResponse])
async def get_sms_by_number(
    number: str,
    db: SMSDatabase = Depends(get_db),
    limit: int = Query(200, ge=1, le=1000),
) -> List[SMSResponse]:
    """Get all SMS records for a specific phone number"""
    try:
        records = db.get_sms_by_number(number, limit=limit)
        return _serialize(records)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=dict)
async def create_sms_record(sms: SMSCreate, db: SMSDatabase = Depends(get_db)):
    """Create a new SMS record"""
    try:
        sms_dict = sms.dict()
        record_id = db.insert_sms(sms_dict)
        return {"id": record_id, "message": "SMS record created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk/insert", response_model=dict)
async def insert_bulk_sms(
    records: List[SMSCreate], db: SMSDatabase = Depends(get_db)
):
    """Insert multiple SMS records"""
    try:
        if not records:
            raise HTTPException(status_code=400, detail="No records provided")
        dicts = [r.dict() for r in records]
        inserted_ids = db.insert_many_sms(dicts)
        return {
            "inserted_count": len(inserted_ids),
            "ids": inserted_ids,
            "message": f"Inserted {len(inserted_ids)} records",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/admin/clear", response_model=dict)
async def clear_all_records(db: SMSDatabase = Depends(get_db)):
    """Clear all SMS records (admin/testing only)"""
    try:
        deleted = db.delete_all()
        return {"deleted_count": deleted, "message": "All records deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
