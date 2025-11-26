from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Property, RealtimeReading, HistoricalReading, SensorType
from comfort_evaluator import ComfortEvaluator

def inspect_property(db: Session, property_name: str):
    prop = db.query(Property).filter(Property.name == property_name).first()
    if not prop:
        print(f"Property '{property_name}' not found.")
        return

    print(f"\n--- Inspecting {prop.name} (ID: {prop.id}) ---")
    
    # Check Realtime Readings
    print("Latest Realtime Readings:")
    readings = ComfortEvaluator.get_latest_readings(db, prop.id)
    for sensor_type, data in readings.items():
        print(f"  {sensor_type.value}: {data['value']} (at {data['timestamp']})")

    # Check Historical Readings (last 5 days)
    print("Recent Historical Readings:")
    for sensor_type in ComfortEvaluator.SUPPORTED_SENSORS:
        history = db.query(HistoricalReading).filter(
            HistoricalReading.property_id == prop.id,
            HistoricalReading.sensor_type == sensor_type
        ).order_by(HistoricalReading.date.desc()).limit(5).all()
        
        if history:
            print(f"  {sensor_type.value}:")
            for h in history:
                print(f"    {h.date}: {h.avg_value}")
        else:
            print(f"  {sensor_type.value}: No history")

def main():
    db = SessionLocal()
    try:
        inspect_property(db, "Urban Studio")
        inspect_property(db, "Historic Townhouse")
        inspect_property(db, "Modern City Loft")
    finally:
        db.close()

if __name__ == "__main__":
    main()
