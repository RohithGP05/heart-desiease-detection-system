import requests
import random

# Base URL
BASE_URL = "http://localhost:5000"

# Generate a unique username for testing database integrity
test_username = f"dr_test_{random.randint(1000, 9999)}"
test_password = "secure_cardiologist_pass_123"

print("🔬 Running Integration Test for Healthcare AI API...")
print("--------------------------------------------------")

# 1. Test registration
print("🔄 Step 1: Registering new healthcare specialist...")
try:
    reg_res = requests.post(
        f"{BASE_URL}/register",
        json={"username": test_username, "password": test_password}
    )
    reg_data = reg_res.json()
    print(f"Status Code: {reg_res.status_code}")
    print(f"Response: {reg_data}")
    
    if reg_res.status_code not in [201, 400]:
        print("❌ Registration test failed!")
        exit(1)
except Exception as e:
    print(f"❌ Connection to API failed: {e}. Please ensure the backend is running.")
    exit(1)

# 2. Test login
print("\n🔄 Step 2: Logging in to acquire JWT security token...")
login_res = requests.post(
    f"{BASE_URL}/login",
    json={"username": test_username, "password": test_password}
)
login_data = login_res.json()
print(f"Status Code: {login_res.status_code}")
if login_res.status_code != 200:
    print("❌ Login test failed!")
    exit(1)

token = login_data.get("access_token")
print("✅ JWT Access Token acquired successfully!")

# 3. Test protected route
print("\n🔄 Step 3: Verifying session credentials on protected clinic portal...")
prot_res = requests.get(
    f"{BASE_URL}/protected",
    headers={"Authorization": f"Bearer {token}"}
)
print(f"Status Code: {prot_res.status_code}")
print(f"Response: {prot_res.json()}")

# 4. Test prediction with XAI
print("\n🔄 Step 4: Submitting patient cardiovascular parameters for AI prediction...")
patient_parameters = {
    "age": 63,
    "sex": "Male",
    "cp": "Asymptomatic",
    "trestbps": 145,
    "chol": 233,
    "fbs": "Yes",
    "restecg": "Normal",
    "thalach": 150,
    "exang": "No",
    "oldpeak": 2.3,
    "slope": "Upsloping",
    "ca": 0,
    "thal": 3  # Normal
}

pred_res = requests.post(
    f"{BASE_URL}/predict",
    json=patient_parameters,
    headers={"Authorization": f"Bearer {token}"}
)
print(f"Status Code: {pred_res.status_code}")
if pred_res.status_code != 200:
    print(f"❌ Prediction test failed! Error details: {pred_res.text}")
    exit(1)

response_data = pred_res.json()
print("✅ Diagnostic prediction completed successfully!")
print("--------------------------------------------------")
print(f"🔮 DIAGNOSIS       : {'HEART DISEASE DETECTED' if response_data['prediction'] == 1 else 'NO HEART DISEASE DETECTED'}")
print(f"📈 RISK PROBABILITY: {response_data['probability'] * 100:.1f}%")
print(f"📊 RISK LEVEL       : {response_data['risk_level']}")
print(f"🎯 CONFIDENCE SCORE : {response_data['confidence_score']}%")
print("\n🩺 EXPLAINABLE AI DRIVERS (Top Contributing Factors):")
for factor in response_data['xai_insights']['top_factors']:
    print(f" - {factor['name']} ({factor['value']}): +{factor['contribution']}% risk impact")

print("\n💚 CLINICAL LIFESTYLE RECOMMENDATIONS:")
for rec in response_data['xai_insights']['recommendations'][:3]:
    print(f" {rec}")

print("--------------------------------------------------")
print("🎉 All Integration Tests Passed Successfully!")
