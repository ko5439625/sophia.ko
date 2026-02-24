"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAdmin } from "@/lib/admin-context"
import { createClient } from "@/lib/supabase/client"

interface BlogPost {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  cover_color: string
  cover_image: string | null
  published: boolean
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { id: "all", label: "All", labelKo: "전체" },
  { id: "qa", label: "QA", labelKo: "QA" },
  { id: "automation", label: "Automation", labelKo: "자동화" },
  { id: "process", label: "Process", labelKo: "프로세스" },
  { id: "retrospective", label: "Retrospective", labelKo: "회고" },
  { id: "general", label: "General", labelKo: "일반" },
]

const COVER_COLORS = [
  "#e0f2fe", "#dbeafe", "#e0e7ff", "#ede9fe",
  "#fce7f3", "#fef3c7", "#d1fae5", "#f1f5f9",
]

export default function BlogPage() {
  const [language, setLanguage] = useState<"ko" | "en">("ko")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const { isAdmin, isLoggedIn } = useAdmin()

  // Form state
  const [formTitle, setFormTitle] = useState("")
  const [formContent, setFormContent] = useState("")
  const [formCategory, setFormCategory] = useState("general")
  const [formTags, setFormTags] = useState("")
  const [formCoverColor, setFormCoverColor] = useState(COVER_COLORS[0])
  const [formCoverImage, setFormCoverImage] = useState<string | null>(null)
  const [formPublished, setFormPublished] = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    const saved = localStorage.getItem("language") as "ko" | "en"
    if (saved) setLanguage(saved)
    fetchPosts()
  }, [])

  // Body scroll lock for modals
  useEffect(() => {
    if (viewingPost || showEditor) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [viewingPost, showEditor])

  // ESC key to close modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewingPost) setViewingPost(null)
        else if (showEditor) { setShowEditor(false); resetForm() }
      }
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [viewingPost, showEditor])

  const fetchPosts = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
      setPosts(data || [])
    } catch {
      setPosts([])
    }
  }

  const handleLanguageChange = (newLang: "ko" | "en") => {
    setLanguage(newLang)
    localStorage.setItem("language", newLang)
  }

  const resetForm = () => {
    setFormTitle("")
    setFormContent("")
    setFormCategory("general")
    setFormTags("")
    setFormCoverColor(COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)])
    setFormCoverImage(null)
    setFormPublished(true)
    setEditingPost(null)
  }

  const handleImageUpload = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setAiError(language === "ko" ? "이미지는 5MB 이하여야 합니다" : "Image must be under 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      setAiError(language === "ko" ? "이미지 파일만 업로드 가능합니다" : "Only image files are allowed")
      return
    }

    setImageUploading(true)
    setAiError("")

    try {
      const supabase = createClient()
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      const { data, error } = await supabase.storage
        .from("blog-images")
        .upload(fileName, file, { cacheControl: "3600", upsert: false })

      if (error) throw error

      const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(data.path)
      setFormCoverImage(urlData.publicUrl)
    } catch (err) {
      console.error("Storage upload failed, using base64 fallback:", err)
      try {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFormCoverImage(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } catch {
        setAiError(language === "ko" ? "이미지 업로드 실패" : "Image upload failed")
      }
    } finally {
      setImageUploading(false)
    }
  }, [language])

  const handleSave = async () => {
    const supabase = createClient()
    const postData = {
      title: formTitle,
      content: formContent,
      category: formCategory,
      tags: formTags.split(",").map(t => t.trim()).filter(Boolean),
      cover_color: formCoverColor,
      cover_image: formCoverImage,
      published: formPublished,
      updated_at: new Date().toISOString(),
    }

    if (editingPost) {
      await supabase.from("blog_posts").update(postData).eq("id", editingPost.id)
    } else {
      await supabase.from("blog_posts").insert(postData)
    }

    setShowEditor(false)
    resetForm()
    fetchPosts()
  }

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormTitle(post.title)
    setFormContent(post.content)
    setFormCategory(post.category)
    setFormTags(post.tags.join(", "))
    setFormCoverColor(post.cover_color)
    setFormCoverImage(post.cover_image)
    setFormPublished(post.published)
    setShowEditor(true)
    setViewingPost(null)
  }

  const handleAIImprove = async () => {
    const hasContent = formTitle.trim() || formContent.trim()
    if (!hasContent) {
      setAiError(language === "ko" ? "먼저 기본 내용을 입력하세요" : "Please enter some basic content first")
      return
    }

    setAiLoading(true)
    setAiError("")

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'blog content improvement',
          type: 'blog',
          language,
          formData: {
            title: formTitle,
            content: formContent,
            tags: formTags
          }
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'AI 생성 실패')
      }

      const data = await response.json()
      setFormTitle(data.title || formTitle)
      setFormContent(data.content || formContent)
      setFormTags(data.tags || formTags)
    } catch (error: any) {
      console.error("AI 개선 오류:", error)
      setAiError(error.message || (language === "ko" ? "AI 생성 중 오류가 발생했습니다" : "Error generating with AI"))
    } finally {
      setAiLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === "ko" ? "정말 삭제하시겠습니까?" : "Are you sure you want to delete?")) return
    const supabase = createClient()
    await supabase.from("blog_posts").delete().eq("id", id)
    setViewingPost(null)
    fetchPosts()
  }

  const filteredPosts = posts
    .filter(p => selectedCategory === "all" || p.category === selectedCategory)
    .filter(p => isAdmin && isLoggedIn ? true : p.published)
    .filter(p => {
      if (!debouncedSearch.trim()) return true
      const q = debouncedSearch.toLowerCase()
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    })

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return language === "ko"
      ? `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`
      : d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 ${isAdmin ? "pt-10" : ""}`}>
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.location.href = "/"}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === "ko" ? "검색으로 돌아가기" : "Back to Search"}
          </button>

          <div className="flex items-center space-x-8">
            {["About", "Experience", "Vision", "Blog"].map((tab) => (
              <button
                key={tab}
                onClick={() => window.location.href = `/${tab.toLowerCase()}`}
                className={`text-sm font-medium transition-colors ${
                  tab === "Blog"
                    ? "text-gray-900 border-b-2 border-gray-900 pb-1"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-3">
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
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Blog</h1>
          <p className="text-gray-500 text-lg">
            {language === "ko"
              ? "QA 엔지니어의 경험과 인사이트를 기록합니다"
              : "Recording experiences and insights of a QA engineer"}
          </p>
        </div>

        {/* Admin: New Post Button */}
        {isAdmin && isLoggedIn && (
          <div className="mb-8 flex justify-end">
            <button
              onClick={() => { resetForm(); setShowEditor(true) }}
              className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              {language === "ko" ? "+ 새 글 작성" : "+ New Post"}
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === "ko" ? "제목, 내용, 태그 검색..." : "Search title, content, tags..."}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-10 flex-wrap justify-center">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {language === "ko" ? cat.labelKo : cat.label}
            </button>
          ))}
        </div>

        {/* Blog Cards */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">
              {debouncedSearch.trim()
                ? "🔍"
                : isAdmin && isLoggedIn ? "📝" : "📭"
              }
            </div>
            <p className="text-gray-500 text-lg">
              {debouncedSearch.trim()
                ? (language === "ko" ? `"${debouncedSearch}" 검색 결과가 없습니다` : `No results for "${debouncedSearch}"`)
                : isAdmin && isLoggedIn
                  ? (language === "ko" ? "첫 번째 글을 작성해보세요!" : "Write your first post!")
                  : (language === "ko" ? "아직 게시된 글이 없습니다" : "No posts yet")
              }
            </p>
            {debouncedSearch.trim() && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {language === "ko" ? "검색 초기화" : "Clear search"}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                className="group bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setViewingPost(post)}
              >
                {/* Cover Image or Color Header */}
                {post.cover_image ? (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div
                    className="h-3"
                    style={{ backgroundColor: post.cover_color }}
                  />
                )}

                <div className="p-6">
                  {/* Category & Status */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                      {CATEGORIES.find(c => c.id === post.category)?.[language === "ko" ? "labelKo" : "label"] || post.category}
                    </span>
                    {!post.published && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">
                        Draft
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Preview */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-gray-400">
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Post Modal */}
      {viewingPost && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingPost(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Cover Image */}
            {viewingPost.cover_image && (
              <div className="h-64 overflow-hidden rounded-t-3xl">
                <img
                  src={viewingPost.cover_image}
                  alt={viewingPost.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8">
              {/* Category */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full font-medium">
                  {CATEGORIES.find(c => c.id === viewingPost.category)?.[language === "ko" ? "labelKo" : "label"] || viewingPost.category}
                </span>
                {!viewingPost.published && (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-medium">
                    Draft
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {viewingPost.title}
              </h2>

              {/* Date */}
              <p className="text-sm text-gray-400 mb-6">
                {formatDate(viewingPost.created_at)}
              </p>

              {/* Content */}
              <div className="prose prose-gray max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed mb-8">
                {viewingPost.content}
              </div>

              {/* Tags */}
              {viewingPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 pt-6 border-t border-gray-100">
                  {viewingPost.tags.map((tag, i) => (
                    <span key={i} className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && isLoggedIn && (
                <div className="flex gap-3 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(viewingPost)}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    {language === "ko" ? "수정" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleDelete(viewingPost.id)}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    {language === "ko" ? "삭제" : "Delete"}
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setViewingPost(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white shadow-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => { setShowEditor(false); resetForm() }}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              {editingPost ? (language === "ko" ? "글 수정" : "Edit Post") : (language === "ko" ? "새 글 작성" : "New Post")}
            </h2>

            {/* AI Content Improvement */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200 mb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {language === "ko" ? "AI 내용 개선" : "AI Content Improvement"}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {language === "ko"
                      ? "기본 내용을 입력하고 버튼을 누르면 AI가 더 전문적이고 매력적으로 개선해드립니다"
                      : "Enter basic content and click to have AI improve it professionally"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAIImprove}
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

            <div className="space-y-5">
              {/* Cover Image Upload */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  {language === "ko" ? "커버 이미지" : "Cover Image"}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file)
                  }}
                />
                {formCoverImage ? (
                  <div className="relative group/img">
                    <img
                      src={formCoverImage}
                      alt="Cover"
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={() => setFormCoverImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400", "bg-blue-50/50") }}
                    onDragLeave={e => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/50") }}
                    onDrop={e => {
                      e.preventDefault()
                      e.currentTarget.classList.remove("border-blue-400", "bg-blue-50/50")
                      const file = e.dataTransfer.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                  >
                    {imageUploading ? (
                      <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">
                          {language === "ko" ? "클릭 또는 드래그하여 이미지 업로드" : "Click or drag to upload image"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {language === "ko" ? "최대 5MB" : "Max 5MB"}
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  {language === "ko" ? "제목" : "Title"}
                </label>
                <input
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={language === "ko" ? "글 제목을 입력하세요" : "Enter post title"}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  {language === "ko" ? "카테고리" : "Category"}
                </label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                >
                  {CATEGORIES.filter(c => c.id !== "all").map(c => (
                    <option key={c.id} value={c.id}>{language === "ko" ? c.labelKo : c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  {language === "ko" ? "내용" : "Content"}
                </label>
                <textarea
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  rows={10}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
                  placeholder={language === "ko" ? "내용을 작성하세요" : "Write your content"}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  {language === "ko" ? "태그 (쉼표로 구분)" : "Tags (comma separated)"}
                </label>
                <input
                  value={formTags}
                  onChange={e => setFormTags(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                  placeholder="QA, Automation, Selenium"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  {language === "ko" ? "카드 색상" : "Card Color"}
                </label>
                <div className="flex gap-3">
                  {COVER_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setFormCoverColor(color)}
                      className={`w-10 h-10 rounded-xl border-2 transition-all ${
                        formCoverColor === color ? "border-gray-900 scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFormPublished(!formPublished)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formPublished ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formPublished ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className="text-sm text-gray-700">
                  {formPublished
                    ? (language === "ko" ? "공개" : "Published")
                    : (language === "ko" ? "비공개" : "Draft")
                  }
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => { setShowEditor(false); resetForm() }}
                className="px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {language === "ko" ? "취소" : "Cancel"}
              </button>
              <button
                onClick={handleSave}
                disabled={!formTitle.trim()}
                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40"
              >
                {language === "ko" ? "저장" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center py-8 text-sm text-gray-400">
        Senior QA Engineer - 5 {language === "ko" ? "년 경력" : "Years Experience"}
      </div>
    </div>
  )
}
