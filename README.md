# Smart Real Estate Sensor Application

A comprehensive web application for real estate agencies that matches customer preferences to properties based on real-time and historical sensor data for indoor comfort conditions.

## Overview

This application catalogs properties with 5 sensor measurements (Light, Humidity, Temperature, Sound, Air Quality) and intelligently matches them to customer requirements, providing insights on why each property should be considered based on ideal indoor conditions.

## Features

### Core Functionality

- **Property Catalog**: Browse multiple properties with comfort scores tailored to customer profiles
- **Sensor Monitoring**: Track 5 key environmental metrics:
  - Temperature (°C)
  - Humidity (%)
  - Light (lux)
  - Sound (dB)
  - Air Quality (0-100 scale)

### Customer Profiles

- **Working Adult**: Prefers slightly cooler temperatures at night, bright light during daytime, quiet evenings
- **Stay-home Elderly**: Prefers warmer temperatures, softer lighting, quieter environment overall

### Comfort Evaluation

- Real-time comfort scoring for each room (0-100 scale)
- Per-sensor status indicators (Excellent, Good, Fair, Poor)
- Intelligent insights explaining why properties match customer needs
- Time-of-day adjustments for preferences

### Data Visualization

- Historical charts showing sensor trends over time
- Real-time updates with live data streaming
- Room-by-room analysis (Bedroom, Living Room, etc.)

### Customer Recognition Demo

- Simulated customer type selection
- Optional webcam integration for demonstration
- Dynamic preference updates based on customer profile

## Architecture

### Backend (FastAPI)

- **Framework**: Python FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **Sensor Simulation**: Background task generating realistic readings every 15 seconds
- **Comfort Logic**: Sophisticated scoring algorithm considering time-of-day, room type, and customer preferences

### Frontend (React)

- **Framework**: React 18+ with Vite
- **Visualization**: Recharts for historical data charts
- **API Client**: Axios for backend communication
- **Styling**: Modern CSS with responsive design

## Installation & Setup

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the FastAPI server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Usage Guide

### For Users

1. **Select Customer Profile**: Use the dropdown in the header to choose between "Working Adult" or "Stay-home Elderly"

2. **Browse Properties**: View the property list on the left, sorted by comfort score for your profile

3. **Select a Property**: Click on any property to view detailed information

4. **Explore Rooms**: Use the room tabs to view comfort conditions for different areas (Bedroom, Living Room, etc.)

5. **View Comfort Analysis**:
   - Overall comfort score for the selected room
   - Individual sensor readings with status indicators
   - Insights explaining why the property matches your needs

6. **Check Historical Data**: Scroll down to see charts showing sensor trends over the past 2 hours

7. **Try Customer Recognition**: Use the camera demo section to simulate switching between customer profiles

### Demo Scenario

The application comes pre-loaded with 3 properties:

1. **Modern City Loft**: Bright with excellent natural lighting, higher ambient noise (city location), good air quality

2. **Quiet Suburban House**: Very quiet environment, stable temperatures, excellent for stay-home residents

3. **Smart Eco Apartment**: Advanced air quality management, optimal humidity control, best-in-class sensors

### Understanding Comfort Scores

- **85-100 (Excellent)**: All sensors within ideal ranges for your profile
- **70-84 (Good)**: Most sensors acceptable, minor deviations from ideal
- **50-69 (Fair)**: Some sensors outside preferred ranges
- **0-49 (Poor)**: Multiple sensors significantly outside comfort zones

## API Endpoints

### Properties
- `GET /properties?customer_type={type}` - List properties with comfort scores
- `GET /properties/{id}` - Get property details

### Rooms & Comfort
- `GET /properties/{id}/rooms/{room_id}/comfort?customer_type={type}` - Comfort evaluation
- `GET /properties/{id}/rooms/{room_id}/history?hours={hours}` - Historical sensor data
- `GET /properties/{id}/rooms/{room_id}/latest` - Latest readings

### Customer Profiles
- `GET /customer-profiles` - List available profiles

## Technical Details

### Sensor Simulation

The backend continuously generates realistic sensor readings with:
- Property-specific baseline values
- Room-type adjustments
- Time-of-day variations
- Random fluctuations for realism

### Comfort Scoring Algorithm

1. Fetch latest sensor readings for the room
2. Compare each reading against customer profile preferences
3. Calculate per-sensor score (0-100) based on ideal/acceptable ranges
4. Apply sensor weights (e.g., temperature more important for elderly)
5. Compute weighted average for overall score
6. Generate natural language insights

### Time-of-Day Adjustments

- **Light**: Varies significantly (bright during day, dim at night)
- **Temperature**: Slightly cooler preferences at night
- **Sound**: Lower tolerance for noise in evenings and nights
- **Humidity/Air Quality**: Consistent throughout day

## Project Structure

```
sensor_app/
├── backend/
│   ├── main.py                 # FastAPI application entry
│   ├── models.py               # Database models
│   ├── schemas.py              # Pydantic schemas
│   ├── database.py             # Database configuration
│   ├── seed_data.py            # Initial data seeding
│   ├── sensor_simulator.py     # Background sensor generation
│   ├── comfort_evaluator.py    # Comfort scoring logic
│   ├── requirements.txt        # Python dependencies
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PropertyList.jsx
│   │   │   ├── PropertyDetail.jsx
│   │   │   ├── RoomComfort.jsx
│   │   │   ├── HistoricalCharts.jsx
│   │   │   └── CameraDemo.jsx
│   │   ├── api.js              # API client
│   │   ├── App.jsx             # Main application
│   │   ├── App.css             # Styles
│   │   └── main.jsx            # Entry point
│   ├── package.json
│   └── README.md
└── README.md                    # This file
```

## Future Enhancements

- Real hardware sensor integration
- Actual facial recognition for customer identification
- Machine learning for personalized comfort recommendations
- Mobile app support
- Multi-language support
- Property comparison tool
- Booking/scheduling system
- Email notifications for comfort threshold breaches

## License

This project is created for educational and demonstration purposes.

## Support

For issues or questions, please refer to the individual README files in the backend and frontend directories.

