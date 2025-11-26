from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from models import SensorType

# Property schemas
class PropertyBase(BaseModel):
    name: str
    address: str
    description: str
    image_url: Optional[str] = None

class PropertyCreate(PropertyBase):
    pass

class Property(PropertyBase):
    id: int
    
    class Config:
        from_attributes = True

class PropertyWithComfort(Property):
    overall_comfort_score: float
    comfort_level: str

class PropertyDetail(Property):
    latest_comfort_score: Optional[float] = None
    
    class Config:
        from_attributes = True

# Sensor reading schemas
class SensorReadingBase(BaseModel):
    sensor_type: SensorType
    value: float

class SensorReadingCreate(SensorReadingBase):
    property_id: int

class SensorReading(SensorReadingBase):
    id: int
    property_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Customer profile schemas
class CustomerProfileBase(BaseModel):
    label: str
    description: str

class CustomerProfile(CustomerProfileBase):
    id: int
    
    class Config:
        from_attributes = True

# Comfort evaluation schemas
class SensorComfort(BaseModel):
    sensor_type: str
    current_value: Optional[float] = None
    current_value_timestamp: Optional[str] = None
    daily_average: Optional[float] = None
    daily_average_date: Optional[str] = None
    score: Optional[float] = None
    status: str
    insight: str
    percentage_match: Optional[float] = None
    days_tracked: int
    preferred_min: Optional[float] = None
    preferred_max: Optional[float] = None
    weight: float

class PropertyComfort(BaseModel):
    property_id: int
    property_name: str
    overall_score: float
    comfort_level: str
    sensors: List[SensorComfort]
    insights: List[str]

# Realtime reading ingestion schema (for Raspberry Pi)
class RealtimeReadingCreate(BaseModel):
    property_id: int
    sensor_type: SensorType
    value: float
    timestamp: Optional[datetime] = None  # If not provided, backend uses current time

