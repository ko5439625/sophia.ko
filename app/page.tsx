"use client"

import { useState, useEffect } from "react"
import { generateDynamicPortfolioPDF } from "../utils/dynamicPDFGenerator"
import { generateInteractiveQuestionnaire, generateQuestionnairePDF } from "../utils/questionnaireGenerator"
import { useAdmin } from "@/lib/admin-context"
import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

export default function HomePage() {
  const [searchValue, setSearchValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [language, setLanguage] = useState<"ko" | "en">("ko")
  const [clickCount, setClickCount] = useState(0)
  const [showHiddenButton, setShowHiddenButton] = useState(false)
  const [logoClickCount, setLogoClickCount] = useState(0)
  const { isAdmin, setIsAdmin } = useAdmin()

  // 언어 설정 로드 및 저장
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "ko" | "en"
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleLanguageChange = (newLanguage: "ko" | "en") => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const handlePDFDownload = async () => {
    try {
      // Check if uploaded portfolio PDF exists
      const supabase = createClient()
      const { data: settingsData } = await supabase
        .from("user_settings")
        .select("settings")
        .eq("user_id", USER_ID)
        .single()

      const portfolioPdfUrl = settingsData?.settings?.portfolio_pdf_url

      if (portfolioPdfUrl) {
        // Download the uploaded PDF directly
        window.open(portfolioPdfUrl, '_blank')
      } else {
        // Show alert that portfolio is being prepared
        alert(language === "ko" ? "포트폴리오 PDF 준비중입니다." : "Portfolio PDF is being prepared.")
      }
    } catch (error) {
      console.error("Error downloading portfolio PDF:", error)
      alert(language === "ko" ? "PDF 다운로드 중 오류가 발생했습니다." : "Error downloading PDF")
    }
  }

  const handleInteractiveQuestionnaire = () => {
    generateInteractiveQuestionnaire({ language })
  }

  const handlePDFQuestionnaire = () => {
    generateQuestionnairePDF({ language })
  }

  const searchSuggestions = {
    ko: [
      {
        id: 1,
        text: "📄 면접관용 포트폴리오",
        description: "5년차 QA 전문가의 핵심 경력 요약본",
        type: "pdf",
        action: handlePDFDownload,
        featured: true,
      },
      {
        id: 2,
        text: "👤 고아현 소개",
        description: "5년차 시니어 QA 엔지니어 • 사용자 중심 사고",
        type: "page",
        action: () => (window.location.href = "/about"),
      },
      {
        id: 3,
        text: "💼 고아현 경험",
        description: "15+ 프로젝트 • 99.7% 성공률 • 테스트 자동화 전문",
        type: "page",
        action: () => (window.location.href = "/experience"),
      },
      {
        id: 4,
        text: "📝 Blog",
        description: "QA 경험 기록 • 기술 인사이트 • 성장 스토리",
        type: "page",
        action: () => (window.location.href = "/blog"),
      },
    ],
    en: [
      {
        id: 1,
        text: "📄 Portfolio for Interviewers",
        description: "Complete QA expertise summary in 5 pages",
        type: "pdf",
        action: handlePDFDownload,
        featured: true,
      },
      {
        id: 2,
        text: "👤 About Goahyun",
        description: "Senior QA Engineer • 5 years experience • User-first mindset",
        type: "page",
        action: () => (window.location.href = "/about"),
      },
      {
        id: 3,
        text: "💼 Goahyun Experience",
        description: "15+ projects • 99.7% success rate • Test automation expert",
        type: "page",
        action: () => (window.location.href = "/experience"),
      },
      {
        id: 4,
        text: "📝 Blog",
        description: "QA experience logs • Technical insights • Growth stories",
        type: "page",
        action: () => (window.location.href = "/blog"),
      },
    ],
  }

  const handleSearchFocus = () => {
    setShowSuggestions(true)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setShowSuggestions(true)
  }

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1
    setLogoClickCount(newCount)
    if (newCount >= 10) {
      setIsAdmin(true)
      setLogoClickCount(0)
    }
  }

  const currentSuggestions = searchSuggestions[language]

  const handleAllServicesClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    if (newCount >= 10) {
      setShowHiddenButton(true)
      setIsAdmin(true)
    }
  }

  const handleGoBack = () => {
    setShowHiddenButton(false)
    setClickCount(0)
  }

  // 구글 스타일 로고 컬러
  const logoColors = ["#4285f4", "#ea4335", "#fbbc04", "#4285f4", "#34a853", "#ea4335"]
  const logoText = "Sophia.ko"

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 ${isAdmin ? "pt-10" : ""}`}>
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-6">
          <div
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
            onClick={handleAllServicesClick}
          >
            {language === "ko" ? "모든 서비스" : "All"}
          </div>
          <div className="text-sm text-gray-600 hover:text-blue-600 hover:underline cursor-pointer transition-colors">
            {language === "ko" ? "이미지" : "Images"}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-medium">S</span>
          </div>
          {/* Language Toggle Switch */}
          <div className="flex items-center space-x-3">
            <span
              className={`text-sm transition-colors ${language === "ko" ? "text-gray-900 font-medium" : "text-gray-500"}`}
            >
              한국어
            </span>
            <button
              onClick={() => handleLanguageChange(language === "ko" ? "en" : "ko")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                language === "en" ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  language === "en" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm transition-colors ${language === "en" ? "text-gray-900 font-medium" : "text-gray-500"}`}
            >
              EN
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo Area */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-1 mb-6 cursor-pointer select-none" onClick={handleLogoClick}>
            {logoText.split("").map((char, index) => (
              <span
                key={index}
                className="text-7xl font-bold tracking-tight hover:scale-110 transition-transform duration-200"
                style={{ color: logoColors[index % logoColors.length] }}
              >
                {char}
              </span>
            ))}
          </div>
          <p className="text-center text-gray-600 text-lg font-light">
            {language === "ko" ? "최고의 QA 엔지니어를 검색하세요 ✨" : "Search the best QA engineer ✨"}
          </p>
        </div>

        {/* Search Container */}
        <div className="w-full max-w-2xl relative">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="flex items-center bg-white border border-gray-200 rounded-full px-6 py-4 shadow-lg hover:shadow-xl transition-shadow duration-300 focus-within:shadow-xl focus-within:border-blue-300">
              <svg className="w-5 h-5 text-gray-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={handleSearchFocus}
                placeholder={language === "ko" ? "고아현" : "goahyun"}
                className="flex-1 outline-none text-gray-700 text-lg bg-transparent placeholder-gray-400"
              />
              <div className="flex items-center space-x-3 ml-4">
                <button className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
                <button className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Search Suggestions - 기본으로 열린 상태 */}
          {showSuggestions && (
            <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden mb-6">
              <div className="p-6">
                <div className="text-sm text-gray-500 mb-4 px-2 flex items-center">
                  <span className="mr-2">🔍</span>
                  {language === "ko" ? "관련 검색어" : "Related searches"}
                </div>
                <div className="space-y-2">
                  {currentSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      className={`group cursor-pointer rounded-2xl transition-all duration-200 ${
                        suggestion.featured
                          ? "bg-white hover:bg-gray-50 border-2 border-gray-200 shadow-md hover:shadow-lg"
                          : suggestion.id === 2
                          ? "bg-blue-50/40 hover:bg-blue-50/70 border border-blue-100/60 shadow-sm hover:shadow-md"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={suggestion.action}
                    >
                      <div className="flex items-center px-4 py-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h3
                              className={`font-medium group-hover:text-blue-600 transition-colors text-lg ${
                                suggestion.featured ? "text-gray-900 font-semibold" : "text-gray-900"
                              }`}
                            >
                              {suggestion.text}
                            </h3>
                            {suggestion.featured && (
                              <span className="ml-3 px-3 py-1 bg-gray-900 text-white text-xs rounded-full font-medium">
                                {language === "ko" ? "추천" : "Recommended"}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm mt-1 ${suggestion.featured ? "text-gray-600 font-medium" : "text-gray-600"}`}
                          >
                            {suggestion.description}
                          </p>
                          {suggestion.id === 2 && (
                            <p className="text-xs text-blue-500 font-medium mt-1.5">
                              {language === "ko" ? "프로필 보기 →" : "View profile →"}
                            </p>
                          )}
                          {suggestion.featured && (
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <span className="mr-1">💡</span>
                              {language === "ko"
                                ? "Tip: PDF 다운로드 후 출력하시면 더 자세히 검토하실 수 있어요!"
                                : "Tip: Download PDF for detailed review!"}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <svg
                            className={`w-5 h-5 transition-colors ${
                              suggestion.featured ? "text-gray-600" : "text-gray-400"
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hidden Buttons - 개선된 버튼 크기와 레이아웃 */}
          {showHiddenButton && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 mb-6">
              <div className="text-center mb-4">
                <span className="text-2xl">🎉</span>
                <p className="text-gray-600 text-sm mt-2">
                  {language === "ko" ? "숨겨진 개발자 도구를 발견했습니다!" : "You found the hidden developer tools!"}
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={handleGoBack}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  {language === "ko" ? "← 돌아가기" : "← Go Back"}
                </button>
                <button
                  onClick={handleInteractiveQuestionnaire}
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                >
                  {language === "ko" ? "📝 작성용 질문지" : "📝 Fillable Form"}
                </button>
                <button
                  onClick={handlePDFQuestionnaire}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium whitespace-nowrap"
                >
                  {language === "ko" ? "📄 참고용 PDF" : "📄 Reference PDF"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Info */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400 mb-4">
            <button className="hover:text-blue-600 transition-colors">
              {language === "ko" ? "개인정보처리방침" : "Privacy"}
            </button>
            <button className="hover:text-blue-600 transition-colors">{language === "ko" ? "약관" : "Terms"}</button>
            <button className="hover:text-blue-600 transition-colors">{language === "ko" ? "설정" : "Settings"}</button>
          </div>
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <span className="mr-2">🎨</span>
            {language === "ko"
              ? "품질과 디자인을 사랑하는 QA 엔지니어가 만든 포트폴리오"
              : "Made with ❤️ by a QA engineer who loves quality & design"}
          </p>
        </div>
      </div>
    </div>
  )
}
