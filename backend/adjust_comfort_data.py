from datetime import date

from database import SessionLocal
from models import RealtimeReading, HistoricalReading, SensorType

# Desired comfort alignment per property
TARGET_VALUES = {
    1: {  # Modern City Loft -> Work from Home Adult
        SensorType.TEMPERATURE: 23.0,
        SensorType.HUMIDITY: 52.0,
        SensorType.AIR_QUALITY: 10.0,
        SensorType.LIGHT: 750.0,
        SensorType.SOUND: 40.0,
    },
    6: {  # Garden Cottage -> Families with Babies
        SensorType.TEMPERATURE: 22.2,
        SensorType.HUMIDITY: 56.0,
        SensorType.AIR_QUALITY: 7.0,
        SensorType.LIGHT: 350.0,
        SensorType.SOUND: 34.0,
    },
    9: {  # Historic Townhouse -> Elderly Residents
        SensorType.TEMPERATURE: 24.2,
        SensorType.HUMIDITY: 53.0,
        SensorType.AIR_QUALITY: 12.0,
        SensorType.LIGHT: 380.0,
        SensorType.SOUND: 34.0,
    },
    3: {  # Smart Eco Apartment -> Allergy/Asthma Sufferers
        SensorType.TEMPERATURE: 21.0,
        SensorType.HUMIDITY: 40.0,
        SensorType.AIR_QUALITY: 9.0,
        SensorType.LIGHT: 400.0,
        SensorType.SOUND: 36.0,
    },
}


def apply_values():
    session = SessionLocal()
    try:
        for property_id, sensors in TARGET_VALUES.items():
            for sensor_type, target_value in sensors.items():
                # Update realtime readings
                realtime_rows = (
                    session.query(RealtimeReading)
                    .filter(
                        RealtimeReading.property_id == property_id,
                        RealtimeReading.sensor_type == sensor_type,
                    )
                    .all()
                )
                for row in realtime_rows:
                    row.value = target_value

                # Update recent historical readings (latest 7 entries)
                historical_rows = (
                    session.query(HistoricalReading)
                    .filter(
                        HistoricalReading.property_id == property_id,
                        HistoricalReading.sensor_type == sensor_type,
                    )
                    .order_by(HistoricalReading.date.desc())
                    .limit(7)
                    .all()
                )
                for row in historical_rows:
                    row.avg_value = target_value

        session.commit()
        print("Comfort data adjusted successfully.")
    finally:
        session.close()


if __name__ == "__main__":
    apply_values()
