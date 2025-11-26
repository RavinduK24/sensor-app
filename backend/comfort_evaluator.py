from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta, date
from collections import defaultdict
from sqlalchemy.orm import Session
from models import RealtimeReading, HistoricalReading, SensorType


class ComfortEvaluator:
    """
    Evaluates comfort levels for the supported customer profiles by applying a
    distance-based score on daily averages and long-term percentage matches.
    """

    DEFAULT_PROFILE = "Young Professionals (Working from Home)"

    PROFILE_ALIASES = {
        "Working Adult": DEFAULT_PROFILE,
        "Stay-home Elderly": "Elderly Residents",
        "Young Professionals": DEFAULT_PROFILE,
        "Young Professional": DEFAULT_PROFILE,
        "Elderly": "Elderly Residents",
        # Frontend profile names
        "Work from Home Adult": DEFAULT_PROFILE,
        "Elderly People": "Elderly Residents",
        "Families with Babies": "Families with Babies/Toddlers",
        "Asthma/Allergic People": "Allergy/Asthma Sufferers",
    }

    SUPPORTED_SENSORS = (
        SensorType.TEMPERATURE,
        SensorType.HUMIDITY,
        SensorType.AIR_QUALITY,
        SensorType.LIGHT,
        SensorType.SOUND,
    )

    SENSOR_LABELS = {
        SensorType.TEMPERATURE: "Temperature",
        SensorType.HUMIDITY: "Humidity",
        SensorType.AIR_QUALITY: "PM2.5",
        SensorType.LIGHT: "Light",
        SensorType.SOUND: "Sound",
    }

    PROFILES = {
        "Young Professionals (Working from Home)": {
            "description": "Bright, focused environment for long working hours at home.",
            "sensors": {
                SensorType.TEMPERATURE: {"min": 21.0, "max": 23.0, "weight": 1.2},
                SensorType.HUMIDITY: {"min": 40.0, "max": 50.0, "weight": 1.0},
                SensorType.AIR_QUALITY: {"min": 0.0, "max": 15.0, "weight": 1.1},
                SensorType.LIGHT: {"min": 500.0, "max": 1000.0, "weight": 1.3},
                SensorType.SOUND: {"min": 25.0, "max": 45.0, "weight": 0.9},
            },
        },
        "Families with Babies/Toddlers": {
            "description": "Stable and gentle environment for infants and toddlers.",
            "sensors": {
                SensorType.TEMPERATURE: {"min": 20.0, "max": 22.0, "weight": 1.2},
                SensorType.HUMIDITY: {"min": 45.0, "max": 55.0, "weight": 1.1},
                SensorType.AIR_QUALITY: {"min": 0.0, "max": 10.0, "weight": 1.4},
                SensorType.LIGHT: {"min": 200.0, "max": 400.0, "weight": 0.8},
                SensorType.SOUND: {"min": 20.0, "max": 35.0, "weight": 1.3},
            },
        },
        "Elderly Residents": {
            "description": "Warm, safe environment with clean air and balanced lighting.",
            "sensors": {
                SensorType.TEMPERATURE: {"min": 22.0, "max": 24.0, "weight": 1.3},
                SensorType.HUMIDITY: {"min": 40.0, "max": 50.0, "weight": 1.0},
                SensorType.AIR_QUALITY: {"min": 0.0, "max": 12.0, "weight": 1.3},
                SensorType.LIGHT: {"min": 300.0, "max": 500.0, "weight": 0.9},
                SensorType.SOUND: {"min": 25.0, "max": 40.0, "weight": 1.2},
            },
        },
        "Allergy/Asthma Sufferers": {
            "description": "Very low particulate levels and drier air to reduce triggers.",
            "sensors": {
                SensorType.TEMPERATURE: {"min": 20.0, "max": 22.0, "weight": 1.0},
                SensorType.HUMIDITY: {"min": 35.0, "max": 45.0, "weight": 1.4},
                SensorType.AIR_QUALITY: {"min": 0.0, "max": 8.0, "weight": 1.6},
                SensorType.LIGHT: {"min": 400.0, "max": 600.0, "weight": 0.7},
                SensorType.SOUND: {"min": 25.0, "max": 40.0, "weight": 1.1},
            },
        },
    }

    @classmethod
    def normalize_profile(cls, customer_type: str) -> str:
        """Ensure the requested customer type maps to one of the supported profiles."""
        if not customer_type:
            return cls.DEFAULT_PROFILE
        customer_type = customer_type.strip()
        normalized = cls.PROFILE_ALIASES.get(customer_type, customer_type)
        if normalized not in cls.PROFILES:
            return cls.DEFAULT_PROFILE
        return normalized

    @classmethod
    def get_profile_sensors(cls, customer_type: str) -> Dict[SensorType, Dict[str, float]]:
        profile_key = cls.normalize_profile(customer_type)
        return cls.PROFILES[profile_key]["sensors"]

    @staticmethod
    def get_latest_readings(db: Session, property_id: int) -> Dict[SensorType, Dict[str, Optional[float]]]:
        """Get the most recent realtime reading for each supported sensor."""
        readings: Dict[SensorType, Dict[str, Optional[float]]] = {}
        for sensor_type in ComfortEvaluator.SUPPORTED_SENSORS:
            latest = (
                db.query(RealtimeReading)
                .filter(
                    RealtimeReading.property_id == property_id,
                    RealtimeReading.sensor_type == sensor_type,
                )
                .order_by(RealtimeReading.timestamp.desc())
                .first()
            )

            if latest:
                readings[sensor_type] = {
                    "value": latest.value,
                    "timestamp": latest.timestamp,
                }
        return readings

    @staticmethod
    def get_historical_map(
        db: Session, property_id: int, sensor_types: List[SensorType], days: int = 365
    ) -> Dict[SensorType, List[HistoricalReading]]:
        """Fetch up to `days` historical daily averages for the selected sensors."""
        since_date = datetime.utcnow().date() - timedelta(days=days)
        rows = (
            db.query(HistoricalReading)
            .filter(
                HistoricalReading.property_id == property_id,
                HistoricalReading.sensor_type.in_(sensor_types),
                HistoricalReading.date >= since_date,
            )
            .order_by(HistoricalReading.date.asc())
            .all()
        )

        grouped: Dict[SensorType, List[HistoricalReading]] = defaultdict(list)
        for row in rows:
            grouped[row.sensor_type].append(row)
        return grouped

    @staticmethod
    def latest_daily_average(rows: List[HistoricalReading]) -> Tuple[Optional[float], Optional[date]]:
        if not rows:
            return None, None
        latest_entry = rows[-1]
        return latest_entry.avg_value, latest_entry.date

    @staticmethod
    def compute_percentage_match(
        rows: List[HistoricalReading], preferred_min: Optional[float], preferred_max: Optional[float]
    ) -> Tuple[Optional[float], int]:
        if not rows:
            return None, 0
        total_days = len(rows)
        matches = 0
        for entry in rows:
            value = entry.avg_value
            if value is None:
                continue
            if preferred_min is not None and value < preferred_min:
                continue
            if preferred_max is not None and value > preferred_max:
                continue
            matches += 1
        percentage = round((matches / total_days) * 100, 1) if total_days > 0 else None
        return percentage, total_days

    @staticmethod
    def calculate_scaled_score(value: Optional[float], pref: Dict[str, float]) -> Optional[float]:
        if value is None:
            return None

        preferred_min = pref.get("min")
        preferred_max = pref.get("max")
        if preferred_min is None and preferred_max is None:
            return None

        # Within preferred range scores 100.
        if (preferred_min is None or value >= preferred_min) and (preferred_max is None or value <= preferred_max):
            return 100.0

        if preferred_min is not None and value < preferred_min:
            distance = preferred_min - value
        elif preferred_max is not None and value > preferred_max:
            distance = value - preferred_max
        else:
            distance = 0.0

        if preferred_min is not None and preferred_max is not None and preferred_max > preferred_min:
            scale = preferred_max - preferred_min
        else:
            reference = preferred_max if preferred_max not in (None, 0) else preferred_min
            scale = max(reference * 0.2 if reference else 5.0, 1.0)

        penalty = min(distance / scale, 1.0)
        score = max(0.0, 100.0 * (1 - penalty))
        return round(score, 1)

    @staticmethod
    def score_to_status(score: Optional[float]) -> str:
        if score is None:
            return "No Data"
        if score >= 90:
            return "Ideal"
        if score >= 75:
            return "Comfortable"
        if score >= 60:
            return "Monitor"
        return "Attention"

    @staticmethod
    def format_range(preferred_min: Optional[float], preferred_max: Optional[float], unit: str = "") -> str:
        if preferred_min is not None and preferred_max is not None:
            return f"{preferred_min:.0f}–{preferred_max:.0f}{unit}"
        if preferred_max is not None:
            return f"<{preferred_max:.0f}{unit}"
        if preferred_min is not None:
            return f">{preferred_min:.0f}{unit}"
        return "—"

    @classmethod
    def build_sensor_insight(
        cls,
        sensor_type: SensorType,
        score: Optional[float],
        value_for_score: Optional[float],
        pref: Dict[str, float],
        percentage_match: Optional[float],
    ) -> str:
        sensor_label = cls.SENSOR_LABELS[sensor_type]
        preferred_min = pref.get("min")
        preferred_max = pref.get("max")

        if score is None:
            return f"{sensor_label} data is not yet available to score this property."

        if value_for_score is None:
            return f"{sensor_label} score could not be determined due to missing readings."

        if preferred_min is not None and value_for_score < preferred_min:
            direction = "below"
        elif preferred_max is not None and value_for_score > preferred_max:
            direction = "above"
        else:
            direction = "within"

        if direction == "within":
            base_msg = f"{sensor_label} averages are squarely within the preferred range."
        else:
            base_msg = (
                f"{sensor_label} daily average ({value_for_score:.1f}) sits {direction} the target range "
                f"of {cls.format_range(preferred_min, preferred_max)}."
            )

        if percentage_match is None:
            return base_msg
        return f"{base_msg} Annual match rate: {percentage_match:.1f}% of days."

    @classmethod
    def build_property_insights(cls, sensors: List[Dict], customer_type: str) -> List[str]:
        positives = []
        warnings = []
        for sensor in sensors:
            label = sensor["sensor_type"].replace("_", " ").title()
            score = sensor.get("score")
            percentage = sensor.get("percentage_match")
            preferred = cls.format_range(sensor.get("preferred_min"), sensor.get("preferred_max"))

            if score is None:
                warnings.append(f"Need more {label.lower()} data to understand how it fits {customer_type.lower()}.")
                continue

            if score >= 90:
                positives.append(f"{label} consistently stays within the ideal range ({preferred}).")
            elif score < 70:
                detail = (
                    f"{label} drifts outside the target range ({preferred}); "
                    f"{'only ' if percentage is not None else ''}"
                    f"{f'{percentage:.0f}% of days meet the preference.' if percentage is not None else 'improve monitoring.'}"
                )
                warnings.append(detail)

        insights: List[str] = warnings[:2] + positives[:2]
        if not insights:
            insights = [f"Conditions are balanced for {customer_type.lower()}."]
        return insights[:4]

    @classmethod
    def evaluate_property_comfort(cls, db: Session, property_id: int, customer_type: str) -> Dict:
        sensors_config = cls.get_profile_sensors(customer_type)

        realtime_readings = cls.get_latest_readings(db, property_id)
        historical_map = cls.get_historical_map(db, property_id, list(sensors_config.keys()))

        sensor_evaluations: List[Dict] = []
        total_weighted_score = 0.0
        total_weight = 0.0

        for sensor_type, pref in sensors_config.items():
            realtime = realtime_readings.get(sensor_type, {})
            hist_rows = historical_map.get(sensor_type, [])
            daily_average, average_date = cls.latest_daily_average(hist_rows)
            percentage_match, days_tracked = cls.compute_percentage_match(
                hist_rows, pref.get("min"), pref.get("max")
            )

            # Prefer realtime value for current score, fallback to daily average
            value_for_score = realtime.get("value") if realtime.get("value") is not None else daily_average
            
            score = cls.calculate_scaled_score(value_for_score, pref)
            status = cls.score_to_status(score)
            insight = cls.build_sensor_insight(sensor_type, score, value_for_score, pref, percentage_match)

            if score is not None:
                weight = pref.get("weight", 1.0)
                total_weighted_score += score * weight
                total_weight += weight

            sensor_evaluations.append(
                {
                    "sensor_type": sensor_type.value,
                    "current_value": realtime.get("value"),
                    "current_value_timestamp": realtime.get("timestamp").isoformat()
                    if realtime.get("timestamp")
                    else None,
                    "daily_average": daily_average,
                    "daily_average_date": average_date.isoformat() if average_date else None,
                    "score": score,
                    "status": status,
                    "insight": insight,
                    "percentage_match": percentage_match,
                    "days_tracked": days_tracked,
                    "preferred_min": pref.get("min"),
                    "preferred_max": pref.get("max"),
                    "weight": pref.get("weight", 1.0),
                }
            )

        if total_weight == 0:
            overall_score = 0.0
        else:
            overall_score = round(total_weighted_score / total_weight, 1)

        if overall_score >= 85:
            comfort_level = "Excellent"
        elif overall_score >= 70:
            comfort_level = "Good"
        elif overall_score >= 55:
            comfort_level = "Fair"
        elif total_weight == 0:
            comfort_level = "No Data"
        else:
            comfort_level = "Poor"

        profile_key = cls.normalize_profile(customer_type)
        insights = cls.build_property_insights(sensor_evaluations, profile_key)

        return {
            "overall_score": overall_score,
            "comfort_level": comfort_level,
            "sensors": sensor_evaluations,
            "insights": insights,
        }

    @classmethod
    def get_property_comfort_score(cls, db: Session, property_id: int, customer_type: str) -> float:
        comfort_data = cls.evaluate_property_comfort(db, property_id, customer_type)
        return comfort_data["overall_score"]

