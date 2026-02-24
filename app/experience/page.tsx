"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/lib/admin-context"
import { loadProjects, addProject, updateProject, deleteProject, type Project } from "@/lib/projects-store"
import EditableField from "@/components/editable-field"
import { AddItemModal } from "@/components/add-item-modal"
import { AddProjectModal } from "@/components/add-project-modal"
import { AdminSettingsModal } from "@/components/admin-settings-modal"
import { getContent, setOverrideSync, initializeContentCache } from "@/lib/content-store"
import {
  loadExperienceData,
  addExperienceData,
  updateExperienceData,
  deleteExperienceData,
  type ExperienceData
} from "@/lib/experience-store"
import { loadFooterData, type FooterItem } from "@/lib/footer-store"
import { generateContent, type AIGenerateOptions } from "@/lib/ai-helper"

function AdminLoginButton({ language }: { language: "ko" | "en" }) {
  const { isAdmin, login, logout } = useAdmin()

  const handleLogin = () => {
    const id = prompt(language === "ko" ? "아이디를 입력하세요:" : "Enter ID:")
    const password = prompt(language === "ko" ? "비밀번호를 입력하세요:" : "Enter password:")
    if (id && password) {
      if (login(id, password)) {
        alert(language === "ko" ? "로그인 성공!" : "Login successful!")
        window.location.reload()
      } else {
        alert(language === "ko" ? "로그인 실패" : "Login failed")
      }
    }
  }

  const handleLogout = () => {
    logout()
    window.location.reload()
  }

  if (isAdmin) {
    return (
      <button
        onClick={handleLogout}
        className="fixed bottom-6 left-6 px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 transition-colors text-sm z-50"
      >
        🔓 {language === "ko" ? "로그아웃" : "Logout"}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogin}
      className="fixed bottom-6 left-6 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-700 transition-colors text-sm z-50"
    >
      🔒 {language === "ko" ? "관리자 로그인" : "Admin Login"}
    </button>
  )
}

export default function ExperiencePage() {
  const [language, setLanguage] = useState<"ko" | "en">("ko")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "vision">("overview")
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const { isAdmin } = useAdmin()
  const [, forceUpdate] = useState(0)

  // Dynamic data from Supabase
  const [timelineData, setTimelineData] = useState<ExperienceData[]>([])
  const [highlightsData, setHighlightsData] = useState<ExperienceData[]>([])
  const [metricsData, setMetricsData] = useState<ExperienceData[]>([])
  const [skillsData, setSkillsData] = useState<ExperienceData[]>([])
  const [certificationsData, setCertificationsData] = useState<ExperienceData[]>([])
  const [approachData, setApproachData] = useState<ExperienceData[]>([])

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalType, setModalType] = useState<string>("")
  const [editingItem, setEditingItem] = useState<ExperienceData | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // AI states
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [aiError, setAiError] = useState("")

  // Footer data
  const [footerContact, setFooterContact] = useState<FooterItem[]>([])
  const [footerLinks, setFooterLinks] = useState<FooterItem[]>([])
  const [footerExpertise, setFooterExpertise] = useState<FooterItem[]>([])

  useEffect(() => {
    // Initialize content cache from Supabase, then re-render
    initializeContentCache().then(() => {
      forceUpdate(n => n + 1)
    })

    const savedLanguage = localStorage.getItem("language") as "ko" | "en"
    if (savedLanguage) setLanguage(savedLanguage)

    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    if (tab && ["overview", "projects", "vision"].includes(tab)) {
      setActiveTab(tab as typeof activeTab)
    }

    loadProjects(savedLanguage || "ko").then((data) => {
      setProjects(data)
    })

    // Load all experience data
    loadAllExperienceData(savedLanguage || "ko")
    loadFooterSections()
  }, [])

  const loadAllExperienceData = async (lang: string) => {
    console.log("=== loadAllExperienceData 시작, language:", lang)
    setLoading(true)
    try {
      const [timeline, highlights, metrics, skills, certs, approach] = await Promise.all([
        loadExperienceData(lang, "timeline"),
        loadExperienceData(lang, "highlight"),
        loadExperienceData(lang, "metric"),
        loadExperienceData(lang, "skill"),
        loadExperienceData(lang, "certification"),
        loadExperienceData(lang, "approach")
      ])

      console.log("Loaded timeline:", timeline)
      console.log("Loaded highlights:", highlights)
      console.log("Loaded metrics:", metrics)
      console.log("Loaded skills:", skills)
      console.log("Loaded certs:", certs)
      console.log("Loaded approach:", approach)

      setTimelineData(timeline)
      setHighlightsData(highlights)
      setMetricsData(metrics)
      setSkillsData(skills)
      setCertificationsData(certs)
      setApproachData(approach)
      console.log("=== loadAllExperienceData 완료 ===")
    } catch (error) {
      console.error("Error loading experience data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadFooterSections = async () => {
    try {
      const [contact, links, expertise] = await Promise.all([
        loadFooterData("contact"),
        loadFooterData("links"),
        loadFooterData("expertise")
      ])
      setFooterContact(contact)
      setFooterLinks(links)
      setFooterExpertise(expertise)
    } catch (error) {
      console.error("Error loading footer data:", error)
    }
  }

  useEffect(() => {
    loadProjects(language).then((data) => {
      setProjects(data)
    })
    loadAllExperienceData(language)
  }, [language])

  // Auto-select the latest company when timeline data loads
  useEffect(() => {
    if (timelineData.length > 0 && expandedCompany === null) {
      const sorted = [...timelineData].sort((a, b) => parseInt(a.content?.year || '0') - parseInt(b.content?.year || '0'))
      const timeline = sorted.map(t => t.content)
      const companyList = [...new Set(timeline.map((t: Record<string, string>) => t.company))]
      if (companyList.length > 0) {
        setExpandedCompany(companyList[companyList.length - 1] as string)
      }
    }
  }, [timelineData])

  const handleLanguageChange = (newLanguage: "ko" | "en") => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      email: (
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      linkedin: (
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      github: (
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    }
    return icons[iconName] || null
  }


  const handleAIImprove = async (key: string, currentValue: string, type: 'text' | 'quote') => {
    if (!currentValue.trim()) {
      setAiError(language === "ko" ? "먼저 내용을 입력하세요" : "Please enter content first")
      return
    }

    setAiLoading(key)
    setAiError("")

    try {
      // 현재 언어로 개선
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Improve this ${type} for a QA engineer portfolio`,
          type: 'blog',
          language,
          formData: {
            title: type === 'quote' ? 'Vision Quote' : 'Vision Content',
            content: currentValue
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI 생성 실패')
      }

      const data = await response.json()
      const improvedContent = data.content || data.text

      if (improvedContent) {
        // 현재 언어로 저장
        save(key)(improvedContent)

        // 반대 언어로도 번역해서 저장
        const targetLang = language === 'ko' ? 'en' : 'ko'
        const translateResponse = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Translate this ${type} to ${targetLang === 'ko' ? 'Korean' : 'English'}`,
            type: 'blog',
            language: targetLang,
            formData: {
              title: type === 'quote' ? 'Vision Quote' : 'Vision Content',
              content: improvedContent
            }
          }),
        })

        if (translateResponse.ok) {
          const translateData = await translateResponse.json()
          const translatedContent = translateData.content || translateData.text
          if (translatedContent) {
            // 반대 언어로도 저장
            setOverrideSync(`exp.${targetLang}.${key}`, translatedContent)
          }
        }
      }
    } catch (error: any) {
      console.error("AI 개선 오류:", error)
      setAiError(error.message || (language === "ko" ? "AI 생성 중 오류가 발생했습니다" : "Error generating with AI"))
    } finally {
      setAiLoading(null)
    }
  }

  const handleSaveItem = async (data: Record<string, any>) => {
    console.log("=== handleSaveItem 시작 ===")
    console.log("modalType:", modalType)
    console.log("language:", language)
    console.log("data:", data)
    console.log("editingItem:", editingItem)

    try {
      // Convert tools string to array for skill type
      if (modalType === "skill" && typeof data.tools === "string") {
        data.tools = data.tools.split(",").map((t: string) => t.trim()).filter((t: string) => t)
      }

      let result
      if (editingItem) {
        console.log("수정 모드: updateExperienceData 호출")
        result = await updateExperienceData(editingItem.id, data)
        console.log("updateExperienceData 결과:", result)
      } else {
        console.log("추가 모드: addExperienceData 호출")
        result = await addExperienceData(language, modalType, data)
        console.log("addExperienceData 결과:", result)
      }

      console.log("loadAllExperienceData 호출 시작")
      await loadAllExperienceData(language)
      console.log("loadAllExperienceData 완료")

      setShowAddModal(false)
      setEditingItem(null)
      console.log("=== handleSaveItem 완료 ===")
    } catch (error) {
      console.error("Error saving item:", error)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm(language === "ko" ? "정말 삭제하시겠습니까?" : "Are you sure you want to delete?")) {
      return
    }
    try {
      await deleteExperienceData(id)
      await loadAllExperienceData(language)
    } catch (error) {
      console.error("Error deleting item:", error)
    }
  }

  const handleEditItem = (item: ExperienceData, type: string) => {
    setEditingItem(item)
    setModalType(type)
    setShowAddModal(true)
  }

  const handleAddProject = (company: string) => {
    setSelectedCompany(company)
    setShowProjectModal(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setSelectedCompany(project.details?.company || "")
    setShowProjectModal(true)
  }

  const handleSaveProject = async (projectData: any) => {
    try {
      console.log("=== handleSaveProject 시작 ===")
      console.log("projectData:", projectData)
      console.log("editingProject:", editingProject)

      if (editingProject) {
        // Update existing project - merge with existing details
        const mergedDetails = {
          ...(editingProject.details || {}),
          ...projectData.details
        }
        await updateProject(editingProject.id, {
          title: projectData.title,
          overview: projectData.overview,
          background: projectData.background,
          tech_stack: projectData.tech_stack,
          details: mergedDetails
        })
        console.log("프로젝트 수정 완료")
      } else {
        // Add new project
        const projectId = `proj-${Date.now()}`
        await addProject(language, {
          project_id: projectId,
          title: projectData.title,
          category: "qa",
          overview: projectData.overview,
          background: projectData.background,
          tech_stack: projectData.tech_stack,
          details: projectData.details || {}
        })
        console.log("프로젝트 추가 완료")
      }

      // Reload projects
      const updatedProjects = await loadProjects(language)
      console.log("리로드된 프로젝트:", updatedProjects)
      setProjects(updatedProjects)

      // Update expandedCompany if company name changed
      const newCompany = projectData.details?.company
      if (newCompany && newCompany !== expandedCompany) {
        setExpandedCompany(newCompany)
      }

      setShowProjectModal(false)
      setSelectedCompany("")
      setEditingProject(null)

      console.log("=== handleSaveProject 완료 ===")
    } catch (error) {
      console.error("Error saving project:", error)
      alert(language === "ko" ? "프로젝트 저장 실패" : "Failed to save project")
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm(language === "ko" ? "정말 이 프로젝트를 삭제하시겠습니까?" : "Are you sure you want to delete this project?")) {
      return
    }

    try {
      console.log("=== handleDeleteProject 시작 ===")
      console.log("projectId:", projectId)

      await deleteProject(projectId)

      console.log("프로젝트 삭제 완료, 리로드 시작")
      // Reload projects
      const updatedProjects = await loadProjects(language)
      console.log("리로드된 프로젝트:", updatedProjects)
      setProjects(updatedProjects)

      console.log("=== handleDeleteProject 완료 ===")
    } catch (error) {
      console.error("Error deleting project:", error)
      alert(language === "ko" ? "프로젝트 삭제 실패" : "Failed to delete project")
    }
  }

  const c = (key: string, fallback: string) => getContent(`exp.${language}.${key}`, fallback)
  const save = (key: string) => (val: string) => { setOverrideSync(`exp.${language}.${key}`, val); forceUpdate(n => n + 1) }

  const tabs = {
    ko: { overview: "개요", projects: "프로젝트", vision: "비전" },
    en: { overview: "Overview", projects: "Projects", vision: "Vision" }
  }

  // Group projects by category
  const qaProjects = projects.filter(p => p.category === 'project' || p.category === 'qa')
  const methodologyProjects = projects.filter(p => p.category === 'methodology')
  const aiLearningProjects = projects.filter(p => p.category === 'ai_learning')
  const skillProjects = projects.filter(p => p.category === 'skill')
  const visionProjects = projects.filter(p => p.category === 'vision')

  console.log("=== Projects Filter Debug ===")
  console.log("Total projects:", projects.length)
  console.log("QA projects:", qaProjects.length)

  // Default summary (only used as EditableField fallback text)
  const defaultSummary = language === "ko"
    ? "5년간 다양한 도메인에서 QA 업무를 수행하며 품질 보증의 전 영역을 경험했습니다."
    : "Over 5 years of QA experience across various domains, covering all aspects of quality assurance."

  const SectionHeader = ({ title, editKey, onAdd, addLabel }: { title: string; editKey?: string; onAdd?: () => void; addLabel?: string }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          {editKey ? (
            <EditableField value={c(editKey, title)} onSave={save(editKey)} as="h2" className="text-2xl font-semibold text-gray-900 mb-2" />
          ) : (
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
          )}
          <div className="w-12 h-0.5 bg-blue-600 rounded-full"></div>
        </div>
        {isAdmin && onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {addLabel || "+"}
          </button>
        )}
      </div>
    </div>
  )

  const timelineColors = [
    { bg: "bg-blue-600", light: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
    { bg: "bg-teal-600", light: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
    { bg: "bg-amber-600", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  ]

  // Always use Supabase data (no hardcoded fallback), sorted by year ascending
  const actualTimeline = [...timelineData].sort((a, b) => {
    const yearA = parseInt(a.content?.year || '0')
    const yearB = parseInt(b.content?.year || '0')
    return yearA - yearB
  }).map(t => t.content)

  console.log("=== Timeline Data Debug ===")
  console.log("timelineData:", timelineData)
  console.log("actualTimeline:", actualTimeline)

  const companies = [...new Set(actualTimeline.map(t => t.company))]
  console.log("companies:", companies)

  const companyColorMap: Record<string, number> = {}
  companies.forEach((co, i) => { companyColorMap[co] = i % timelineColors.length })

  // Group projects by company
  const grouped: Record<string, Project[]> = {}
  companies.forEach(company => { grouped[company] = [] })

  console.log("=== Grouping Projects ===")
  console.log("qaProjects:", qaProjects)

  qaProjects.forEach(p => {
    // First try to use company from details
    let key = p.details?.company

    // If no company in details, try to match by year
    if (!key) {
      const year = p.details?.period?.toString().slice(0, 4) || "2024"
      const matchedCompany = actualTimeline.find(t => t.year === year)?.company
      key = matchedCompany || companies[companies.length - 1]
    }

    console.log(`Project "${p.title}" -> Company: "${key}"`)

    if (!grouped[key]) {
      console.warn(`Company "${key}" not found in companies list, creating new group`)
      grouped[key] = []
    }
    grouped[key].push(p)
  })

  console.log("grouped:", grouped)
  console.log("=== Grouping Complete ===")

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
                <button onClick={() => (window.location.href = "/about")} className="text-gray-600 hover:text-gray-900 pb-4 transition-colors">About</button>
                <div className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">Experience</div>
                <button onClick={() => (window.location.href = "/blog")} className="text-gray-600 hover:text-gray-900 pb-4 transition-colors">Blog</button>
              </div>
              <div className="flex items-center space-x-3">
                {isAdmin && (
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                    title={language === "ko" ? "관리자 설정" : "Admin Settings"}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <span className={`text-sm transition-colors ${language === "ko" ? "text-gray-900 font-medium" : "text-gray-500"}`}>한국어</span>
                <button
                  onClick={() => handleLanguageChange(language === "ko" ? "en" : "ko")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${language === "en" ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${language === "en" ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm transition-colors ${language === "en" ? "text-gray-900 font-medium" : "text-gray-500"}`}>EN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <EditableField value={c("title", "Experience")} onSave={save("title")} as="h1" className="text-4xl font-bold text-gray-900 mb-4 tracking-tight" />
          <EditableField
            value={c("subtitle", language === "ko" ? "5년간 제품에 품질을 구축해온 경험" : "5 years of building quality into products")}
            onSave={save("subtitle")}
            as="p"
            className="text-gray-600 text-lg"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50 shadow-sm">
            {Object.entries(tabs[language]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === key ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="text-gray-500">{language === "ko" ? "로딩 중..." : "Loading..."}</div>
          </div>
        ) : (
          <>
            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === "overview" && (
              <div className="space-y-12">
                {/* Summary */}
                <div className="relative overflow-hidden">
                  <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-3xl p-8 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -translate-y-8 translate-x-8"></div>
                    {isAdmin && (
                      <button
                        onClick={() => handleAIImprove("summary", c("summary", defaultSummary), 'text')}
                        disabled={aiLoading === "summary"}
                        className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {aiLoading === "summary" ? (
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
                    <div className="relative z-10">
                      <EditableField value={c("summaryTitle", language === "ko" ? "요약" : "Summary")} onSave={save("summaryTitle")} as="h2" className="text-2xl font-semibold text-gray-900 mb-6" />
                      <EditableField value={c("summary", defaultSummary)} onSave={save("summary")} as="p" className="text-gray-800 text-lg leading-relaxed" multiline />
                    </div>
                  </div>
                </div>

                {/* Key Highlights */}
                <div>
                  <SectionHeader
                    title={language === "ko" ? "핵심 강점" : "Key Highlights"}
                    editKey="highlightsTitle"
                    onAdd={() => { setModalType("highlight"); setEditingItem(null); setShowAddModal(true); }}
                    addLabel={language === "ko" ? "+ 강점 추가" : "+ Add Highlight"}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(highlightsData).map((item, index) => {
                      const content = item.content || item
                      return (
                        <div key={item.id || index} className="relative group bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                          {isAdmin && item.id && !item.id.startsWith('temp-') && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditItem(item as ExperienceData, "highlight")}
                                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                          <h3 className="font-semibold text-gray-900 text-lg mb-3">{content.title}</h3>
                          <p className="text-gray-700 mb-4">{content.description}</p>
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            <span className="text-green-700 font-medium text-sm">{content.impact}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Key Performance Metrics */}
                <div>
                  <SectionHeader
                    title={language === "ko" ? "핵심 성과" : "Key Metrics"}
                    editKey="metricsTitle"
                    onAdd={() => { setModalType("metric"); setEditingItem(null); setShowAddModal(true); }}
                    addLabel={language === "ko" ? "+ 성과 추가" : "+ Add Metric"}
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(metricsData).map((item, index) => {
                      const content = item.content || item
                      return (
                        <div key={item.id || index} className="relative group bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                          {isAdmin && item.id && !item.id.startsWith('temp-') && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditItem(item as ExperienceData, "metric")}
                                className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          )}
                          <div className="text-2xl font-semibold text-blue-600 mb-1">{content.value}</div>
                          <div className="font-semibold text-gray-900 text-sm mb-1">{content.label}</div>
                          <div className="text-xs text-gray-500">{content.description}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tech Stack & Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <SectionHeader
                      title={language === "ko" ? "기술 스택" : "Tech Stack"}
                      editKey="techTitle"
                      onAdd={() => { setModalType("skill"); setEditingItem(null); setShowAddModal(true); }}
                      addLabel={language === "ko" ? "+ 기술 추가" : "+ Add Skill"}
                    />
                    <div className="space-y-3">
                      {(skillsData).map((item, index) => {
                        const content = item.content || item
                        return (
                          <div key={item.id || index} className="relative group bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm">{content.category}</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {(Array.isArray(content.tools) ? content.tools : content.tools?.split(',').map((t: string) => t.trim())).map((tool: string, ti: number) => (
                                <span key={ti} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">{tool}</span>
                              ))}
                            </div>
                            {isAdmin && item.id && !item.id.startsWith('temp-') && (
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingItem(item as ExperienceData)
                                    setModalType("skill")
                                    setShowAddModal(true)
                                  }}
                                  className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <SectionHeader
                      title={language === "ko" ? "전문 자격증" : "Certifications"}
                      editKey="certsTitle"
                      onAdd={() => { setModalType("certification"); setEditingItem(null); setShowAddModal(true); }}
                      addLabel={language === "ko" ? "+ 자격증 추가" : "+ Add Cert"}
                    />
                    <div className="space-y-3">
                      {(certificationsData).map((item, index) => {
                        const content = item.content || item
                        return (
                          <div key={item.id || index} className="relative group bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4 flex items-center justify-between">
                            <span className="font-medium text-gray-900 text-sm">{content.name}</span>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0 ml-3">
                                <span className="text-gray-500">{content.issuer}</span>
                                <span>{"/"}</span>
                                <span className="text-gray-500">{content.year}</span>
                              </div>
                              {isAdmin && item.id && !item.id.startsWith('temp-') && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                  <button
                                    onClick={() => handleEditItem(item as ExperienceData, "certification")}
                                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== PROJECTS TAB ===== */}
            {activeTab === "projects" && (
              <div className="space-y-12">
                {/* Career Timeline */}
                <div>
                  <SectionHeader
                    title={language === "ko" ? "커리어 타임라인" : "Career Timeline"}
                    editKey="timelineTitle"
                    onAdd={() => { setModalType("timeline"); setEditingItem(null); setShowAddModal(true); }}
                    addLabel={language === "ko" ? "+ 년도 추가" : "+ Add Year"}
                  />
                  <p className="text-xs text-gray-400 mb-3 -mt-2">{language === "ko" ? "클릭하여 프로젝트 보기" : "Click to view projects"}</p>
                  <div className="relative">
                    <div className="hidden md:block absolute top-8 left-8 right-8 h-0.5 bg-gray-200 z-0"></div>
                    <div className="flex flex-wrap gap-3 relative z-10">
                      {[...timelineData].sort((a, b) => parseInt(a.content?.year || '0') - parseInt(b.content?.year || '0')).map((item, index) => {
                        const content = item.content || item
                        const colorIdx = companyColorMap[content.company] ?? 0
                        const color = timelineColors[colorIdx] || timelineColors[0]
                        const isSelected = expandedCompany === content.company
                        return (
                          <div
                            key={item.id || index}
                            onClick={() => { setExpandedCompany(content.company); setSelectedProject(null); }}
                            className={`relative group flex-1 min-w-[150px] ${color.light} rounded-2xl shadow-sm border ${color.border} p-4 cursor-pointer transition-all duration-300 ${
                              isSelected
                                ? `ring-2 ring-offset-2 ${color.border.replace('border-', 'ring-')} shadow-lg scale-105`
                                : 'opacity-70 hover:opacity-100 hover:shadow-md hover:-translate-y-2'
                            }`}
                          >
                            {isAdmin && item.id && !item.id.startsWith('temp-') && (
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEditItem(item as ExperienceData, "timeline"); }}
                                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}
                            <div className={`inline-block ${color.bg} text-white text-xs font-bold px-2.5 py-1 rounded-lg mb-2`}>
                              {content.year}
                            </div>
                            <p className="font-medium text-gray-900 text-sm mb-0.5">{content.role}</p>
                            <p className={`${color.text} text-xs font-medium mb-0.5`}>{content.company}</p>
                            <p className="text-gray-600 text-xs">{content.focus}</p>
                            {isSelected && (
                              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-current" style={{ color: color.bg === 'bg-blue-600' ? '#2563eb' : color.bg === 'bg-teal-600' ? '#0d9488' : '#d97706' }}></div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Selected company projects */}
                {expandedCompany && (() => {
                  const colorIdx = companyColorMap[expandedCompany] ?? 0
                  const color = timelineColors[colorIdx] || timelineColors[0]
                  const companyProjects = grouped[expandedCompany] || []
                  const companyYears = actualTimeline.filter(t => t.company === expandedCompany).map(t => t.year)

                  return (
                    <div>
                      {/* Company header */}
                      <div className={`flex items-center gap-4 mb-6 p-4 rounded-2xl ${color.light} border ${color.border}`}>
                        <div className={`w-3 h-3 ${color.bg} rounded-full`}></div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-xl">{expandedCompany}</h3>
                          <p className="text-gray-500 text-sm">
                            {companyYears.length > 0 && `${companyYears[0]} - ${companyYears[companyYears.length - 1]} · `}{companyProjects.length} {language === "ko" ? "개 프로젝트" : "projects"}
                          </p>
                        </div>
                      </div>

                      {/* Project list */}
                      <div className={`space-y-6 ml-4 pl-4 border-l-2 ${color.border}`}>
                        {isAdmin && (
                          <button
                            onClick={() => handleAddProject(expandedCompany)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:bg-white hover:border-blue-400 hover:text-blue-600 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="font-medium">{language === "ko" ? "+ 프로젝트 추가" : "+ Add Project"}</span>
                          </button>
                        )}
                        {companyProjects.length === 0 && (
                          <p className="text-gray-400 text-sm text-center py-8">{language === "ko" ? "등록된 프로젝트가 없습니다" : "No projects registered"}</p>
                        )}
                        {companyProjects.map((project) => (
                          <div key={project.id} className="space-y-3">
                            <div
                              className={`relative group bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg hover:bg-white/80 transition-all duration-300 cursor-pointer ${selectedProject === project.id ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
                              onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)}
                            >
                              {isAdmin && (
                                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEditProject(project)
                                    }}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDeleteProject(project.id)
                                    }}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                              )}
                              <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h4>
                                    <p className="text-gray-700 text-sm mb-4">{project.overview}</p>
                                  </div>
                                  <span className={`${color.light} ${color.text} px-3 py-1 rounded-full text-xs font-medium border ${color.border} ml-4 whitespace-nowrap`}>
                                    {project.details?.type || "Project"}
                                  </span>
                                </div>

                                {project.tech_stack && project.tech_stack.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {project.tech_stack.map((tech, i) => (
                                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {selectedProject === project.id && (
                              <div className={`${color.light} rounded-2xl p-6 border ${color.border} shadow-sm`}>
                                {project.background && (
                                  <div className="mb-6">
                                    <h5 className="font-semibold text-gray-900 mb-2 text-sm">{language === "ko" ? "배경" : "Background"}</h5>
                                    <p className="text-gray-700 text-sm leading-relaxed">{project.background}</p>
                                  </div>
                                )}

                                {project.details && Object.keys(project.details).length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-3 text-sm">{language === "ko" ? "상세 정보" : "Details"}</h5>
                                    <div className="space-y-2 text-sm">
                                      {Object.entries(project.details).map(([key, value]) => {
                                        if (Array.isArray(value)) {
                                          return (
                                            <div key={key} className="bg-white/50 rounded-lg p-3">
                                              <p className="font-medium text-gray-900 mb-2">{key}:</p>
                                              <ul className="list-disc list-inside space-y-1 text-gray-700">
                                                {value.map((item, i) => (
                                                  <li key={i}>{String(item)}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )
                                        }
                                        if (typeof value === 'object' && value !== null) {
                                          return (
                                            <div key={key} className="bg-white/50 rounded-lg p-3">
                                              <p className="font-medium text-gray-900 mb-2">{key}:</p>
                                              <div className="text-gray-700 space-y-1">
                                                {Object.entries(value).map(([k, v]) => (
                                                  <div key={k} className="flex gap-2">
                                                    <span className="font-medium">{k}:</span>
                                                    <span>{String(v)}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          )
                                        }
                                        return (
                                          <div key={key} className="bg-white/50 rounded-lg p-3">
                                            <span className="font-medium text-gray-900">{key}:</span>{' '}
                                            <span className="text-gray-700">{String(value)}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* ===== VISION TAB ===== */}
            {activeTab === "vision" && (
              <div className="space-y-12">
                {/* Philosophy Quote */}
                <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-gray-200/50 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl"></div>
                  {isAdmin && (
                    <div className="absolute top-4 right-4 z-20">
                      <button
                        onClick={() => handleAIImprove("visionQuote", c("visionQuote", language === "ko" ? "품질은 우연이 아니라 의도의 결과입니다" : "Quality is not an accident, it's the result of intention"), 'quote')}
                        disabled={aiLoading === "visionQuote"}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {aiLoading === "visionQuote" ? (
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
                    </div>
                  )}
                  <div className="relative text-center">
                    <div className="inline-block mb-6">
                      <svg className="w-12 h-12 text-blue-400 opacity-30" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                    <blockquote className="text-3xl font-medium text-gray-800 mb-6 leading-relaxed">
                      <EditableField
                        value={c("visionQuote", language === "ko" ? "품질은 우연이 아니라 의도의 결과입니다" : "Quality is not an accident, it's the result of intention")}
                        onSave={save("visionQuote")}
                        as="span"
                        className="text-3xl font-medium text-gray-800"
                        multiline
                      />
                    </blockquote>
                    <EditableField value={c("visionAuthor", "- Sophia Ko")} onSave={save("visionAuthor")} as="p" className="text-gray-500 font-medium" />
                  </div>
                </div>

                {/* Value Cards */}
                <div>
                  <SectionHeader title={language === "ko" ? "핵심 가치" : "Core Values"} editKey="valuesTitle" />
                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        icon: "🎯",
                        title: language === "ko" ? "비용-효율 최적화" : "Cost-Efficiency Optimization",
                        description: language === "ko" ? "\"완벽한 품질\"이 아닌 적정 품질에서 적시 출시가 수익 극대화 전략. 반복 검증을 자동화하여 QA 리소스를 실제 검증 활동에 집중합니다." : "Not \"perfect quality\" but timely release at optimal quality maximizes value. Automate repetitive verification to focus QA resources on real testing.",
                        impact: language === "ko" ? "반복 검증 90% 자동화 달성" : "90% automation of repetitive verification"
                      },
                      {
                        icon: "📊",
                        title: language === "ko" ? "불편하면 직접 만든다" : "Build It If It's Missing",
                        description: language === "ko" ? "도구가 없으면 직접 개발합니다. Excel Diff Viewer, JIRA 미러링, 확률 검증, 위키 자동화까지 — 반복되는 비효율을 발견하면 직접 도구를 만들어 해결합니다." : "If there's no tool, build it. From Excel Diff Viewer to JIRA mirroring, probability verification, and wiki automation — when I find recurring inefficiency, I build a tool to solve it.",
                        impact: language === "ko" ? "7개+ QA 도구 직접 개발" : "7+ QA tools self-developed"
                      },
                      {
                        icon: "🛡️",
                        title: language === "ko" ? "AI × QA 통합" : "AI × QA Integration",
                        description: language === "ko" ? "RAG 기반 버그 자동작성, 확률 검증 자동화, MCP 기반 위키 자동 업로드 등 AI를 QA 프로세스 전반에 적용하여 실무에서 동작하는 도구들을 만들어왔습니다." : "Applied AI across QA processes — RAG-based bug auto-writing, probability verification automation, MCP-based wiki auto-upload — building tools that work in real practice.",
                        impact: language === "ko" ? "AI 활용 QA 도구 실무 적용 중" : "AI-powered QA tools in production use"
                      }
                    ].map((value, i) => (
                      <div key={i} className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        {isAdmin && (
                          <button
                            onClick={() => handleAIImprove(`value_${i}_d`, c(`value_${i}_d`, value.description), 'text')}
                            disabled={aiLoading === `value_${i}_d`}
                            className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {aiLoading === `value_${i}_d` ? (
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )}
                          </button>
                        )}
                        <div className="text-4xl mb-4">{value.icon}</div>
                        <EditableField value={c(`value_${i}_t`, value.title)} onSave={save(`value_${i}_t`)} as="h3" className="text-xl font-semibold text-gray-900 mb-3" />
                        <EditableField value={c(`value_${i}_d`, value.description)} onSave={save(`value_${i}_d`)} as="p" className="text-gray-700 mb-4 text-sm" multiline />
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <EditableField value={c(`value_${i}_i`, value.impact)} onSave={save(`value_${i}_i`)} as="span" className="text-blue-700 font-medium text-xs" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3-Stage Roadmap */}
                <div>
                  <SectionHeader title={language === "ko" ? "비전 로드맵" : "Vision Roadmap"} editKey="roadmapTitle" />
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full"></div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                      {[
                        {
                          timeline: "2025",
                          phase: language === "ko" ? "1단계" : "Phase 1",
                          title: language === "ko" ? "AI 기반 QA 도구 통합" : "AI-Powered QA Tool Integration",
                          description: language === "ko" ? "이미 개발한 도구들(JIRA 미러링, Excel Diff, 확률 검증 등)을 AI로 연결하고, 도구 간 컨텍스트를 공유하는 통합 체계를 구축합니다." : "Connect existing tools (JIRA mirroring, Excel Diff, probability verification) with AI, building an integrated system that shares context between tools.",
                          goals: language === "ko" ? ["기존 도구 간 AI 컨텍스트 공유 체계 구축", "Diff→영향도 판단→테스트 제안 자동 연결", "도구 통합으로 검증 효율 추가 30% 향상"] : ["Build AI context sharing between existing tools", "Auto-chain: Diff→impact analysis→test suggestion", "30% additional efficiency through tool integration"],
                          color: "from-blue-500 to-blue-600"
                        },
                        {
                          timeline: "2026",
                          phase: language === "ko" ? "2단계" : "Phase 2",
                          title: language === "ko" ? "QA 자동화 파이프라인" : "QA Automation Pipeline",
                          description: language === "ko" ? "버그 발견→패턴 분석→등록→리포트→문서화까지 엔드투엔드 자동 파이프라인을 구축합니다. 기획서 변경 시 테스트 케이스 자동 업데이트 체계를 만듭니다." : "Build end-to-end automation pipeline from bug detection→pattern analysis→registration→report→documentation. Create auto-update system for test cases when specs change.",
                          goals: language === "ko" ? ["버그 발견→분석→등록→리포트 엔드투엔드 자동화", "기획서 변경 시 테스트 케이스 자동 업데이트", "커버리지 부족 영역 AI 자동 제안"] : ["End-to-end: bug detection→analysis→reporting automation", "Auto-update test cases on spec changes", "AI auto-suggests under-covered areas"],
                          color: "from-purple-500 to-purple-600"
                        },
                        {
                          timeline: "2027+",
                          phase: language === "ko" ? "3단계" : "Phase 3",
                          title: language === "ko" ? "AI 자율 QA 시스템" : "AI Autonomous QA System",
                          description: language === "ko" ? "AI가 '검증해야 할 것'을 스스로 판단하고, QA 엔지니어가 핵심 판단에 집중할 수 있는 환경을 만듭니다. 프로젝트 투입 시 장르/규모별 QA 체계를 AI가 자동 설계합니다." : "Build an environment where AI autonomously decides what to verify, allowing QA engineers to focus on critical decisions. AI auto-designs QA frameworks by genre/scale on project entry.",
                          goals: language === "ko" ? ["AI가 검증 대상을 스스로 판단하는 자율 QA", "장르/규모별 QA 체계 AI 자동 설계", "QA 엔지니어가 핵심 판단에만 집중하는 환경"] : ["Autonomous QA where AI decides what to verify", "AI auto-designs QA framework by genre/scale", "Environment where QA engineers focus on critical decisions"],
                          color: "from-pink-500 to-pink-600"
                        }
                      ].map((roadmap, i) => (
                        <div key={i} className="relative">
                          {/* Circle Marker */}
                          <div className={`hidden md:flex absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-br ${roadmap.color} rounded-full border-4 border-white shadow-lg z-10`}></div>

                          <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-xl transition-all duration-300 mt-8">
                            {isAdmin && (
                              <button
                                onClick={() => handleAIImprove(`roadmap_${i}_desc`, c(`roadmap_${i}_desc`, roadmap.description), 'text')}
                                disabled={aiLoading === `roadmap_${i}_desc`}
                                className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              >
                                {aiLoading === `roadmap_${i}_desc` ? (
                                  <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                            <div className={`inline-block bg-gradient-to-r ${roadmap.color} text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3`}>
                              <EditableField value={c(`roadmap_${i}_timeline`, roadmap.timeline)} onSave={save(`roadmap_${i}_timeline`)} as="span" className="text-white text-xs font-bold" />
                            </div>
                            <div className="text-xs text-gray-500 font-medium mb-2">
                              <EditableField value={c(`roadmap_${i}_phase`, roadmap.phase)} onSave={save(`roadmap_${i}_phase`)} as="span" className="text-gray-500 text-xs" />
                            </div>
                            <EditableField value={c(`roadmap_${i}_title`, roadmap.title)} onSave={save(`roadmap_${i}_title`)} as="h3" className="text-lg font-semibold text-gray-900 mb-3" />
                            <EditableField value={c(`roadmap_${i}_desc`, roadmap.description)} onSave={save(`roadmap_${i}_desc`)} as="p" className="text-gray-700 text-sm mb-4 leading-relaxed" multiline />

                            <div className="space-y-2">
                              {roadmap.goals.map((goal, gi) => (
                                <div key={gi} className="flex items-start">
                                  <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-xs text-gray-600">{c(`roadmap_${i}_goal_${gi}`, goal)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* R&D Interest Areas */}
                <div>
                  <SectionHeader title={language === "ko" ? "R&D 관심 분야" : "R&D Interest Areas"} editKey="rdTitle" />
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: "🤖",
                        title: language === "ko" ? "AI 기반 버그 예측 & 사전 감지" : "AI Bug Prediction & Early Detection",
                        description: language === "ko" ? "3,000건 버그 패턴 학습 경험을 발전시켜, 코드/테이블 변경 시 영향 범위를 자동 분석하고 잠재 버그를 예측하는 시스템 연구" : "Evolving 3,000 bug pattern learning experience to auto-analyze impact scope on code/table changes and predict potential bugs",
                        topics: language === "ko" ? ["코드/테이블 변경 시 영향 범위 자동 분석", "3,000건 패턴 학습 기반 잠재 버그 예측", "변경 리스크 자동 등급화 시스템"] : ["Auto-analyze impact scope on code/table changes", "Predict bugs from 3,000 pattern learning", "Automatic change risk grading system"]
                      },
                      {
                        icon: "🔬",
                        title: language === "ko" ? "실시간 확률 모니터링" : "Real-time Probability Monitoring",
                        description: language === "ko" ? "확률 검증 자동화 경험을 발전시켜, 라이브 환경에서 확률 이상을 실시간으로 탐지하고 자동 알림하는 모니터링 시스템 연구" : "Evolving probability verification automation to real-time anomaly detection and auto-alerting monitoring system in live environments",
                        topics: language === "ko" ? ["라이브 환경 확률 이상 실시간 탐지", "BM 테이블 변경 자동 검증 알림", "확률형 아이템 통계적 유의성 검증"] : ["Real-time probability anomaly detection in live env", "Auto-verify alerts on BM table changes", "Statistical significance testing for gacha items"]
                      },
                      {
                        icon: "🔐",
                        title: language === "ko" ? "QA 도구 AI 고도화" : "AI Enhancement of QA Tools",
                        description: language === "ko" ? "개별 QA 도구들을 AI로 연결하여, 테이블 변경 시 자동 영향도 분석, 기획 의도 vs 실제 데이터 AI 자동 검증 등 도구 간 시너지 창출" : "Connect individual QA tools with AI for auto-impact analysis on table changes, AI auto-verification of design intent vs actual data, creating synergy between tools",
                        topics: language === "ko" ? ["테이블 변경 시 AI 영향도 자동 분석", "기획 의도 vs 실제 데이터 AI 검증", "도구 간 시너지로 검증 프로세스 혁신"] : ["AI auto-impact analysis on table changes", "AI verify: design intent vs actual data", "Innovate verification through tool synergy"]
                      },
                      {
                        icon: "📱",
                        title: language === "ko" ? "AI 기반 QA 프로세스 표준화" : "AI-based QA Process Standardization",
                        description: language === "ko" ? "SET팀 협업 경험을 확장하여, 프로젝트 신규 투입 시 장르/규모/플랫폼에 맞는 QA 프로세스, 체크리스트, 도구 세팅을 AI가 자동 추천하는 체계 연구" : "Expanding SET team collaboration experience to research AI auto-recommendation of QA processes, checklists, and tool setups by genre/scale/platform on new project entry",
                        topics: language === "ko" ? ["장르/규모/플랫폼별 QA 프로세스 AI 추천", "체크리스트 & 도구 세팅 자동 생성", "신규 프로젝트 온보딩 시간 대폭 단축"] : ["AI auto-recommend QA process by genre/scale/platform", "Auto-generate checklists & tool setups", "Drastically reduce new project onboarding time"]
                      }
                    ].map((area, i) => (
                      <div key={i} className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                        {isAdmin && (
                          <button
                            onClick={() => handleAIImprove(`rd_${i}_d`, c(`rd_${i}_d`, area.description), 'text')}
                            disabled={aiLoading === `rd_${i}_d`}
                            className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs rounded hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {aiLoading === `rd_${i}_d` ? (
                              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            )}
                          </button>
                        )}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="text-3xl">{area.icon}</div>
                          <div className="flex-1">
                            <EditableField value={c(`rd_${i}_t`, area.title)} onSave={save(`rd_${i}_t`)} as="h3" className="text-lg font-semibold text-gray-900 mb-2" />
                            <EditableField value={c(`rd_${i}_d`, area.description)} onSave={save(`rd_${i}_d`)} as="p" className="text-gray-700 text-sm" multiline />
                          </div>
                        </div>
                        <div className="space-y-2 pl-12">
                          {area.topics.map((topic, ti) => (
                            <div key={ti} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-xs text-gray-600">{c(`rd_${i}_topic_${ti}`, topic)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-10 text-white shadow-2xl">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">
                        {language === "ko" ? "함께 품질을 구축할 준비가 되셨나요?" : "Ready to Build Quality Together?"}
                      </h2>
                      <p className="text-gray-400">
                        {language === "ko" ? "사용자가 사랑하고 개발자가 자랑스러워하는 제품을 만들어봅시다." : "Let's create products that users love and developers are proud of."}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8 text-center md:text-left">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          {language === "ko" ? "연락처" : "Contact"}
                        </h3>
                        <div className="space-y-2 text-sm">
                          {footerContact.map((item) => (
                            <a
                              key={item.id}
                              href={item.content.link}
                              className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition-colors"
                              {...(item.content.link?.startsWith('http') && { target: "_blank", rel: "noopener noreferrer" })}
                            >
                              {item.content.icon && getIcon(item.content.icon)}
                              {item.content.value}
                            </a>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          {language === "ko" ? "빠른 링크" : "Quick Links"}
                        </h3>
                        <div className="space-y-2 text-sm">
                          {footerLinks.map((item) => (
                            <a
                              key={item.id}
                              href={item.content.link}
                              className="block text-gray-300 hover:text-white transition-colors"
                            >
                              {item.content.label}
                            </a>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          {language === "ko" ? "전문 분야" : "Expertise"}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-300">
                          {footerExpertise.map((item) => (
                            <p key={item.id}>{item.content.label}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
                      <p>© {new Date().getFullYear()} Sophia Ko. {language === "ko" ? "모든 권리 보유." : "All rights reserved."}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Admin Login Button - Hidden */}
      {/* <AdminLoginButton language={language} /> */}


      {/* Add Item Modal */}
      <AddItemModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditingItem(null); }}
        onSave={handleSaveItem}
        itemType={modalType}
        language={language}
        editingItem={editingItem}
      />

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={showProjectModal}
        onClose={() => { setShowProjectModal(false); setSelectedCompany(""); setEditingProject(null); }}
        onSave={handleSaveProject}
        company={selectedCompany}
        language={language}
        editingProject={editingProject}
      />

      {/* Admin Settings Modal */}
      <AdminSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        language={language}
      />
    </div>
  )
}
