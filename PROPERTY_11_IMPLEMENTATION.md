# Property 11 - Real Raspberry Pi Sensor Implementation

## Summary

Successfully implemented **Property 11** to receive real-time sensor data from a Raspberry Pi connected to actual hardware sensors. This property appears alongside your 10 synthetic properties and displays live data from your IoT setup.

---

## What Was Implemented

### 🔧 Backend Changes

#### 1. **New API Endpoint** (`backend/main.py`)
   - **POST** `/realtime/ingest` - Receives sensor readings from Raspberry Pi
   - Accepts: property_id, sensor_type, value, timestamp (optional)
   - Returns: confirmation with reading ID
   - Example usage:
     ```bash
     curl -X POST http://localhost:8000/realtime/ingest \
       -H "Content-Type: application/json" \
       -d '{
         "property_id": 11,
         "sensor_type": "TEMPERATURE",
         "value": 24.5
       }'
     ```

#### 2. **New Schema** (`backend/schemas.py`)
   - Added `RealtimeReadingCreate` for validating incoming sensor data
   - Supports all 5 sensor types: TEMPERATURE, HUMIDITY, AIR_QUALITY, SOUND, LIGHT

#### 3. **Property 11 Added** (`backend/seed_data.py`)
   - Name: "Smart IoT Home (Raspberry Pi)"
   - Address: "Real-time Sensor Network, Live Data"
   - Image: Smart home IoT image from Unsplash
   - Will appear in the property list after restarting backend

### 📱 Frontend Integration

**No changes needed!** The frontend automatically:
- ✅ Displays Property 11 in the property list
- ✅ Shows latest sensor readings
- ✅ Renders 24-hour charts
- ✅ Displays monthly/yearly trends
- ✅ Calculates comfort scores

### 🔌 Raspberry Pi Script

Created **`raspberry_pi_sender.py`** with:
- ⏱️ Sample rates matching your backend (1s for sound, 10s for air quality, 10min for others)
- 🔄 Continuous polling loop
- 📝 Comprehensive logging
- 🛠️ Easy sensor enable/disable configuration
- 🔌 Stub functions for all 5 sensor types (ready to implement)
- 🚀 Systemd service support for auto-start on boot

### 📚 Documentation

Created **`RASPBERRY_PI_SETUP.md`** with:
- Hardware requirements and sensor options
- Complete software installation guide
- Network configuration (ngrok and port forwarding)
- Sensor wiring examples (DHT22, BH1750, MCP3008, etc.)
- Troubleshooting guide
- Systemd service setup

---

## How It Works

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Raspberry Pi   │         │   Your Backend   │         │   Frontend   │
│   (Property 11) │         │   (Mac M2)       │         │   (Browser)  │
└─────────────────┘         └──────────────────┘         └──────────────┘
        │                            │                            │
        │  Read sensors every       │                            │
        │  1s - 10min               │                            │
        │                            │                            │
        │  POST /realtime/ingest    │                            │
        ├──────────────────────────>│                            │
        │  {property_id: 11,        │                            │
        │   sensor_type: "TEMP",    │  Store in                 │
        │   value: 24.5}            │  realtime_readings         │
        │                            │  table                    │
        │                            │                            │
        │  201 Created              │                            │
        │<──────────────────────────┤                            │
        │                            │                            │
        │                            │  GET /properties/11/latest│
        │                            │<──────────────────────────┤
        │                            │                            │
        │                            │  Return latest readings   │
        │                            ├──────────────────────────>│
        │                            │                            │
        │                            │  Display charts & scores  │
        │                            │                            │
```

---

## Next Steps to Get Started

### 1. **Restart Backend** (to load Property 11)

```bash
# Stop backend if running (Ctrl+C)
cd /Users/nurdauletnazarbay/Desktop/sensor_app/backend

# Delete old database to reseed with property 11
rm sensor_app.db

# Restart backend
python main.py
```

Property 11 will now be seeded into the database.

### 2. **Verify Property 11 Exists**

Open browser: `http://localhost:8000/properties`

You should see property 11 in the JSON response:
```json
{
  "id": 11,
  "name": "Smart IoT Home (Raspberry Pi)",
  "address": "Real-time Sensor Network, Live Data",
  ...
}
```

### 3. **Test the Endpoint** (without Raspberry Pi)

```bash
# Send a test reading
curl -X POST http://localhost:8000/realtime/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "property_id": 11,
    "sensor_type": "TEMPERATURE",
    "value": 24.5
  }'

# Check latest readings
curl http://localhost:8000/properties/11/latest
```

### 4. **View in Frontend**

```bash
# Start frontend (if not running)
cd /Users/nurdauletnazarbay/Desktop/sensor_app/frontend
npm run dev
```

Open: `http://localhost:5173`

You should see **"Smart IoT Home (Raspberry Pi)"** in the property list!

### 5. **Set Up Raspberry Pi**

Follow the complete guide in `RASPBERRY_PI_SETUP.md`:
1. Install dependencies
2. Configure sensors
3. Set up network access (ngrok or port forwarding)
4. Run the script
5. Enable as systemd service

---

## Sample Rates Reference

| Sensor Type    | Sample Rate | Frequency       |
|----------------|-------------|-----------------|
| SOUND          | 1 second    | Very High       |
| AIR_QUALITY    | 10 seconds  | High            |
| TEMPERATURE    | 10 minutes  | Medium          |
| HUMIDITY       | 10 minutes  | Medium          |
| LIGHT          | 10 minutes  | Medium          |

---

## Network Options

### Option A: ngrok (Easy, Temporary)
```bash
# On your Mac
ngrok http 8000

# Use the https://xyz.ngrok.io URL in raspberry_pi_sender.py
```

**Pros**: Easy setup, works from any network  
**Cons**: URL changes each time, requires ngrok account

### Option B: Port Forwarding (Permanent)
1. Find Mac's local IP: `ipconfig getifaddr en0`
2. Forward router port 8000 to Mac
3. Use public IP in raspberry_pi_sender.py

**Pros**: Permanent solution  
**Cons**: Requires router config, exposes port publicly

### Option C: Same Network (Simplest)
If you can connect Raspberry Pi to same Wi-Fi:
```python
BACKEND_URL = "http://192.168.1.x:8000/realtime/ingest"  # Mac's local IP
```

**Pros**: No tunnel needed, simple  
**Cons**: Only works on same network

---

## Files Created/Modified

### Created:
- ✅ `raspberry_pi_sender.py` - Raspberry Pi sensor script
- ✅ `RASPBERRY_PI_SETUP.md` - Complete setup guide
- ✅ `PROPERTY_11_IMPLEMENTATION.md` - This file

### Modified:
- ✅ `backend/schemas.py` - Added RealtimeReadingCreate
- ✅ `backend/main.py` - Added POST /realtime/ingest endpoint
- ✅ `backend/seed_data.py` - Added property 11 definition

---

## Testing Checklist

- [ ] Backend running on port 8000
- [ ] Property 11 appears in `/properties` endpoint
- [ ] Can manually POST to `/realtime/ingest`
- [ ] Latest readings show on `/properties/11/latest`
- [ ] Frontend displays Property 11 in list
- [ ] Can click Property 11 and see dashboard (even with no data)
- [ ] Raspberry Pi can reach backend URL
- [ ] Raspberry Pi script sends data successfully
- [ ] Real sensor readings appear in frontend charts

---

## Architecture Benefits

✅ **Scalable**: Easy to add more Raspberry Pi properties (12, 13, etc.)  
✅ **Flexible**: Can mix synthetic and real properties  
✅ **Unified**: Real data uses same database schema and API as synthetic  
✅ **Compatible**: Works with existing comfort evaluation system  
✅ **Real-time**: Data appears in frontend within seconds  

---

## Questions?

1. **Where are readings stored?**  
   → `realtime_readings` table (same as synthetic properties 1-10)

2. **How often should I send data?**  
   → Follow the sample rates in `SAMPLE_RATES` dictionary

3. **Can I add more Raspberry Pis?**  
   → Yes! Just add property 12, 13, etc. in seed_data.py

4. **What if network connection fails?**  
   → Script logs errors and retries on next cycle

5. **Do I need all 5 sensors?**  
   → No! Set `ENABLED_SENSORS` to disable sensors you don't have

---

Happy IoT monitoring! 🚀

