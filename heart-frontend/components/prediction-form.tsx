"use client"

import type React from "react"
import { useState, useEffect } from "react"
import PresetSelector from "./preset-selector"
import { User, Activity, Flame, ShieldAlert, RotateCcw } from "lucide-react"

export interface FormData {
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

interface PredictionFormProps {
  onSubmit: (data: FormData) => void
  onReset: () => void
  isLoading: boolean
  initialValues: FormData | null
}

export default function PredictionForm({ onSubmit, onReset, isLoading, initialValues }: PredictionFormProps) {
  const defaultFormData: FormData = {
    age: 50,
    sex: 1,
    cp: 1,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 0,
    thalach: 140,
    exang: 0,
    oldpeak: 0.0,
    slope: 1,
    ca: 0,
    thal: 3,
  }

  const [formData, setFormData] = useState<FormData>(defaultFormData)

  // Auto-fill when initialValues or presets are chosen
  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues)
    }
  }, [initialValues])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: Number.parseFloat(value),
    }))
  }

  const handlePresetSelect = (presetData: FormData) => {
    setFormData(presetData)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleResetClick = () => {
    setFormData(defaultFormData)
    onReset()
  }

  return (
    <div className="space-y-6">
      {/* Patient Profile Presets */}
      <PresetSelector onSelect={handlePresetSelect} disabled={isLoading} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Demographics */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              1. Patient Demographics
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Age (years)
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Biological Sex
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              >
                <option value="0">Female</option>
                <option value="1">Male</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Resting Vitals */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              2. Resting Clinical Vitals
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Resting Blood Pressure (mmHg)
              </label>
              <input
                type="number"
                name="trestbps"
                value={formData.trestbps}
                onChange={handleChange}
                min="80"
                max="220"
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              />
              <p className="text-[10px] text-slate-500 mt-1">Normal is &lt; 120 mmHg</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Serum Cholesterol (mg/dl)
              </label>
              <input
                type="number"
                name="chol"
                value={formData.chol}
                onChange={handleChange}
                min="80"
                max="600"
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              />
              <p className="text-[10px] text-slate-500 mt-1">Optimal is &lt; 200 mg/dl</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Fasting Blood Sugar &gt; 120 mg/dl
              </label>
              <select
                name="fbs"
                value={formData.fbs}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              >
                <option value="0">No (sugar is normal)</option>
                <option value="1">Yes (diabetic or borderline)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Resting Electrocardiographic (ECG)
              </label>
              <select
                name="restecg"
                value={formData.restecg}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              >
                <option value="0">Normal</option>
                <option value="1">ST-T Wave Abnormality</option>
                <option value="2">Left Ventricular Hypertrophy</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Stress Test Vitals */}
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              3. Exercise Stress Test Performance
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Chest Pain Type
              </label>
              <select
                name="cp"
                value={formData.cp}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              >
                <option value="0">Typical Angina (effort-linked pain)</option>
                <option value="1">Atypical Angina (non-effort chest pain)</option>
                <option value="2">Non-anginal Pain (sharp chest spasms)</option>
                <option value="3">Asymptomatic (no pain, silent ischemia)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Maximum Heart Rate achieved (bpm)
              </label>
              <input
                type="number"
                name="thalach"
                value={formData.thalach}
                onChange={handleChange}
                min="60"
                max="240"
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              />
              <p className="text-[10px] text-slate-500 mt-1">Higher is safer (220 - age is target)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Exercise Induced Angina
              </label>
              <select
                name="exang"
                value={formData.exang}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              >
                <option value="0">No (exertion does not cause pain)</option>
                <option value="1">Yes (pain occurs during workout)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                ST Depression (oldpeak)
              </label>
              <input
                type="number"
                name="oldpeak"
                value={formData.oldpeak}
                onChange={handleChange}
                min="0.0"
                max="10.0"
                step="0.1"
                required
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              />
              <p className="text-[10px] text-slate-500 mt-1">Normal is &lt; 1.0 (ECG strain indicator)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                ST Slope Type
              </label>
              <select
                name="slope"
                value={formData.slope}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              >
                <option value="0">Upsloping (normal/healthy exercise ECG)</option>
                <option value="1">Flat (oxygen restriction indicator)</option>
                <option value="2">Downsloping (severe ischemia warning)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Major Blocked Vessels (ca)
              </label>
              <select
                name="ca"
                value={formData.ca}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              >
                <option value="0">0 vessels blocked (normal)</option>
                <option value="1">1 vessel blocked</option>
                <option value="2">2 vessels blocked</option>
                <option value="3">3 vessels blocked</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                Thalassemia
              </label>
              <select
                name="thal"
                value={formData.thal}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
              >
                <option value="3">Normal blood flow</option>
                <option value="6">Fixed Defect (chronic ischemia / old scar)</option>
                <option value="7">Reversible Defect (active coronary narrowing)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Action Controls */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-indigo-500/35 transition-all duration-200 text-sm cursor-pointer disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Performing Diagnostic...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Analyze Health Vitals
              </span>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleResetClick}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-1.5 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold py-3 px-5 rounded-xl transition-all duration-200 text-sm disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
