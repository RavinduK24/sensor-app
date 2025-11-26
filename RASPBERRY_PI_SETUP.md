# Raspberry Pi Sensor Setup Guide

This guide will help you set up a Raspberry Pi to send real-time sensor data to your backend as **Property 11**.

## Table of Contents
1. [Overview](#overview)
2. [Hardware Requirements](#hardware-requirements)
3. [Software Setup](#software-setup)
4. [Network Configuration](#network-configuration)
5. [Sensor Configuration](#sensor-configuration)
6. [Running the Script](#running-the-script)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Raspberry Pi will continuously read 5 types of sensors and send data to your backend API:

| Sensor Type    | Sample Rate | Description                    |
|----------------|-------------|--------------------------------|
| TEMPERATURE    | 10 minutes  | Room temperature in °C         |
| HUMIDITY       | 10 minutes  | Relative humidity in %         |
| AIR_QUALITY    | 10 seconds  | Air Quality Index (AQI)        |
| SOUND          | 1 second    | Sound level in dB              |
| LIGHT          | 10 minutes  | Light intensity in lux         |

---

## Hardware Requirements

### Raspberry Pi
- Any Raspberry Pi model with GPIO pins (3, 4, Zero, etc.)
- SD card (8GB+) with Raspberry Pi OS installed
- Power supply

### Sensors (Example Options)

#### Temperature & Humidity
- **DHT22** (recommended) or DHT11
- Connection: 3.3V, GND, Data to GPIO4

#### Light Sensor
- **BH1750** (I2C, recommended) or simple LDR
- Connection: 3.3V, GND, SDA, SCL

#### Air Quality
- **MQ-135** (analog) or SGP30 (I2C, recommended)
- Connection: Requires MCP3008 ADC if using analog sensor

#### Sound Sensor
- **MAX4466** (analog, recommended) or KY-038
- Connection: Requires MCP3008 ADC for analog sensor

#### Optional: Analog-to-Digital Converter
- **MCP3008** - if using analog sensors
- Connection: SPI interface

---

## Software Setup

### 1. Update Raspberry Pi OS

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install Python Dependencies

```bash
# Install pip if not already installed
sudo apt install python3-pip -y

# Install required Python packages
pip3 install requests

# For DHT sensors
pip3 install Adafruit_DHT

# For I2C sensors (BH1750, SGP30)
sudo apt install python3-smbus i2c-tools -y

# For GPIO access
pip3 install RPi.GPIO
```

### 3. Enable I2C (for BH1750, SGP30)

```bash
sudo raspi-config
# Navigate to: Interface Options → I2C → Enable
# Reboot after enabling

# Verify I2C is working
sudo i2cdetect -y 1
```

### 4. Enable SPI (for MCP3008 ADC)

```bash
sudo raspi-config
# Navigate to: Interface Options → SPI → Enable
# Reboot after enabling
```

### 5. Copy the Sensor Script

Transfer `raspberry_pi_sender.py` to your Raspberry Pi:

```bash
# From your Mac (in the sensor_app directory)
scp raspberry_pi_sender.py pi@raspberrypi.local:~/

# Or use USB drive, SFTP, etc.
```

Make it executable:

```bash
chmod +x ~/raspberry_pi_sender.py
```

---

## Network Configuration

Since your Raspberry Pi is on a **different network** than your backend, you have two options:

### Option 1: Using ngrok (Recommended for Testing)

On your **Mac** (where backend is running):

```bash
# Install ngrok
brew install ngrok

# If you haven't already, sign up at https://ngrok.com and get your auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN

# Start ngrok tunnel (keep this terminal open)
ngrok http 8000
```

Copy the `https://` URL from ngrok (e.g., `https://abc123.ngrok.io`) and update in your Raspberry Pi script:

```python
BACKEND_URL = "https://abc123.ngrok.io/realtime/ingest"
```

### Option 2: Port Forwarding (For Permanent Setup)

1. Find your Mac's local IP:
   ```bash
   ipconfig getifaddr en0
   ```

2. Set up port forwarding on your home router:
   - Forward external port 8000 → your Mac's IP:8000
   
3. Find your public IP:
   ```bash
   curl ifconfig.me
   ```

4. Update Raspberry Pi script:
   ```python
   BACKEND_URL = "http://YOUR_PUBLIC_IP:8000/realtime/ingest"
   ```

⚠️ **Security Note**: For production, use HTTPS and authentication!

---

## Sensor Configuration

Edit `raspberry_pi_sender.py` and update the sensor reading functions:

### Example: DHT22 Temperature/Humidity

```python
import Adafruit_DHT

DHT_SENSOR = Adafruit_DHT.DHT22
DHT_PIN = 4  # GPIO pin number

def read_temperature() -> float:
    humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
    return temperature if temperature else 0.0

def read_humidity() -> float:
    humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
    return humidity if humidity else 0.0
```

### Example: BH1750 Light Sensor

```python
import smbus

I2C_BUS = 1
BH1750_ADDR = 0x23

def read_light() -> float:
    bus = smbus.SMBus(I2C_BUS)
    data = bus.read_i2c_block_data(BH1750_ADDR, 0x10)
    lux = (data[1] + (256 * data[0])) / 1.2
    return lux
```

### Example: MCP3008 for Analog Sensors

```python
import spidev

spi = spidev.SpiDev()
spi.open(0, 0)
spi.max_speed_hz = 1350000

def read_analog_channel(channel):
    """Read from MCP3008 channel (0-7)"""
    adc = spi.xfer2([1, (8 + channel) << 4, 0])
    data = ((adc[1] & 3) << 8) + adc[2]
    return data

def read_sound() -> float:
    """Assuming sound sensor on channel 0"""
    raw_value = read_analog_channel(0)
    # Convert to dB (calibration needed)
    db = (raw_value / 1023.0) * 100  # Simple mapping
    return db

def read_air_quality() -> float:
    """Assuming MQ-135 on channel 1"""
    raw_value = read_analog_channel(1)
    # Convert to AQI (calibration needed)
    aqi = (raw_value / 1023.0) * 50  # Simple mapping
    return aqi
```

### Disable Sensors You Don't Have

If you don't have all sensors yet:

```python
ENABLED_SENSORS = {
    "TEMPERATURE": True,   # Have this
    "HUMIDITY": True,      # Have this
    "AIR_QUALITY": False,  # Don't have yet
    "SOUND": False,        # Don't have yet
    "LIGHT": True,         # Have this
}
```

---

## Running the Script

### Test Run (Manual)

```bash
cd ~
python3 raspberry_pi_sender.py
```

You should see output like:
```
2025-11-16 10:30:00 - INFO - Raspberry Pi Sensor Data Sender - Starting
2025-11-16 10:30:00 - INFO - Backend URL: https://abc123.ngrok.io/realtime/ingest
2025-11-16 10:30:00 - INFO - Property ID: 11
2025-11-16 10:30:01 - INFO - ✓ Sent SOUND: 42.0 (ID: 1234)
2025-11-16 10:30:10 - INFO - ✓ Sent AIR_QUALITY: 7.5 (ID: 1235)
...
```

Press `Ctrl+C` to stop.

### Run as a Service (Auto-start on Boot)

Create a systemd service:

```bash
sudo nano /etc/systemd/system/sensor-sender.service
```

Add this content:

```ini
[Unit]
Description=Raspberry Pi Sensor Data Sender
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi
ExecStart=/usr/bin/python3 /home/pi/raspberry_pi_sender.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable sensor-sender.service
sudo systemctl start sensor-sender.service

# Check status
sudo systemctl status sensor-sender.service

# View logs
sudo journalctl -u sensor-sender.service -f
```

---

## Troubleshooting

### Backend Connection Issues

**Problem**: `Failed to send TEMPERATURE reading: Connection refused`

**Solutions**:
1. Check backend is running: `curl http://localhost:8000` (on Mac)
2. Verify ngrok is running and URL is correct
3. Test endpoint manually:
   ```bash
   curl -X POST http://YOUR_BACKEND_URL/realtime/ingest \
     -H "Content-Type: application/json" \
     -d '{"property_id": 11, "sensor_type": "TEMPERATURE", "value": 25.0}'
   ```

### Sensor Reading Issues

**Problem**: `DHT sensor not found` or sensor returns `None`

**Solutions**:
1. Check wiring (power, ground, data pin)
2. Verify GPIO pin number in code matches physical wiring
3. Try different GPIO pins
4. Test with a simple script:
   ```python
   import Adafruit_DHT
   sensor = Adafruit_DHT.DHT22
   pin = 4
   humidity, temperature = Adafruit_DHT.read_retry(sensor, pin)
   print(f"Temp: {temperature}°C, Humidity: {humidity}%")
   ```

### I2C Devices Not Found

**Problem**: `i2cdetect` shows empty grid

**Solutions**:
1. Check I2C is enabled: `sudo raspi-config`
2. Verify wiring (SDA → GPIO2, SCL → GPIO3)
3. Try both I2C buses (0 and 1)

### Permission Errors

**Problem**: `Permission denied` on GPIO

**Solution**:
```bash
sudo usermod -a -G gpio,i2c,spi pi
# Log out and back in
```

### View Backend Logs

On your **Mac** (where backend runs):

```bash
# Backend logs should show incoming requests
# Check terminal where you ran: uvicorn main:app --reload
```

---

## Next Steps

1. ✅ Backend is running with property 11 seeded
2. ✅ Raspberry Pi script is configured and sending data
3. 🌐 Open frontend at `http://localhost:5173`
4. 🏠 Select **"Smart IoT Home (Raspberry Pi)"** from the property list
5. 📊 View real-time sensor data on the dashboard!

---

## Frontend Access

Once your Raspberry Pi is sending data:

1. Start the backend (if not already running):
   ```bash
   cd backend
   python main.py
   ```

2. Start the frontend (if not already running):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open browser: `http://localhost:5173`

4. Property 11 will appear in the list as **"Smart IoT Home (Raspberry Pi)"**

5. Click on it to see:
   - ✨ Latest sensor readings
   - 📈 24-hour charts
   - 📊 Historical trends
   - 🎯 Comfort scores

---

## Support

If you encounter issues:
1. Check logs: `sudo journalctl -u sensor-sender.service -f`
2. Verify network connectivity
3. Test backend endpoint manually
4. Ensure all sensors are properly wired

Happy monitoring! 🎉

