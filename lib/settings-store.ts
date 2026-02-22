import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

export interface UserSettings {
  gpt_api_key: string
  ai_model: string
  ai_enabled: boolean
}

let settingsCache: UserSettings | null = null

export async function loadSettings(): Promise<UserSettings> {
  // Return from cache if available
  if (settingsCache) {
    return settingsCache
  }

  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_settings")
    .select("settings")
    .eq("user_id", USER_ID)
    .single()

  if (error) {
    console.error("Error loading settings:", error)
    return {
      gpt_api_key: "",
      ai_model: "gpt-4",
      ai_enabled: false
    }
  }

  settingsCache = data.settings as UserSettings
  return settingsCache
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<boolean> {
  const supabase = createClient()

  // Merge with existing settings
  const currentSettings = await loadSettings()
  const newSettings = { ...currentSettings, ...settings }

  const { error } = await supabase
    .from("user_settings")
    .update({
      settings: newSettings,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", USER_ID)

  if (error) {
    console.error("Error saving settings:", error)
    return false
  }

  // Update cache
  settingsCache = newSettings
  return true
}

export async function getGPTApiKey(): Promise<string> {
  const settings = await loadSettings()
  return settings.gpt_api_key || ""
}

export function clearSettingsCache() {
  settingsCache = null
}
