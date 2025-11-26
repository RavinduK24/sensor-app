from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base

class SensorType(enum.Enum):
    LIGHT = "LIGHT"
    HUMIDITY = "HUMIDITY"
    TEMPERATURE = "TEMPERATURE"
    SOUND = "SOUND"
    AIR_QUALITY = "AIR_QUALITY"

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    description = Column(String)
    image_url = Column(String)
    
    sensor_readings = relationship("SensorReading", back_populates="property", cascade="all, delete-orphan")
    realtime_readings = relationship("RealtimeReading", back_populates="property", cascade="all, delete-orphan")
    historical_readings = relationship("HistoricalReading", back_populates="property", cascade="all, delete-orphan")

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    sensor_type = Column(SQLEnum(SensorType))
    value = Column(Float)
    
    property = relationship("Property", back_populates="sensor_readings")

class RealtimeReading(Base):
    """Stores current day's sensor readings with high frequency (<10min sample rate)"""
    __tablename__ = "realtime_readings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    sensor_type = Column(SQLEnum(SensorType))
    value = Column(Float)
    
    property = relationship("Property", back_populates="realtime_readings")

class HistoricalReading(Base):
    """Stores historical daily averages for past days"""
    __tablename__ = "historical_readings"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    date = Column(Date, index=True)  # The date of the reading
    sensor_type = Column(SQLEnum(SensorType))
    avg_value = Column(Float)  # Average value for the whole day
    
    property = relationship("Property", back_populates="historical_readings")

class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, unique=True, index=True)
    description = Column(String)

