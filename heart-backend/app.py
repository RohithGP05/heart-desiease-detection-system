from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import joblib
import pandas as pd
import os
import sys
import subprocess
import datetime
from database import db_layer
from explainers import explain_patient_risk

app = Flask(__name__)

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'heart-healthcare-ai-secret-key-9923')
jwt = JWTManager(app)

# Paths Configuration
MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(os.path.dirname(__file__), 'models', 'heart_xgb_pipeline.joblib'))
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,https://*.vercel.app').split(',')
PORT = int(os.getenv('PORT', 5000))

# Model Verification and Robust Loading
def load_and_verify_model():
    try:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
            
        loaded_model = joblib.load(MODEL_PATH)
        # Verify prediction works with standard schema
        dummy_df = pd.DataFrame([{
            "age": 50, "sex": 1, "cp": 1, "trestbps": 120, "chol": 200, "fbs": 0,
            "restecg": 0, "thalach": 150, "exang": 0, "oldpeak": 0.0, "slope": 1, "ca": 0, "thal": 3
        }])
        loaded_model.predict(dummy_df)
        print("✅ Calibrated XGBoost pipeline loaded and verified successfully!")
        return loaded_model
    except Exception as e:
        print(f"⚠️ Model load or verification failed: {e}")
        print("🔄 Triggering auto-retraining to align with current scikit-learn environment...")
        try:
            # Execute train_model.py using current python interpreter to avoid path/env mismatches
            script_path = os.path.join(os.path.dirname(__file__), 'train_model.py')
            subprocess.run([sys.executable, "-X", "utf8", script_path], cwd=os.path.dirname(__file__), check=True)
            loaded_model = joblib.load(MODEL_PATH)
            print("✅ Model auto-retrained and loaded successfully!")
            return loaded_model
        except Exception as retrain_error:
            print(f"❌ Critical: Model auto-retraining failed: {retrain_error}")
            return None

model = load_and_verify_model()

# Configure CORS
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "message": "Heart Disease Healthcare AI Detection API is running",
        "database_type": db_layer.db_type,
        "model_loaded": model is not None,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No registration data provided"}), 400
            
        username = data.get('username')
        password = data.get('password')
        
        result, status_code = db_layer.register_user(username, password)
        
        if status_code == 201:
            access_token = create_access_token(identity=username)
            return jsonify({
                "message": result.get("message"),
                "access_token": access_token
            }), 201
            
        return jsonify(result), status_code
    except Exception as e:
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No login credentials provided"}), 400
            
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400
            
        is_verified = db_layer.verify_user(username, password)
        
        if is_verified:
            access_token = create_access_token(identity=username)
            return jsonify({
                "message": "Login successful",
                "access_token": access_token
            }), 200
            
        return jsonify({"error": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"error": f"Login failed: {str(e)}"}), 500

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({"message": "Logged out successfully (session cleared)"}), 200

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({
        "message": f"Welcome, Doctor/Analyst {current_user}!",
        "role": "Healthcare Specialist"
    }), 200

def convert_input(data):
    mapping = {
        # Sex
        "Male": 1, "Female": 0,

        # Chest Pain Type (cp)
        "Typical Angina": 0,
        "Atypical Angina": 1,
        "Non-anginal Pain": 2,
        "Asymptomatic": 3,

        # Fasting Blood Sugar (fbs)
        "Yes": 1, "No": 0,

        # Resting ECG (restecg)
        "Normal": 0,
        "ST-T wave abnormality": 1,
        "Left ventricular hypertrophy": 2,

        # Exercise Induced Angina (exang)
        "Yes": 1, "No": 0,

        # Slope of ST segment (slope)
        "Upsloping": 0,
        "Flat": 1,
        "Downsloping": 2,

        # Thalassemia (thal)
        "Normal": 3,
        "Fixed Defect": 6,
        "Reversible Defect": 7
    }

    for key, value in data.items():
        if isinstance(value, str) and value in mapping:
            data[key] = mapping[value]
    return data

@app.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    try:
        if model is None:
            return jsonify({"error": "Machine learning model not initialized. Contact administration."}), 503

        data = request.get_json()
        if not data:
            return jsonify({"error": "No patient parameters provided"}), 400

        # Create copy to convert categorical inputs to numerical
        numeric_data = convert_input(data.copy())

        # Extract features
        features = {
            'age': numeric_data.get('age'),
            'sex': numeric_data.get('sex'),
            'cp': numeric_data.get('cp'),
            'trestbps': numeric_data.get('trestbps'),
            'chol': numeric_data.get('chol'),
            'fbs': numeric_data.get('fbs'),
            'restecg': numeric_data.get('restecg'),
            'thalach': numeric_data.get('thalach'),
            'exang': numeric_data.get('exang'),
            'oldpeak': numeric_data.get('oldpeak'),
            'slope': numeric_data.get('slope'),
            'ca': numeric_data.get('ca'),
            'thal': numeric_data.get('thal')
        }

        # Check for missing features
        missing = [k for k, v in features.items() if v is None]
        if missing:
            return jsonify({"error": f"Missing medical parameters: {missing}"}), 400

        # Cast to float/int
        for k in features:
            if k in ['oldpeak']:
                features[k] = float(features[k])
            else:
                features[k] = int(features[k])

        # Create DataFrame
        df = pd.DataFrame([features])

        # Make prediction
        prediction = int(model.predict(df)[0])
        probability = float(model.predict_proba(df)[0][1])

        # Calibrate risk levels
        if probability < 0.3:
            risk_level = "Low"
        elif probability <= 0.7:
            risk_level = "Medium"
        else:
            risk_level = "High"

        # Math confidence: Probability of predicted class
        confidence = probability if prediction == 1 else (1.0 - probability)
        confidence_score = round(confidence * 100, 1)

        # Generate Explainable AI outputs
        xai_insights = explain_patient_risk(features, probability, MODEL_PATH)

        return jsonify({
            "prediction": prediction,
            "probability": round(probability, 3),
            "risk_level": risk_level,
            "confidence_score": confidence_score,
            "xai_insights": xai_insights,
            "patient_data": data  # Echo input parameters
        })

    except Exception as e:
        return jsonify({"error": f"Diagnostic prediction failed: {str(e)}"}), 500

if __name__ == '__main__':
    print(f"🚀 Starting Healthcare AI backend server on port {PORT}...")
    app.run(host='0.0.0.0', port=PORT, debug=True)
