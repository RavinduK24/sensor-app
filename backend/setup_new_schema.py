"""
Setup script for new database schema with realtime and historical readings
Run this once to set up the new database structure
"""
import os
from database import engine, Base, SessionLocal
from models import Property, CustomerProfile, SensorReading, RealtimeReading, HistoricalReading
from seed_data import seed_database

def setup_database():
    """Set up database with new schema"""
    
    print("=" * 60)
    print("Setting up database with new schema...")
    print("=" * 60)
    
    # Create all tables (will create new tables if they don't exist)
    print("\n1. Creating/updating database tables...")
    Base.metadata.create_all(bind=engine)
    print("   ✓ Tables created/updated")
    
    # Seed initial data
    print("\n2. Seeding initial data...")
    db = SessionLocal()
    seed_database(db)
    db.close()
    print("   ✓ Initial data seeded")
    
    # Check if we need to migrate historical data
    db = SessionLocal()
    sensor_reading_count = db.query(SensorReading).count()
    historical_reading_count = db.query(HistoricalReading).count()
    db.close()
    
    print(f"\n3. Database status:")
    print(f"   - Sensor readings (old data): {sensor_reading_count}")
    print(f"   - Historical readings (new): {historical_reading_count}")
    
    if sensor_reading_count > 0 and historical_reading_count == 0:
        print("\n4. Historical data migration needed!")
        print("   Run: python populate_historical.py")
        print("   This will migrate old sensor readings to the new historical format")
    else:
        print("\n4. No historical data migration needed")
    
    print("\n" + "=" * 60)
    print("Setup complete! You can now start the application:")
    print("  python main.py")
    print("=" * 60)

if __name__ == "__main__":
    setup_database()

