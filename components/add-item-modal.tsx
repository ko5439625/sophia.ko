"use client"

import { useState, useEffect } from "react"

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Record<string, any>) => void
  itemType: string
  language: "ko" | "en"
  editingItem?: Record<string, any> | null
}

export function AddItemModal({ isOpen, onClose, onSave, itemType, language, editingItem }: AddItemModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")

  useEffect(() => {
    if (editingItem) {
      // Convert tools array to string for skill type
      if (itemType === "skill" && editingItem.content?.tools && Array.isArray(editingItem.content.tools)) {
        setFormData({
          ...editingItem.content,
          tools: editingItem.content.tools.join(", ")
        })
      } else {
        setFormData(editingItem.content || editingItem)
      }
    } else {
      setFormData({})
    }
  }, [editingItem, itemType])

  const handleAIAutoFill = async () => {
    // Check if user has entered some content
    const hasContent = Object.values(formData).some(val => val && String(val).trim())

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
          prompt: 'content improvement',
          type: itemType,
          language,
          formData: formData
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI 생성 실패')
      }

      const data = await response.json()

      // AI 응답으로 폼 데이터 업데이트
      setFormData(prevData => ({
        ...prevData,
        ...data,
        // skill 타입의 경우 tools 배열을 문자열로 변환
        ...(itemType === "skill" && data.tools ? { tools: Array.isArray(data.tools) ? data.tools.join(", ") : data.tools } : {})
      }))
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
    onSave(formData)
    setFormData({})
  }

  const renderFormFields = () => {
    switch (itemType) {
      case "timeline":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "년도" : "Year"}
              </label>
              <input
                type="text"
                value={formData.year || ""}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "직책" : "Role"}
              </label>
              <input
                type="text"
                value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Senior QA Engineer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "회사" : "Company"}
              </label>
              <input
                type="text"
                value={formData.company || ""}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === "ko" ? "회사명" : "Company Name"}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "포커스" : "Focus"}
              </label>
              <input
                type="text"
                value={formData.focus || ""}
                onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === "ko" ? "주요 업무" : "Main Focus"}
                required
              />
            </div>
          </>
        )

      case "highlight":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "제목" : "Title"}
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "설명" : "Description"}
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "임팩트" : "Impact"}
              </label>
              <input
                type="text"
                value={formData.impact || ""}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === "ko" ? "성과 지표" : "Impact metric"}
                required
              />
            </div>
          </>
        )

      case "metric":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "레이블" : "Label"}
              </label>
              <input
                type="text"
                value={formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "값" : "Value"}
              </label>
              <input
                type="text"
                value={formData.value || ""}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="99.7%"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "설명" : "Description"}
              </label>
              <input
                type="text"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </>
        )

      case "certification":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "자격증명" : "Certification Name"}
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "발급기관" : "Issuer"}
              </label>
              <input
                type="text"
                value={formData.issuer || ""}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "취득년도" : "Year"}
              </label>
              <input
                type="text"
                value={formData.year || ""}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2024"
                required
              />
            </div>
          </>
        )

      case "skill":
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "카테고리" : "Category"}
              </label>
              <input
                type="text"
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={language === "ko" ? "예: 테스트 자동화, 성능 테스팅" : "e.g., Test Automation, Performance Testing"}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "ko" ? "도구/기술 (쉼표로 구분)" : "Tools (comma separated)"}
              </label>
              <textarea
                value={formData.tools || ""}
                onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder={language === "ko" ? "Selenium, Cypress, Playwright" : "Selenium, Cypress, Playwright"}
                required
              />
            </div>
          </>
        )

      default:
        return null
    }
  }

  const getTitle = () => {
    const titles: Record<string, { ko: string, en: string }> = {
      timeline: { ko: "타임라인 추가", en: "Add Timeline Item" },
      highlight: { ko: "핵심 강점 추가", en: "Add Highlight" },
      metric: { ko: "핵심 성과 추가", en: "Add Metric" },
      certification: { ko: "자격증 추가", en: "Add Certification" },
      skill: { ko: "기술 스택 추가", en: "Add Skill" }
    }
    return editingItem
      ? (language === "ko" ? "수정" : "Edit")
      : titles[itemType]?.[language] || (language === "ko" ? "추가" : "Add")
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">{getTitle()}</h2>
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
          {/* AI Content Improvement */}
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

          {renderFormFields()}

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
