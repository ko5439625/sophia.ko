"use client"

import { useState } from "react"
import { useAdmin } from "@/lib/admin-context"
import { applyAIContent } from "@/lib/content-mapper"
import { clearAllOverrides } from "@/lib/content-store"

export default function AdminBar() {
  const { isAdmin, isLoggedIn, login, logout, setIsAdmin } = useAdmin()
  const [showLogin, setShowLogin] = useState(false)
  const [id, setId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [rawText, setRawText] = useState("")
  const [aiLang, setAiLang] = useState<"ko" | "en">("ko")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiStatus, setAiStatus] = useState("")

  if (!isAdmin) return null

  if (!isLoggedIn) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {!showLogin ? (
            <div className="flex items-center justify-between">
              <span className="text-sm">Admin Mode - Login required to edit</span>
              <div className="flex items-center gap-3">
                <button onClick={() => setShowLogin(true)} className="text-sm bg-white text-gray-900 px-4 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  Login
                </button>
                <button onClick={() => setIsAdmin(false)} className="text-sm text-gray-400 hover:text-white transition-colors">
                  Exit
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={e => {
              e.preventDefault()
              setError("")
              const ok = login(id, password)
              if (!ok) setError("ID or password incorrect")
            }} className="flex items-center gap-3">
              <input type="text" placeholder="ID" value={id} onChange={e => setId(e.target.value)}
                className="text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 outline-none focus:border-blue-500 w-40" />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                className="text-sm bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white placeholder-gray-500 outline-none focus:border-blue-500 w-40" />
              <button type="submit" className="text-sm bg-blue-600 px-4 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Login
              </button>
              <button type="button" onClick={() => { setShowLogin(false); setIsAdmin(false) }} className="text-sm text-gray-400 hover:text-white transition-colors">
                Cancel
              </button>
              {error && <span className="text-red-400 text-sm">{error}</span>}
            </form>
          )}
        </div>
      </div>
    )
  }

  const handleAIGenerate = async () => {
    if (!rawText.trim()) return
    setAiLoading(true)
    setAiStatus("AI generating content...")
    try {
      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, language: aiLang }),
      })
      if (!res.ok) throw new Error("AI generation failed")
      const data = await res.json()
      applyAIContent(data, aiLang)
      setAiStatus("Content applied! Refreshing...")
      setTimeout(() => window.location.reload(), 1000)
    } catch (err) {
      setAiStatus("Error: " + (err instanceof Error ? err.message : "Failed"))
    } finally {
      setAiLoading(false)
    }
  }

  const handleReset = () => {
    if (confirm("Reset all content to defaults? This cannot be undone.")) {
      clearAllOverrides()
      window.location.reload()
    }
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Admin Mode</span>
            <span className="text-xs text-gray-400 hidden sm:inline">Click any text to edit</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="text-sm bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-1.5 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Auto-fill
            </button>
            <button onClick={handleReset} className="text-sm text-gray-400 hover:text-red-400 transition-colors">
              Reset
            </button>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-white transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      {showAIPanel && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => !aiLoading && setShowAIPanel(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">AI Content Auto-fill</h2>
                    <p className="text-sm text-gray-500">Paste your info and AI will fill all sections</p>
                  </div>
                </div>
                <button onClick={() => setShowAIPanel(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAiLang("ko")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aiLang === "ko" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    Korean
                  </button>
                  <button
                    onClick={() => setAiLang("en")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${aiLang === "en" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    English
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Information
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Paste your resume, career summary, or answers to the questionnaire below. Include: name, role, experience, skills, projects, achievements, certifications, career goals, etc.
                </p>
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={`Example:\n\nName: John Doe\nRole: QA Engineer (5 years)\nCompany: ABC Corp (2020-Present), XYZ Inc (2018-2020)\n\nSkills:\n- Mobile Testing (iOS/Android)\n- Selenium, Appium automation\n- API Testing with Postman\n\nProjects:\n- E-commerce app QA - reduced bugs by 40%\n- CI/CD pipeline setup - 70% faster releases\n\nCertifications:\n- ISTQB Foundation (2019)\n\nGoals:\n- AI-powered testing leadership\n- QA team management...`}
                  className="w-full h-64 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-y"
                  disabled={aiLoading}
                />
              </div>

              {aiStatus && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${aiStatus.startsWith("Error") ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {aiLoading && (
                    <svg className="inline w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {aiStatus}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  AI will generate content for About, Experience, and Vision pages
                </p>
                <button
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !rawText.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium text-sm hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate & Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
