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

  // expandedCompany는 이제 타임라인 항목의 ID를 저장 (회사명 대신)
  // Drag & Drop states (admin only)
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [dragOverCompany, setDragOverCompany] = useState<string | null>(null)

  // AI states
  const [aiLoading, setAiLoading] = useState<string | null>(null)
  const [aiError, setAiError] = useState("")

  // UI animation states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [quoteTypingPos, setQuoteTypingPos] = useState(0)

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

  // 월 단위까지 고려한 날짜 파싱 (예: "2023.12", "2024.02~2024.05", "2017.09-2020.05")
  const parseYearMonth = (yearStr: string): number => {
    if (!yearStr) return 0
    // 시작 날짜만 추출 (첫 번째 숫자 부분)
    const match = yearStr.match(/(\d{4})(?:\.(\d{1,2}))?/)
    if (!match) return parseInt(yearStr) * 100 || 0
    const year = parseInt(match[1])
    const month = match[2] ? parseInt(match[2]) : 1
    return year * 100 + month
  }

  // Auto-select the latest timeline item when timeline data loads
  useEffect(() => {
    if (timelineData.length > 0 && expandedCompany === null) {
      const sorted = [...timelineData].sort((a, b) => parseYearMonth(a.content?.year || '0') - parseYearMonth(b.content?.year || '0'))
      if (sorted.length > 0) {
        setExpandedCompany(sorted[sorted.length - 1].id)
      }
    }
  }, [timelineData])

  // Scroll entrance animation
  useEffect(() => {
    if (loading) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('scroll-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-scroll]').forEach((el) => observer.observe(el))
    }, 100)
    return () => { clearTimeout(timer); observer.disconnect() }
  }, [loading, activeTab])

  // Vision quote typewriter effect (slow & smooth)
  useEffect(() => {
    if (activeTab !== "vision" || loading) return
    setQuoteTypingPos(0)
    let pos = 0
    let delay = 30
    const interval = setInterval(() => {
      if (delay > 0) { delay--; return }
      pos++
      setQuoteTypingPos(pos)
      if (pos >= 200) clearInterval(interval)
    }, 70)
    return () => clearInterval(interval)
  }, [activeTab, loading])

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

  const handleAddProject = (timelineId: string) => {
    // timelineId에서 회사명 찾기
    const timelineItem = timelineData.find(t => t.id === timelineId)
    setSelectedCompany(timelineItem?.content?.company || "")
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
        // timeline_id 유지
        if (!mergedDetails.timeline_id && editingProject.details?.timeline_id) {
          mergedDetails.timeline_id = editingProject.details.timeline_id
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
        // Add new project - expandedCompany가 timeline_id
        const projectId = `proj-${Date.now()}`
        const details = { ...(projectData.details || {}), timeline_id: expandedCompany }
        await addProject(language, {
          project_id: projectId,
          title: projectData.title,
          category: "qa",
          overview: projectData.overview,
          background: projectData.background,
          tech_stack: projectData.tech_stack,
          details
        })
        console.log("프로젝트 추가 완료")
      }

      // Reload projects
      const updatedProjects = await loadProjects(language)
      console.log("리로드된 프로젝트:", updatedProjects)
      setProjects(updatedProjects)

      // expandedCompany는 이미 timeline_id이므로 유지

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

  // Drag & Drop handlers for moving projects between companies
  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", project.id)
  }

  const handleDragEnd = () => {
    setDraggedProject(null)
    setDragOverCompany(null)
  }

  const handleDragOverTimeline = (e: React.DragEvent, timelineId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverCompany(timelineId)
  }

  const handleDragLeaveTimeline = () => {
    setDragOverCompany(null)
  }

  const handleDropOnTimeline = async (e: React.DragEvent, targetTimelineId: string) => {
    e.preventDefault()
    setDragOverCompany(null)

    if (!draggedProject) return
    const currentTimelineId = draggedProject.details?.timeline_id
    if (currentTimelineId === targetTimelineId) {
      setDraggedProject(null)
      return
    }

    try {
      // 타겟 타임라인의 회사명 가져오기
      const targetTimeline = timelineData.find(t => t.id === targetTimelineId)
      const targetCompany = targetTimeline?.content?.company || ""
      const updatedDetails = { ...(draggedProject.details || {}), timeline_id: targetTimelineId, company: targetCompany }
      await updateProject(draggedProject.id, { details: updatedDetails })

      // Reload projects
      const updatedProjects = await loadProjects(language)
      setProjects(updatedProjects)
      setExpandedCompany(targetTimelineId)
      setSelectedProject(null)
    } catch (error) {
      console.error("Error moving project:", error)
      alert(language === "ko" ? "프로젝트 이동 실패" : "Failed to move project")
    }
    setDraggedProject(null)
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
        <div className="flex items-center flex-1 mr-4">
          {editKey ? (
            <EditableField value={c(editKey, title)} onSave={save(editKey)} as="h2" className="text-2xl font-semibold text-gray-900 tracking-tight mr-4" />
          ) : (
            <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mr-4">{title}</h2>
          )}
          <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
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

  // 타임라인을 월 단위까지 고려하여 정렬
  const sortedTimeline = [...timelineData].sort((a, b) => {
    return parseYearMonth(a.content?.year || '0') - parseYearMonth(b.content?.year || '0')
  })

  // 회사 그룹 키 추출 함수 ("NCsoft - 라이브 QA" → "ncsoft")
  const getCompanyGroupKey = (company: string) => {
    if (!company) return ""
    const sep = company.indexOf(" - ")
    return sep > 0 ? company.substring(0, sep).toLowerCase() : company.toLowerCase()
  }

  // 그룹 키 기반 색상 매핑 (같은 회사 = 같은 색상)
  const uniqueGroupKeys = [...new Set(sortedTimeline.map(t => getCompanyGroupKey(t.content?.company || "")))]
  const groupColorMap: Record<string, number> = {}
  uniqueGroupKeys.forEach((key, i) => { groupColorMap[key] = i % timelineColors.length })

  // 타임라인 ID 기반으로 프로젝트 그룹화
  const grouped: Record<string, Project[]> = {}
  sortedTimeline.forEach(t => { grouped[t.id] = [] })

  qaProjects.forEach(p => {
    // 1순위: timeline_id로 매칭
    let key = p.details?.timeline_id

    // 2순위: timeline_id가 없으면 company 문자열로 폴백 매칭
    if (!key || !grouped[key]) {
      const company = p.details?.company
      if (company) {
        const matchedTimeline = sortedTimeline.find(t => t.content?.company === company)
        key = matchedTimeline?.id
      }
    }

    // 3순위: 그래도 없으면 마지막 타임라인에 배치
    if (!key || !grouped[key]) {
      key = sortedTimeline[sortedTimeline.length - 1]?.id
    }

    if (key && grouped[key]) {
      grouped[key].push(p)
    }
  })

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 ${isAdmin ? "pt-10" : ""}`}>
      <style>{`
        [data-scroll] { opacity: 0; transform: translateY(24px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        [data-scroll].scroll-visible { opacity: 1; transform: translateY(0); }
        [data-scroll]:nth-child(2) { transition-delay: 0.1s; }
        [data-scroll]:nth-child(3) { transition-delay: 0.15s; }
        [data-scroll]:nth-child(4) { transition-delay: 0.2s; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes stepReveal { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes arrowFade { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        .roadmap-step { opacity: 0; animation: stepReveal 0.8s ease-out forwards; }
        .roadmap-arrow { opacity: 0; animation: arrowFade 0.5s ease-out forwards; }
      `}</style>
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => (window.location.href = "/")} className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {language === "ko" ? "검색으로 돌아가기" : "Back to Search"}
            </button>
            {/* Hamburger button (mobile) */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
            <div className="hidden md:flex items-center space-x-8">
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
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-lg px-6 py-4 space-y-1 animate-[slideDown_0.2s_ease-out] z-50">
            <button onClick={() => (window.location.href = "/about")} className="block w-full text-left text-gray-600 hover:text-gray-900 py-2.5 text-sm">About</button>
            <div className="text-blue-600 font-medium py-2.5 text-sm border-l-2 border-blue-600 pl-3">Experience</div>
            <button onClick={() => (window.location.href = "/blog")} className="block w-full text-left text-gray-600 hover:text-gray-900 py-2.5 text-sm">Blog</button>
            <div className="flex items-center space-x-3 pt-3 border-t border-gray-100 mt-2">
              <span className={`text-sm ${language === "ko" ? "text-gray-900 font-medium" : "text-gray-500"}`}>한국어</span>
              <button
                onClick={() => handleLanguageChange(language === "ko" ? "en" : "ko")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${language === "en" ? "bg-blue-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${language === "en" ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className={`text-sm ${language === "en" ? "text-gray-900 font-medium" : "text-gray-500"}`}>EN</span>
            </div>
          </div>
        )}
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
              <div className="space-y-16">
                {/* Summary */}
                <div className="relative overflow-hidden" data-scroll>
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
                <div data-scroll>
                  <SectionHeader
                    title={language === "ko" ? "핵심 강점" : "Key Highlights"}
                    editKey="highlightsTitle"
                    onAdd={() => { setModalType("highlight"); setEditingItem(null); setShowAddModal(true); }}
                    addLabel={language === "ko" ? "+ 강점 추가" : "+ Add Highlight"}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(highlightsData).map((item, index) => {
                      const content = item.content || item
                      return (
                        <div key={item.id || index} className="relative group bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-8 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
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
                <div data-scroll>
                  <SectionHeader
                    title={language === "ko" ? "핵심 성과" : "Key Metrics"}
                    editKey="metricsTitle"
                    onAdd={() => { setModalType("metric"); setEditingItem(null); setShowAddModal(true); }}
                    addLabel={language === "ko" ? "+ 성과 추가" : "+ Add Metric"}
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {(metricsData).map((item, index) => {
                      const content = item.content || item
                      return (
                        <div key={item.id || index} className="relative group bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
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

                {/* Culture & Leadership - 정성 요소 */}
                <div data-scroll>
                  <SectionHeader
                    title={language === "ko" ? "조직 문화 & 리더십" : "Culture & Leadership"}
                    editKey="cultureTitle"
                  />
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* 동호회 운영 */}
                    <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4 border border-amber-100">
                        <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <EditableField
                        value={c("culture_0_t", language === "ko" ? "동호회 창설 & 운영" : "Club Founding & Management")}
                        onSave={save("culture_0_t")}
                        as="h3"
                        className="text-lg font-semibold text-gray-900 mb-3"
                      />
                      <EditableField
                        value={c("culture_0_d", language === "ko"
                          ? "Point Mobile 재직 시 '모던아트' 동호회를 직접 창설하고 회장으로 운영했습니다. 당시 트렌드였던 오일 파스텔 수업을 위해 전문 강사를 직접 섭외하고, 회사 지원금을 활용하여 조직 내 문화 생활과 친목 도모를 이끌었습니다."
                          : "Founded and led the 'Modern Art' club at Point Mobile as president. Personally recruited professional instructors for oil pastel classes (then trending), utilizing company funding to foster team culture and bonding."
                        )}
                        onSave={save("culture_0_d")}
                        as="p"
                        className="text-gray-700 text-sm leading-relaxed mb-4"
                        multiline
                      />
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-100">{language === "ko" ? "리더십" : "Leadership"}</span>
                        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-100">{language === "ko" ? "기획·조율" : "Planning"}</span>
                        <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-100">{language === "ko" ? "문화 주도" : "Culture"}</span>
                      </div>
                    </div>

                    {/* 스몰톡 전 회차 참여 */}
                    <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4 border border-blue-100">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      </div>
                      <EditableField
                        value={c("culture_1_t", language === "ko" ? "스몰톡 전 회차 참여" : "Full Small Talk Attendance")}
                        onSave={save("culture_1_t")}
                        as="h3"
                        className="text-lg font-semibold text-gray-900 mb-3"
                      />
                      <EditableField
                        value={c("culture_1_d", language === "ko"
                          ? "NCsoft에서 년 2회 진행되는 스몰톡 활동에 한 번도 빠짐없이 참여하고 있습니다. 업무 자동화·AI 관련 스몰톡에서 실무 인사이트를 얻고, 게임 방법론 및 실제 게임 스몰톡을 통해 게임에 대한 이해도와 QA 프로세스 이해도를 높였습니다."
                          : "Attended every single NCsoft Small Talk session (held twice yearly) without exception. Gained practical insights from automation & AI sessions, and deepened game understanding through game methodology discussions with QA engineers from other projects."
                        )}
                        onSave={save("culture_1_d")}
                        as="p"
                        className="text-gray-700 text-sm leading-relaxed mb-4"
                        multiline
                      />
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">{language === "ko" ? "적극적 참여" : "Active"}</span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">{language === "ko" ? "크로스 팀 교류" : "Cross-team"}</span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">{language === "ko" ? "인사이트" : "Insight"}</span>
                      </div>
                    </div>

                    {/* 스몰톡 리딩 */}
                    <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-4 border border-purple-100">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                      </div>
                      <EditableField
                        value={c("culture_2_t", language === "ko" ? "\"잠깐, 이거 맞아?\" 스몰톡 리딩" : "Leading \"Wait, Is This Right?\" Talk")}
                        onSave={save("culture_2_t")}
                        as="h3"
                        className="text-lg font-semibold text-gray-900 mb-3"
                      />
                      <EditableField
                        value={c("culture_2_d", language === "ko"
                          ? "업무 중 문득 떠오르는 질문들 — '이건 왜 이렇게 할까?', '나는 왜 이 부분을 중요하게 볼까?' — 에 대한 생각과 의견을 나누는 스몰톡을 직접 기획하고 진행하고 있습니다. 정답이나 결론 없이 서로의 시선을 통해 사고를 확장할 수 있도록 하여, 참가자들로부터 긍정적인 피드백을 받고 있습니다."
                          : "Planning and leading a Small Talk series exploring spontaneous work questions — 'Why do we do it this way?', 'Why do I prioritize this?' — sharing perspectives and attitudes freely. With no fixed answers or conclusions, participants expand their thinking through each other's viewpoints, receiving positive feedback."
                        )}
                        onSave={save("culture_2_d")}
                        as="p"
                        className="text-gray-700 text-sm leading-relaxed mb-4"
                        multiline
                      />
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium border border-purple-100">{language === "ko" ? "퍼실리테이션" : "Facilitation"}</span>
                        <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium border border-purple-100">{language === "ko" ? "사고 확장" : "Critical Thinking"}</span>
                        <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium border border-purple-100">{language === "ko" ? "주도적" : "Initiative"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech Stack & Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8" data-scroll>
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

                {/* Subtle Footer */}
                <div className="text-center pt-4">
                  <p className="text-[11px] text-gray-300 tracking-wide">— QA Engineer Sophia Ko —</p>
                </div>
              </div>
            )}

            {/* ===== PROJECTS TAB ===== */}
            {activeTab === "projects" && (
              <div className="space-y-12">
                {/* Career Timeline */}
                <div data-scroll>
                  <SectionHeader
                    title={language === "ko" ? "커리어 타임라인" : "Career Timeline"}
                    editKey="timelineTitle"
                    onAdd={() => { setModalType("timeline"); setEditingItem(null); setShowAddModal(true); }}
                    addLabel={language === "ko" ? "+ 년도 추가" : "+ Add Year"}
                  />
                  <p className="text-xs text-gray-400 mb-3 -mt-2">
                    {draggedProject
                      ? (language === "ko" ? "타임라인 카드에 드롭하여 프로젝트 이동" : "Drop on a timeline card to move project")
                      : (language === "ko" ? "클릭하여 프로젝트 보기" : "Click to view projects")
                    }
                    {isAdmin && !draggedProject && (
                      <span className="ml-2 text-gray-300">{language === "ko" ? "· 프로젝트를 드래그하여 이동 가능" : "· Drag projects to move"}</span>
                    )}
                  </p>
                  <div className="relative">
                    <div className="hidden md:block absolute top-8 left-8 right-8 h-0.5 bg-gray-200 z-0"></div>
                    {/* 같은 회사끼리 그룹핑하여 렌더링 */}
                    <div className="relative z-10">
                      {(() => {
                        // 회사명에서 그룹 키 추출 ("NCsoft - 라이브 QA" → "NCsoft")
                        const getCompanyGroup = (company: string) => {
                          if (!company) return ""
                          const sep = company.indexOf(" - ")
                          return sep > 0 ? company.substring(0, sep).toLowerCase() : company.toLowerCase()
                        }

                        // 정렬된 타임라인을 같은 회사끼리 그룹핑 (인접하지 않아도 매칭)
                        const companyGroups: { company: string; groupKey: string; items: typeof sortedTimeline }[] = []
                        sortedTimeline.forEach(item => {
                          const company = item.content?.company || ""
                          const groupKey = getCompanyGroup(company)
                          const existingGroup = companyGroups.find(g => g.groupKey === groupKey)
                          if (existingGroup) {
                            existingGroup.items.push(item)
                          } else {
                            companyGroups.push({ company, groupKey, items: [item] })
                          }
                        })

                        // 항상 3컬럼 기준으로 동일 폭 유지
                        const maxCols = 3
                        const totalGroups = companyGroups.length

                        return (
                          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
                        {companyGroups.map((group) => {
                          const colorIdx = groupColorMap[group.groupKey] ?? 0
                          const color = timelineColors[colorIdx] || timelineColors[0]
                          const hasSelectedItem = group.items.some(item => expandedCompany === item.id)

                          return (
                            <div
                              key={group.company}
                              className={`rounded-2xl border-2 border-dashed ${color.border} p-2 ${hasSelectedItem ? color.light : 'bg-white/30'} transition-colors duration-300`}
                            >
                              {/* 회사 라벨 (항상 표시) */}
                              {(() => {
                                const firstCompany = group.items[0]?.content?.company || ""
                                const sep = firstCompany.indexOf(" - ")
                                const displayName = sep > 0 ? firstCompany.substring(0, sep) : firstCompany
                                return (
                                  <div className={`text-xs font-semibold ${color.text} mb-2 px-2 flex items-center gap-1.5`}>
                                    <div className={`w-2 h-2 ${color.bg} rounded-full`}></div>
                                    {displayName}
                                  </div>
                                )
                              })()}
                              <div className="flex flex-col gap-2">
                                {group.items.map((item, index) => {
                                  const content = item.content || {}
                                  const isSelected = expandedCompany === item.id
                                  const isDragOver = dragOverCompany === item.id && draggedProject?.details?.timeline_id !== item.id
                                  const projectCount = grouped[item.id]?.length || 0
                                  return (
                                    <div
                                      key={item.id || index}
                                      onClick={() => { setExpandedCompany(item.id); setSelectedProject(null); }}
                                      onDragOver={isAdmin ? (e) => handleDragOverTimeline(e, item.id) : undefined}
                                      onDragLeave={isAdmin ? handleDragLeaveTimeline : undefined}
                                      onDrop={isAdmin ? (e) => handleDropOnTimeline(e, item.id) : undefined}
                                      className={`relative group ${color.light} rounded-xl shadow-sm border ${color.border} p-3 cursor-pointer transition-all duration-300 ${
                                        isSelected
                                          ? `ring-2 ring-offset-1 ${color.border.replace('border-', 'ring-')} shadow-lg`
                                          : 'opacity-70 hover:opacity-100 hover:shadow-md'
                                      } ${isDragOver ? 'ring-2 ring-dashed ring-blue-400 shadow-xl bg-blue-100/50' : ''}`}
                                    >
                                      {isAdmin && item.id && !item.id.startsWith('temp-') && (
                                        <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <div className={`inline-block ${color.bg} text-white text-[10px] font-bold px-2 py-0.5 rounded-md`}>
                                          {content.year}
                                        </div>
                                        {projectCount > 0 && (
                                          <span className="text-[10px] text-gray-400">{projectCount}</span>
                                        )}
                                      </div>
                                      <p className="font-medium text-gray-900 text-sm mb-0.5">{content.role}</p>
                                      <p className={`${color.text} text-xs font-medium mb-0.5`}>{content.company}</p>
                                      <p className="text-gray-500 text-xs leading-relaxed">{content.focus}</p>
                                      {isSelected && (
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-current" style={{ color: color.bg === 'bg-blue-600' ? '#2563eb' : color.bg === 'bg-teal-600' ? '#0d9488' : '#d97706' }}></div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>

                {/* Selected timeline item's projects */}
                {expandedCompany && (() => {
                  const selectedTimeline = sortedTimeline.find(t => t.id === expandedCompany)
                  if (!selectedTimeline) return null
                  const content = selectedTimeline.content || {}
                  const colorIdx = groupColorMap[getCompanyGroupKey(content.company)] ?? 0
                  const color = timelineColors[colorIdx] || timelineColors[0]
                  const companyProjects = grouped[expandedCompany] || []

                  return (
                    <div data-scroll>
                      {/* Timeline item header */}
                      <div className={`flex items-center gap-4 mb-6 p-4 rounded-2xl ${color.light} border ${color.border}`}>
                        <div className={`w-3 h-3 ${color.bg} rounded-full`}></div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-xl">{content.company}</h3>
                          <p className="text-gray-500 text-sm">
                            {content.role} · {content.year} · {companyProjects.length} {language === "ko" ? "개 프로젝트" : "projects"}
                          </p>
                          {content.focus && (
                            <p className="text-gray-400 text-xs mt-1">{content.focus}</p>
                          )}
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
                              draggable={isAdmin}
                              onDragStart={isAdmin ? (e) => handleDragStart(e, project) : undefined}
                              onDragEnd={isAdmin ? handleDragEnd : undefined}
                              className={`relative group bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg hover:bg-white/80 transition-all duration-300 cursor-pointer ${selectedProject === project.id ? "ring-2 ring-offset-1 ring-blue-400" : ""} ${isAdmin ? "cursor-grab active:cursor-grabbing" : ""} ${draggedProject?.id === project.id ? "opacity-50 scale-95" : ""}`}
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
                              <div className={`${color.light} rounded-2xl p-6 border ${color.border} shadow-sm animate-[slideDown_0.3s_ease-out]`}>
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
                                      {Object.entries(project.details).filter(([key]) => !['timeline_id', 'company'].includes(key)).map(([key, value]) => {
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

                {/* Subtle Footer */}
                <div className="text-center pt-4">
                  <p className="text-[11px] text-gray-300 tracking-wide">— QA Engineer Sophia Ko —</p>
                </div>
              </div>
            )}

            {/* ===== VISION TAB ===== */}
            {activeTab === "vision" && (
              <div className="space-y-16">
                {/* Philosophy Quote */}
                <div className="relative bg-white rounded-2xl p-12 md:p-16 border border-gray-100 shadow-sm overflow-hidden" data-scroll>
                  <div className="absolute top-6 left-8 text-[120px] leading-none font-serif text-gray-200 select-none pointer-events-none">&ldquo;</div>
                  <div className="absolute bottom-2 right-8 text-[120px] leading-none font-serif text-gray-200 select-none pointer-events-none">&rdquo;</div>
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
                  <div className="relative text-center py-4">
                    <blockquote className="mb-6 max-w-3xl mx-auto">
                      {isAdmin ? (
                        <EditableField
                          value={c("visionQuote", language === "ko" ? "품질은 우연이 아니라 의도의 결과입니다" : "Quality is not an accident, it's the result of intention")}
                          onSave={save("visionQuote")}
                          as="span"
                          className="text-2xl md:text-3xl font-bold text-gray-700 leading-relaxed"
                          multiline
                        />
                      ) : (() => {
                        const fullQuote = c("visionQuote", language === "ko" ? "품질은 우연이 아니라 의도의 결과입니다" : "Quality is not an accident, it's the result of intention")
                        return (
                          <span className="text-2xl md:text-3xl font-bold text-gray-700 leading-relaxed">
                            {fullQuote.slice(0, quoteTypingPos)}
                            {quoteTypingPos < fullQuote.length && <span className="animate-pulse text-gray-400 ml-0.5">|</span>}
                          </span>
                        )
                      })()}
                    </blockquote>
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-8 h-[1px] bg-blue-300"></div>
                      <EditableField value={c("visionAuthor", "Sophia Ko")} onSave={save("visionAuthor")} as="p" className="text-sm font-medium text-blue-400 tracking-wider" />
                      <div className="w-8 h-[1px] bg-blue-300"></div>
                    </div>
                  </div>
                </div>

                {/* Value Cards */}
                <div data-scroll>
                  <SectionHeader title={language === "ko" ? "핵심 가치" : "Core Values"} editKey="valuesTitle" />
                  <div className="grid md:grid-cols-3 gap-8">
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
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                          {i === 0 && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                          {i === 1 && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.59-5.59a2 2 0 010-2.83l.17-.17a2 2 0 012.83 0l2.17 2.17 2.17-2.17a2 2 0 012.83 0l.17.17a2 2 0 010 2.83l-5.59 5.59a1 1 0 01-1.41 0zM19.42 15.17l-1.59-1.59M4 20h16" /></svg>}
                          {i === 2 && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                        </div>
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

                {/* Culture & Growth Philosophy */}
                <div data-scroll>
                  <SectionHeader title={language === "ko" ? "함께 성장하는 문화" : "Growing Together"} editKey="cultureVisionTitle" />
                  <div className="bg-gradient-to-br from-white via-amber-50/30 to-white rounded-2xl border border-amber-200/50 p-8 md:p-10">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <EditableField
                          value={c("cultureVision_d", language === "ko"
                            ? "기술적 역량만으로는 좋은 QA를 만들 수 없다고 생각합니다. 조직 내 소통과 문화가 뒷받침될 때 비로소 진정한 시너지가 만들어집니다.\n\nPoint Mobile에서 '모던아트' 동호회를 직접 창설하여 오일 파스텔 수업을 기획·운영했고, NCsoft에서는 스몰톡 활동에 매 회차 빠짐없이 참여하며 타 프로젝트 QA와의 교류를 통해 시야를 넓혔습니다. 현재는 '잠깐, 이거 맞아?'라는 스몰톡을 직접 이끌며, 일을 바라보는 관점과 태도를 자유롭게 공유하는 자리를 만들고 있습니다."
                            : "Technical expertise alone doesn't make great QA. True synergy emerges when communication and culture are in place.\n\nI founded the 'Modern Art' club at Point Mobile, organizing oil pastel workshops, and at NCsoft, I've attended every Small Talk session to broaden perspectives through cross-project QA exchanges. Currently, I lead the 'Wait, Is This Right?' talk series — creating a space where we freely share our viewpoints and attitudes toward work."
                          )}
                          onSave={save("cultureVision_d")}
                          as="p"
                          className="text-gray-700 leading-relaxed text-sm whitespace-pre-line"
                          multiline
                        />
                      </div>
                      <div className="space-y-4">
                        {[
                          { icon: "🎨", label: language === "ko" ? "동호회 창설 & 회장 역임" : "Founded & Led Art Club", sub: language === "ko" ? "Point Mobile 모던아트 — 강사 섭외, 회사 지원금 운영" : "Point Mobile Modern Art — instructor hiring, company funding" },
                          { icon: "💬", label: language === "ko" ? "스몰톡 전 회차 참여" : "100% Small Talk Attendance", sub: language === "ko" ? "NCsoft 년 2회 · AI, 자동화, 게임 방법론 등" : "NCsoft biannual · AI, automation, game methodology" },
                          { icon: "🎙️", label: language === "ko" ? "\"잠깐, 이거 맞아?\" 스몰톡 리딩" : "Leading \"Wait, Is This Right?\" Talk", sub: language === "ko" ? "사고 확장형 자유 토론 · 긍정적 피드백 수령 중" : "Free-form thought expansion · receiving positive feedback" }
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-3 bg-white/80 rounded-xl p-4 border border-gray-100">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i === 0 && <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                              {i === 1 && <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                              {i === 2 && <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3-Stage Roadmap */}
                <div data-scroll>
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
                        <div key={i} className="relative roadmap-step" style={{ animationDelay: `${i * 0.3}s` }}>
                          {/* Circle Marker with step number */}
                          <div className={`hidden md:flex absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br ${roadmap.color} rounded-full border-4 border-white shadow-lg z-10 items-center justify-center`}>
                            <span className="text-white text-[10px] font-bold">{i + 1}</span>
                          </div>

                          {/* Connector arrow between cards */}
                          {i < 2 && (
                            <div className="hidden md:block absolute top-12 -right-4 z-20">
                              <svg className="w-8 h-8 text-gray-300 roadmap-arrow" style={{ animationDelay: `${i * 0.3 + 0.5}s` }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                          )}

                          <div className={`relative bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300 mt-8`}>
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
                <div data-scroll>
                  <SectionHeader title={language === "ko" ? "R&D 관심 분야" : "R&D Interest Areas"} editKey="rdTitle" />
                  <div className="grid md:grid-cols-2 gap-8">
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
                          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            {i === 0 && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                            {i === 1 && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                            {i === 2 && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            {i === 3 && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>}
                          </div>
                          <div className="flex-1">
                            <EditableField value={c(`rd_${i}_t`, area.title)} onSave={save(`rd_${i}_t`)} as="h3" className="text-lg font-semibold text-gray-900 mb-2" />
                            <EditableField value={c(`rd_${i}_d`, area.description)} onSave={save(`rd_${i}_d`)} as="p" className="text-gray-700 text-sm" multiline />
                          </div>
                        </div>
                        <div className="space-y-2 pl-14">
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
                <div className="bg-gray-50 rounded-2xl p-10 border border-gray-200/80">
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                      <p className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em]">Designing Reliable Quality.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-10 text-center md:text-left">
                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                          {language === "ko" ? "연락처" : "Contact"}
                        </h3>
                        <div className="space-y-2.5 text-sm">
                          {footerContact.map((item) => (
                            <a
                              key={item.id}
                              href={item.content.link}
                              className="flex items-center justify-center md:justify-start text-gray-500 hover:text-gray-900 transition-colors"
                              {...(item.content.link?.startsWith('http') && { target: "_blank", rel: "noopener noreferrer" })}
                            >
                              {item.content.icon && getIcon(item.content.icon)}
                              {item.content.value}
                            </a>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                          {language === "ko" ? "빠른 링크" : "Quick Links"}
                        </h3>
                        <div className="space-y-2.5 text-sm">
                          {footerLinks.map((item) => (
                            <a
                              key={item.id}
                              href={item.content.link}
                              className="block text-gray-500 hover:text-gray-900 transition-colors"
                            >
                              {item.content.label}
                            </a>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                          {language === "ko" ? "전문 분야" : "Expertise"}
                        </h3>
                        <div className="space-y-2.5 text-sm text-gray-500">
                          {footerExpertise.map((item) => (
                            <p key={item.id}>{item.content.label}</p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
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
