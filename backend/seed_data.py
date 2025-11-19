from sqlalchemy.orm import Session
from models import Property, CustomerProfile, SensorReading, SensorType
from datetime import datetime
import csv
import os

def seed_database(db: Session):
    # Check if data already exists
    if db.query(Property).count() > 0:
        print("Database already seeded, skipping...")
        return
    
    # Create customer profiles
    profiles = [
        CustomerProfile(
            label="Working Adult",
            description="Prefers slightly cooler temperatures at night, bright light during daytime, and quiet evenings."
        ),
        CustomerProfile(
            label="Stay-home Elderly",
            description="Prefers warmer temperatures, softer lighting, and quieter environment overall."
        )
    ]
    db.add_all(profiles)
    db.commit()
    
    # Property definitions
    property_definitions = [
        {
            "id": 1,
            "name": "Modern City Loft",
            "address": "123 Downtown Avenue, City Center",
            "description": "A bright, modern loft with excellent natural lighting and state-of-the-art ventilation. Located in the heart of the city with vibrant atmosphere.",
            "image_url": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"
        },
        {
            "id": 2,
            "name": "Quiet Suburban House",
            "address": "456 Maple Street, Green Valley",
            "description": "A peaceful family home in a quiet neighborhood with excellent temperature control and minimal noise pollution.",
            "image_url": "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800"
        },
        {
            "id": 3,
            "name": "Smart Eco Apartment",
            "address": "789 Innovation Boulevard, Tech District",
            "description": "An eco-friendly smart apartment with advanced air quality management, optimal humidity control, and intelligent lighting systems.",
            "image_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"
        },
        {
            "id": 4,
            "name": "Lakeside Villa",
            "address": "101 Waterfront Drive, Lake District",
            "description": "A stunning lakeside property with panoramic views, natural ventilation, and serene environment perfect for relaxation.",
            "image_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
        },
        {
            "id": 5,
            "name": "Urban Studio",
            "address": "222 Market Street, Downtown",
            "description": "A compact urban studio with smart home features, optimized for energy efficiency and modern living.",
            "image_url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"
        },
        {
            "id": 6,
            "name": "Garden Cottage",
            "address": "333 Rose Avenue, Botanical Gardens",
            "description": "A charming cottage surrounded by lush gardens, offering excellent air quality and natural lighting throughout the day.",
            "image_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"
        },
        {
            "id": 7,
            "name": "Mountain Retreat",
            "address": "444 Highland Road, Mountain View",
            "description": "A secluded mountain retreat with pristine air quality, peaceful environment, and stunning natural views.",
            "image_url": "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?w=800"
        },
        {
            "id": 8,
            "name": "Beachfront Condo",
            "address": "555 Ocean Boulevard, Coastal Area",
            "description": "A modern beachfront condo with natural sea breeze, abundant sunlight, and tranquil coastal atmosphere.",
            "image_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
        },
        {
            "id": 9,
            "name": "Historic Townhouse",
            "address": "666 Heritage Lane, Old Town",
            "description": "A beautifully restored historic townhouse with modern climate control while maintaining its classic charm.",
            "image_url": "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=800"
        },
        {
            "id": 10,
            "name": "Penthouse Suite",
            "address": "777 Skyline Tower, Financial District",
            "description": "A luxurious penthouse with panoramic city views, state-of-the-art environmental controls, and premium amenities.",
            "image_url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"
        },
        {
            "id": 11,
            "name": "Smart IoT Home (Raspberry Pi)",
            "address": "Real-time Sensor Network, Live Data",
            "description": "A cutting-edge smart home powered by Raspberry Pi with real-time sensor monitoring. Features live environmental data from actual IoT sensors including temperature, humidity, air quality, sound, and light sensors.",
            "image_url": "https://images.unsplash.com/photo-1558002038-1055907df827?w=800"
        }
    ]
    
    # Create properties
    properties = []
    for prop_def in property_definitions:
        prop = Property(**prop_def)
        db.add(prop)
        properties.append(prop)
    
    db.commit()
    print(f"Created {len(properties)} properties")
    
    # Load historical sensor data from CSV files
    synthetic_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "synthetic_data")
    
    for i in range(1, 11):
        csv_file = os.path.join(synthetic_data_dir, f"property_{i}_sensor_data.csv")
        if not os.path.exists(csv_file):
            print(f"Warning: CSV file not found: {csv_file}")
            continue
        
        print(f"Loading historical data for property {i}...")
        
        with open(csv_file, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Parse date
                date = datetime.strptime(row['Date'], '%Y-%m-%d')
                
                # Create sensor readings for each type
                readings = [
                    SensorReading(
                        property_id=i,
                        timestamp=date,
                        sensor_type=SensorType.TEMPERATURE,
                        value=float(row['Room_Temp'])
                    ),
                    SensorReading(
                        property_id=i,
                        timestamp=date,
                        sensor_type=SensorType.AIR_QUALITY,
                        value=float(row['Air_Quality'])
                    ),
                    SensorReading(
                        property_id=i,
                        timestamp=date,
                        sensor_type=SensorType.HUMIDITY,
                        value=float(row['Humidity'])
                    ),
                    SensorReading(
                        property_id=i,
                        timestamp=date,
                        sensor_type=SensorType.LIGHT,
                        value=float(row['Light_Intensity'])
                    ),
                    SensorReading(
                        property_id=i,
                        timestamp=date,
                        sensor_type=SensorType.SOUND,
                        value=float(row['Sound_Level'])
                    )
                ]
                
                db.add_all(readings)
        
        db.commit()
        print(f"Loaded historical data for property {i}")
    
    print("Database seeded successfully with all properties and historical sensor data!")

