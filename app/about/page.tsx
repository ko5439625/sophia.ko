"use client"

import { useState, useEffect, useRef } from "react"
import { useAdmin } from "@/lib/admin-context"
import { getContent, setOverrideSync, initializeContentCache } from "@/lib/content-store"
import { loadProfileImage, uploadProfileImage, saveProfileImageData, saveCropSettings } from "@/lib/profile-image-store"
import { updateFooterFromAbout } from "@/lib/footer-store"
import EditableField from "@/components/editable-field"

export default function AboutPage() {
  const [language, setLanguage] = useState<"ko" | "en">("ko")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [cropZoom, setCropZoom] = useState(1)
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 })
  const [isCropping, setIsCropping] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { isAdmin, isLoggedIn } = useAdmin()
  const [, forceUpdate] = useState(0)
  const [aiLoading, setAiLoading] = useState<number | null>(null)
  const [aiError, setAiError] = useState("")

  useEffect(() => {
    // Initialize content cache from Supabase, then re-render
    initializeContentCache().then(() => {
      forceUpdate(n => n + 1)
    })

    const savedLanguage = localStorage.getItem("language") as "ko" | "en"
    if (savedLanguage) setLanguage(savedLanguage)

    // Load profile image from Supabase
    loadProfileImage().then((data) => {
      if (data) {
        setProfileImage(data.imageUrl)
        setCropZoom(data.cropZoom)
        setCropOffset({ x: data.cropOffsetX, y: data.cropOffsetY })
      }
    })
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Upload to Supabase Storage
    const imageUrl = await uploadProfileImage(file)
    if (imageUrl) {
      setProfileImage(imageUrl)
      // Save image data with current crop settings
      await saveProfileImageData(imageUrl, cropZoom, cropOffset.x, cropOffset.y)
    }
  }

  const saveCrop = (zoom: number, offset: { x: number; y: number }) => {
    // Save to Supabase
    saveCropSettings(zoom, offset.x, offset.y)
  }

  const handleCropMouseDown = (e: React.MouseEvent) => {
    if (!isCropping) return
    e.preventDefault()
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y })
  }
  const handleCropMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || !isCropping) return
    const maxPan = (cropZoom - 1) * 80
    const newX = Math.max(-maxPan, Math.min(maxPan, e.clientX - dragStart.x))
    const newY = Math.max(-maxPan, Math.min(maxPan, e.clientY - dragStart.y))
    setCropOffset({ x: newX, y: newY })
  }
  const handleCropMouseUp = () => {
    if (dragStart) {
      setDragStart(null)
      saveCrop(cropZoom, cropOffset)
    }
  }

  const handleLanguageChange = (newLanguage: "ko" | "en") => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const c = (key: string, fallback: string) => getContent(`about.${language}.${key}`, fallback)
  const save = (key: string) => (val: string) => {
    setOverrideSync(`about.${language}.${key}`, val)

    // Sync contact info to footer
    const contactMatch = key.match(/^contact_(\d+)_(l|v)$/)
    if (contactMatch) {
      const [, index, field] = contactMatch
      updateFooterFromAbout(parseInt(index), field as 'l' | 'v', val)
    }

    forceUpdate(n => n + 1)
  }

  const handleAIImprove = async (index: number) => {
    const question = c(`info_${index}_q`, defaultInfo[index]?.q || "")
    const answer = c(`info_${index}_a`, defaultInfo[index]?.a || "")

    if (!question.trim() || !answer.trim()) {
      setAiError(language === "ko" ? "먼저 질문과 답변을 입력하세요" : "Please enter question and answer first")
      return
    }

    setAiLoading(index)
    setAiError("")

    try {
      // 현재 언어로 개선
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'about QA improvement',
          type: 'about',
          language,
          formData: {
            question,
            answer
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI 생성 실패')
      }

      const data = await response.json()

      // 현재 언어로 저장
      if (data.question) save(`info_${index}_q`)(data.question)
      if (data.answer) save(`info_${index}_a`)(data.answer)

      // 반대 언어로도 번역해서 저장
      const targetLang = language === 'ko' ? 'en' : 'ko'
      const translateResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'about QA improvement',
          type: 'about',
          language: targetLang,
          formData: {
            question: data.question || question,
            answer: data.answer || answer
          }
        }),
      })

      if (translateResponse.ok) {
        const translateData = await translateResponse.json()
        if (translateData.question) {
          setOverrideSync(`about.${targetLang}.info_${index}_q`, translateData.question)
        }
        if (translateData.answer) {
          setOverrideSync(`about.${targetLang}.info_${index}_a`, translateData.answer)
        }
      }
    } catch (error: any) {
      console.error("AI 개선 오류:", error)
      setAiError(error.message || (language === "ko" ? "AI 생성 중 오류가 발생했습니다" : "Error generating with AI"))
    } finally {
      setAiLoading(null)
    }
  }

  const defaultInfo = language === "ko" ? [
    { q: "QA 업무를 시작하게 된 계기는?", a: "대학교에서 컴퓨터공학을 전공하며 개발 프로젝트를 진행할 때, 완벽하다고 생각했던 코드에서 예상치 못한 버그들을 발견하는 경험을 했습니다. 그때 '사용자 관점에서 제품을 바라보는 것'의 중요성을 깨달았고, 품질 보증이라는 분야에 매력을 느꼈습니다." },
    { q: "5년간 가장 중요하게 생각하는 QA 가치는?", a: "예방적 접근법입니다. 버그를 찾아내는 것도 중요하지만, 애초에 버그가 발생하지 않도록 하는 것이 더 중요하다고 생각합니다. 요구사항 분석 단계부터 참여하여 모호한 부분을 명확히 하고, 개발 초기부터 테스트 케이스를 설계하여 품질을 내재화하는 것이 진정한 QA의 가치라고 믿습니다." },
    { q: "다른 QA와 차별화되는 강점은?", a: "개발팀과의 원활한 소통 능력입니다. 단순히 버그를 보고하는 것이 아니라, 재현 단계를 명확히 정리하고 근본 원인을 함께 분석합니다. 또한 자동화 도구를 활용하여 반복적인 테스트를 효율화하고, 데이터 기반으로 우선순위를 결정하는 체계적인 접근 방식을 가지고 있습니다." },
    { q: "가장 기억에 남는 프로젝트는?", a: "결제 시스템 품질 검증 프로젝트입니다. 금융 서비스의 특성상 단 하나의 오류도 용납할 수 없는 상황에서, 다양한 결제 시나리오와 예외 상황을 체계적으로 테스트했습니다. 특히 동시 결제, 네트워크 오류, 부분 결제 등의 엣지 케이스를 발견하고 해결하여 99.7%의 성공률을 달성했습니다." },
  ] : [
    { q: "What got you into QA?", a: "During my computer science studies, I discovered bugs in what I thought was perfect code. That moment taught me the importance of seeing products from a user's perspective. Quality assurance became my passion." },
    { q: "Core QA philosophy?", a: "Prevention over detection. While finding bugs is important, preventing them is crucial. I participate from requirements analysis, clarify ambiguities, and design test cases early to build quality into the product." },
    { q: "What makes you different?", a: "Seamless communication with dev teams. I don't just report bugs - I provide clear reproduction steps and collaborate on root cause analysis. Plus, I leverage automation tools and make data-driven priority decisions." },
    { q: "Most memorable project?", a: "Payment system quality verification. With zero tolerance for errors in financial services, I systematically tested various payment scenarios and edge cases, achieving 99.7% success rate." },
  ]

  const defaultStats = language === "ko"
    ? [{ l: "성공률", v: "99.7%" }, { l: "프로젝트", v: "15+" }, { l: "플랫폼", v: "8개" }]
    : [{ l: "Success Rate", v: "99.7%" }, { l: "Projects", v: "15+" }, { l: "Platforms", v: "8" }]

  const defaultContacts = [
    { l: language === "ko" ? "이메일" : "Email", v: "sophia.ko@email.com" },
    { l: language === "ko" ? "전화" : "Phone", v: "+82 10-1234-5678" },
    { l: "GitHub", v: "github.com/sophia-ko" },
    { l: "LinkedIn", v: "linkedin.com/in/sophia-ko" },
  ]

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 ${isAdmin ? "pt-10" : ""}`}>
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => (window.location.href = "/")} className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {language === "ko" ? "검색으로 돌아가기" : "Back to Search"}
            </button>
            <div className="flex items-center space-x-8">
              <div className="flex space-x-8">
                <div className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">About</div>
                <button onClick={() => (window.location.href = "/experience")} className="text-gray-600 hover:text-gray-900 pb-4 transition-colors">Experience</button>
                <button onClick={() => (window.location.href = "/blog")} className="text-gray-600 hover:text-gray-900 pb-4 transition-colors">Blog</button>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm transition-colors ${language === "ko" ? "text-gray-900 font-medium" : "text-gray-500"}`}>한국어</span>
                <button onClick={() => handleLanguageChange(language === "ko" ? "en" : "ko")} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${language === "en" ? "bg-blue-600" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${language === "en" ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm transition-colors ${language === "en" ? "text-gray-900 font-medium" : "text-gray-500"}`}>EN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Profile Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-8 mb-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`relative group w-40 h-40 rounded-3xl overflow-hidden shadow-lg ${isCropping ? "ring-2 ring-blue-500 ring-offset-2 cursor-grab active:cursor-grabbing" : ""}`}
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="absolute inset-0 w-full h-full object-cover select-none"
                    style={{
                      transform: `scale(${cropZoom}) translate(${cropOffset.x / cropZoom}px, ${cropOffset.y / cropZoom}px)`,
                      transformOrigin: "center center",
                    }}
                    crossOrigin="anonymous"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                    <span className="text-4xl font-light text-white">고</span>
                  </div>
                )}
                {isAdmin && isLoggedIn && !isCropping && (
                  <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                )}
                {isCropping && (
                  <div className="absolute inset-0 border-2 border-dashed border-white/60 rounded-3xl pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap pointer-events-none">
                      {language === "ko" ? "드래그하여 위치 조정" : "Drag to reposition"}
                    </div>
                  </div>
                )}

              </div>
              {isAdmin && isLoggedIn && profileImage && (
                <div className="flex flex-col items-center gap-2">
                  {isCropping ? (
                    <>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v4m0 0v4m0-4h4m-4 0H6" /></svg>
                        <input
                          type="range"
                          min="1"
                          max="3"
                          step="0.05"
                          value={cropZoom}
                          onChange={(e) => {
                            const z = Number(e.target.value)
                            setCropZoom(z)
                            const maxPan = (z - 1) * 80
                            const clampedX = Math.max(-maxPan, Math.min(maxPan, cropOffset.x))
                            const clampedY = Math.max(-maxPan, Math.min(maxPan, cropOffset.y))
                            setCropOffset({ x: clampedX, y: clampedY })
                            saveCrop(z, { x: clampedX, y: clampedY })
                          }}
                          className="w-28 h-1.5 accent-blue-600 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400 w-10 text-right">{Math.round(cropZoom * 100)}%</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCropZoom(1)
                            setCropOffset({ x: 0, y: 0 })
                            saveCrop(1, { x: 0, y: 0 })
                          }}
                          className="text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {language === "ko" ? "초기화" : "Reset"}
                        </button>
                        <button
                          onClick={() => setIsCropping(false)}
                          className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {language === "ko" ? "완료" : "Done"}
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsCropping(true)}
                      className="text-xs text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {language === "ko" ? "사진 조정" : "Adjust Photo"}
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-3">
                <EditableField value={c("name", language === "ko" ? "고아현" : "Goahyun Ko")} onSave={save("name")} as="h1" className="text-4xl font-bold text-gray-900 mr-3 tracking-tight" />
                <EditableField value={c("position", "Senior QA Engineer")} onSave={save("position")} as="div" className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium" />
              </div>
              <EditableField value={c("experience", language === "ko" ? "5년차 QA 전문가" : "5 years of experience")} onSave={save("experience")} as="p" className="text-lg text-gray-600 mb-3" />
              <EditableField value={c("quote", language === "ko" ? "품질은 행동이 아니라 습관이다 - 아리스토텔레스" : '"Quality is not an act, it is a habit" - Aristotle')} onSave={save("quote")} as="p" className="text-gray-700 italic mb-6" />

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                {defaultStats.map((stat, i) => (
                  <div key={i} className="flex items-center bg-gray-50 rounded-full px-4 py-2">
                    <span className="text-gray-400 mr-2">●</span>
                    <EditableField value={c(`stat_${i}_v`, stat.v)} onSave={save(`stat_${i}_v`)} as="span" className="text-sm font-medium mr-1" />
                    <EditableField value={c(`stat_${i}_l`, stat.l)} onSave={save(`stat_${i}_l`)} as="span" className="text-sm font-medium" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {defaultContacts.map((contact, i) => (
                <div key={i} className="text-center lg:text-left">
                  <EditableField value={c(`contact_${i}_l`, contact.l)} onSave={save(`contact_${i}_l`)} as="p" className="text-sm text-gray-500 mb-1" />
                  <EditableField value={c(`contact_${i}_v`, contact.v)} onSave={save(`contact_${i}_v`)} as="p" className="text-gray-900 text-sm font-mono" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mb-8">
          <div className="flex items-center mb-8">
            <EditableField value={c("sectionTitle", "About")} onSave={save("sectionTitle")} as="h2" className="text-3xl font-semibold text-gray-900 mr-4 tracking-tight" />
            <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
          </div>

          <div className="grid gap-6">
            {defaultInfo.map((item, i) => (
              <div key={i} className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md hover:bg-white/80 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors duration-300">
                    <span className="text-xl text-gray-600">Q</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <EditableField value={c(`info_${i}_q`, item.q)} onSave={save(`info_${i}_q`)} as="h3" className="font-semibold text-gray-900 text-lg flex-1" />
                      {isAdmin && (
                        <button
                          onClick={() => handleAIImprove(i)}
                          disabled={aiLoading === i}
                          className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {aiLoading === i ? (
                            <>
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {language === "ko" ? "개선 중..." : "Improving..."}
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              {language === "ko" ? "AI 개선" : "AI Improve"}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <EditableField value={c(`info_${i}_a`, item.a)} onSave={save(`info_${i}_a`)} as="p" className="text-gray-700 leading-relaxed" multiline />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fun Fact */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
          <div className="flex items-center justify-center text-center">
            <EditableField
              value={c("funFact", language === "ko" ? "재미있는 사실: 예방적 QA 프로세스를 구현해서 찾은 버그보다 예방한 버그가 더 많아요!" : "Fun fact: I've prevented more bugs than I've found by implementing preventive QA processes!")}
              onSave={save("funFact")}
              as="p"
              className="text-gray-700 font-medium"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
