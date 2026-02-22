"use client"

import { useState, useEffect } from "react"

export interface UserSettings {
  gpt_api_key: string
  ai_model: string
  ai_enabled: boolean
  user_context?: string
  project_guidelines?: string
  portfolio_pdf_url?: string
}

interface AdminSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  language: "ko" | "en"
}

export function AdminSettingsModal({ isOpen, onClose, language }: AdminSettingsModalProps) {
  const [settings, setSettings] = useState<UserSettings>({
    gpt_api_key: "",
    ai_model: "gpt-4",
    ai_enabled: false,
    user_context: "",
    project_guidelines: ""
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<any>(null)
  const [uploadingPDF, setUploadingPDF] = useState(false)
  const [uploadingPortfolioPDF, setUploadingPortfolioPDF] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Failed to load settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert(language === "ko" ? "저장 실패" : "Save failed")
    } finally {
      setLoading(false)
    }
  }

  const handlePortfolioPDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert(language === "ko" ? "PDF 파일만 업로드 가능합니다" : "Only PDF files are allowed")
      return
    }

    setUploadingPortfolioPDF(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-portfolio-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('PDF upload failed')
      }

      const data = await response.json()
      setSettings({ ...settings, portfolio_pdf_url: data.url })
      alert(language === "ko" ? "포트폴리오 PDF가 업로드되었습니다" : "Portfolio PDF uploaded successfully")
    } catch (error: any) {
      console.error("Portfolio PDF upload error:", error)
      alert(language === "ko" ? "PDF 업로드 실패: " + error.message : "PDF upload failed: " + error.message)
    } finally {
      setUploadingPortfolioPDF(false)
    }
  }

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'user_context' | 'project_guidelines') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert(language === "ko" ? "PDF 파일만 업로드 가능합니다" : "Only PDF files are allowed")
      return
    }

    setUploadingPDF(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('PDF extraction failed')
      }

      const data = await response.json()
      setSettings({ ...settings, [field]: data.text })
      alert(language === "ko" ? "PDF 내용이 추출되었습니다" : "PDF content extracted")
    } catch (error: any) {
      console.error("PDF upload error:", error)
      alert(language === "ko" ? "PDF 업로드 실패: " + error.message : "PDF upload failed: " + error.message)
    } finally {
      setUploadingPDF(false)
    }
  }

  const handleMigration = async () => {
    if (!settings.gpt_api_key) {
      alert(language === "ko" ? "먼저 API 키를 입력하세요" : "Please enter API key first")
      return
    }

    if (!confirm(language === "ko"
      ? "기존 한국어 데이터를 영어로 번역하여 마이그레이션합니다. 계속하시겠습니까?"
      : "Migrate existing Korean data to English. Continue?")) {
      return
    }

    setMigrating(true)
    setMigrationResult(null)

    try {
      const response = await fetch('/api/migrate-translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: settings.gpt_api_key }),
      })

      if (!response.ok) {
        throw new Error('Migration failed')
      }

      const result = await response.json()
      setMigrationResult(result)
      alert(language === "ko"
        ? `마이그레이션 완료!\n콘텐츠: ${result.results.content}개\n경험: ${result.results.experience}개\n프로젝트: ${result.results.projects}개`
        : `Migration complete!\nContent: ${result.results.content}\nExperience: ${result.results.experience}\nProjects: ${result.results.projects}`)
    } catch (error: any) {
      console.error("Migration error:", error)
      alert(language === "ko" ? "마이그레이션 실패: " + error.message : "Migration failed: " + error.message)
    } finally {
      setMigrating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {language === "ko" ? "⚙️ 관리자 설정" : "⚙️ Admin Settings"}
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

        <div className="p-6 space-y-6">
          {/* AI Settings Section */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {language === "ko" ? "AI 자동 완성 설정" : "AI Auto Fill Settings"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {language === "ko" ? "AI 기능 활성화" : "Enable AI Features"}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.ai_enabled}
                      onChange={(e) => setSettings({ ...settings, ai_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ko" ? "OpenAI API 키" : "OpenAI API Key"}
                </label>
                <input
                  type="password"
                  value={settings.gpt_api_key}
                  onChange={(e) => setSettings({ ...settings, gpt_api_key: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                  placeholder="sk-..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  {language === "ko"
                    ? "OpenAI API 키는 안전하게 암호화되어 저장됩니다. AI 자동 완성 기능을 사용하려면 필수입니다."
                    : "Your API key is securely encrypted. Required for AI auto-fill features."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ko" ? "AI 모델" : "AI Model"}
                </label>
                <select
                  value={settings.ai_model}
                  onChange={(e) => setSettings({ ...settings, ai_model: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="gpt-4">GPT-4 (추천)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (빠름)</option>
                </select>
              </div>

              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  {language === "ko" ? "💡 AI 자동 완성 사용법" : "💡 How to Use AI Auto Fill"}
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• {language === "ko" ? "항목 추가 시 간단한 키워드만 입력하세요" : "Just enter simple keywords when adding items"}</li>
                  <li>• {language === "ko" ? "AI가 자동으로 상세한 내용을 생성합니다" : "AI automatically generates detailed content"}</li>
                  <li>• {language === "ko" ? "생성된 내용은 수정 가능합니다" : "Generated content can be edited"}</li>
                  <li>• {language === "ko" ? "예: \"결제 시스템 테스트 자동화\" → 상세한 프로젝트 설명 생성" : "Example: \"Payment system test automation\" → Detailed project description"}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* AI Context Section */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {language === "ko" ? "AI 참고 자료" : "AI Reference Materials"}
            </h3>

            <div className="space-y-6">
              {/* User Context */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ko" ? "나의 상세 정보" : "Your Detailed Information"}
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  {language === "ko"
                    ? "경력, 전문성, 성격, 성향 등 AI가 참고할 당신에 대한 정보를 입력하세요"
                    : "Enter information about your career, expertise, personality, preferences for AI reference"}
                </p>
                <textarea
                  value={settings.user_context || ""}
                  onChange={(e) => setSettings({ ...settings, user_context: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  rows={6}
                  placeholder={language === "ko"
                    ? "예: 5년차 QA 엔지니어로, 테스트 자동화와 성능 테스팅을 전문으로 합니다. 사용자 중심 사고를 중요시하며, 데이터 기반 의사결정을 선호합니다..."
                    : "e.g., 5-year QA engineer specializing in test automation and performance testing. Value user-centric thinking and data-driven decisions..."}
                />
                <div className="mt-2 flex gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {uploadingPDF ? (language === "ko" ? "처리 중..." : "Processing...") : (language === "ko" ? "PDF 업로드" : "Upload PDF")}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handlePDFUpload(e, 'user_context')}
                      className="hidden"
                      disabled={uploadingPDF}
                    />
                  </label>
                  {settings.user_context && (
                    <button
                      onClick={() => setSettings({ ...settings, user_context: "" })}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      {language === "ko" ? "초기화" : "Clear"}
                    </button>
                  )}
                </div>
              </div>

              {/* Project Guidelines */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "ko" ? "프로젝트 가이드라인" : "Project Guidelines"}
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  {language === "ko"
                    ? "포트폴리오 작성 시 AI가 따라야 할 톤, 스타일, 중점사항 등을 입력하세요"
                    : "Enter tone, style, focus points that AI should follow when writing portfolio"}
                </p>
                <textarea
                  value={settings.project_guidelines || ""}
                  onChange={(e) => setSettings({ ...settings, project_guidelines: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  rows={6}
                  placeholder={language === "ko"
                    ? "예: 전문적이면서도 친근한 톤 유지, 구체적인 숫자와 지표 포함, 결과 중심으로 작성, 기술 용어는 적절히 설명..."
                    : "e.g., Maintain professional yet friendly tone, include specific numbers and metrics, focus on results, explain technical terms appropriately..."}
                />
                <div className="mt-2 flex gap-2">
                  <label className="cursor-pointer px-3 py-1.5 bg-orange-100 text-orange-700 rounded text-xs hover:bg-orange-200 transition-colors flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {uploadingPDF ? (language === "ko" ? "처리 중..." : "Processing...") : (language === "ko" ? "PDF 업로드" : "Upload PDF")}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handlePDFUpload(e, 'project_guidelines')}
                      className="hidden"
                      disabled={uploadingPDF}
                    />
                  </label>
                  {settings.project_guidelines && (
                    <button
                      onClick={() => setSettings({ ...settings, project_guidelines: "" })}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200 transition-colors"
                    >
                      {language === "ko" ? "초기화" : "Clear"}
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  {language === "ko" ? "💡 참고 자료 활용 방법" : "💡 How to Use Reference Materials"}
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• {language === "ko" ? "AI가 콘텐츠 생성 시 이 정보를 참고합니다" : "AI references this information when generating content"}</li>
                  <li>• {language === "ko" ? "더 상세할수록 더 정확한 결과를 얻을 수 있습니다" : "More detailed information yields more accurate results"}</li>
                  <li>• {language === "ko" ? "기존 이력서나 자기소개서 PDF를 업로드할 수 있습니다" : "You can upload existing resume or cover letter PDFs"}</li>
                  <li>• {language === "ko" ? "언제든 수정 및 업데이트 가능합니다" : "Can be edited and updated anytime"}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Portfolio PDF Upload Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {language === "ko" ? "포트폴리오 PDF 관리" : "Portfolio PDF Management"}
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                {language === "ko"
                  ? "메인 페이지에서 다운로드할 포트폴리오 PDF를 업로드하세요. 동적 생성 대신 직접 업로드한 PDF를 제공합니다."
                  : "Upload portfolio PDF for download on main page. Provides your uploaded PDF instead of dynamic generation."}
              </p>

              {settings.portfolio_pdf_url && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {language === "ko" ? "현재 업로드된 포트폴리오" : "Current Portfolio"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {settings.portfolio_pdf_url.split('/').pop()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={settings.portfolio_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                      >
                        {language === "ko" ? "미리보기" : "Preview"}
                      </a>
                      <button
                        onClick={() => setSettings({ ...settings, portfolio_pdf_url: "" })}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                      >
                        {language === "ko" ? "삭제" : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:bg-blue-50 transition-colors">
                  {uploadingPortfolioPDF ? (
                    <div className="flex flex-col items-center gap-3">
                      <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm text-gray-600">
                        {language === "ko" ? "업로드 중..." : "Uploading..."}
                      </span>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto h-12 w-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm font-medium text-gray-900">
                        {language === "ko" ? "포트폴리오 PDF 업로드" : "Upload Portfolio PDF"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {language === "ko" ? "클릭하거나 파일을 드래그하세요" : "Click or drag file here"}
                      </p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePortfolioPDFUpload}
                  className="hidden"
                  disabled={uploadingPortfolioPDF}
                />
              </label>

              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  {language === "ko" ? "💡 포트폴리오 PDF 가이드" : "💡 Portfolio PDF Guide"}
                </h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• {language === "ko" ? "메인 페이지 다운로드 버튼에서 제공됩니다" : "Provided via download button on main page"}</li>
                  <li>• {language === "ko" ? "파일 크기는 10MB 이하 권장" : "File size under 10MB recommended"}</li>
                  <li>• {language === "ko" ? "언제든 새로운 버전으로 교체 가능" : "Can be replaced with new version anytime"}</li>
                  <li>• {language === "ko" ? "업로드하지 않으면 기본 동적 PDF 생성" : "Falls back to dynamic PDF if not uploaded"}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Translation Migration Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {language === "ko" ? "번역 마이그레이션" : "Translation Migration"}
            </h3>

            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                {language === "ko"
                  ? "기존 한국어 데이터를 영어로 자동 번역하여 DB에 저장합니다. AI 개선 시 양쪽 언어가 자동으로 업데이트됩니다."
                  : "Automatically translate existing Korean data to English and save to DB. Both languages will auto-update when using AI improvements."}
              </p>

              <button
                onClick={handleMigration}
                disabled={migrating || !settings.ai_enabled || !settings.gpt_api_key}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {migrating
                  ? (language === "ko" ? "🔄 번역 중..." : "🔄 Translating...")
                  : (language === "ko" ? "🌐 한→영 번역 시작" : "🌐 Start KO→EN Translation")}
              </button>

              {migrationResult && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900 mb-2">
                    ✅ {language === "ko" ? "마이그레이션 완료" : "Migration Complete"}
                  </h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• {language === "ko" ? "콘텐츠" : "Content"}: {migrationResult.results.content}개</li>
                    <li>• {language === "ko" ? "경험" : "Experience"}: {migrationResult.results.experience}개</li>
                    <li>• {language === "ko" ? "프로젝트" : "Projects"}: {migrationResult.results.projects}개</li>
                    {migrationResult.results.errors.length > 0 && (
                      <li className="text-red-600">• {language === "ko" ? "오류" : "Errors"}: {migrationResult.results.errors.length}개</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {language === "ko" ? "취소" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg disabled:opacity-50"
            >
              {loading
                ? (language === "ko" ? "저장 중..." : "Saving...")
                : saved
                ? (language === "ko" ? "✓ 저장 완료!" : "✓ Saved!")
                : (language === "ko" ? "저장" : "Save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
