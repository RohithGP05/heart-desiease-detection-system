"use client"

import { Activity, ShieldAlert, Heart } from "lucide-react"

export interface PresetProfile {
  name: string
  description: string
  icon: any
  color: string
  bg: string
  border: string
  data: {
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

export const PRESET_PROFILES: PresetProfile[] = [
  {
    name: "Healthy Athlete",
    description: "28yo Female, active lifestyle, optimal vitals",
    icon: Heart,
    color: "text-emerald-600",
    bg: "bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-900/50",
    data: {
      age: 28,
      sex: 0, // Female
      cp: 1,  // Atypical Angina (mild)
      trestbps: 110,
      chol: 175,
      fbs: 0, // No
      restecg: 0, // Normal
      thalach: 178, // High Max HR
      exang: 0, // No
      oldpeak: 0.0,
      slope: 0, // Upsloping
      ca: 0,
      thal: 3 // Normal
    }
  },
  {
    name: "Moderate Risk",
    description: "54yo Male, borderline cholesterol, elevated BP",
    icon: Activity,
    color: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100/80 dark:bg-amber-950/20 dark:hover:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/50",
    data: {
      age: 54,
      sex: 1, // Male
      cp: 2,  // Non-anginal pain
      trestbps: 132, // Elevated
      chol: 242, // Borderline High
      fbs: 0, // No
      restecg: 1, // ST-T abnormality
      thalach: 142, // Moderate Max HR
      exang: 0, // No
      oldpeak: 0.8, // Slight depression
      slope: 1, // Flat
      ca: 0,
      thal: 3 // Normal
    }
  },
  {
    name: "Critical Cardiac",
    description: "68yo Male, asymptomatic ischemia, multiple vessels blocked",
    icon: ShieldAlert,
    color: "text-rose-600",
    bg: "bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-900/50",
    data: {
      age: 68,
      sex: 1, // Male
      cp: 3,  // Asymptomatic (highest risk clinical correlation)
      trestbps: 155, // High
      chol: 288, // Very High
      fbs: 1, // Yes (Fasting Sugar > 120)
      restecg: 2, // Left ventricular hypertrophy
      thalach: 112, // Low Max HR
      exang: 1, // Yes (angina induced by exercise)
      oldpeak: 2.8, // Severe ST depression
      slope: 2, // Downsloping
      ca: 2, // 2 blocked vessels
      thal: 7 // Reversible defect (severe)
    }
  }
]

interface PresetSelectorProps {
  onSelect: (data: PresetProfile["data"]) => void
  disabled: boolean
}

export default function PresetSelector({ onSelect, disabled }: PresetSelectorProps) {
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        ⚡ Select Demo Patient Profiles (One-click Autofill)
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRESET_PROFILES.map((profile) => {
          const Icon = profile.icon
          return (
            <button
              key={profile.name}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(profile.data)}
              className={`flex flex-col items-start text-left p-3.5 rounded-xl border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${profile.bg} ${profile.border}`}
            >
              <div className="flex items-center gap-2 mb-1.5 w-full">
                <Icon className={`w-5 h-5 ${profile.color}`} />
                <span className="font-semibold text-slate-900 dark:text-white text-sm">
                  {profile.name}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                {profile.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
