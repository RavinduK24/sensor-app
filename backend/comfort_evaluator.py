from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from models import RealtimeReading, SensorType, Property

class ComfortEvaluator:
    """Evaluates comfort levels based on sensor readings and customer preferences"""
    
    # Customer preference profiles
    PREFERENCES = {
        "Working Adult": {
            SensorType.TEMPERATURE: {
                "ideal_min": 20.0,
                "ideal_max": 23.0,
                "acceptable_min": 18.0,
                "acceptable_max": 25.0,
                "weight": 1.2,
                "time_variations": {
                    "night": {"ideal_min": 19.0, "ideal_max": 21.0},  # Cooler at night
                    "day": {"ideal_min": 21.0, "ideal_max": 24.0}
                }
            },
            SensorType.HUMIDITY: {
                "ideal_min": 40.0,
                "ideal_max": 55.0,
                "acceptable_min": 30.0,
                "acceptable_max": 65.0,
                "weight": 0.9
            },
            SensorType.LIGHT: {
                "ideal_min": 400.0,
                "ideal_max": 800.0,
                "acceptable_min": 200.0,
                "acceptable_max": 1000.0,
                "weight": 1.0,
                "time_variations": {
                    "night": {"ideal_min": 50.0, "ideal_max": 200.0},  # Dim at night
                    "day": {"ideal_min": 500.0, "ideal_max": 800.0}
                }
            },
            SensorType.SOUND: {
                "ideal_min": 20.0,
                "ideal_max": 40.0,
                "acceptable_min": 20.0,
                "acceptable_max": 55.0,
                "weight": 1.0,
                "time_variations": {
                    "night": {"ideal_max": 35.0},  # Quieter at night
                    "evening": {"ideal_max": 40.0}
                }
            },
            SensorType.AIR_QUALITY: {
                "ideal_min": 75.0,
                "ideal_max": 100.0,
                "acceptable_min": 60.0,
                "acceptable_max": 100.0,
                "weight": 1.1
            }
        },
        "Stay-home Elderly": {
            SensorType.TEMPERATURE: {
                "ideal_min": 22.0,
                "ideal_max": 25.0,
                "acceptable_min": 20.0,
                "acceptable_max": 27.0,
                "weight": 1.3  # More important for elderly
            },
            SensorType.HUMIDITY: {
                "ideal_min": 45.0,
                "ideal_max": 55.0,
                "acceptable_min": 35.0,
                "acceptable_max": 65.0,
                "weight": 1.0
            },
            SensorType.LIGHT: {
                "ideal_min": 300.0,
                "ideal_max": 600.0,
                "acceptable_min": 200.0,
                "acceptable_max": 700.0,
                "weight": 0.9,  # Prefer softer light
                "time_variations": {
                    "day": {"ideal_min": 400.0, "ideal_max": 600.0}
                }
            },
            SensorType.SOUND: {
                "ideal_min": 20.0,
                "ideal_max": 35.0,
                "acceptable_min": 20.0,
                "acceptable_max": 45.0,
                "weight": 1.2  # Very important for elderly
            },
            SensorType.AIR_QUALITY: {
                "ideal_min": 80.0,
                "ideal_max": 100.0,
                "acceptable_min": 70.0,
                "acceptable_max": 100.0,
                "weight": 1.3  # Very important for elderly
            }
        }
    }
    
    @staticmethod
    def get_time_period() -> str:
        """Determine current time period"""
        hour = datetime.now().hour
        if 22 <= hour or hour < 6:
            return "night"
        elif 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 18:
            return "day"
        elif 18 <= hour < 22:
            return "evening"
        return "day"
    
    @staticmethod
    def get_preferences(customer_type: str, sensor_type: SensorType) -> Dict:
        """Get preferences with time-of-day adjustments"""
        if customer_type not in ComfortEvaluator.PREFERENCES:
            customer_type = "Working Adult"
        
        prefs = ComfortEvaluator.PREFERENCES[customer_type][sensor_type].copy()
        
        # Apply time variations if available
        if "time_variations" in prefs:
            time_period = ComfortEvaluator.get_time_period()
            if time_period in prefs["time_variations"]:
                prefs.update(prefs["time_variations"][time_period])
        
        return prefs
    
    @staticmethod
    def evaluate_sensor(value: float, customer_type: str, sensor_type: SensorType) -> Tuple[float, str, str]:
        """
        Evaluate a single sensor reading
        Returns: (score 0-100, status, insight message)
        """
        prefs = ComfortEvaluator.get_preferences(customer_type, sensor_type)
        
        ideal_min = prefs["ideal_min"]
        ideal_max = prefs["ideal_max"]
        acceptable_min = prefs["acceptable_min"]
        acceptable_max = prefs["acceptable_max"]
        
        # Calculate score
        if ideal_min <= value <= ideal_max:
            score = 100
            status = "Excellent"
            insight = f"{sensor_type.value} is in the ideal range for {customer_type.lower()}s."
        elif acceptable_min <= value < ideal_min:
            # Linear scale from acceptable to ideal
            score = 60 + 40 * (value - acceptable_min) / (ideal_min - acceptable_min)
            status = "Good"
            if sensor_type == SensorType.TEMPERATURE:
                insight = f"{sensor_type.value} is slightly cooler than ideal but still comfortable."
            elif sensor_type == SensorType.LIGHT:
                insight = f"{sensor_type.value} is dimmer than ideal but acceptable."
            else:
                insight = f"{sensor_type.value} is slightly below ideal range but acceptable."
        elif ideal_max < value <= acceptable_max:
            score = 60 + 40 * (acceptable_max - value) / (acceptable_max - ideal_max)
            status = "Good"
            if sensor_type == SensorType.TEMPERATURE:
                insight = f"{sensor_type.value} is slightly warmer than ideal but still comfortable."
            elif sensor_type == SensorType.SOUND:
                insight = f"{sensor_type.value} is slightly louder than ideal but tolerable."
            else:
                insight = f"{sensor_type.value} is slightly above ideal range but acceptable."
        else:
            # Outside acceptable range
            score = max(0, 60 - abs(value - ((ideal_min + ideal_max) / 2)) * 2)
            status = "Poor"
            if value < acceptable_min:
                insight = f"{sensor_type.value} is too low and may cause discomfort for {customer_type.lower()}s."
            else:
                insight = f"{sensor_type.value} is too high and may cause discomfort for {customer_type.lower()}s."
        
        return round(score, 1), status, insight
    
    @staticmethod
    def get_latest_readings(db: Session, property_id: int) -> Dict[SensorType, float]:
        """Get the latest reading for each sensor type from realtime database"""
        readings = {}
        for sensor_type in SensorType:
            latest = db.query(RealtimeReading).filter(
                RealtimeReading.property_id == property_id,
                RealtimeReading.sensor_type == sensor_type
            ).order_by(RealtimeReading.timestamp.desc()).first()
            
            if latest:
                readings[sensor_type] = latest.value
        
        return readings
    
    @staticmethod
    def evaluate_property_comfort(db: Session, property_id: int, customer_type: str) -> Dict:
        """Evaluate overall comfort for a property"""
        readings = ComfortEvaluator.get_latest_readings(db, property_id)
        
        if not readings:
            return {
                "overall_score": 0,
                "comfort_level": "No Data",
                "sensors": [],
                "insights": ["No sensor data available yet."]
            }
        
        sensor_evaluations = []
        total_weighted_score = 0
        total_weight = 0
        key_insights = []
        
        for sensor_type, value in readings.items():
            score, status, insight = ComfortEvaluator.evaluate_sensor(value, customer_type, sensor_type)
            prefs = ComfortEvaluator.get_preferences(customer_type, sensor_type)
            weight = prefs.get("weight", 1.0)
            
            sensor_evaluations.append({
                "sensor_type": sensor_type.value,
                "value": value,
                "status": status,
                "score": score,
                "insight": insight
            })
            
            total_weighted_score += score * weight
            total_weight += weight
            
            # Collect key insights (especially for excellent or poor ratings)
            if score >= 90 or score < 60:
                key_insights.append(insight)
        
        # Calculate overall score
        overall_score = round(total_weighted_score / total_weight if total_weight > 0 else 0, 1)
        
        # Determine comfort level
        if overall_score >= 85:
            comfort_level = "Excellent"
            key_insights.insert(0, f"This property provides excellent comfort conditions for {customer_type.lower()}s.")
        elif overall_score >= 70:
            comfort_level = "Good"
            key_insights.insert(0, f"This property provides good comfort conditions for {customer_type.lower()}s.")
        elif overall_score >= 50:
            comfort_level = "Fair"
            key_insights.insert(0, f"This property has acceptable but not ideal conditions for {customer_type.lower()}s.")
        else:
            comfort_level = "Poor"
            key_insights.insert(0, f"This property may not provide comfortable conditions for {customer_type.lower()}s.")
        
        return {
            "overall_score": overall_score,
            "comfort_level": comfort_level,
            "sensors": sensor_evaluations,
            "insights": key_insights[:4]  # Limit to top 4 insights
        }
    
    @staticmethod
    def get_property_comfort_score(db: Session, property_id: int, customer_type: str) -> float:
        """Calculate overall comfort score for a property (simple version for list view)"""
        comfort_data = ComfortEvaluator.evaluate_property_comfort(db, property_id, customer_type)
        return comfort_data["overall_score"]

