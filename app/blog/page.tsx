"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/lib/admin-context"
import { createClient } from "@/lib/supabase/client"

interface BlogPost {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  cover_color: string
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
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const { isAdmin, isLoggedIn } = useAdmin()

  // Form state
  const [formTitle, setFormTitle] = useState("")
  const [formContent, setFormContent] = useState("")
  const [formCategory, setFormCategory] = useState("general")
  const [formTags, setFormTags] = useState("")
  const [formCoverColor, setFormCoverColor] = useState(COVER_COLORS[0])
  const [formPublished, setFormPublished] = useState(true)

  const DUMMY_POSTS: BlogPost[] = [
    {
      id: "dummy-1",
      title: "QA 엔지니어로서의 첫 자동화 테스트 도입기",
      content: "입사 초기, 수동으로 진행하던 리그레션 테스트를 자동화로 전환한 경험을 공유합니다.\n\n기존에는 매 스프린트마다 2일씩 수동 리그레션 테스트를 진행했습니다. 반복되는 작업에 피로감이 쌓였고, 휴먼 에러로 인한 누락도 발생했습니다.\n\nSelenium + Python으로 첫 자동화 스크립트를 작성했을 때의 짜릿함은 아직도 잊을 수 없습니다. 초기에는 유지보수 비용이 더 높다는 팀원들의 우려가 있었지만, Page Object Model 패턴을 도입하고 CI/CD 파이프라인에 통합한 후에는 테스트 시간을 70% 단축할 수 있었습니다.\n\n핵심 교훈:\n- 자동화는 목적이 아니라 수단이다\n- 안정적인 테스트 인프라가 먼저다\n- 팀의 공감대 형성이 가장 중요하다",
      category: "automation",
      tags: ["Selenium", "자동화", "CI/CD", "회고"],
      cover_color: "#dbeafe",
      published: true,
      created_at: "2025-01-15T09:00:00Z",
      updated_at: "2025-01-15T09:00:00Z",
    },
  ]

  useEffect(() => {
    const saved = localStorage.getItem("language") as "ko" | "en"
    if (saved) setLanguage(saved)
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false })
      if (data && data.length > 0) {
        setPosts(data)
      } else {
        setPosts(DUMMY_POSTS)
      }
    } catch {
      setPosts(DUMMY_POSTS)
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
    setFormPublished(true)
    setEditingPost(null)
  }

  const handleSave = async () => {
    const supabase = createClient()
    const postData = {
      title: formTitle,
      content: formContent,
      category: formCategory,
      tags: formTags.split(",").map(t => t.trim()).filter(Boolean),
      cover_color: formCoverColor,
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
    setFormPublished(post.published)
    setShowEditor(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(language === "ko" ? "정말 삭제하시겠습니까?" : "Are you sure you want to delete?")) return
    const supabase = createClient()
    await supabase.from("blog_posts").delete().eq("id", id)
    fetchPosts()
  }

  const filteredPosts = posts.filter(
    p => selectedCategory === "all" || p.category === selectedCategory
  ).filter(p => isAdmin && isLoggedIn ? true : p.published)

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
          <h1 className="text-5xl font-light text-gray-900 mb-4">Blog</h1>
          <p className="text-gray-600 text-lg font-light">
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

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                {editingPost ? (language === "ko" ? "글 수정" : "Edit Post") : (language === "ko" ? "새 글 작성" : "New Post")}
              </h2>

              <div className="space-y-5">
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

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-10 flex-wrap">
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
              {isAdmin && isLoggedIn ? "📝" : "📭"}
            </div>
            <p className="text-gray-500 text-lg">
              {isAdmin && isLoggedIn
                ? (language === "ko" ? "첫 번째 글을 작성해보세요!" : "Write your first post!")
                : (language === "ko" ? "아직 게시된 글이 없습니다" : "No posts yet")
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <div
                key={post.id}
                className="group bg-white rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              >
                {/* Color Header */}
                <div
                  className="h-3"
                  style={{ backgroundColor: post.cover_color }}
                />

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
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatDate(post.created_at)}</span>
                    {isAdmin && isLoggedIn && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleEdit(post)} className="text-blue-500 hover:text-blue-700 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700 transition-colors">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedPost === post.id && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50/50" onClick={e => e.stopPropagation()}>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-gray-400">
        Senior QA Engineer - 5 {language === "ko" ? "년 경력" : "Years Experience"}
      </div>
    </div>
  )
}
