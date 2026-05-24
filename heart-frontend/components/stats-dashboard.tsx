"use client"

import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ReferenceLine, LineChart, Line, CartesianGrid, Legend } from "recharts"
import { Activity, Thermometer, Flame, Scale } from "lucide-react"

interface StatsDashboardProps {
  patientData: {
    age: number
    sex: number
    cp: number
    trestbps: number
    chol: number
    fbs: number
    restecg: number
    thalach: number
    exang: number
    oldpeak: number
    slope: number
    ca: number
    thal: number
  }
}

export default function StatsDashboard({ patientData }: StatsDashboardProps) {
  // Chart 1: Blood Pressure comparison
  const bpData = [
    { name: "Optimal Vitals", value: 120, fill: "#10b981" },
    { name: "Patient BP", value: patientData.trestbps, fill: patientData.trestbps >= 140 ? "#ef4444" : patientData.trestbps >= 130 ? "#f59e0b" : "#3b82f6" },
    { name: "Hypertension Stage 1", value: 130, fill: "#f59e0b" },
    { name: "Hypertension Stage 2", value: 140, fill: "#ef4444" }
  ]

  // Chart 2: Cholesterol comparison
  const cholData = [
    { name: "Optimal Vitals", value: 200, fill: "#10b981" },
    { name: "Patient Cholesterol", value: patientData.chol, fill: patientData.chol >= 240 ? "#ef4444" : patientData.chol >= 200 ? "#f59e0b" : "#3b82f6" },
    { name: "Borderline High", value: 220, fill: "#f59e0b" },
    { name: "Clinical Danger Zone", value: 240, fill: "#ef4444" }
  ]

  // Chart 3: Max Stress Heart Rate compared with medical age guidelines (220 - age)
  const maxHRLimit = 220 - patientData.age
  // Generating a short curve of recommended heart rates by age surrounding the patient's age
  const agesRange = [30, 40, 50, 60, 70, 80]
  const hrAgeCurve = agesRange.map(a => ({
    ageGroup: `Age ${a}`,
    recommendedMax: 220 - a,
    patientPoint: a === Math.round(patientData.age / 10) * 10 ? patientData.thalach : null
  }))

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Vitals Summary Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Blood Pressure Card */}
        <div className="bg-white dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Blood Pressure</span>
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {patientData.trestbps} <span className="text-xs font-semibold text-slate-500">mmHg</span>
          </p>
          <div className="mt-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              patientData.trestbps >= 140
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20"
                : patientData.trestbps >= 130
                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
            }`}>
              {patientData.trestbps >= 140 ? "Hypertension L2" : patientData.trestbps >= 130 ? "Elevated BP" : "Optimal"}
            </span>
          </div>
        </div>

        {/* Cholesterol Card */}
        <div className="bg-white dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Cholesterol</span>
            <Scale className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {patientData.chol} <span className="text-xs font-semibold text-slate-500">mg/dl</span>
          </p>
          <div className="mt-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              patientData.chol >= 240
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20"
                : patientData.chol >= 200
                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
            }`}>
              {patientData.chol >= 240 ? "Clinical High" : patientData.chol >= 200 ? "Borderline High" : "Optimal"}
            </span>
          </div>
        </div>

        {/* Stress Heart Rate Card */}
        <div className="bg-white dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Stress Heart Rate</span>
            <Flame className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {patientData.thalach} <span className="text-xs font-semibold text-slate-500">bpm</span>
          </p>
          <div className="mt-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              patientData.thalach < 140
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
            }`}>
              {patientData.thalach < 140 ? "Low Output Response" : "Adequate Output"}
            </span>
          </div>
        </div>

        {/* Exercise ECG ST Depression Card */}
        <div className="bg-white dark:bg-slate-950 p-4.5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">ST Depression</span>
            <Thermometer className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">
            {patientData.oldpeak.toFixed(1)} <span className="text-xs font-semibold text-slate-500">mm</span>
          </p>
          <div className="mt-2.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              patientData.oldpeak >= 1.5
                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20"
                : patientData.oldpeak >= 1.0
                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
            }`}>
              {patientData.oldpeak >= 1.5 ? "Severe ECG Strain" : patientData.oldpeak >= 1.0 ? "Moderate Strain" : "Normal"}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BP Bar Chart Comparison */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">
            Resting Blood Pressure Comparison (mmHg)
          </h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bpData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9 }} />
                <YAxis domain={[60, 200]} />
                <Tooltip />
                <ReferenceLine y={120} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Optimal Threshold (120)', fill: '#10b981', fontSize: 10, position: 'top' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {bpData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cholesterol Bar Chart Comparison */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm">
          <h3 className="font-extrabold text-slate-800 dark:text-white text-sm mb-4">
            Serum Cholesterol Comparison (mg/dl)
          </h3>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cholData} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9 }} />
                <YAxis domain={[100, 350]} />
                <Tooltip />
                <ReferenceLine y={200} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Optimal Threshold (200)', fill: '#10b981', fontSize: 10, position: 'top' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45}>
                  {cholData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Max HR Heart Rate curve */}
        <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">
              Exercise Heart Rate compared with Clinical Max HR Curve (220 - Age)
            </h3>
            <span className="text-xs font-semibold text-slate-600">
              Patient Age: {patientData.age} | Maximum Heart Rate Limit: {maxHRLimit} bpm
            </span>
          </div>
          <div className="h-64 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hrAgeCurve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="ageGroup" tick={{ fill: "#64748b" }} />
                <YAxis domain={[80, 210]} />
                <Tooltip />
                <Legend />
                <Line
                  name="Normal Clinical Max HR (220 - Age)"
                  type="monotone"
                  dataKey="recommendedMax"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <ReferenceLine
                  y={patientData.thalach}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{ value: `Patient Max achieved (${patientData.thalach} bpm)`, fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-2 leading-relaxed">
            * Standard clinical guidelines state that during an exercise stress test, patients should ideally achieve at least 85% of their age-predicted maximum heart rate. Lower response counts can be an indicator of chronotropic incompetence or coronary flow restrictions.
          </p>
        </div>
      </div>
    </div>
  )
}
