"use client"

// localStorage-based content management
// Stores user edits as overrides on top of default content

const STORAGE_KEY = "portfolio_content_overrides"

export function getOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function setOverride(key: string, value: string) {
  const overrides = getOverrides()
  overrides[key] = value
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
}

export function getContent(key: string, defaultValue: string): string {
  const overrides = getOverrides()
  return overrides[key] ?? defaultValue
}

export function clearAllOverrides() {
  localStorage.removeItem(STORAGE_KEY)
}
