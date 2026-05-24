# HeartAI: Calibrated Heart Disease AI Diagnostic & Analytics Platform

[![HIPAA Compliant](https://img.shields.io/badge/HIPAA-Secure-emerald?style=flat-square&logo=shield)](https://github.com)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.0-blue?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Calibrated XGBoost](https://img.shields.io/badge/Model-XGBoost%20Calibrated-indigo?style=flat-square&logo=scikitlearn)](https://xgboost.readthedocs.io)
[![XAI Engine](https://img.shields.io/badge/Explainable_AI-XAI-violet?style=flat-square)](https://github.com)
[![Zero-Config Auth](https://img.shields.io/badge/Auth-SQLite_Fallback-orange?style=flat-square&logo=sqlite)](https://sqlite.org)

HeartAI is a medical platform designed to assist cardiologists and healthcare specialists in early coronary artery disease screening. By bridging standard clinical parameters (resting vitals, stress tests, demographics) with an ensembled **Calibrated XGBoost Classifier**, HeartAI returns highly accurate probability calculations, local **Explainable AI (XAI)** biomarker contributions, and programmatically tailored clinical lifestyle recommendations.

---

## 🏗️ Systems Architecture & ML Pipeline

```mermaid
graph TD
    classDef primary fill:#4f46e5,stroke:#4f46e5,color:#fff
    classDef secondary fill:#0ea5e9,stroke:#0ea5e9,color:#fff
    classDef highlight fill:#10b981,stroke:#10b981,color:#fff
    classDef fallback fill:#f59e0b,stroke:#f59e0b,color:#fff

    subgraph Client ["Next.js Responsive Specialist Dashboard"]
        F_Auth["Specialist Auth Guard"]
        F_Form["Categorized Parameters Input & Presets"]
        F_Gauge["Dynamic Radial Risk Gauge"]
        F_XAI["Recharts Local Biomarker Influence Chart"]
        F_Analytics["Recharts Comparative Clinical Range Charts"]
    end

    subgraph Server ["Flask Production API Server"]
        B_CORS["Dynamic CORS & JWT Filter"]
        B_DB{"MongoDB Connected?"}
        B_Mongo[("MongoDB Atlas Cloud")]
        B_Sqlite[("SQLite Local Fallback DB")]
        B_Model["Pipeline Controller"]
        B_XAI_Eng["Explainable AI Contribution Engine"]
    end

    subgraph Model ["Scikit-learn Calibrated ML Pipeline"]
        M_Impute["Simple Imputer (Median)"]
        M_Scale["Standard Scaler"]
        M_Estimator["Ensembled XGBoost (3-Fold CV)"]
        M_Calibrate["Isotonic Probability Calibrator"]
    end

    %% Client Flows
    F_Form -->|POST Vitals with JWT Token| B_CORS
    B_DB -->|No / Timeout| B_Sqlite
    B_DB -->|Yes| B_Mongo
    F_Auth -->|Register / Login| B_CORS
    B_CORS --> B_DB

    %% Server to Model
    B_CORS -->|Validate Schema & numerical cast| B_Model
    B_Model -->|Feature Dataframe| M_Impute
    M_Impute --> M_Scale
    M_Scale --> M_Estimator
    M_Estimator --> M_Calibrate
    M_Calibrate -->|Calibrated Probability| B_XAI_Eng
    
    %% Output Flow
    B_XAI_Eng -->|Risk, Confidence, Contributions & Recommendations JSON| F_Form
    F_Form --> F_Gauge
    F_Form --> F_XAI
    F_Form --> F_Analytics

    class F_Form,F_Gauge,F_XAI,F_Analytics primary
    class B_CORS,B_Model,B_XAI_Eng secondary
    class M_Impute,M_Scale,M_Estimator,M_Calibrate highlight
    class B_Sqlite fallback
```

---

## 🌟 Key Application Features

1. **Healthcare-Branded Dashboard Portal**: Sleek typography, spacing, customized inputs, responsive double-panel grid layouts, and active specialist login sessions.
2. **Double-Calibrated XGBoost Model**: Leverages 3-fold cross-validated probability calibration (Isotonic Regression) over ensembled extreme gradient boosted trees to output highly reliable clinical risk percentages.
3. **Local Explainable AI (XAI)**: Evaluates the specific patient parameters against optimal biological baselines, normalized by global feature importances, to output a clear horizontal Recharts bar chart showing exactly which metrics drove risk calculation upwards.
4. **Tailored Clinical Advice**: Programmatically issues high-impact warning logs and lifestyle recommendations (blood pressure adjustments, lipid panels, coronary screening alerts) based on the patient's anomalous markers.
5. **Zero-Configuration SQLite Fallback**: Automatic, zero-configuration local database initialization if MongoDB Atlas is offline, allowing registration, login, and auth validation to work instantly.
6. **Autofill Patient Profiles (Demo Presets)**: Fast demo loaders enabling reviewers to click a profile (e.g. *Healthy Athlete*, *Borderline Risk*, *Critical Cardiac*) to instantly populate the form and evaluate outcomes.
7. **Model Transparency Metrics**: Visual confusion matrices, sensitivity analyses, and interactive ROC Curves showing the technical pipeline configurations.

---

## 💻 Interactive Screenshot Section

Prepare local screenshot capture placements:

### 1. Diagnostic Portal Dashboard
*(Autofill presets, organized demographics, vitals, and stress performance parameters ready for diagnostic compilation)*
`[Placeholder: C:\Users\Hemalatha P\Desktop\Improve\heart-frontend\public\screenshot_dashboard.png]`

### 2. Explainable AI Clinical Risk Assessment
*(Animated radial risk gauge, confidence indicators, Recharts local biomarker influence metrics, and tailored medical lifestyle recommendations)*
`[Placeholder: C:\Users\Hemalatha P\Desktop\Improve\heart-frontend\public\screenshot_prediction.png]`

### 3. Patient Vitals Comparison Charts
*(Interactive Recharts comparing resting blood pressure, cholesterol count, and maximum heart rate achieving levels against normal medical thresholds)*
`[Placeholder: C:\Users\Hemalatha P\Desktop\Improve\heart-frontend\public\screenshot_analytics.png]`

### 4. Technical Model Performance Reports
*(Interactive ROC curves, precision/recall grids, low false-negative confusion matrix logs, and pipeline architectures)*
`[Placeholder: C:\Users\Hemalatha P\Desktop\Improve\heart-frontend\public\screenshot_performance.png]`

---

## 🛠️ Installation & Local Running Guide

### Prerequisites
* Python 3.10+ (PIP environment)
* Node.js 18+ (NPM package manager)

### 1. Initialize and Run the Backend API
Navigate to the backend directory, install requirements, and boot up the server:
```bash
# Move to backend
cd heart-backend

# Install python dependencies
pip install -r requirements.txt

# Start the Flask API with UTF-8 support
python -X utf8 app.py
```
> [!NOTE]
> The backend server will automatically check if the model pipeline loads correctly. If it detects scikit-learn version mismatches from serialized files, it will **automatically retrain the calibrated pipeline** on `Data/heart.csv` on the fly to match your system specs.
>
> If MongoDB is unreachable, it will trigger the fallback, initializing `heart_disease.db` locally.

### 2. Initialize and Run the Next.js Frontend
Navigate to the frontend directory, install dependencies, and start the development server:
```bash
# Move to frontend
cd ../heart-frontend

# Install dependencies (ignoring conflicts with React 19)
npm install --legacy-peer-deps

# Start Next.js development server
npm run dev
```

The application is now running locally:
* **Frontend Portal**: `http://localhost:3000`
* **Healthcare API**: `http://localhost:5000`

---

## 🚀 Production Deployment Instructions

### Frontend → Vercel
1. Install the Vercel CLI or link your repository to the [Vercel Dashboard](https://vercel.com).
2. Set the root directory to `heart-frontend`.
3. Configure the following environment variable:
   * `NEXT_PUBLIC_API_URL` = `https://your-backend-render-url.onrender.com`
4. Deploy the project. The build configurations will automatically execute `next build` and optimize files.

### Backend → Render / Railway
1. Create a Web Service on [Render](https://render.com) linked to your repository.
2. Set the root directory to `heart-backend`.
3. Set the **Build Command** to:
   ```bash
   pip install -r requirements.txt && python -X utf8 train_model.py
   ```
4. Set the **Start Command** to:
   ```bash
   gunicorn app:app --bind 0.0.0.0:$PORT
   ```
5. Configure the following environment variables:
   * `JWT_SECRET_KEY` = `your-custom-production-jwt-hash-key`
   * `MONGO_URI` = `your-mongodb-atlas-connection-string` (Leave blank to use persistent local SQLite storage)
   * `ALLOWED_ORIGINS` = `https://your-frontend-vercel-url.vercel.app,http://localhost:3000`
6. Deploy the web service.

---

## 🔮 Future Cardiac Research Roadmap
* **Wearable Real-time Sync**: Integrating wearable sensor APIs (Apple HealthKit, Fitbit) to log resting heart rate and blood pressure trends continuously.
* **Deep Learning ECG Analysis**: Implementing ensembled multi-channel convolutional neural networks (CNNs) to analyze raw 12-lead ECG wave waveforms.
* **Cardiology PDF Exports**: Compiling elegant, print-ready clinician diagnostic summaries in PDF format complete with signature blocks.
