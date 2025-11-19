# Real Estate Sensor App - Backend

FastAPI backend for the Real Estate Sensor Application.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python main.py
```

The server will start on `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints

- `GET /properties` - List all properties
- `GET /properties/{property_id}` - Get property details with rooms
- `GET /properties/{property_id}/rooms/{room_id}/history` - Get historical sensor data
- `GET /properties/{property_id}/rooms/{room_id}/comfort` - Get comfort evaluation
- `GET /properties/{property_id}/rooms/{room_id}/latest` - Get latest sensor readings
- `GET /customer-profiles` - List customer profiles

## Database

SQLite database (`sensor_app.db`) will be created automatically on first run.
The database is automatically seeded with sample properties and customer profiles.

