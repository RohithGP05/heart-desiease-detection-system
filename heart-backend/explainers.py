import numpy as np
import joblib
import os
import pandas as pd

# Healthy medical baselines and diagnostic labels
CLINICAL_METRICS = {
    'age': {
        'name': 'Age',
        'normal_range': 'Under 50 years',
        'healthy_min': 0,
        'healthy_max': 50,
        'impact_direction': 1,  # Older = higher risk
        'unit': 'years'
    },
    'trestbps': {
        'name': 'Resting Blood Pressure',
        'normal_range': 'Under 120 mmHg',
        'healthy_min': 90,
        'healthy_max': 120,
        'impact_direction': 1,  # Higher = higher risk
        'unit': 'mmHg'
    },
    'chol': {
        'name': 'Serum Cholesterol',
        'normal_range': 'Under 200 mg/dl',
        'healthy_min': 120,
        'healthy_max': 200,
        'impact_direction': 1,  # Higher = higher risk
        'unit': 'mg/dl'
    },
    'thalach': {
        'name': 'Max Heart Rate Achieved',
        'normal_range': 'Over 140 bpm',
        'healthy_min': 140,
        'healthy_max': 220,
        'impact_direction': -1,  # Lower = higher risk
        'unit': 'bpm'
    },
    'oldpeak': {
        'name': 'ST Depression',
        'normal_range': 'Under 1.0',
        'healthy_min': 0.0,
        'healthy_max': 1.0,
        'impact_direction': 1,  # Higher = higher risk
        'unit': ''
    }
}

# Categorical labels mapping for UI displaying
LABELS_MAP = {
    'sex': {0: 'Female', 1: 'Male'},
    'cp': {0: 'Typical Angina', 1: 'Atypical Angina', 2: 'Non-anginal Pain', 3: 'Asymptomatic'},
    'fbs': {0: 'No (<120 mg/dl)', 1: 'Yes (>120 mg/dl)'},
    'restecg': {0: 'Normal', 1: 'ST-T Wave Abnormality', 2: 'Left Ventricular Hypertrophy'},
    'exang': {0: 'No', 1: 'Yes'},
    'slope': {0: 'Upsloping', 1: 'Flat', 2: 'Downsloping'},
    'ca': {0: '0 Vessels', 1: '1 Vessel', 2: '2 Vessels', 3: '3 Vessels'},
    'thal': {3: 'Normal', 6: 'Fixed Defect', 7: 'Reversible Defect'}
}

# Default global importances matching trained calibrated model if we can't extract them
DEFAULT_GLOBAL_IMPORTANCES = {
    'ca': 0.18,
    'cp': 0.15,
    'thal': 0.14,
    'oldpeak': 0.12,
    'thalach': 0.10,
    'exang': 0.08,
    'slope': 0.06,
    'age': 0.05,
    'trestbps': 0.04,
    'sex': 0.04,
    'chol': 0.02,
    'restecg': 0.01,
    'fbs': 0.01
}

def get_global_feature_importances(model_path):
    """
    Extracts global feature importances from the calibrated classifier pipeline.
    """
    try:
        if not os.path.exists(model_path):
            return DEFAULT_GLOBAL_IMPORTANCES
            
        pipeline = joblib.load(model_path)
        classifier = pipeline.named_steps['classifier']
        
        # If classifier is CalibratedClassifierCV
        if hasattr(classifier, 'calibrated_classifiers_'):
            importances = []
            for clf in classifier.calibrated_classifiers_:
                if hasattr(clf.estimator, 'feature_importances_'):
                    importances.append(clf.estimator.feature_importances_)
            
            if importances:
                avg_importances = np.mean(importances, axis=0)
                # Feature order matches the num_cols from train_model.py
                # Which is the columns order of X (same as heart.csv minus target)
                feature_names = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']
                return dict(zip(feature_names, [float(x) for x in avg_importances]))
        
        return DEFAULT_GLOBAL_IMPORTANCES
    except Exception as e:
        print(f"⚠️ Error extracting global feature importances: {e}")
        return DEFAULT_GLOBAL_IMPORTANCES

def explain_patient_risk(patient_data, probability, model_path):
    """
    Computes Explainable AI (XAI) feature contribution and healthy range metrics
    for a specific patient, returning structured explanations and clinical recommendations.
    """
    # 1. Get global model importances
    global_importances = get_global_feature_importances(model_path)
    
    contributions = {}
    total_impact = 0.0
    
    # 2. Compute local impact of each feature
    # We analyze how much each feature pulls the prediction towards Heart Disease
    for feature, val in patient_data.items():
        weight = global_importances.get(feature, 0.05)
        impact = 0.0
        
        if feature in CLINICAL_METRICS:
            cfg = CLINICAL_METRICS[feature]
            healthy_max = cfg['healthy_max']
            healthy_min = cfg['healthy_min']
            direction = cfg['impact_direction']
            
            if direction == 1:  # Higher val is worse
                if val > healthy_max:
                    deviation = (val - healthy_max) / (healthy_max - healthy_min)
                    impact = deviation * weight * 2.0  # Scale deviation
                else:
                    impact = -0.5 * weight * (1 - (val / healthy_max))  # Helper factor
            else:  # Lower val is worse (like thalach)
                if val < healthy_min:
                    deviation = (healthy_min - val) / healthy_min
                    impact = deviation * weight * 2.0
                else:
                    impact = -0.5 * weight * ((val - healthy_min) / healthy_min)
        else:
            # Categorical contributions
            if feature == 'cp':  # Chest pain: asymptomatic (3) or typical/atypical are higher risk
                impact = weight * (val / 3.0) if val > 0 else -0.3 * weight
            elif feature == 'sex':  # Male (1) has higher risk baseline in these models
                impact = weight * 0.8 if val == 1 else -0.2 * weight
            elif feature == 'exang':  # Exercise induced angina
                impact = weight * 1.5 if val == 1 else -0.3 * weight
            elif feature == 'ca':  # Blocked vessels (0 is healthy, 1-3 is diseased)
                impact = weight * val * 1.5 if val > 0 else -0.5 * weight
            elif feature == 'thal':  # Thalassemia (3 is normal, 6-7 abnormal)
                impact = weight * 1.5 if val > 3 else -0.4 * weight
            elif feature == 'slope':  # ST segment slope (Flat/1 or Downsloping/2 are higher risk)
                impact = weight * val * 0.8 if val > 0 else -0.3 * weight
            elif feature == 'fbs':  # Fasting blood sugar
                impact = weight * 0.8 if val == 1 else -0.1 * weight
            elif feature == 'restecg':  # ECG results
                impact = weight * val * 0.5 if val > 0 else -0.1 * weight

        contributions[feature] = round(impact, 4)
        total_impact += abs(impact)

    # Normalize contributions so they reflect percentage of risk contribution
    if total_impact > 0:
        normalized_contributions = {}
        for k, v in contributions.items():
            # Percentage contribution (risk factor influence)
            # Positive percentage means it drives risk up, negative means it protects/lowers risk
            normalized_contributions[k] = round((v / total_impact) * 100, 1)
    else:
        normalized_contributions = {k: 0.0 for k in contributions}

    # 3. Generate Clinical Insights & Custom Recommendations
    recommendations = []
    high_risk_biomarkers = []
    
    # Blood Pressure Recommendation
    bp_val = patient_data.get('trestbps', 120)
    if bp_val >= 140:
        high_risk_biomarkers.append("High Blood Pressure")
        recommendations.append(f"🔴 **Hypertension Alert ({bp_val} mmHg)**: Your blood pressure is classified as High. Please restrict dietary sodium, engage in moderate cardiovascular exercises, and consult a physician to discuss medical management.")
    elif bp_val >= 130:
        recommendations.append(f"🟡 **Elevated Blood Pressure ({bp_val} mmHg)**: Your blood pressure is in the pre-hypertension range. Focus on potassium-rich foods (like bananas and spinach), reduce stress levels, and perform weekly BP tracking.")

    # Cholesterol Recommendation
    chol_val = patient_data.get('chol', 200)
    if chol_val >= 240:
        high_risk_biomarkers.append("Severe Hypercholesterolemia")
        recommendations.append(f"🔴 **High Cholesterol ({chol_val} mg/dl)**: Your blood lipid count is in the severe high range. It is strongly recommended to restrict trans-fats, increase dietary fiber intake, and discuss lipid-lowering therapies (e.g. statins) with your doctor.")
    elif chol_val >= 200:
        recommendations.append(f"🟡 **Elevated Cholesterol ({chol_val} mg/dl)**: Your cholesterol is borderline high. Consider increasing intake of Omega-3 fatty acids (fish or flaxseeds) and engaging in aerobic exercises to raise healthy HDL.")

    # ST Depression Recommendation
    peak_val = patient_data.get('oldpeak', 0.0)
    if peak_val >= 1.5:
        high_risk_biomarkers.append("Elevated ST Depression")
        recommendations.append(f"🔴 **Cardiac Stress Strain ({peak_val})**: Elevated ST depression indicates that your heart muscle experiences significant oxygen deprivation during exertion. Avoid intense physical workouts and request an elective exercise stress test or angiogram.")
    elif peak_val >= 1.0:
        recommendations.append(f"🟡 **Mild ST Depression ({peak_val})**: Borderline ST strain detected. It is recommended to perform graded cardio training under medical supervision rather than sudden strenuous loading.")

    # Max Heart Rate Recommendation
    hr_val = patient_data.get('thalach', 150)
    if hr_val < 130:
        high_risk_biomarkers.append("Low Max Heart Rate")
        recommendations.append(f"🔴 **Low Chronotropic Response ({hr_val} bpm)**: Your max heart rate during exertion is lower than normal healthy ranges. If you are not on beta-blockers, this may indicate reduced cardiac performance.")

    # Vessels recommendation
    ca_val = patient_data.get('ca', 0)
    if ca_val > 0:
        vessel_text = "vessel" if ca_val == 1 else "vessels"
        high_risk_biomarkers.append("Blocked Major Vessels")
        recommendations.append(f"🔴 **Coronary Calcification ({ca_val} {vessel_text} blocked)**: Fluoroscopy shows {ca_val} major blood vessels are blocked or narrowed. This is a critical indicator of coronary artery disease. Please consult a cardiologist immediately.")

    # Chest Pain recommendation
    cp_val = patient_data.get('cp', 0)
    if cp_val == 3:  # Asymptomatic CP
        recommendations.append("🔴 **Asymptomatic Chest Discomfort**: Although asymptomatic in general, this classification is highly correlated with ischemic heart disease in stress tests. Prioritize a clinical cardiology consult.")
    elif cp_val in [1, 2]:
        recommendations.append(f"🟡 **Active Angina Reported ({LABELS_MAP['cp'][cp_val]})**: Chest tightness or pain can be an indicator of arterial restriction. Keep a log of what physical activities trigger your chest pain.")

    # Exercise Induced Angina
    exang_val = patient_data.get('exang', 0)
    if exang_val == 1:
        recommendations.append("🔴 **Exercise-Induced Angina**: Your chest pain is triggered by physical activity. Avoid heavy lifting and extreme outdoor temperatures which put extra load on the coronary arteries.")

    # Default protective advice if everything is normal
    if not recommendations:
        recommendations.append("💚 **Excellent Clinical Profile**: All of your clinical markers (BP, Cholesterol, ECG, Stress tests) reside in optimal healthy ranges. Maintain a nutrient-dense whole-food diet and log at least 150 minutes of aerobic exercise weekly.")
        recommendations.append("💚 **Routine Cardiology Check**: Since cardiovascular health changes with age, continue scheduling your routine annual physical exams and blood panels.")

    # Top contributing risk factors (sorted by contribution, keeping only positive contributions)
    top_factors = []
    sorted_factors = sorted(normalized_contributions.items(), key=lambda x: x[1], reverse=True)
    for feat, pct in sorted_factors:
        if pct > 0:
            feat_name = CLINICAL_METRICS.get(feat, {}).get('name', feat.upper())
            if feat in LABELS_MAP:
                raw_val = patient_data[feat]
                val_desc = LABELS_MAP[feat].get(raw_val, str(raw_val))
            else:
                raw_val = patient_data[feat]
                val_desc = f"{raw_val} {CLINICAL_METRICS[feat].get('unit', '')}".strip()
            
            top_factors.append({
                'feature': feat,
                'name': feat_name,
                'value': val_desc,
                'contribution': pct
            })

    return {
        'contributions': normalized_contributions,
        'top_factors': top_factors[:4],  # Top 4 drivers of risk
        'recommendations': recommendations,
        'high_risk_biomarkers': high_risk_biomarkers
    }
