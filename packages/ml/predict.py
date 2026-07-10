import json
import math
import random
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, asdict
from collections import defaultdict
import statistics


@dataclass
class GeoPoint:
    latitude: float
    longitude: float


@dataclass
class PredictionFactor:
    name: str
    impact: float
    description: str


@dataclass
class DeliveryPrediction:
    order_id: str
    estimated_arrival: str
    confidence: float
    factors: List[Dict]
    risk_level: str
    delay_probability: float
    weather_impact: float
    traffic_impact: float
    historical_accuracy: float
    alternative_time_slots: List[str]


@dataclass
class TrainingSample:
    distance_km: float
    weather_score: float
    traffic_score: float
    time_of_day: int
    day_of_week: int
    vehicle_type_encoded: int
    actual_hours: float
    was_on_time: bool


class DeliveryPredictionEngine:
    def __init__(self):
        self.weights = {
            "distance": 0.30,
            "weather": 0.15,
            "traffic": 0.20,
            "time_of_day": 0.10,
            "day_of_week": 0.05,
            "vehicle_type": 0.10,
            "route_familiarity": 0.05,
            "seasonal": 0.05,
        }
        self.bias = 2.0
        self.training_data: List[TrainingSample] = []
        self.accuracy = 0.78
        self.learning_rate = 0.01
        self.vehicle_speeds = {
            "truck": 40, "van": 50, "motorbike": 30,
            "bicycle": 12, "trailer": 35, "pickup": 45,
        }
        self.weather_multipliers = {
            "clear": 1.0, "cloudy": 1.05, "light_rain": 1.25,
            "rain": 1.4, "heavy_rain": 1.7, "storm": 2.0,
            "fog": 1.3, "harmattan": 1.2,
        }
        self.traffic_multipliers = {
            "free_flow": 1.0, "light": 1.1, "moderate": 1.3,
            "heavy": 1.7, "severe": 2.2,
        }
        self.african_holiday_dates = self._load_holidays()

    def _load_holidays(self) -> Dict[str, List[str]]:
        holidays = {
            "NG": ["01-01", "10-01", "12-25", "12-26", "05-01", "06-12"],
            "KE": ["01-01", "05-01", "06-01", "10-10", "12-12", "12-25", "12-26"],
            "ZA": ["01-01", "03-21", "04-27", "05-01", "06-16", "08-09", "09-24", "12-16", "12-25", "12-26"],
            "GH": ["01-01", "01-07", "03-06", "05-01", "07-01", "12-25", "12-26"],
            "TZ": ["01-01", "01-12", "04-26", "05-01", "07-07", "08-08", "10-14", "12-09", "12-25"],
            "UG": ["01-01", "01-26", "03-08", "04-29", "05-01", "06-03", "06-09", "10-09", "12-25", "12-26"],
            "SN": ["01-01", "04-04", "05-01", "05-27", "08-15", "11-01", "12-25"],
            "ET": ["01-01", "01-07", "09-11", "09-12", "09-27", "12-25"],
            "MA": ["01-11", "05-01", "07-30", "08-14", "11-06", "11-18", "12-30"],
            "CM": ["01-01", "02-11", "05-01", "05-20", "08-15", "10-01", "12-25"],
        }
        return holidays

    def predict(
        self,
        order_id: str,
        origin: GeoPoint,
        destination: GeoPoint,
        vehicle_type: str,
        departure_time: Optional[str] = None,
        weather_conditions: str = "clear",
        weather_temp: float = 28.0,
        traffic_level: str = "moderate",
        country: str = "NG",
    ) -> DeliveryPrediction:
        distance = self._haversine(origin, destination)
        dep_time = datetime.fromisoformat(departure_time) if departure_time else datetime.now()

        distance_factor = min(distance / 500, 1.0)
        weather_factor = self._get_weather_score(weather_conditions, weather_temp)
        traffic_factor = self._get_traffic_score(traffic_level)
        time_factor = self._get_time_score(dep_time.hour)
        day_factor = self._get_day_score(dep_time.weekday())
        vehicle_factor = self._get_vehicle_score(vehicle_type)
        seasonal_factor = self._get_seasonal_score(dep_time, country)
        route_factor = self._get_route_familiarity_score(origin, destination)

        features = {
            "distance": distance_factor,
            "weather": weather_factor,
            "traffic": traffic_factor,
            "time_of_day": time_factor,
            "day_of_week": day_factor,
            "vehicle_type": vehicle_factor,
            "route_familiarity": route_factor,
            "seasonal": seasonal_factor,
        }

        base_speed = self.vehicle_speeds.get(vehicle_type, 40)
        adjusted_speed = base_speed * self.weather_multipliers.get(weather_conditions, 1.0) * self.traffic_multipliers.get(traffic_level, 1.0)

        base_hours = distance / max(adjusted_speed, 5)

        predicted_hours = base_hours * (
            1 + sum(self.weights[k] * features[k] for k in self.weights if k in features)
        ) + self.bias * 0.1

        delay_prob = self._calculate_delay_probability(distance, weather_conditions, traffic_level, dep_time, country)
        confidence = self._calculate_confidence(distance, weather_conditions, len(self.training_data))

        arrival_time = dep_time + timedelta(hours=predicted_hours)

        risk_level = "high" if delay_prob > 0.4 else "medium" if delay_prob > 0.2 else "low"

        factors = [
            {"name": "Distance", "impact": distance_factor, "description": f"{distance:.0f} km route"},
            {"name": "Weather", "impact": weather_factor, "description": f"{weather_conditions} ({weather_temp:.0f}°C)"},
            {"name": "Traffic", "impact": traffic_factor, "description": traffic_level},
            {"name": "Time of Day", "impact": time_factor, "description": self._get_time_label(dep_time.hour)},
            {"name": "Vehicle", "impact": vehicle_factor, "description": vehicle_type},
            {"name": "Seasonal", "impact": seasonal_factor, "description": self._get_season_label(dep_time.month)},
        ]

        alt_slots = self._generate_alternatives(dep_time, predicted_hours)

        return DeliveryPrediction(
            order_id=order_id,
            estimated_arrival=arrival_time.isoformat(),
            confidence=round(confidence, 3),
            factors=factors,
            risk_level=risk_level,
            delay_probability=round(delay_prob, 3),
            weather_impact=round(weather_factor - 1, 3),
            traffic_impact=round(traffic_factor - 1, 3),
            historical_accuracy=round(self.accuracy, 3),
            alternative_time_slots=alt_slots,
        )

    def train(self, samples: List[TrainingSample]):
        self.training_data.extend(samples)
        if len(self.training_data) < 10:
            return

        for _ in range(100):
            total_error = 0
            for sample in self.training_data:
                predicted = self._predict_base(sample)
                error = sample.actual_hours - predicted
                total_error += error ** 2

                features = self._sample_to_features(sample)
                for key in self.weights:
                    if key in features:
                        self.weights[key] += self.learning_rate * error * features[key]
                self.bias += self.learning_rate * error

            total_weight = sum(abs(w) for w in self.weights.values())
            if total_weight > 0:
                for key in self.weights:
                    self.weights[key] /= total_weight

        correct = sum(1 for s in self.training_data if self._was_prediction_accurate(s))
        self.accuracy = correct / len(self.training_data) if self.training_data else 0

    def _predict_base(self, sample: TrainingSample) -> float:
        speed = list(self.vehicle_speeds.values())[sample.vehicle_type_encoded % len(self.vehicle_speeds)]
        return sample.distance_km / max(speed, 5)

    def _sample_to_features(self, sample: TrainingSample) -> Dict[str, float]:
        return {
            "distance": min(sample.distance_km / 500, 1.0),
            "weather": sample.weather_score,
            "traffic": sample.traffic_score,
            "time_of_day": self._get_time_score(sample.time_of_day),
            "day_of_week": self._get_day_score(sample.day_of_week),
            "vehicle_type": sample.vehicle_type_encoded / 5,
        }

    def _was_prediction_accurate(self, sample: TrainingSample) -> bool:
        predicted = self._predict_base(sample)
        return abs(predicted - sample.actual_hours) < predicted * 0.2

    def get_feature_importance(self) -> Dict[str, float]:
        total = sum(abs(w) for w in self.weights.values())
        return {k: abs(v) / total if total > 0 else 0 for k, v in self.weights.items()}

    def _haversine(self, a: GeoPoint, b: GeoPoint) -> float:
        R = 6371
        lat1, lat2 = math.radians(a.latitude), math.radians(b.latitude)
        dlat = math.radians(b.latitude - a.latitude)
        dlon = math.radians(b.longitude - a.longitude)
        h = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        return R * 2 * math.atan2(math.sqrt(h), math.sqrt(1 - h))

    def _get_weather_score(self, conditions: str, temp: float) -> float:
        score = self.weather_multipliers.get(conditions, 1.0) - 1
        if temp > 38: score += 0.1
        elif temp < 10: score += 0.05
        return min(score, 1.0)

    def _get_traffic_score(self, level: str) -> float:
        return (self.traffic_multipliers.get(level, 1.3) - 1) / 1.2

    def _get_time_score(self, hour: int) -> float:
        if 7 <= hour <= 9: return 0.7
        if 17 <= hour <= 19: return 0.8
        if 12 <= hour <= 14: return 0.4
        if hour >= 22 or hour <= 5: return 0.1
        return 0.3

    def _get_day_score(self, day: int) -> float:
        if day >= 5: return 0.2
        if day == 4: return 0.6
        return 0.4

    def _get_vehicle_score(self, vehicle_type: str) -> float:
        scores = {"motorbike": 0.2, "bicycle": 0.5, "pickup": 0.3, "van": 0.35, "truck": 0.5, "trailer": 0.6}
        return scores.get(vehicle_type, 0.4)

    def _get_seasonal_score(self, dt: datetime, country: str) -> float:
        month = dt.month
        rainy_seasons = {
            "NG": [4, 5, 6, 7, 8, 9, 10], "KE": [3, 4, 5, 6, 11],
            "ZA": [10, 11, 12, 1, 2, 3], "GH": [3, 4, 5, 6, 9, 10],
            "TZ": [3, 4, 5, 11, 12], "ET": [6, 7, 8, 9],
        }
        rainy_months = rainy_seasons.get(country, [4, 5, 6, 7, 8, 9])
        return 0.5 if month in rainy_months else 0.2

    def _get_route_familiarity_score(self, origin: GeoPoint, dest: GeoPoint) -> float:
        route_key = f"{origin.latitude:.1f}_{dest.latitude:.1f}"
        count = sum(1 for s in self.training_data if hasattr(s, 'route_key') and s.route_key == route_key)
        return min(count / 10, 0.8)

    def _calculate_delay_probability(self, distance, weather, traffic, dt, country) -> float:
        prob = 0.15
        if distance > 100: prob += 0.1
        if distance > 300: prob += 0.1
        if weather in ("rain", "heavy_rain"): prob += 0.2
        if weather == "storm": prob += 0.35
        if traffic in ("heavy", "severe"): prob += 0.25
        if dt.hour in range(7, 10): prob += 0.1
        if dt.hour in range(17, 20): prob += 0.15
        if dt.weekday() == 4: prob += 0.05
        if dt.strftime("%m-%d") in self.african_holiday_dates.get(country, []): prob += 0.2
        return min(prob, 0.95)

    def _calculate_confidence(self, distance, weather, sample_count) -> float:
        conf = 0.78
        if sample_count > 100: conf += 0.05
        if sample_count > 1000: conf += 0.05
        if distance < 50: conf += 0.05
        elif distance > 200: conf -= 0.1
        if weather in ("heavy_rain", "storm"): conf -= 0.15
        return max(0.3, min(0.98, conf))

    def _generate_alternatives(self, departure: datetime, travel_hours: float) -> List[str]:
        slots = []
        for offset in [-4, -2, 2, 4]:
            slot = departure + timedelta(hours=offset)
            if slot > datetime.now():
                slots.append(slot.isoformat())
        return slots

    def _get_time_label(self, hour: int) -> str:
        if 5 <= hour < 12: return "Morning"
        if 12 <= hour < 17: return "Afternoon"
        if 17 <= hour < 21: return "Evening"
        return "Night"

    def _get_season_label(self, month: int) -> str:
        if month in (12, 1, 2): return "Dry season (Harmattan)"
        if month in (3, 4, 5): return "Early rainy season"
        if month in (6, 7, 8): return "Peak rainy season"
        return "Late rainy season"


def generate_training_data(n: int = 500) -> List[TrainingSample]:
    samples = []
    vehicle_types = ["truck", "van", "motorbike", "pickup", "trailer"]
    weather_types = ["clear", "cloudy", "rain", "heavy_rain"]
    traffic_types = ["free_flow", "light", "moderate", "heavy"]

    for _ in range(n):
        distance = random.uniform(5, 500)
        vehicle = random.choice(vehicle_types)
        weather = random.choice(weather_types)
        traffic = random.choice(traffic_types)
        hour = random.randint(0, 23)
        day = random.randint(0, 6)
        vt_encoded = vehicle_types.index(vehicle)

        base_speed = {"truck": 40, "van": 50, "motorbike": 30, "pickup": 45, "trailer": 35}[vehicle]
        weather_mult = {"clear": 1.0, "cloudy": 1.05, "rain": 1.4, "heavy_rain": 1.7}[weather]
        traffic_mult = {"free_flow": 1.0, "light": 1.1, "moderate": 1.3, "heavy": 1.7}[traffic]

        actual_hours = distance / (base_speed * weather_mult * traffic_mult)
        actual_hours += random.gauss(0, actual_hours * 0.1)
        actual_hours = max(0.5, actual_hours)

        samples.append(TrainingSample(
            distance_km=distance,
            weather_score=weather_mult - 1,
            traffic_score=(traffic_mult - 1) / 1.2,
            time_of_day=hour,
            day_of_week=day,
            vehicle_type_encoded=vt_encoded,
            actual_hours=actual_hours,
            was_on_time=random.random() > 0.2,
        ))
    return samples


if __name__ == "__main__":
    engine = DeliveryPredictionEngine()

    print("Generating training data...")
    training_data = generate_training_data(1000)
    print(f"Training with {len(training_data)} samples...")
    engine.train(training_data)

    print(f"\nModel accuracy: {engine.accuracy:.1%}")
    print(f"Feature importance: {json.dumps(engine.get_feature_importance(), indent=2)}")

    prediction = engine.predict(
        order_id="ORD-20260710-TEST01",
        origin=GeoPoint(latitude=6.5244, longitude=3.3792),
        destination=GeoPoint(latitude=7.3775, longitude=3.9470),
        vehicle_type="truck",
        weather_conditions="rain",
        weather_temp=27.0,
        traffic_level="heavy",
        country="NG",
    )

    print(f"\nPrediction for Lagos to Ibadan:")
    print(f"  ETA: {prediction.estimated_arrival}")
    print(f"  Confidence: {prediction.confidence:.1%}")
    print(f"  Risk: {prediction.risk_level}")
    print(f"  Delay probability: {prediction.delay_probability:.1%}")
    print(f"  Weather impact: {prediction.weather_impact:.1%}")
    print(f"  Traffic impact: {prediction.traffic_impact:.1%}")
