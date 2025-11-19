# System Architecture - Smart Real Estate Sensor Platform

Complete architectural overview of the application.

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                     http://localhost:5173                    │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP/JSON
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    REACT FRONTEND (Vite)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                       App.jsx                        │   │
│  │  • State Management                                  │   │
│  │  • Customer Profile Selection                        │   │
│  │  • Property List Management                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ PropertyList│  │PropertyDetail│  │  CameraDemo     │   │
│  │   Component │  │  Component   │  │   Component     │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐                         │
│  │ RoomComfort │  │ Historical   │                         │
│  │  Component  │  │    Charts    │                         │
│  └─────────────┘  └──────────────┘                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    api.js (Axios)                    │   │
│  │  • getProperties()                                   │   │
│  │  • getProperty()                                     │   │
│  │  • getRoomComfort()                                  │   │
│  │  • getRoomHistory()                                  │   │
│  │  • getLatestReadings()                               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ HTTP/JSON
                          │ http://localhost:8000
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  FASTAPI BACKEND (Python)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                     main.py                          │   │
│  │  • API Endpoints (6 routes)                          │   │
│  │  • CORS Middleware                                   │   │
│  │  • Startup/Shutdown Events                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  models.py  │  │  schemas.py  │  │  database.py    │   │
│  │  ORM Models │  │  Validation  │  │  DB Config      │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
│                                                              │
│  ┌─────────────────────┐  ┌──────────────────────────────┐ │
│  │ sensor_simulator.py │  │  comfort_evaluator.py        │ │
│  │ Background Task     │  │  Scoring Algorithm           │ │
│  │ Generates data      │  │  Preference Matching         │ │
│  │ Every 15 seconds    │  │  Insights Generation         │ │
│  └─────────────────────┘  └──────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              seed_data.py                            │   │
│  │  • Initial Properties                                │   │
│  │  • Rooms                                             │   │
│  │  • Customer Profiles                                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          │ SQLAlchemy ORM
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   SQLITE DATABASE                            │
│                   sensor_app.db                              │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  properties  │  │    rooms     │  │sensor_readings  │   │
│  │  table       │  │    table     │  │    table        │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │            customer_profiles table                   │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### 1. Initial Page Load

```
User Opens Browser
    ↓
React App Loads (main.jsx → App.jsx)
    ↓
useEffect Hook Triggered
    ↓
getProperties('Working Adult') API Call
    ↓
FastAPI Endpoint: GET /properties?customer_type=Working Adult
    ↓
Backend Queries Database for All Properties
    ↓
For Each Property:
    ComfortEvaluator.evaluate_property_comfort()
    ↓
    Query Latest Sensor Readings
    ↓
    Calculate Weighted Score Based on Customer Preferences
    ↓
    Return Overall Comfort Score
    ↓
Sort Properties by Comfort Score (Highest First)
    ↓
Return JSON Array to Frontend
    ↓
Frontend Updates State: setProperties(data)
    ↓
React Re-renders PropertyList Component
    ↓
User Sees 3 Property Cards Ranked by Best Match
```

### 2. Selecting a Property

```
User Clicks Property Card
    ↓
onSelectProperty(property) Callback
    ↓
setSelectedProperty(property)
    ↓
React Re-renders PropertyDetail Component
    ↓
useEffect Triggered (propertyId Changed)
    ↓
getProperty(propertyId) API Call
    ↓
FastAPI Endpoint: GET /properties/{id}
    ↓
Backend Queries Database for Property + Rooms
    ↓
Return Property with Rooms Array
    ↓
Frontend Updates State: setProperty(data)
    ↓
Auto-select First Room (Bedroom if available)
    ↓
React Re-renders Room Tabs
    ↓
User Sees Property Details
```

### 3. Loading Room Comfort Data

```
Room Selected
    ↓
RoomComfort Component Mounts
    ↓
useEffect Triggered
    ↓
getRoomComfort(propertyId, roomId, customerType) API Call
    ↓
FastAPI Endpoint: GET /properties/{id}/rooms/{roomId}/comfort
    ↓
Backend: ComfortEvaluator.evaluate_room_comfort()
    ↓
For Each Sensor Type (5 total):
    ↓
    Query Latest Reading from Database
    ↓
    Get Customer Preferences for Sensor Type
    ↓
    Apply Time-of-Day Adjustments
    ↓
    Calculate Score (0-100)
    ↓
    Determine Status (Excellent/Good/Fair/Poor)
    ↓
    Generate Insight Message
    ↓
Calculate Overall Room Score (Weighted Average)
    ↓
Determine Comfort Level
    ↓
Generate Top 4 Insights
    ↓
Return JSON with Scores, Status, Insights
    ↓
Frontend Updates State: setComfort(data)
    ↓
React Re-renders Comfort Display
    ↓
User Sees Scores, Sensors, Insights
    ↓
Set Interval: Refresh Every 30 Seconds
```

### 4. Loading Historical Charts

```
Room Selected
    ↓
HistoricalCharts Component Mounts
    ↓
useEffect Triggered
    ↓
Parallel API Calls:
    getRoomHistory(propertyId, roomId, 2) +
    getLatestReadings(propertyId, roomId)
    ↓
FastAPI Endpoints:
    GET /properties/{id}/rooms/{roomId}/history?hours=2
    GET /properties/{id}/rooms/{roomId}/latest
    ↓
Backend Queries Sensor Readings:
    WHERE timestamp >= (now - 2 hours)
    ORDER BY timestamp ASC
    ↓
Return Array of Readings with Timestamps
    ↓
Frontend Transforms Data:
    Group by Timestamp
    Create Chart Data Structure:
    [{ time: "10:30", TEMPERATURE: 22, HUMIDITY: 45, ... }, ...]
    ↓
Update State: setHistoricalData(), setLatestReadings()
    ↓
Recharts Re-renders Multi-line Chart
    ↓
User Sees 2-hour Trends
    ↓
Set Interval: Refresh Every 15 Seconds
```

### 5. Background Sensor Simulation

```
Backend Startup
    ↓
sensor_simulator.py Starts as Background Task
    ↓
Every 15 Seconds:
    ↓
    For Each Property:
        ↓
        For Each Room:
            ↓
            For Each Sensor Type:
                ↓
                Generate Realistic Value:
                    • Temperature: 15-30°C with property baseline
                    • Humidity: 20-80% with variation
                    • Light: 0-1000 lux (day/night cycle)
                    • Sound: 20-90 dB (property baseline)
                    • Air Quality: 0-100 (property profile)
                ↓
                Create SensorReading Record
                ↓
                Insert into Database
    ↓
Old Data Cleanup (keep last 24 hours)
    ↓
Repeat Forever Until Shutdown
```

### 6. Switching Customer Profile

```
User Selects "Stay-home Elderly" from Dropdown
    ↓
onChange Event Triggered
    ↓
handleCustomerTypeChange('Stay-home Elderly')
    ↓
setCustomerType('Stay-home Elderly')
    ↓
useEffect Hook Triggered (customerType Changed)
    ↓
loadProperties() Called
    ↓
getProperties('Stay-home Elderly') API Call
    ↓
Backend Re-evaluates All Properties:
    Use Stay-home Elderly Preferences:
        • Warmer temps (22-25°C)
        • Softer light (300-600 lux)
        • Quieter (20-35 dB)
        • Higher air quality weight
    ↓
    Recalculate All Comfort Scores
    ↓
    Re-sort Properties by New Scores
    ↓
Return Updated Property List
    ↓
Frontend Updates State
    ↓
React Re-renders:
    • Property List (new order)
    • Selected Property Details
    • Room Comfort (new scores)
    • Insights (new recommendations)
    ↓
User Sees Personalized Results
```

---

## 🎯 Component Communication

### Parent-Child Data Flow

```
App.jsx (Parent)
│
├── State:
│   ├── properties: Array
│   ├── selectedProperty: Object
│   ├── customerType: String
│   └── loading/error: Boolean/String
│
├── Props to PropertyList:
│   ├── properties → List to display
│   ├── selectedProperty → Currently selected
│   └── onSelectProperty → Callback function
│
└── Props to PropertyDetail:
    ├── propertyId → Which property to show
    ├── customerType → For scoring
    └── onCustomerTypeChange → Profile switch callback
    │
    └── PropertyDetail (Child)
        │
        ├── State:
        │   ├── property: Object
        │   └── selectedRoom: Object
        │
        ├── Props to RoomComfort:
        │   ├── propertyId
        │   ├── room
        │   └── customerType
        │
        ├── Props to HistoricalCharts:
        │   ├── propertyId
        │   └── room
        │
        └── Props to CameraDemo:
            ├── customerType
            └── onCustomerTypeChange
```

---

## 🗄️ Database Schema

### Tables

#### 1. properties
```sql
CREATE TABLE properties (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    image_url TEXT
);
```

#### 2. rooms
```sql
CREATE TABLE rooms (
    id INTEGER PRIMARY KEY,
    property_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id)
);
```

#### 3. sensor_readings
```sql
CREATE TABLE sensor_readings (
    id INTEGER PRIMARY KEY,
    property_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    sensor_type TEXT NOT NULL,  -- TEMPERATURE, HUMIDITY, LIGHT, SOUND, AIR_QUALITY
    value REAL NOT NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);
```

#### 4. customer_profiles
```sql
CREATE TABLE customer_profiles (
    id INTEGER PRIMARY KEY,
    label TEXT UNIQUE NOT NULL,
    description TEXT
);
```

### Relationships
```
properties 1 ──── M rooms
properties 1 ──── M sensor_readings
rooms 1 ──── M sensor_readings
```

---

## 🔌 API Endpoints

### 1. GET /
**Purpose:** Health check  
**Response:** `{"message": "Real Estate Sensor API", "version": "1.0.0"}`

### 2. GET /properties
**Purpose:** Get all properties with comfort scores  
**Query Params:** `customer_type` (default: "Working Adult")  
**Response:**
```json
[
  {
    "id": 1,
    "name": "Modern City Loft",
    "address": "123 Downtown Avenue",
    "description": "A bright, modern loft...",
    "image_url": "https://...",
    "overall_comfort_score": 85.5,
    "comfort_level": "Excellent"
  }
]
```

### 3. GET /properties/{id}
**Purpose:** Get property details with rooms  
**Response:**
```json
{
  "id": 1,
  "name": "Modern City Loft",
  "address": "123 Downtown Avenue",
  "description": "...",
  "image_url": "...",
  "rooms": [
    {"id": 1, "property_id": 1, "name": "Bedroom"},
    {"id": 2, "property_id": 1, "name": "Living Room"}
  ]
}
```

### 4. GET /properties/{id}/rooms/{roomId}/comfort
**Purpose:** Get comfort analysis for a room  
**Query Params:** `customer_type`  
**Response:**
```json
{
  "room_id": 1,
  "room_name": "Bedroom",
  "overall_score": 88.2,
  "comfort_level": "Excellent",
  "sensors": [
    {
      "sensor_type": "TEMPERATURE",
      "value": 22.3,
      "status": "Excellent",
      "score": 95.0,
      "insight": "Temperature is in the ideal range..."
    }
  ],
  "insights": [
    "This room provides excellent comfort...",
    "Temperature is ideal for working adults..."
  ]
}
```

### 5. GET /properties/{id}/rooms/{roomId}/history
**Purpose:** Get historical sensor readings  
**Query Params:** `hours` (default: 24)  
**Response:**
```json
[
  {
    "id": 1,
    "property_id": 1,
    "room_id": 1,
    "timestamp": "2025-11-14T10:30:00",
    "sensor_type": "TEMPERATURE",
    "value": 22.3
  }
]
```

### 6. GET /properties/{id}/rooms/{roomId}/latest
**Purpose:** Get latest reading for each sensor type  
**Response:**
```json
{
  "TEMPERATURE": {
    "value": 22.3,
    "timestamp": "2025-11-14T10:30:00"
  },
  "HUMIDITY": {
    "value": 45.2,
    "timestamp": "2025-11-14T10:30:00"
  }
}
```

---

## ⚙️ Configuration

### Backend Configuration
- **Host:** 0.0.0.0
- **Port:** 8000
- **Reload:** Enabled (development)
- **CORS:** Allowed for all origins (development)
- **Database:** SQLite (sensor_app.db)
- **Sensor Interval:** 15 seconds

### Frontend Configuration
- **Host:** localhost
- **Port:** 5173
- **API Base URL:** http://localhost:8000
- **Auto Open:** Enabled
- **HMR:** Enabled (Hot Module Replacement)

---

## 🔄 Background Processes

### Sensor Simulator
- **File:** `backend/sensor_simulator.py`
- **Frequency:** Every 15 seconds
- **Action:** Generate sensor readings for all rooms
- **Cleanup:** Keep last 24 hours of data

### Frontend Polling
- **Room Comfort:** Every 30 seconds
- **Historical Charts:** Every 15 seconds
- **Method:** setInterval in useEffect hooks

---

## 🛡️ Security Considerations

### CORS
- Development: All origins allowed
- Production: Should restrict to frontend domain

### Data Validation
- Pydantic schemas validate all API inputs
- SQLAlchemy ORM prevents SQL injection
- React auto-escapes content (XSS protection)

### Error Handling
- Backend: FastAPI exception handlers
- Frontend: Try-catch blocks with user-friendly messages

---

## 📊 Performance Characteristics

### Response Times
- GET /properties: ~50-100ms
- GET /properties/{id}: ~20-30ms
- GET room comfort: ~30-50ms
- GET room history: ~50-100ms (varies with data volume)

### Database Queries
- Indexed on: id, timestamp, sensor_type
- Optimized with ORM eager loading
- Cleanup prevents table bloat

### Frontend Rendering
- React virtual DOM optimizations
- Recharts canvas rendering
- No unnecessary re-renders

---

## 🚀 Deployment Architecture

### Production Setup (Recommended)

```
Internet
    ↓
┌─────────────────┐
│  CDN (Cloudflare│
│  /CloudFront)   │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Load Balancer  │
│  (ALB/nginx)    │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│Frontend│ │Frontend│  (React SPA - Static Files)
│Server 1│ │Server 2│
└────────┘ └────────┘
    │         │
    └────┬────┘
         ↓
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌────────┐ ┌────────┐
│Backend │ │Backend │  (FastAPI + Gunicorn)
│Server 1│ │Server 2│
└────┬───┘ └───┬────┘
     │         │
     └────┬────┘
          ↓
┌─────────────────┐
│  PostgreSQL DB  │  (RDS/managed instance)
└─────────────────┘
```

---

**This architecture provides a scalable, maintainable, and performant real estate sensor platform!** 🏗️
