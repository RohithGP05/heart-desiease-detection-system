"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PredictionForm, { FormData } from "@/components/prediction-form"
import ResultCard from "@/components/result-card"
import StatsDashboard from "@/components/stats-dashboard"
import ModelPerformance from "@/components/model-performance"
import { ShieldCheck, HeartPulse, Stethoscope, BarChart3, Database, Lock, AlertCircle, RefreshCw } from "lucide-react"

interface PredictionResult {
  prediction: number
  probability: number
  risk_level: string
  confidence_score: number
  xai_insights: {
    contributions: Record<string, number>
    top_factors: Array<{
      feature: string
      name: string
      value: string
      contribution: number
    }>
    recommendations: string[]
    high_risk_biomarkers: string[]
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"diagnostics" | "analytics" | "model">("diagnostics")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [lastPatientData, setLastPatientData] = useState<FormData | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null) // null = loading
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
    
    // Listen for global storage updates
    const handleStorageChange = () => {
      const token = localStorage.getItem("token")
      setIsLoggedIn(!!token)
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handlePredictSubmit = async (formData: FormData) => {
    setLoading(true)
    setResult(null)
    setLastPatientData(formData)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const token = localStorage.getItem("token")

      if (!token) {
        throw new Error("No active specialist session. Please authenticate.")
      }

      const response = await fetch(`${apiUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 422) {
          localStorage.removeItem("token")
          window.dispatchEvent(new Event("storage"))
          throw new Error("Your diagnostic session has expired. Please login again.")
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Diagnostics Server Error: ${response.status}`)
      }

      const data: PredictionResult = await response.json()
      setResult(data)
      showToast("Clinical prediction and XAI insights compiled successfully!", "success")
    } catch (error) {
      console.error("Clinical predictive run error:", error)
      showToast(
        error instanceof Error ? error.message : "Diagnostics API is unreachable. Check that backend is running.",
        "error"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleFormReset = () => {
    setResult(null)
    setLastPatientData(null)
  }

  // Session guard check
  if (isLoggedIn === null) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-semibold mt-3">Verifying clinic credentials...</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-block p-4 bg-rose-50 dark:bg-rose-950/20 rounded-3xl border border-rose-100 dark:border-rose-900/50 text-rose-500 animate-bounce">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Specialist Portal Locked</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              This cardiodiagnostic system contains regulated metrics. Specialist credentials are required to run automated AI predictions.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-md shadow-blue-500/25 transition-all"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-slate-300 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-all"
            >
              Register Account
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50/50 dark:bg-slate-950/20">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Portal Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl shadow-md shadow-blue-500/25 text-white">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                  Heart Disease AI Diagnostic System
                </h1>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                  <ShieldCheck className="w-3 h-3" />
                  HIPAA Secure
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Calibrated XGBoost Machine Learning Pipeline with Explainable AI (XAI) Patient Insights
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-slate-200/50 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200/20 flex shrink-0">
            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "diagnostics"
                  ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              Diagnostics Panel
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "analytics"
                  ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Vitals Analytics
            </button>
            <button
              onClick={() => setActiveTab("model")}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "model"
                  ? "bg-white dark:bg-slate-950 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Model Performance
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="min-h-[60vh]">
          
          {/* TAB 1: Diagnostics Panel */}
          {activeTab === "diagnostics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Form Parameters */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-950 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-900 p-6 md:p-8">
                <div className="mb-6 border-b border-slate-100 dark:border-slate-900 pb-4">
                  <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                    Patient Medical Parameters
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    Enter the physiological and stress test metrics collected during active clinical testing to run diagnostic analysis.
                  </p>
                </div>
                
                <PredictionForm
                  onSubmit={handlePredictSubmit}
                  onReset={handleFormReset}
                  isLoading={loading}
                  initialValues={lastPatientData}
                />
              </div>

              {/* Right Column: Diagnostic Results */}
              <div className="lg:col-span-5 h-full min-h-[500px]">
                {loading ? (
                  <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-lg p-8 h-full flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <div className="w-14 h-14 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-indigo-500 animate-pulse">
                        <HeartPulse className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-center space-y-1 max-w-xs">
                      <p className="text-sm font-extrabold text-slate-800 dark:text-white">Compiling Biomarkers</p>
                      <p className="text-xs text-slate-500 leading-normal">
                        Calibrated XGBoost classifier is processing scaled parameters against dataset folds...
                      </p>
                    </div>
                  </div>
                ) : result ? (
                  <ResultCard result={result} />
                ) : (
                  <div className="bg-white dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 h-full min-h-[500px] flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 dark:text-slate-600 mb-4 border border-slate-100 dark:border-slate-800/80">
                      <HeartPulse className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                      Awaiting Diagnostic Input
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                      Autofill a profile or enter custom numbers on the left, then click <strong>"Analyze Health Vitals"</strong> to see AI predictive explanations.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Vitals Analytics */}
          {activeTab === "analytics" && (
            <div className="h-full">
              {lastPatientData ? (
                <StatsDashboard patientData={lastPatientData} />
              ) : (
                <div className="bg-white dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-12">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full text-slate-400 dark:text-slate-600 inline-block mb-4 border border-slate-100 dark:border-slate-800/80">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                    No Active Analytics Data
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5 leading-relaxed">
                    To view interactive vitals comparison charts, please run a diagnostic predictive test under the <strong>Diagnostics Panel</strong> tab first.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Model Performance */}
          {activeTab === "model" && <ModelPerformance />}

        </div>
      </div>

      {/* Floating Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 py-3 px-4.5 rounded-xl border shadow-xl text-xs font-semibold animate-fade-in ${
          toast.type === "success"
            ? "bg-emerald-900 border-emerald-800 text-white"
            : "bg-rose-900 border-rose-800 text-white"
        }`}>
          {toast.type === "success" ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <p>{toast.message}</p>
        </div>
      )}
    </main>
  )
}
