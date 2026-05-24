"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, User, Lock, AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // If already logged in, redirect to dashboard
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/")
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your credentials.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Auto-login after successful registration
        localStorage.setItem("token", data.access_token)
        window.dispatchEvent(new Event("storage"))
        router.push("/")
      } else {
        setError(data.error || "Registration failed. Username may already exist.")
      }
    } catch (err) {
      setError("Unable to connect to the healthcare backend. Please ensure the Flask app is running.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/20 px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Logo */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 mb-3 text-blue-600">
            <Heart className="w-8 h-8 text-red-500 fill-red-500/20 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            Heart Disease Predictor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto">
            Advanced Clinical Decision Support Platform for Healthcare Specialists
          </p>
        </div>

        <Card className="border border-slate-200 dark:border-slate-900 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-slate-950">
          <CardHeader className="space-y-1.5 pb-5">
            <CardTitle className="text-xl font-bold text-slate-800 dark:text-white text-center">
              Specialist Registration
            </CardTitle>
            <CardDescription className="text-center text-xs">
              Create a new medical account to access diagnostics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Create specialist username"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Create secure password"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Verify secure password"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Error Box */}
              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl flex gap-2.5 items-start text-xs leading-tight text-rose-700 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/25 hover:shadow-indigo-500/35 transition-all duration-200 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Registering Specialist...
                  </span>
                ) : (
                  "Create Specialist Account"
                )}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-slate-600 dark:text-slate-400">
              <p>
                Already have an account?{" "}
                <a href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  Login here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-[10px] text-center text-slate-500">
          Access strictly monitored under HIPAA clinical security standards.
        </p>
      </div>
    </div>
  )
}
