"""
MongoDB database connection and operations for SMS Dashboard
"""

from pymongo import MongoClient, ASCENDING, GEOSPHERE, DESCENDING
from pymongo.errors import ServerSelectionTimeoutError, OperationFailure
from typing import Optional, List, Dict
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

MONGO_URL = os.getenv(
    "MONGO_URL",
    "mongodb://root:password@sms-mongodb:27017/sms_dashboard?authSource=admin&directConnection=true",
)
DB_NAME = os.getenv("DB_NAME", "sms_dashboard")
COLLECTION_NAME = "sms_records"


class SMSDatabase:
    """MongoDB database operations for SMS records"""

    def __init__(self, mongo_url: str = MONGO_URL):
        self.mongo_url = mongo_url
        self.client: Optional[MongoClient] = None
        self.db = None
        self.collection = None

    def connect(self):
        if self.client:
            return

        try:
            self.client = MongoClient(
                self.mongo_url,
                serverSelectionTimeoutMS=5000,
                maxPoolSize=50,
                retryWrites=True,
                appname="sms-dashboard-backend",
            )
            self.client.admin.command("ping")
            self.db = self.client[DB_NAME]
            self.collection = self.db[COLLECTION_NAME]
            self._create_indexes()
            print(f"✅ Connected to MongoDB: {self.mongo_url}")
        except (ServerSelectionTimeoutError, OperationFailure) as e:
            print(f"❌ MongoDB connection failed: {e}")
            raise

    def disconnect(self):
        if self.client:
            self.client.close()
            self.client = None
            print("🔌 MongoDB disconnected")

    def _create_indexes(self):
        try:
            self.collection.create_index([("sender", ASCENDING)])
            self.collection.create_index([("receiver", ASCENDING)])
            self.collection.create_index([("msisdn", ASCENDING)])
            self.collection.create_index([("timestamp", ASCENDING)])
            self.collection.create_index([("status", ASCENDING)])
            self.collection.create_index([("operator", ASCENDING)])
            self.collection.create_index([("network", ASCENDING)])
            self.collection.create_index([("group", ASCENDING)])
            self.collection.create_index([("target", ASCENDING)])
            # Geospatial index on location
            self.collection.create_index([("geo_location", GEOSPHERE)])
            print("✅ Indexes created")
        except OperationFailure as e:
            print(f"❌ Index creation failed: {e}")

    # ------------------ INSERT ------------------

    def insert_sms(self, sms_data: Dict) -> str:
        self._add_geo_point(sms_data)
        result = self.collection.insert_one(sms_data)
        return str(result.inserted_id)

    def insert_many_sms(self, sms_list: List[Dict]) -> List[str]:
        if not sms_list:
            return []
        for record in sms_list:
            self._add_geo_point(record)
        result = self.collection.insert_many(sms_list)
        return [str(_id) for _id in result.inserted_ids]

    def _add_geo_point(self, record: Dict):
        """Add GeoJSON point for geospatial queries"""
        loc = record.get("location", {})
        lat = loc.get("lat")
        lng = loc.get("lng")
        if lat is not None and lng is not None:
            record["geo_location"] = {
                "type": "Point",
                "coordinates": [lng, lat],
            }

    # ------------------ FETCH ------------------

    def get_all_sms(self, limit: int = 1000, skip: int = 0) -> List[Dict]:
        return list(
            self.collection.find()
            .sort("timestamp", DESCENDING)
            .skip(skip)
            .limit(limit)
        )

    def get_sms_by_number(self, number: str, limit: int = 200) -> List[Dict]:
        query = {"$or": [{"sender": number}, {"receiver": number}, {"msisdn": number}]}
        return list(self.collection.find(query).sort("timestamp", DESCENDING).limit(limit))

    def get_sms_by_date_range(self, start: datetime, end: datetime, limit: int = 1000) -> List[Dict]:
        query = {"timestamp": {"$gte": start, "$lte": end}}
        return list(self.collection.find(query).sort("timestamp", DESCENDING).limit(limit))

    def get_sms_by_radius(self, lat: float, lng: float, radius_km: float, limit: int = 500) -> List[Dict]:
        query = {
            "geo_location": {
                "$near": {
                    "$geometry": {"type": "Point", "coordinates": [lng, lat]},
                    "$maxDistance": radius_km * 1000,
                }
            }
        }
        return list(self.collection.find(query).limit(limit))

    def get_sms_with_filters(
        self,
        number: Optional[str] = None,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        status: Optional[str] = None,
        operator: Optional[str] = None,
        network: Optional[str] = None,
        lat: Optional[float] = None,
        lng: Optional[float] = None,
        radius_km: Optional[float] = None,
        limit: int = 1000,
    ) -> List[Dict]:
        query = {}

        if number:
            query["$or"] = [
                {"sender": number},
                {"receiver": number},
                {"msisdn": number},
            ]

        if start_date and end_date:
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)
            query["timestamp"] = {"$gte": start, "$lte": end}

        if status:
            query["status"] = status

        if operator:
            query["operator"] = operator

        if network:
            query["network"] = network

        if lat is not None and lng is not None and radius_km:
            query["geo_location"] = {
                "$near": {
                    "$geometry": {"type": "Point", "coordinates": [lng, lat]},
                    "$maxDistance": radius_km * 1000,
                }
            }

        return list(
            self.collection.find(query).sort("timestamp", DESCENDING).limit(limit)
        )

    # ------------------ ANALYTICS ------------------

    def get_sms_frequency(self, limit: int = 10) -> List[Dict]:
        pipeline = [
            {
                "$group": {
                    "_id": "$sender",
                    "sent_count": {"$sum": 1},
                    "unique_contacts": {"$addToSet": "$receiver"},
                    "operators": {"$addToSet": "$operator"},
                }
            },
            {
                "$project": {
                    "number": "$_id",
                    "sent_count": 1,
                    "unique_contacts": {"$size": "$unique_contacts"},
                    "operators": 1,
                    "_id": 0,
                }
            },
            {"$sort": {"sent_count": -1}},
            {"$limit": limit},
        ]
        return list(self.collection.aggregate(pipeline))

    def get_status_breakdown(self) -> List[Dict]:
        pipeline = [
            {"$group": {"_id": "$status", "count": {"$sum": 1}}},
            {"$project": {"status": "$_id", "count": 1, "_id": 0}},
            {"$sort": {"count": -1}},
        ]
        return list(self.collection.aggregate(pipeline))

    def get_operator_breakdown(self) -> List[Dict]:
        pipeline = [
            {
                "$group": {
                    "_id": "$operator",
                    "count": {"$sum": 1},
                    "networks": {"$addToSet": "$network"},
                }
            },
            {
                "$project": {
                    "operator": "$_id",
                    "count": 1,
                    "networks": 1,
                    "_id": 0,
                }
            },
            {"$sort": {"count": -1}},
        ]
        return list(self.collection.aggregate(pipeline))

    def get_network_breakdown(self) -> List[Dict]:
        pipeline = [
            {"$group": {"_id": "$network", "count": {"$sum": 1}}},
            {"$project": {"network": "$_id", "count": 1, "_id": 0}},
            {"$sort": {"count": -1}},
        ]
        return list(self.collection.aggregate(pipeline))

    def get_timeline_data(self, group_by: str = "day") -> List[Dict]:
        """Get SMS counts grouped by time period"""
        if group_by == "hour":
            date_format = "%Y-%m-%dT%H:00:00"
            group_id = {
                "year": {"$year": "$timestamp"},
                "month": {"$month": "$timestamp"},
                "day": {"$dayOfMonth": "$timestamp"},
                "hour": {"$hour": "$timestamp"},
            }
        elif group_by == "month":
            date_format = "%Y-%m"
            group_id = {
                "year": {"$year": "$timestamp"},
                "month": {"$month": "$timestamp"},
            }
        else:  # day
            date_format = "%Y-%m-%d"
            group_id = {
                "year": {"$year": "$timestamp"},
                "month": {"$month": "$timestamp"},
                "day": {"$dayOfMonth": "$timestamp"},
            }

        pipeline = [
            {
                "$group": {
                    "_id": group_id,
                    "total": {"$sum": 1},
                    "delivered": {
                        "$sum": {"$cond": [{"$eq": ["$status", "Delivered"]}, 1, 0]}
                    },
                    "failed": {
                        "$sum": {"$cond": [{"$eq": ["$status", "Failed"]}, 1, 0]}
                    },
                    "sent": {
                        "$sum": {"$cond": [{"$eq": ["$status", "Sent"]}, 1, 0]}
                    },
                    "pending": {
                        "$sum": {"$cond": [{"$eq": ["$status", "Pending"]}, 1, 0]}
                    },
                }
            },
            {"$sort": {"_id": 1}},
        ]
        results = list(self.collection.aggregate(pipeline))

        # Format period label
        formatted = []
        for r in results:
            g = r["_id"]
            if group_by == "hour":
                label = f"{g['year']}-{g['month']:02d}-{g['day']:02d} {g['hour']:02d}:00"
            elif group_by == "month":
                label = f"{g['year']}-{g['month']:02d}"
            else:
                label = f"{g['year']}-{g['month']:02d}-{g['day']:02d}"

            formatted.append({
                "period": label,
                "total": r["total"],
                "delivered": r["delivered"],
                "failed": r["failed"],
                "sent": r["sent"],
                "pending": r["pending"],
            })

        return formatted

    def get_dashboard_stats(self) -> Dict:
        total = self.collection.count_documents({})
        status_breakdown = self.get_status_breakdown()
        operator_breakdown = self.get_operator_breakdown()
        network_breakdown = self.get_network_breakdown()
        fake_count = self.collection.count_documents({"fake": True})

        # Date range
        oldest = self.collection.find_one({}, sort=[("timestamp", ASCENDING)])
        newest = self.collection.find_one({}, sort=[("timestamp", DESCENDING)])
        date_range = {
            "start": oldest["timestamp"].isoformat() if oldest else None,
            "end": newest["timestamp"].isoformat() if newest else None,
        }

        return {
            "total_records": total,
            "status_breakdown": status_breakdown,
            "operator_breakdown": operator_breakdown,
            "network_breakdown": network_breakdown,
            "fake_count": fake_count,
            "date_range": date_range,
        }

    def count_records(self) -> int:
        return self.collection.count_documents({})

    def delete_all(self) -> int:
        return self.collection.delete_many({}).deleted_count


# Global singleton
sms_db: Optional[SMSDatabase] = None


def get_db() -> SMSDatabase:
    global sms_db
    if sms_db is None:
        sms_db = SMSDatabase()
        sms_db.connect()
    return sms_db
