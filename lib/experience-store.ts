import { createClient } from "@/lib/supabase"
import { translateObject } from "@/lib/translate"

const USER_ID = "sophia.ko"

export interface ExperienceData {
  id: string
  user_id: string
  language: string
  data_type: 'timeline' | 'highlight' | 'metric' | 'skill' | 'certification' | 'approach'
  content: Record<string, any>
  display_order: number
  created_at?: string
  updated_at?: string
}

// 각 data_type별로 번역할 필드 정의
const TRANSLATE_FIELDS: Record<string, string[]> = {
  timeline: ['role', 'company', 'focus'],
  highlight: ['title', 'description', 'impact'],
  metric: ['label', 'description'],
  skill: ['category', 'tools'],
  certification: ['name', 'issuer'],
  approach: ['title', 'description']
}

export async function loadExperienceData(language: string, dataType: string): Promise<ExperienceData[]> {
  const supabase = createClient()

  // 항상 한국어 데이터만 로드 (language = 'ko')
  const { data, error } = await supabase
    .from("experience_data")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("language", "ko") // 항상 한국어 데이터 로드
    .eq("data_type", dataType)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error loading experience data:", error)
    return []
  }

  if (!data) return []

  // 영어 요청 시 실시간 번역
  if (language === "en") {
    const fieldsToTranslate = TRANSLATE_FIELDS[dataType] || []
    const translatedData = await Promise.all(
      data.map(async (item) => ({
        ...item,
        content: await translateObject(item.content, fieldsToTranslate)
      }))
    )
    return translatedData
  }

  return data
}

export async function addExperienceData(
  language: string,
  dataType: string,
  content: Record<string, any>,
  displayOrder?: number
): Promise<ExperienceData | null> {
  const supabase = createClient()

  // If no display order provided, get the max and add 1
  if (displayOrder === undefined) {
    const { data: existing } = await supabase
      .from("experience_data")
      .select("display_order")
      .eq("user_id", USER_ID)
      .eq("language", language)
      .eq("data_type", dataType)
      .order("display_order", { ascending: false })
      .limit(1)

    displayOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0
  }

  const { data, error } = await supabase
    .from("experience_data")
    .insert({
      user_id: USER_ID,
      language,
      data_type: dataType,
      content,
      display_order: displayOrder
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding experience data:", error)
    return null
  }

  return data
}

export async function updateExperienceData(
  id: string,
  content: Record<string, any>
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from("experience_data")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating experience data:", error)
    return false
  }

  return true
}

export async function deleteExperienceData(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from("experience_data")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting experience data:", error)
    return false
  }

  return true
}

export async function reorderExperienceData(
  language: string,
  dataType: string,
  items: { id: string; display_order: number }[]
): Promise<boolean> {
  const supabase = createClient()

  const updates = items.map(item =>
    supabase
      .from("experience_data")
      .update({ display_order: item.display_order })
      .eq("id", item.id)
  )

  try {
    await Promise.all(updates)
    return true
  } catch (error) {
    console.error("Error reordering experience data:", error)
    return false
  }
}
