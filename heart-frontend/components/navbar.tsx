"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Heart, LogOut, UserCheck, ChevronDown, Database, ShieldCheck, User } from "lucide-react"

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("Specialist")
  const [role, setRole] = useState("Healthcare Specialist")
  const [dbType, setDbType] = useState("sqlite")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const loggedIn = !!token
      setIsLoggedIn(loggedIn)
      
      if (token) {
        // 1. Decode JWT locally to extract username quickly
        try {
          const base64Url = token.split(".")[1]
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
          const jsonPayload = decodeURIComponent(
            window.atob(base64)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          )
          const payload = JSON.parse(jsonPayload)
          setUsername(payload.sub || "Specialist")
        } catch (e) {
          setUsername("Specialist")
        }

        // 2. Fetch additional specialist metadata from backend
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        try {
          const res = await fetch(`${apiUrl}/protected`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (res.ok) {
            const data = await res.json()
            setRole(data.role || "Healthcare Specialist")
          }
        } catch (err) {
          console.error("Failed to fetch specialist role:", err)
        }

        // 3. Fetch active database type from backend root
        try {
          const res = await fetch(`${apiUrl}/`)
          if (res.ok) {
            const data = await res.json()
            setDbType(data.database_type || "sqlite")
          }
        } catch (err) {
          console.error("Failed to fetch database status:", err)
        }
      }
    }

    checkAuth()

    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!isProfileOpen) return
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".specialist-profile-container")) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [isProfileOpen])

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("token")
      setIsLoggedIn(false)
      setUsername("Specialist")
      setRole("Healthcare Specialist")
      setDbType("sqlite")
      setIsProfileOpen(false)
      window.dispatchEvent(new Event("storage"))
      router.push("/login")
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Branding */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="p-1.5 bg-red-50 dark:bg-red-950/20 rounded-lg group-hover:scale-105 transition-transform duration-200">
                <Heart className="h-5 w-5 text-red-500 fill-red-500/20 animate-pulse" />
              </div>
              <span className="font-extrabold text-lg text-slate-800 dark:text-white tracking-tight">
                Heart<span className="text-blue-600 dark:text-blue-400">AI</span>
              </span>
            </Link>
          </div>

          {/* Right Action Menu */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4 specialist-profile-container relative">
                {/* Clickable Active Specialist Status Badge */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-900/80 py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-800 cursor-pointer select-none transition-all outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="max-w-[120px] truncate">{username}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Profile Card */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-4 px-4.5 space-y-3.5 z-50">
                    {/* Header: Avatar, Name & Role */}
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-3">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-white truncate">
                          {username}
                        </h4>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">
                          {role}
                        </p>
                      </div>
                    </div>

                    {/* Metadata Rows */}
                    <div className="space-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {/* Database Connection */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-100/50 dark:border-slate-900/50">
                        <div className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-slate-400" />
                          <span>DB Gateway</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800/50">
                          {dbType === "mongodb" ? "MongoDB Atlas" : "SQLite Local"}
                        </span>
                      </div>

                      {/* Security Clearance */}
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Clearance</span>
                        </div>
                        <span className="text-[9px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40 uppercase tracking-wider">
                          HIPAA Secure
                        </span>
                      </div>
                    </div>

                    {/* Action Block */}
                    <div className="border-t border-slate-100 dark:border-slate-900 pt-3">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Terminate Session
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/register"
                  className="px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-950 text-xs font-bold text-slate-600 dark:text-slate-400 rounded-xl transition-all"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded-xl shadow-sm transition-all"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
export default Navbar
