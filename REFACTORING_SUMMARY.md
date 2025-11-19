# Sensor App Refactoring Summary

## Overview
Successfully refactored the sensor app to remove the room-based architecture and implement property-level sensor measurements with comprehensive historical data support.

## Major Changes

### 1. Database Schema Changes
- **Removed**: `Room` model completely
- **Updated**: `SensorReading` model to reference only properties (removed `room_id` foreign key)
- **Properties**: Now have 10 predefined properties loaded from CSV files

### 2. Backend API Changes

#### Removed Endpoints:
- `/properties/{property_id}/rooms/{room_id}/comfort`
- `/properties/{property_id}/rooms/{room_id}/history`
- `/properties/{property_id}/rooms/{room_id}/latest`

#### New Endpoints:
- `/properties/{property_id}/comfort` - Get property comfort evaluation
- `/properties/{property_id}/latest` - Get latest sensor readings for a property
- `/properties/{property_id}/history/24hour` - Get 24-hour historical data
- `/properties/{property_id}/history/monthly` - Get monthly trend (last 30 days)
- `/properties/{property_id}/history/yearly` - Get yearly trend (last 365 days)

### 3. Sensor Sample Rates (Real-Time)
As specified:
- **Temperature**: 10 minutes
- **Humidity**: 10 minutes
- **Air Quality**: 10 seconds
- **Sound**: 1 second
- **Light**: 10 minutes

### 4. Historical Data
- Loaded from 10 CSV files in `/synthetic_data/` directory
- Each file contains 365 days of sensor measurements
- One property per CSV file (property_1 through property_10)
- Daily aggregated data for monthly and yearly views

### 5. Frontend Components

#### Modified:
- **PropertyDetail.jsx**: Removed room selection, now displays property data directly
- **api.js**: Updated to use property-level endpoints
- **HistoricalCharts.jsx**: Completely rewritten to support three chart views:
  - 24-hour real-time view
  - Monthly trend view (30 days)
  - Yearly trend view (365 days)

#### Created:
- **PropertyComfort.jsx**: Renamed from RoomComfort, displays property-level comfort metrics

#### Removed:
- **RoomComfort.jsx**: Replaced by PropertyComfort

### 6. Property Profiles
All 10 properties are now defined with unique characteristics:
1. Modern City Loft
2. Quiet Suburban House
3. Smart Eco Apartment
4. Lakeside Villa
5. Urban Studio
6. Garden Cottage
7. Mountain Retreat
8. Beachfront Condo
9. Historic Townhouse
10. Penthouse Suite

## Files Modified

### Backend:
- `models.py` - Removed Room model
- `schemas.py` - Updated schemas for property-level data
- `main.py` - Updated all endpoints
- `comfort_evaluator.py` - Evaluate properties instead of rooms
- `sensor_simulator.py` - Implement variable sample rates per sensor type
- `seed_data.py` - Load 10 properties from CSV files

### Frontend:
- `src/api.js` - Updated API calls
- `src/components/PropertyDetail.jsx` - Removed room selection
- `src/components/PropertyComfort.jsx` - New component (renamed from RoomComfort)
- `src/components/HistoricalCharts.jsx` - Three chart views implementation
- `src/App.css` - Added styles for chart view selector

### Deleted:
- `backend/sensor_app.db` - Old database (will be recreated with new schema)
- `frontend/src/components/RoomComfort.jsx` - Replaced by PropertyComfort

## How to Run

### Backend:
```bash
cd backend
pip install -r requirements.txt
python main.py
```
The backend will:
1. Create a new database with the updated schema
2. Load all 10 properties from CSV files
3. Populate historical sensor data (365 days per property)
4. Start real-time sensor simulation with variable sample rates
5. Run on http://localhost:8000

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on http://localhost:5173

## Key Features

### Real-Time Data:
- Sound sensor updates every 1 second
- Air quality updates every 10 seconds
- Temperature, humidity, and light update every 10 minutes

### Historical Charts:
- **24-Hour View**: Shows detailed real-time and recent historical data
- **Monthly View**: Shows daily averages for the last 30 days
- **Yearly View**: Shows daily averages for the last 365 days from CSV files

### Comfort Analysis:
- Property-level comfort scores
- Customer profile-based recommendations (Working Adult, Stay-home Elderly)
- Real-time sensor status indicators
- Personalized insights

## Database Schema
```
properties
  - id (Primary Key)
  - name
  - address
  - description
  - image_url

sensor_readings
  - id (Primary Key)
  - property_id (Foreign Key → properties.id)
  - timestamp
  - sensor_type (TEMPERATURE, HUMIDITY, LIGHT, SOUND, AIR_QUALITY)
  - value

customer_profiles
  - id (Primary Key)
  - label
  - description
```

## Notes
- The old database file was deleted and will be recreated on first run
- All 10 properties have unique sensor characteristics based on their location/type
- Historical data from CSV files is automatically loaded during database seeding
- Real-time simulation continues to generate new data with proper sample rates

