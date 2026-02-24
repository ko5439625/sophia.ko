"use client"

import { createClient } from "@/lib/supabase/client"

// Supabase-based content management
// Stores user edits in Supabase database with localStorage fallback

const STORAGE_KEY = "portfolio_content_overrides"
const USER_ID = "sophia.ko"

// In-memory cache for better performance
let contentCache: Record<string, string> | null = null
let isCacheInitialized = false

// Get current language from localStorage or default to 'ko'
function getCurrentLanguage(): string {
  if (typeof window === "undefined") return "ko"
  return localStorage.getItem("language") || "ko"
}

// Reset cache (call when language changes or data needs refresh)
export function resetContentCache(): void {
  contentCache = null
  isCacheInitialized = false
}

// Extract language from content key (e.g., "about.ko.info_0_q" -> "ko")
function getLanguageFromKey(key: string): string {
  const parts = key.split(".")
  if (parts.length >= 2 && (parts[1] === "ko" || parts[1] === "en")) {
    return parts[1]
  }
  return getCurrentLanguage()
}

// Initialize content cache from Supabase
export async function initializeContentCache(): Promise<void> {
  if (isCacheInitialized) return

  try {
    const supabase = createClient()

    // Load ALL content for the user (language is already in the key)
    const { data, error } = await supabase
      .from("portfolio_content")
      .select("content_key, content_value")
      .eq("user_id", USER_ID)

    if (error) {
      console.error("Error loading content from Supabase:", error)
      // Fallback to localStorage
      contentCache = getLocalOverrides()
    } else {
      contentCache = {}
      data?.forEach((item) => {
        contentCache![item.content_key] = item.content_value
      })
    }

    isCacheInitialized = true
  } catch (error) {
    console.error("Failed to initialize content cache:", error)
    contentCache = getLocalOverrides()
    isCacheInitialized = true
  }
}

// Get overrides from localStorage (fallback)
function getLocalOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Get all overrides (from cache or localStorage)
export function getOverrides(): Record<string, string> {
  if (contentCache !== null) {
    return contentCache
  }
  return getLocalOverrides()
}

// Set override and save to Supabase
export async function setOverride(key: string, value: string): Promise<void> {
  try {
    const supabase = createClient()
    // Extract language from key (e.g., "about.ko.info_0_q" -> "ko")
    const language = getLanguageFromKey(key)

    // Update cache immediately for instant UI feedback
    if (contentCache !== null) {
      contentCache[key] = value
    }

    // Save to Supabase
    const { error } = await supabase
      .from("portfolio_content")
      .upsert({
        user_id: USER_ID,
        language,
        content_key: key,
        content_value: value,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,language,content_key'
      })

    if (error) {
      console.error("Error saving to Supabase:", error)
      // Fallback to localStorage
      const overrides = getLocalOverrides()
      overrides[key] = value
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
    }
  } catch (error) {
    console.error("Failed to save content:", error)
    // Fallback to localStorage
    const overrides = getLocalOverrides()
    overrides[key] = value
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  }
}

// Synchronous version for compatibility (uses cache)
export function setOverrideSync(key: string, value: string): void {
  // Update cache immediately
  if (contentCache !== null) {
    contentCache[key] = value
  }

  // Update localStorage as fallback
  const overrides = getLocalOverrides()
  overrides[key] = value
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))

  // Save to Supabase asynchronously (fire and forget)
  setOverride(key, value).catch(console.error)
}

// Get content with fallback to default value
export function getContent(key: string, defaultValue: string): string {
  const overrides = getOverrides()
  return overrides[key] ?? defaultValue
}

// Clear all overrides (from Supabase and localStorage)
export async function clearAllOverrides(): Promise<void> {
  try {
    const supabase = createClient()
    const language = getCurrentLanguage()

    // Clear from Supabase
    const { error } = await supabase
      .from("portfolio_content")
      .delete()
      .eq("user_id", USER_ID)
      .eq("language", language)

    if (error) {
      console.error("Error clearing Supabase content:", error)
    }

    // Clear cache
    contentCache = {}

    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear content:", error)
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Synchronous version for compatibility
export function clearAllOverridesSync(): void {
  contentCache = {}
  localStorage.removeItem(STORAGE_KEY)
  clearAllOverrides().catch(console.error)
}
