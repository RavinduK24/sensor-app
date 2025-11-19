#!/usr/bin/env python3
"""
Raspberry Pi Sensor Data Sender
This script reads real sensor data from a Raspberry Pi and sends it to the backend API.

Hardware requirements:
- Raspberry Pi (any model with GPIO)
- Temperature/Humidity sensor (e.g., DHT22, DHT11)
- Light sensor (e.g., BH1750, LDR)
- Sound sensor (e.g., MAX4466, KY-038)
- Air quality sensor (e.g., MQ-135, SGP30)

Install required packages:
    pip3 install requests Adafruit_DHT smbus RPi.GPIO
"""

import time
import random
import requests
import logging
from datetime import datetime
from typing import Dict, Callable
from smbus2 import SMBus, i2c_msg #
# =============================================================================
# CONFIGURATION - Update these values for your setup
# =============================================================================

# Backend API URL - Replace with your actual backend URL
# If using ngrok: "https://your-ngrok-id.ngrok.io/realtime/ingest"
# If using local network: "http://192.168.1.x:8000/realtime/ingest"
BACKEND_URL = "http://172.20.10.3:8000/realtime/ingest"

# Property ID for this Raspberry Pi (should be 11)
PROPERTY_ID = 11

# Sample rates in seconds (matching your backend's rates)
SAMPLE_RATES = {
    "TEMPERATURE": 10,     # 10 minutes
    "HUMIDITY": 10,         # 10 minutes
    "AIR_QUALITY": 5,       # 10 seconds
    "SOUND": 1,              # 1 second
    "LIGHT": 10,            # 10 minutes
}

# Enable/disable specific sensors
ENABLED_SENSORS = {
    "TEMPERATURE": True,
    "HUMIDITY": True,
    "AIR_QUALITY": True,
    "SOUND": True,
    "LIGHT": True,
}

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/home/pi/iot/sensor_sender.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# =============================================================================
# SENSOR READING FUNCTIONS
# =============================================================================
# Replace these stub functions with actual sensor reading code for your hardware

# I2C setup
I2C_BUS = 1  # Usually 1 on Raspberry Pi
bus = SMBus(I2C_BUS)


# Define the Device Addresses here
DEV_ADDR_SHT4X = 0x44      # I2C address of SHT4X

def i2c_read(i2c_addr, number_of_bytes):
    with SMBus(I2C_BUS) as bus:
        read = i2c_msg.read(i2c_addr, number_of_bytes)
        bus.i2c_rdwr(read)
        return list(read)
    
def read_temperature() -> float:
    try:
        with SMBus(I2C_BUS) as bus:
            # Send the "measure high precision" command (0xFD)
            bus.write_byte(DEV_ADDR_SHT4X, 0xFD)
        time.sleep(0.01)  # Wait for measurement

        rx_bytes = i2c_read(DEV_ADDR_SHT4X, 6)
        if len(rx_bytes) != 6:
            raise ValueError("Did not receive 6 bytes from sensor")

        t_ticks = rx_bytes[0] * 256 + rx_bytes[1]
        checksum_t = rx_bytes[2]
        rh_ticks = rx_bytes[3] * 256 + rx_bytes[4]
        checksum_rh = rx_bytes[5]
        t_degC = -45 + 175 * t_ticks / 65535
        rh_pRH = -6 + 125 * rh_ticks / 65535
        rh_pRH = max(0, min(100, rh_pRH))  # Clamp between 0 and 100

        return t_degC
    except Exception as e:
        print(f"Error reading SHT4x: {e}")
        return 22


def read_humidity() -> float:
    try:
        with SMBus(I2C_BUS) as bus:
            # Send the "measure high precision" command (0xFD)
            bus.write_byte(DEV_ADDR_SHT4X, 0xFD)
        time.sleep(0.01)  # Wait for measurement

        rx_bytes = i2c_read(DEV_ADDR_SHT4X, 6)
        if len(rx_bytes) != 6:
            raise ValueError("Did not receive 6 bytes from sensor")

        t_ticks = rx_bytes[0] * 256 + rx_bytes[1]
        checksum_t = rx_bytes[2]
        rh_ticks = rx_bytes[3] * 256 + rx_bytes[4]
        checksum_rh = rx_bytes[5]
        t_degC = -45 + 175 * t_ticks / 65535
        rh_pRH = -6 + 125 * rh_ticks / 65535
        rh_pRH = max(0, min(100, rh_pRH))  # Clamp between 0 and 100

        return rh_pRH
    except Exception as e:
        print(f"Error reading SHT4x: {e}")
        return 50


I2C_BUS = 1  # Usually 1 on Raspberry Pi
DEVICE_ADDR = 0x4d
REG_PARTICLE_HIGH = 0x26
REG_PARTICLE_LOW = 0x27

REG_AVG_HIGH = 0x24
REG_AVG_LOW = 0x25
def read_air_quality() -> float:
    # Write register address (no stop between write and read)
    # Read high byte
    high = bus.read_byte_data(DEVICE_ADDR, REG_PARTICLE_HIGH)
    # Read low byte
    low = bus.read_byte_data(DEVICE_ADDR, REG_PARTICLE_LOW)
    # Combine to get 16-bit value
    value = (high << 8) | low
    print(f"Particle Concentration: {value} µg/m³")
    return round(value, 2)


def read_sound() -> float:
    
    return round(random.uniform(45, 55), 2)


def read_light() -> float:
    bus = SMBus(I2C_BUS)
    addr = 0x10

    # Write registers
    als_conf_0 = 0x00
    als_WH = 0x01
    als_WL = 0x02
    pow_sav = 0x03

    # Read registers
    als = 0x04

    # Configuration values for max range (0-120Klx)
    confValues = [0x00, 0x18]  # 1/4 gain, 100ms IT
    interrupt_high = [0x00, 0x00]
    interrupt_low = [0x00, 0x00]
    power_save_mode = [0x00, 0x00]

    # Write configuration to sensor
    bus.write_i2c_block_data(addr, als_conf_0, confValues)
    bus.write_i2c_block_data(addr, als_WH, interrupt_high)
    bus.write_i2c_block_data(addr, als_WL, interrupt_low)
    bus.write_i2c_block_data(addr, pow_sav, power_save_mode)

    # Wait for integration time (100ms) + margin
    time.sleep(0.01)  # 40ms

    # Read ALS data
    word = bus.read_word_data(addr, als)
    print(f"Raw ALS data: {word}")
    # Calculate lux
    gain = 0.2688  # Gain for 1/4 gain & 100ms IT
    val = word * gain

    a = 6.0135e-13
    b = -9.3924e-9
    c = 8.1488e-5
    d = 1.0023

    if val > 1000:
        val = a * (val ** 4) + b * (val ** 3) + c * (val ** 2) + d * (val)
        print('Adjusted lux value for >1000: ', val)

    val = round(val, 2)

    return val


# =============================================================================
# DATA SENDER
# =============================================================================

def send_reading(sensor_type: str, value: float) -> bool:
    """Send a sensor reading to the backend API."""
    payload = {
        "property_id": PROPERTY_ID,
        "sensor_type": sensor_type,
        "value": value
    }
    
    try:
        response = requests.post(BACKEND_URL, json=payload, timeout=10)
        response.raise_for_status()
        
        result = response.json()
        logger.info(f"✓ Sent {sensor_type}: {value} (ID: {result['id']})")
        return True
        
    except requests.exceptions.RequestException as e:
        logger.error(f"✗ Failed to send {sensor_type} reading: {e}")
        return False
    except Exception as e:
        logger.error(f"✗ Unexpected error sending {sensor_type}: {e}")
        return False


# =============================================================================
# MAIN LOOP
# =============================================================================

def main():
    """Main loop to continuously read sensors and send data."""
    logger.info("=" * 70)
    logger.info("Raspberry Pi Sensor Data Sender - Starting")
    logger.info(f"Backend URL: {BACKEND_URL}")
    logger.info(f"Property ID: {PROPERTY_ID}")
    logger.info("=" * 70)
    
    # Track last sent time for each sensor
    last_sent: Dict[str, float] = {
        sensor: 0 for sensor in SAMPLE_RATES.keys()
    }
    
    # Map sensor types to their reading functions
    read_functions: Dict[str, Callable[[], float]] = {
        "TEMPERATURE": read_temperature,
        "HUMIDITY": read_humidity,
        "AIR_QUALITY": read_air_quality,
        "SOUND": read_sound,
        "LIGHT": read_light,
    }
    
    logger.info("Enabled sensors:")
    for sensor, enabled in ENABLED_SENSORS.items():
        if enabled:
            logger.info(f"  - {sensor} (sample rate: {SAMPLE_RATES[sensor]}s)")
    
    logger.info("\nStarting data collection loop...\n")
    
    try:
        while True:
            current_time = time.time()
            
            for sensor_type, sample_rate in SAMPLE_RATES.items():
                # Skip if sensor is disabled
                if not ENABLED_SENSORS.get(sensor_type, False):
                    continue
                
                # Check if it's time to send this sensor's reading
                time_since_last = current_time - last_sent[sensor_type]
                
                if time_since_last >= sample_rate:
                    try:
                        # Read sensor value
                        value = read_functions[sensor_type]()
                        
                        # Send to backend
                        if send_reading(sensor_type, value):
                            last_sent[sensor_type] = current_time
                        else:
                            logger.warning(f"Will retry {sensor_type} on next cycle")
                            
                    except Exception as e:
                        logger.error(f"Error reading {sensor_type} sensor: {e}")
            
            # Sleep for the smallest interval (sound sensor at 1 second)
            time.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("\n" + "=" * 70)
        logger.info("Shutting down gracefully...")
        logger.info("=" * 70)
    except Exception as e:
        logger.critical(f"Critical error in main loop: {e}", exc_info=True)


if __name__ == "__main__":
    main()

