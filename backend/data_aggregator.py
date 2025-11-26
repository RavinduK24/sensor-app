import asyncio
from datetime import datetime, timedelta, date, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import RealtimeReading, HistoricalReading, SensorType, Property
from database import SessionLocal

# GMT+8 timezone
GMT_PLUS_8 = timezone(timedelta(hours=8))

class DataAggregator:
    """Manages aggregation of realtime data to historical hourly averages"""
    
    def __init__(self):
        self.running = False
        self.last_check_date = None
        
    async def aggregate_and_migrate(self):
        """Background task to aggregate hourly data and migrate at end of day"""
        print(f"Starting data aggregator (GMT+8)...")
        self.running = True
        self.last_check_date = datetime.now(GMT_PLUS_8).date()
        
        while self.running:
            db = SessionLocal()
            try:
                current_date = datetime.now(GMT_PLUS_8).date()
                
                # Check if it's a new day - if so, migrate yesterday's data
                if current_date != self.last_check_date:
                    print(f"New day detected! Migrating data from {self.last_check_date} to historical database...")
                    await self.migrate_previous_day_to_historical(db, self.last_check_date)
                    self.last_check_date = current_date
                
            except Exception as e:
                print(f"Error in data aggregator: {e}")
                db.rollback()
            finally:
                db.close()
            
            # Check every 5 minutes
            await asyncio.sleep(300)
    
    async def migrate_previous_day_to_historical(self, db: Session, target_date: date):
        """
        Migrate previous day's realtime data to historical database with daily average
        and clear the migrated realtime data
        """
        try:
            properties = db.query(Property).all()
            
            # Define the time range for the whole day
            start_of_day = datetime.combine(target_date, datetime.min.time())
            end_of_day = start_of_day + timedelta(days=1)
            
            for property in properties:
                for sensor_type in SensorType:
                    # Calculate average for the WHOLE day (not hourly)
                    avg_result = db.query(
                        func.avg(RealtimeReading.value).label('avg_value')
                    ).filter(
                        RealtimeReading.property_id == property.id,
                        RealtimeReading.sensor_type == sensor_type,
                        RealtimeReading.timestamp >= start_of_day,
                        RealtimeReading.timestamp < end_of_day
                    ).first()
                    
                    if avg_result and avg_result.avg_value is not None:
                        # Create historical record with daily average
                        historical_reading = HistoricalReading(
                            property_id=property.id,
                            date=target_date,
                            sensor_type=sensor_type,
                            avg_value=round(avg_result.avg_value, 2)
                        )
                        db.add(historical_reading)
            
            # Commit all historical records
            db.commit()
            print(f"Successfully migrated daily averages for {target_date} to historical database")
            
            # Now delete the realtime data for the target date
            deleted_count = db.query(RealtimeReading).filter(
                RealtimeReading.timestamp >= start_of_day,
                RealtimeReading.timestamp < end_of_day
            ).delete()
            
            db.commit()
            print(f"Cleared {deleted_count} realtime readings for {target_date}")
            
        except Exception as e:
            print(f"Error migrating data for {target_date}: {e}")
            db.rollback()
            raise
    
    
    def stop(self):
        """Stop the data aggregator"""
        self.running = False
        print("Stopping data aggregator...")

# Global aggregator instance
aggregator = DataAggregator()

