"""
SMS Dashboard - Pydantic data models
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class LocationPoint(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    city: str = ""
    region: str = ""


class EncryptionInfo(BaseModel):
    a5_1: bool = False
    a5_2: bool = False
    a5_3: bool = False


class NetworkInfo(BaseModel):
    ran: str = ""
    band: str = ""
    lac_tac: str = ""
    rx_level: Optional[int] = None
    encryption: EncryptionInfo = Field(default_factory=EncryptionInfo)


class SMSBase(BaseModel):
    sender: str = Field(..., description="Sender phone number")
    receiver: str = Field(..., description="Receiver phone number")
    msisdn: str = Field(..., description="MSISDN of monitored device")
    timestamp: datetime = Field(..., description="SMS timestamp")
    status: str = Field(..., description="SMS status: Sent/Delivered/Received/Pending/Failed")
    content: str = Field(default="", description="SMS content/keyword")
    description: str = Field(default="", description="Description notes")
    target: str = Field(default="", description="Target person name")
    group: str = Field(default="", description="Group identifier")
    operator: str = Field(default="", description="Mobile operator")
    network: str = Field(default="", description="Network type: 3G/4G/LTE/5G")
    country: str = Field(default="", description="Country")
    place: str = Field(default="", description="City/place name")
    model: str = Field(default="", description="Device model")
    fake: bool = Field(default=False, description="Whether this is a fake/spoofed SMS")
    location: LocationPoint = Field(default_factory=LocationPoint)
    network_info: NetworkInfo = Field(default_factory=NetworkInfo)
    imsi: str = Field(default="", description="IMSI identifier")
    imei: str = Field(default="", description="IMEI identifier")


class SMSCreate(SMSBase):
    pass


class SMSResponse(SMSBase):
    id: Optional[str] = Field(None, description="MongoDB record ID")

    class Config:
        from_attributes = True


class SMSFilterParams(BaseModel):
    number: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    operator: Optional[str] = None
    network: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    radius: Optional[float] = None


class SMSFrequencyData(BaseModel):
    number: str
    sent_count: int
    received_count: int
    total_count: int
    unique_contacts: int
    operators: list = []


class StatusBreakdown(BaseModel):
    status: str
    count: int
    percentage: float


class OperatorStats(BaseModel):
    operator: str
    count: int
    networks: list = []


class DashboardStats(BaseModel):
    total_records: int
    status_breakdown: list
    operator_breakdown: list
    network_breakdown: list
    fake_count: int
    date_range: dict
