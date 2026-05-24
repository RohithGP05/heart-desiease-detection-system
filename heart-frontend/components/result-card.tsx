"use client"

import { useEffect, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts"
import { AlertCircle, CheckCircle, ShieldAlert, Heart, Info, ArrowUpRight, TrendingUp } from "lucide-react"

interface Factor {
  feature: string
  name: string
  value: string
  contribution: number
}

interface XaiInsights {
  contributions: Record<string, number>
  top_factors: Factor[]
  recommendations: string[]
  high_risk_biomarkers: string[]
}

interface ResultCardProps {
  result: {
    prediction: number
    probability: number
    risk_level: string
    confidence_score: number
    xai_insights: XaiInsights
  }
}

export default function ResultCard({ result }: ResultCardProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const probabilityPercent = Math.round(result.probability * 100)
  const confidence = result.confidence_score

  const getRiskStyles = (level: string) => {
    switch (level.toLowerCase()) {
      case "low":
        return {
          bg: "bg-emerald-50/50 dark:bg-emerald-950/10",
          border: "border-emerald-200 dark:border-emerald-900/50",
          text: "text-emerald-700 dark:text-emerald-400",
          accent: "from-emerald-500 to-teal-500",
          icon: CheckCircle,
          description: "Low probability of coronary artery restriction."
        }
      case "medium":
        return {
          bg: "bg-amber-50/50 dark:bg-amber-950/10",
          border: "border-amber-200 dark:border-amber-900/50",
          text: "text-amber-700 dark:text-amber-400",
          accent: "from-amber-500 to-orange-500",
          icon: AlertCircle,
          description: "Moderate cardiac risk. Borderline biomarkers detected."
        }
      case "high":
        return {
          bg: "bg-rose-50/50 dark:bg-rose-950/10",
          border: "border-rose-200 dark:border-rose-900/50",
          text: "text-rose-700 dark:text-rose-400",
          accent: "from-rose-500 to-red-600",
          icon: ShieldAlert,
          description: "Critical risk detected. Multiple severe ischemic biomarkers present."
        }
      default:
        return {
          bg: "bg-slate-50 dark:bg-slate-900/10",
          border: "border-slate-200 dark:border-slate-800",
          text: "text-slate-700 dark:text-slate-400",
          accent: "from-blue-500 to-indigo-500",
          icon: Info,
          description: "Analysis complete."
        }
    }
  }

  const styles = getRiskStyles(result.risk_level)
  const RiskIcon = styles.icon

  // Clean recommendations markdown tags for frontend rendering
  const cleanRec = (text: string) => {
    return text.replace(/\*\*|🔴|🟡|💚/g, "")
  }

  const getRecType = (text: string) => {
    if (text.includes("🔴")) return "critical"
    if (text.includes("🟡")) return "warning"
    return "healthy"
  }

  // Prepping Explainable AI Chart data
  const chartData = result.xai_insights.top_factors.map(factor => ({
    name: factor.name,
    influence: factor.contribution,
    val: factor.value
  })).reverse() // Reverse to show highest on top in Recharts layout

  // Circular gauge params
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (result.probability * circumference)

  return (
    <div
      className={`transform transition-all duration-500 h-full ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className={`bg-white dark:bg-slate-950 rounded-2xl shadow-xl p-6 md:p-8 border border-slate-200 dark:border-slate-900 flex flex-col justify-between h-full`}>
        <div>
          {/* Header Summary */}
          <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-900 pb-5 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                AI Diagnostic Summary
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-white mt-1">
                Clinical Risk Report
              </h2>
            </div>
            <div className={`p-2.5 rounded-xl ${styles.bg} border ${styles.border}`}>
              <Heart className={`w-6 h-6 text-red-500 animate-pulse`} />
            </div>
          </div>

          {/* Risk Score & Gauge Section */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
            {/* Visual Gauge */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-40 h-40">
                {/* SVG Radial Gauge */}
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Active Arc */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-blue-600 transition-all duration-1000 ease-out"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      stroke: `url(#riskGradient)`,
                    }}
                  />
                  <defs>
                    <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
                    {probabilityPercent}%
                  </span>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mt-0.5">
                    Risk Probability
                  </span>
                </div>
              </div>
            </div>

            {/* Assessment Statement */}
            <div className="md:col-span-7 space-y-3.5">
              <div className={`p-4 rounded-xl border ${styles.bg} ${styles.border} flex gap-3`}>
                <RiskIcon className={`w-5.5 h-5.5 ${styles.text} shrink-0 mt-0.5`} />
                <div>
                  <h3 className={`font-bold ${styles.text} text-base`}>
                    {result.risk_level} Risk Category
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {styles.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 text-center">
                <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Diagnosis
                  </span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white mt-1 block">
                    {result.prediction === 0 ? "Negative (Healthy)" : "Positive (Ischemic)"}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 p-3 rounded-xl">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    AI Certainty
                  </span>
                  <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
                    {confidence}% Confidence
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Explainable AI Recharts Bar Chart */}
          <div className="mb-8 bg-slate-50 dark:bg-slate-900/20 p-4.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
            <div className="flex items-center gap-1.5 mb-4">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Explainable AI (XAI) Biomarker Contributions
              </span>
            </div>
            
            <div className="h-44 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={110}
                    tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-lg border border-slate-800 text-[10px] leading-tight">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-slate-400 mt-0.5">Value: {data.val}</p>
                            <p className="text-emerald-400 font-semibold mt-1">
                              Contribution: +{data.influence}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="influence" radius={[0, 4, 4, 0]} barSize={12}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.influence > 15
                            ? "#f43f5e"
                            : entry.influence > 5
                            ? "#fbbf24"
                            : "#3b82f6"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-1">
              * Bars represent how much each abnormal vitals metric drove the risk calculation upwards.
            </p>
          </div>

          {/* Clinical Recommendations Section */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              Tailored Clinical Lifestyle Recommendations
            </span>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {result.xai_insights.recommendations.map((rec, index) => {
                const recType = getRecType(rec)
                let borderStyle = "border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/20"
                let markerStyle = "bg-emerald-500"
                if (recType === "critical") {
                  borderStyle = "border-rose-100 dark:border-rose-950/20 bg-rose-50/20"
                  markerStyle = "bg-rose-500"
                } else if (recType === "warning") {
                  borderStyle = "border-amber-100 dark:border-amber-950/20 bg-amber-50/20"
                  markerStyle = "bg-amber-500"
                }
                
                return (
                  <div
                    key={index}
                    className={`p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300 ${borderStyle}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${markerStyle} shrink-0 mt-1.5`} />
                    <p>{cleanRec(rec)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-900 text-center">
          <p className="text-[10px] text-slate-500 leading-normal max-w-lg mx-auto">
            ⚠️ <strong>Clinical Disclaimer:</strong> This cardiovascular diagnostic run is generated by a calibrated machine learning model trained on UCI health sets. It is intended for educational demonstrations and should not replace a professional cardiologist consultation.
          </p>
        </div>
      </div>
    </div>
  )
}
