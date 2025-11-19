"""
Quick loader for synthetic historical data - ONE daily average per sensor
"""
import csv
import os
from datetime import datetime, date
from database import SessionLocal
from models import HistoricalReading, SensorType

def quick_load():
    """Fast load of synthetic data - stores ONE daily average per sensor per property"""
    db = SessionLocal()
    
    try:
        # Clear existing
        print("Clearing old data...")
        db.query(HistoricalReading).delete()
        db.commit()
        
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        synthetic_data_dir = os.path.join(base_dir, 'synthetic_data')
        
        batch = []
        batch_size = 1000
        
        for property_id in range(1, 11):
            csv_file = os.path.join(synthetic_data_dir, f'property_{property_id}_sensor_data.csv')
            if not os.path.exists(csv_file):
                continue
            
            print(f"Property {property_id}...", end=" ", flush=True)
            
            with open(csv_file, 'r') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    data_date = datetime.strptime(row['Date'], '%Y-%m-%d').date()
                    if data_date == date.today():
                        continue
                    
                    # Sensor data - ONE value per day per sensor (Air Quality in µg/m³)
                    sensors = {
                        SensorType.TEMPERATURE: float(row['Room_Temp']),
                        SensorType.AIR_QUALITY: float(row['Air_Quality']),
                        SensorType.HUMIDITY: float(row['Humidity']),
                        SensorType.LIGHT: float(row['Light_Intensity']),
                        SensorType.SOUND: float(row['Sound_Level'])
                    }
                    
                    # Create ONE record per sensor type (daily average)
                    for sensor_type, daily_val in sensors.items():
                        batch.append(HistoricalReading(
                            property_id=property_id,
                            date=data_date,
                            sensor_type=sensor_type,
                            avg_value=round(daily_val, 2)
                        ))
                        
                        if len(batch) >= batch_size:
                            db.bulk_save_objects(batch)
                            db.commit()
                            batch = []
            
            print("✓")
        
        # Save remaining
        if batch:
            db.bulk_save_objects(batch)
            db.commit()
        
        count = db.query(HistoricalReading).count()
        print(f"\n✓ Loaded {count:,} historical records")
        print(f"   (365 days × 10 properties × 5 sensors = {365*10*5:,} expected)")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    quick_load()

