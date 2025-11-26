import asyncio
import random
from datetime import datetime, time, timezone, timedelta
from sqlalchemy.orm import Session
from models import RealtimeReading, SensorType, Property
from database import SessionLocal

# GMT+8 timezone
GMT_PLUS_8 = timezone(timedelta(hours=8))

class SensorSimulator:
    """Simulates realistic sensor readings for all properties with different sample rates"""
    
    # Sample rates in seconds for each sensor type
    SAMPLE_RATES = {
        SensorType.TEMPERATURE: 600,      # 10 minutes for real-time
        SensorType.HUMIDITY: 600,          # 10 minutes for real-time
        SensorType.AIR_QUALITY: 10,        # 10 seconds for real-time
        SensorType.SOUND: 1,               # 1 second for real-time
        SensorType.LIGHT: 600,             # 10 minutes for real-time
    }
    
    # Property-specific profiles based on requirements
    # Each profile has day/night ranges for realistic simulation
    PROPERTY_PROFILES = [
        # Property 1
        {
            "temp_day": (23, 25), "temp_night": (21, 22),
            "humidity": (45, 55),
            "light_day": (600, 800), "light_night": (0, 10),
            "aq": (5, 8),
            "sound_day": (40, 45), "sound_night": (35, 38)
        },
        # Property 2
        {
            "temp_day": (22, 24), "temp_night": (21, 22),
            "humidity": (40, 50),
            "light_day": (1200, 1500), "light_night": (0, 50),
            "aq": (10, 15),
            "sound_day": (65, 70), "sound_night": (45, 50)
        },
        # Property 3
        {
            "temp_day": (22, 24), "temp_night": (19, 20),
            "humidity": (45, 55),
            "light_day": (500, 700), "light_night": (0, 5),
            "aq": (3, 7),
            "sound_day": (50, 55), "sound_night": (30, 35)
        },
        # Property 4
        {
            "temp_day": (21, 23), "temp_night": (19, 20),
            "humidity": (50, 60),
            "light_day": (400, 600), "light_night": (0, 50),
            "aq": (8, 12),
            "sound_day": (60, 65), "sound_night": (40, 45)
        },
        # Property 5
        {
            "temp_day": (24, 27), "temp_night": (21, 22),
            "humidity": (40, 45),
            "light_day": (1800, 2000), "light_night": (0, 50),
            "aq": (5, 10),
            "sound_day": (45, 50), "sound_night": (38, 42)
        },
        # Property 6
        {
            "temp_day": (22, 23), "temp_night": (20, 21),
            "humidity": (45, 50),
            "light_day": (500, 600), "light_night": (0, 30),
            "aq": (7, 10),
            "sound_day": (48, 52), "sound_night": (38, 40)
        },
        # Property 7
        {
            "temp_day": (20, 24), "temp_night": (18, 19),
            "humidity": (55, 65),
            "light_day": (300, 500), "light_night": (0, 50),
            "aq": (8, 15),
            "sound_day": (50, 55), "sound_night": (40, 45)
        },
        # Property 8
        {
            "temp_day": (19, 20), "temp_night": (18, 19),
            "humidity": (60, 65),
            "light_day": (200, 300), "light_night": (0, 10),
            "aq": (5, 8),
            "sound_day": (45, 48), "sound_night": (35, 38)
        },
        # Property 9
        {
            "temp_day": (22, 22.5), "temp_night": (21, 21.5),
            "humidity": (48, 52),
            "light_day": (700, 900), "light_night": (0, 10),
            "aq": (1, 3),
            "sound_day": (42, 45), "sound_night": (32, 35)
        },
        # Property 10
        {
            "temp_day": (21, 23), "temp_night": (20, 21),
            "humidity": (45, 55),
            "light_day": (800, 1000), "light_night": (0, 50),
            "aq": (12, 18),
            "sound_day": (70, 80), "sound_night": (40, 45)
        },
        # Property 11 (Smart Home IoT) - Ideal conditions
        {
            "temp_day": (21.5, 22.5), "temp_night": (21, 22),
            "humidity": (42, 48),
            "light_day": (600, 800), "light_night": (0, 20),
            "aq": (2, 5),
            "sound_day": (30, 40), "sound_night": (25, 30)
        },
    ]
    
    def __init__(self):
        self.running = False
        self.last_readings = {}  # Store last reading time for each property and sensor type
        
    def is_day_time(self) -> bool:
        """Check if current time is day (6 AM to 6 PM) or night using GMT+8"""
        current_hour = datetime.now(GMT_PLUS_8).hour
        return 6 <= current_hour < 18
    
    def generate_reading(self, property_id: int, sensor_type: SensorType) -> float:
        """Generate a realistic sensor reading using normal distribution"""
        profile = self.PROPERTY_PROFILES[property_id - 1]
        is_day = self.is_day_time()
        
        # Get ranges based on sensor type and time of day
        if sensor_type == SensorType.TEMPERATURE:
            min_val, max_val = profile["temp_day"] if is_day else profile["temp_night"]
        elif sensor_type == SensorType.HUMIDITY:
            min_val, max_val = profile["humidity"]
        elif sensor_type == SensorType.LIGHT:
            min_val, max_val = profile["light_day"] if is_day else profile["light_night"]
        elif sensor_type == SensorType.SOUND:
            min_val, max_val = profile["sound_day"] if is_day else profile["sound_night"]
        elif sensor_type == SensorType.AIR_QUALITY:
            min_val, max_val = profile["aq"]
        else:
            return 0.0
        
        # Generate value using normal distribution
        # Mean is the center of the range, std is range/6 (covers 99.7% within range)
        mean = (min_val + max_val) / 2
        std = (max_val - min_val) / 6
        
        # Generate normal distribution value
        value = random.gauss(mean, std)
        
        # Ensure value stays within bounds
        value = max(min_val, min(max_val, value))
        
        return round(value, 2)
    
    async def simulate_sensors(self):
        """Background task to continuously generate sensor readings with different sample rates"""
        print(f"Starting sensor simulation with variable sample rates (GMT+8)...")
        self.running = True
        
        # Initialize last reading times per property and sensor type
        # Set to 0 to force immediate generation on first run
        for property_id in range(1, 12):
            self.last_readings[property_id] = {}
            for sensor_type in SensorType:
                self.last_readings[property_id][sensor_type] = 0
        
        while self.running:
            db = SessionLocal()
            try:
                current_time = datetime.now().timestamp()
                properties = db.query(Property).all()
                
                for property in properties:
                    for sensor_type in SensorType:
                        # Check if it's time to generate a reading for this property's sensor
                        time_since_last = current_time - self.last_readings[property.id][sensor_type]
                        sample_rate = self.SAMPLE_RATES[sensor_type]
                        
                        if time_since_last >= sample_rate:
                            value = self.generate_reading(property.id, sensor_type)
                            
                            # Use GMT+8 timezone
                            reading = RealtimeReading(
                                property_id=property.id,
                                sensor_type=sensor_type,
                                value=value,
                                timestamp=datetime.now(GMT_PLUS_8)
                            )
                            db.add(reading)
                            
                            # Update last reading time for this specific property and sensor
                            self.last_readings[property.id][sensor_type] = current_time
                
                db.commit()
                
            except Exception as e:
                print(f"Error in sensor simulation: {e}")
                db.rollback()
            finally:
                db.close()
            
            # Sleep for the smallest sample rate (1 second for sound)
            await asyncio.sleep(1)
    
    def stop(self):
        """Stop the sensor simulation"""
        self.running = False
        print("Stopping sensor simulation...")

# Global simulator instance
simulator = SensorSimulator()

