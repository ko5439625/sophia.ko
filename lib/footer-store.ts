import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

export interface FooterItem {
  id: string
  user_id: string
  language: string
  section: 'contact' | 'links' | 'expertise'
  content: {
    label: string
    value?: string
    icon?: string
    link?: string
  }
  display_order: number
  created_at?: string
  updated_at?: string
}

export async function loadFooterData(section: string): Promise<FooterItem[]> {
  const supabase = createClient()

  // 항상 한국어 데이터만 로드 (번역은 translate.ts에서 처리)
  const { data, error } = await supabase
    .from("footer_data")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("language", "ko")
    .eq("section", section)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error loading footer data:", error)
    return []
  }

  return data || []
}

export async function addFooterItem(
  section: string,
  content: Record<string, any>
): Promise<FooterItem | null> {
  const supabase = createClient()

  // Get max display_order
  const { data: existing } = await supabase
    .from("footer_data")
    .select("display_order")
    .eq("user_id", USER_ID)
    .eq("language", "ko")
    .eq("section", section)
    .order("display_order", { ascending: false })
    .limit(1)

  const displayOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

  const { data, error } = await supabase
    .from("footer_data")
    .insert({
      user_id: USER_ID,
      language: "ko",
      section,
      content,
      display_order: displayOrder
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding footer item:", error)
    return null
  }

  return data
}

export async function updateFooterItem(
  id: string,
  content: Record<string, any>
): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from("footer_data")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error updating footer item:", error)
    return false
  }

  return true
}

export async function deleteFooterItem(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from("footer_data")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting footer item:", error)
    return false
  }

  return true
}

export async function updateFooterFromAbout(contactIndex: number, field: 'l' | 'v', value: string): Promise<void> {
  const supabase = createClient()

  // Load current footer contact items
  const contacts = await loadFooterData("contact")

  if (contactIndex < contacts.length) {
    // Update existing contact item
    const contact = contacts[contactIndex]
    const newContent = {
      ...contact.content,
      [field === 'l' ? 'label' : 'value']: value
    }
    await updateFooterItem(contact.id, newContent)
  }
}
