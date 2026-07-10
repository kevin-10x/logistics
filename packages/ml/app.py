from flask import Flask, request, jsonify
from predict import DeliveryPredictionEngine, GeoPoint, generate_training_data

app = Flask(__name__)
engine = DeliveryPredictionEngine()

print("Training ML model...")
training_data = generate_training_data(1000)
engine.train(training_data)
print(f"Model ready. Accuracy: {engine.accuracy:.1%}")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "model_accuracy": engine.accuracy, "training_samples": len(engine.training_data)})

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    origin = GeoPoint(data["origin"]["latitude"], data["origin"]["longitude"])
    destination = GeoPoint(data["destination"]["latitude"], data["destination"]["longitude"])
    prediction = engine.predict(
        order_id=data.get("order_id", ""),
        origin=origin,
        destination=destination,
        vehicle_type=data.get("vehicle_type", "truck"),
        departure_time=data.get("departure_time"),
        weather_conditions=data.get("weather", "clear"),
        weather_temp=data.get("weather_temp", 28),
        traffic_level=data.get("traffic", "moderate"),
        country=data.get("country", "NG"),
    )
    return jsonify(prediction.__dict__)

@app.route("/retrain", methods=["POST"])
def retrain():
    new_data = generate_training_data(500)
    engine.train(new_data)
    return jsonify({"accuracy": engine.accuracy, "samples": len(engine.training_data)})

@app.route("/feature-importance", methods=["GET"])
def feature_importance():
    return jsonify(engine.get_feature_importance())

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
