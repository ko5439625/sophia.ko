import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

export interface Project {
  id: string
  user_id: string
  language: string
  project_id: string
  title: string
  category: string
  overview: string
  background: string | null
  tech_stack: string[]
  display_order: number
  details: Record<string, any>
  created_at?: string
  updated_at?: string
}

let projectsCache: Project[] | null = null

export async function loadProjects(language: string = "ko"): Promise<Project[]> {
  const supabase = createClient()

  // 요청된 언어의 데이터를 직접 로드
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("language", language)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error loading projects:", error)
    return []
  }

  if (!data || data.length === 0) {
    // 해당 언어 데이터가 없으면 한국어 폴백
    if (language !== "ko") {
      const { data: koData } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", USER_ID)
        .eq("language", "ko")
        .order("display_order", { ascending: true })
      projectsCache = koData || []
      return projectsCache
    }
    return []
  }

  projectsCache = data
  return projectsCache
}

export function getProjectsByCategory(category: string, language: string = "ko"): Project[] {
  if (!projectsCache) return []
  return projectsCache.filter(p => p.category === category)
}

export function getAllProjects(language: string = "ko"): Project[] {
  return projectsCache || []
}

export async function addProject(
  language: string,
  projectData: {
    project_id: string
    title: string
    category: string
    overview: string
    background?: string
    tech_stack?: string[]
    details?: Record<string, any>
  }
): Promise<Project | null> {
  const supabase = createClient()

  // Get max display_order
  const { data: existing } = await supabase
    .from("projects")
    .select("display_order")
    .eq("user_id", USER_ID)
    .eq("language", language)
    .order("display_order", { ascending: false })
    .limit(1)

  const displayOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: USER_ID,
      language,
      project_id: projectData.project_id,
      title: projectData.title,
      category: projectData.category,
      overview: projectData.overview,
      background: projectData.background || null,
      tech_stack: projectData.tech_stack || [],
      details: projectData.details || {},
      display_order: displayOrder
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding project:", error)
    return null
  }

  // Clear cache
  projectsCache = null
  return data
}

export async function updateProject(
  id: string,
  projectData: Partial<Project>
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from("projects")
    .update({ ...projectData, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating project:", error)
    return false
  }

  // Clear cache
  projectsCache = null
  return true
}

export async function deleteProject(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting project:", error)
    return false
  }

  // Clear cache
  projectsCache = null
  return true
}
