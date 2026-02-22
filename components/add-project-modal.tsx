"use client"

import { useState, useEffect } from "react"

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    overview: string
    background?: string
    tech_stack: string[]
    achievements?: string
    details?: Record<string, any>
  }) => void
  company: string
  language: "ko" | "en"
  editingProject?: {
    id: string
    title: string
    overview: string
    background?: string
    tech_stack: string[]
    details?: Record<string, any>
  } | null
}

export function AddProjectModal({ isOpen, onClose, onSave, company, language, editingProject }: AddProjectModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    overview: "",
    background: "",
    tech_stack: "",
    achievements: "",
    type: "QA Project",
    period: ""
  })
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")

  useEffect(() => {
    if (isOpen && editingProject) {
      setFormData({
        title: editingProject.title,
        overview: editingProject.overview,
        background: editingProject.background || "",
        tech_stack: editingProject.tech_stack.join(", "),
        achievements: editingProject.details?.achievements || "",
        type: editingProject.details?.type || "QA Project",
        period: editingProject.details?.period || ""
      })
    } else if (!isOpen) {
      setFormData({
        title: "",
        overview: "",
        background: "",
        tech_stack: "",
        achievements: "",
        type: "QA Project",
        period: ""
      })
      setAiError("")
    }
  }, [isOpen, editingProject])

  const handleAIAutoFill = async () => {
    // Check if user has entered some content
    const hasContent = formData.title.trim() || formData.overview.trim() || formData.background.trim()

    if (!hasContent) {
      setAiError(language === "ko" ? "먼저 기본 정보를 입력하세요" : "Please enter some basic information first")
      return
    }

    setAiLoading(true)
    setAiError("")

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'project content improvement',
          type: 'project',
          context: `회사: ${company}`,
          language,
          formData: formData
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI 생성 실패')
      }

      const data = await response.json()

      // AI 응답으로 폼 데이터 채우기
      setFormData({
        title: data.title || formData.title,
        overview: data.overview || formData.overview,
        background: data.background || formData.background,
        tech_stack: data.tech_stack ? data.tech_stack.join(", ") : formData.tech_stack,
        achievements: data.achievements || formData.achievements,
        type: data.type || formData.type,
        period: data.period || formData.period
      })
    } catch (error: any) {
      console.error("AI 자동 완성 오류:", error)
      setAiError(error.message || (language === "ko" ? "AI 생성 중 오류가 발생했습니다" : "Error generating with AI"))
    } finally {
      setAiLoading(false)
    }
  }

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const techArray = formData.tech_stack
      ? formData.tech_stack.split(",").map(t => t.trim()).filter(t => t)
      : []

    onSave({
      title: formData.title,
      overview: formData.overview,
      background: formData.background || undefined,
      tech_stack: techArray,
      details: {
        company,
        type: formData.type,
        period: formData.period,
        achievements: formData.achievements
      }
    })

    setFormData({
      title: "",
      overview: "",
      background: "",
      tech_stack: "",
      achievements: "",
      type: "QA Project",
      period: ""
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingProject
              ? (language === "ko" ? `${company} - 프로젝트 수정` : `${company} - Edit Project`)
              : (language === "ko" ? `${company} - 프로젝트 추가` : `${company} - Add Project`)
            }
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* AI Auto-fill Helper */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  ✨ {language === "ko" ? "AI 내용 개선" : "AI Content Improvement"}
                </h3>
                <p className="text-xs text-gray-600">
                  {language === "ko"
                    ? "기본 내용을 입력하고 버튼을 누르면 AI가 더 전문적이고 상세하게 개선해드립니다"
                    : "Enter basic content and click to have AI improve it professionally"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAIAutoFill}
                disabled={aiLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                {aiLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {language === "ko" ? "개선 중..." : "Improving..."}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {language === "ko" ? "AI로 개선" : "Improve"}
                  </>
                )}
              </button>
            </div>
            {aiError && (
              <div className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
                {aiError}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ko" ? "프로젝트 제목 *" : "Project Title *"}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === "ko" ? "예: 결제 시스템 QA 자동화" : "e.g., Payment System QA Automation"}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ko" ? "프로젝트 개요 *" : "Project Overview *"}
            </label>
            <textarea
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={language === "ko" ? "프로젝트에 대한 간단한 설명" : "Brief description of the project"}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ko" ? "프로젝트 배경" : "Project Background"}
            </label>
            <textarea
              value={formData.background}
              onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={language === "ko" ? "프로젝트 배경 및 상세 설명" : "Project background and detailed description"}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ko" ? "주요 성과 *" : "Achievements *"}
            </label>
            <textarea
              value={formData.achievements}
              onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={language === "ko" ? "프로젝트의 주요 성과 및 결과물" : "Key achievements and outcomes"}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === "ko" ? "기술 스택" : "Tech Stack"}
            </label>
            <input
              type="text"
              value={formData.tech_stack}
              onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={language === "ko" ? "Selenium, Python, Jenkins (쉼표로 구분)" : "Selenium, Python, Jenkins (comma separated)"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "프로젝트 유형" : "Project Type"}
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="QA Project"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "기간" : "Period"}
              </label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === "ko" ? "2024.01 - 2024.06" : "2024.01 - 2024.06"}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {language === "ko" ? "취소" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === "ko" ? "저장" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
