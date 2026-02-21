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

  projectsCache = data || []
  return projectsCache
}

export function getProjectsByCategory(category: string, language: string = "ko"): Project[] {
  if (!projectsCache) return []
  return projectsCache.filter(p => p.category === category)
}

export function getAllProjects(language: string = "ko"): Project[] {
  return projectsCache || []
}
