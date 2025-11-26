from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
import uvicorn
import asyncio

from database import engine, get_db, Base
from models import Property as PropertyModel, CustomerProfile as CustomerProfileModel, SensorReading, SensorType, RealtimeReading, HistoricalReading
import schemas
from data_aggregator import aggregator
from sensor_simulator import simulator
from comfort_evaluator import ComfortEvaluator
from datetime import datetime, timedelta, date, timezone
from collections import defaultdict

# GMT+8 timezone
GMT_PLUS_8 = timezone(timedelta(hours=8))

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Real Estate Sensor API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to initialize database
@app.on_event("startup")
async def startup_event():
    db = next(get_db())
    try:
        # Create initial properties if they don't exist
        existing = db.query(PropertyModel).first()
        if not existing:
            # Create sample properties
            sample_properties = [
                PropertyModel(
                    name="Sunny Apartment",
                    address="123 Main Street, City",
                    description="Bright and spacious apartment with great natural light",
                    image_url="https://via.placeholder.com/300x200?text=Sunny+Apartment"
                ),
                PropertyModel(
                    name="Modern Condo",
                    address="456 Park Avenue, City",
                    description="Contemporary condo with premium finishes and amenities",
                    image_url="https://via.placeholder.com/300x200?text=Modern+Condo"
                ),
                PropertyModel(
                    name="Cozy Townhouse",
                    address="789 Oak Road, City",
                    description="Charming townhouse perfect for families",
                    image_url="https://via.placeholder.com/300x200?text=Cozy+Townhouse"
                ),
                PropertyModel(
                    name="Luxury Penthouse",
                    address="321 Summit Street, City",
                    description="Exclusive penthouse with panoramic views",
                    image_url="https://via.placeholder.com/300x200?text=Luxury+Penthouse"
                ),
            ]
            for prop in sample_properties:
                db.add(prop)
            db.commit()
    finally:
        db.close()
    # Start data aggregator in background
    asyncio.create_task(aggregator.aggregate_and_migrate())
    # Start sensor simulator in background
    asyncio.create_task(simulator.simulate_sensors())

@app.get("/")
def read_root():
    return {"message": "Real Estate Sensor API", "version": "1.0.0"}

@app.get("/properties", response_model=List[schemas.PropertyWithComfort])
def get_properties(
    customer_type: str = ComfortEvaluator.DEFAULT_PROFILE, db: Session = Depends(get_db)
):
    """Get all properties with comfort scores for the selected customer type"""
    properties = db.query(PropertyModel).all()
    result = []
    
    for prop in properties:
        comfort_score = ComfortEvaluator.get_property_comfort_score(db, prop.id, customer_type)
        
        # Determine comfort level
        if comfort_score >= 85:
            comfort_level = "Excellent"
        elif comfort_score >= 70:
            comfort_level = "Good"
        elif comfort_score >= 50:
            comfort_level = "Fair"
        else:
            comfort_level = "Poor"
        
        property_dict = {
            "id": prop.id,
            "name": prop.name,
            "address": prop.address,
            "description": prop.description,
            "image_url": prop.image_url,
            "overall_comfort_score": comfort_score,
            "comfort_level": comfort_level
        }
        result.append(property_dict)
    
    # Sort by comfort score (highest first)
    result.sort(key=lambda x: x["overall_comfort_score"], reverse=True)
    
    return result

@app.get("/properties/{property_id}", response_model=schemas.PropertyDetail)
def get_property(property_id: int, db: Session = Depends(get_db)):
    """Get a specific property"""
    property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property

@app.get("/customer-profiles", response_model=List[schemas.CustomerProfile])
def get_customer_profiles(db: Session = Depends(get_db)):
    """Get all customer profiles"""
    profiles = db.query(CustomerProfileModel).all()
    return profiles

@app.get("/properties/{property_id}/comfort", response_model=schemas.PropertyComfort)
def get_property_comfort(
    property_id: int, 
    customer_type: str = ComfortEvaluator.DEFAULT_PROFILE,
    db: Session = Depends(get_db)
):
    """Get comfort evaluation for a specific property"""
    property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    comfort_data = ComfortEvaluator.evaluate_property_comfort(db, property_id, customer_type)
    
    return {
        "property_id": property_id,
        "property_name": property.name,
        "overall_score": comfort_data["overall_score"],
        "comfort_level": comfort_data["comfort_level"],
        "sensors": comfort_data["sensors"],
        "insights": comfort_data["insights"]
    }

@app.post("/realtime/ingest", status_code=201)
def ingest_realtime_reading(
    payload: schemas.RealtimeReadingCreate,
    db: Session = Depends(get_db),
):
    """
    Ingest a single real-time sensor reading from external sources (e.g., Raspberry Pi).
    This endpoint is designed to receive sensor data from property 11 (Raspberry Pi).
    """
    # Ensure property exists
    property_obj = db.query(PropertyModel).filter(
        PropertyModel.id == payload.property_id
    ).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    # Use provided timestamp or server "now" in GMT+8
    ts = payload.timestamp if payload.timestamp else datetime.now(GMT_PLUS_8)

    reading = RealtimeReading(
        property_id=payload.property_id,
        sensor_type=payload.sensor_type,
        value=payload.value,
        timestamp=ts,
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    return {
        "id": reading.id,
        "property_id": reading.property_id,
        "sensor_type": reading.sensor_type.value,
        "value": reading.value,
        "timestamp": reading.timestamp.isoformat(),
    }

@app.get("/properties/{property_id}/latest")
def get_latest_readings(
    property_id: int,
    db: Session = Depends(get_db)
):
    """Get the latest reading for each sensor type in a property from realtime DB"""
    property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    latest_readings = {}
    
    for sensor_type in SensorType:
        reading = db.query(RealtimeReading).filter(
            RealtimeReading.property_id == property_id,
            RealtimeReading.sensor_type == sensor_type
        ).order_by(RealtimeReading.timestamp.desc()).first()
        
        if reading:
            latest_readings[sensor_type.value] = {
                "value": reading.value,
                "timestamp": reading.timestamp.isoformat()
            }
    
    return latest_readings

@app.get("/properties/{property_id}/history/24hour")
def get_24hour_history(
    property_id: int,
    db: Session = Depends(get_db)
):
    """Get 24-hour data with 10-minute intervals (144 data points) from current day's realtime data"""
    property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Get 10-minute interval averages for current day from realtime readings (GMT+8)
    current_date = datetime.now(GMT_PLUS_8).date()
    start_of_day = datetime.combine(current_date, datetime.min.time(), tzinfo=GMT_PLUS_8)
    
    grouped_data = {}
    
    for sensor_type in SensorType:
        interval_data = []
        
        # Create 144 data points (24 hours × 6 ten-minute intervals per hour)
        for interval_index in range(144):
            # Calculate time for this 10-minute interval
            start_time = start_of_day + timedelta(minutes=interval_index * 10)
            end_time = start_time + timedelta(minutes=10)
            
            # Calculate hour for x-axis (0-23, with decimals for positioning)
            hour_decimal = interval_index / 6.0
            
            # Get average for this 10-minute interval
            avg_result = db.query(
                func.avg(RealtimeReading.value).label('avg_value')
            ).filter(
                RealtimeReading.property_id == property_id,
                RealtimeReading.sensor_type == sensor_type,
                RealtimeReading.timestamp >= start_time,
                RealtimeReading.timestamp < end_time
            ).first()
            
            if avg_result and avg_result.avg_value is not None:
                interval_data.append({
                    "time": hour_decimal,
                    "value": round(avg_result.avg_value, 2)
                })
            else:
                # No data for this interval yet - still include it with null value
                interval_data.append({
                    "time": hour_decimal,
                    "value": None
                })
        
        grouped_data[sensor_type.value] = interval_data
    
    return grouped_data

@app.get("/properties/{property_id}/history/monthly")
def get_monthly_history(
    property_id: int,
    db: Session = Depends(get_db)
):
    """Get monthly trend (last 30 days) with daily averages from historical data"""
    property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Get readings from the last 30 days from historical database (GMT+8)
    since_date = datetime.now(GMT_PLUS_8).date() - timedelta(days=30)
    
    readings = db.query(
        HistoricalReading.date,
        HistoricalReading.sensor_type,
        HistoricalReading.avg_value
    ).filter(
        HistoricalReading.property_id == property_id,
        HistoricalReading.date >= since_date
    ).order_by(HistoricalReading.date.asc()).all()
    
    # Group by sensor type
    grouped_data = defaultdict(list)
    for reading in readings:
        grouped_data[reading.sensor_type.value].append({
            "date": str(reading.date),
            "value": reading.avg_value
        })
    
    return grouped_data

@app.get("/properties/{property_id}/history/yearly")
def get_yearly_history(
    property_id: int,
    db: Session = Depends(get_db)
):
    """Get yearly trend (last 365 days) with daily averages from historical data"""
    property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Get readings from the last 365 days from historical database (GMT+8)
    since_date = datetime.now(GMT_PLUS_8).date() - timedelta(days=365)
    
    readings = db.query(
        HistoricalReading.date,
        HistoricalReading.sensor_type,
        HistoricalReading.avg_value
    ).filter(
        HistoricalReading.property_id == property_id,
        HistoricalReading.date >= since_date
    ).order_by(HistoricalReading.date.asc()).all()
    
    # Group by sensor type
    grouped_data = defaultdict(list)
    for reading in readings:
        grouped_data[reading.sensor_type.value].append({
            "date": str(reading.date),
            "value": reading.avg_value
        })
    
    return grouped_data

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

