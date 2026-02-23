import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

const DEFAULT_SETTINGS = {
  gpt_api_key: "",
  ai_model: "gpt-4",
  ai_enabled: false,
}

export async function GET() {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", USER_ID)
      .single()

    if (error) {
      console.error("Error loading settings:", error)
      return NextResponse.json(DEFAULT_SETTINGS)
    }

    return NextResponse.json(data.settings)
  } catch (error) {
    console.error("Error in GET /api/settings:", error)
    return NextResponse.json(DEFAULT_SETTINGS)
  }
}

export async function POST(request: Request) {
  try {
    const settings = await request.json()
    const supabase = createClient()

    // Get current settings
    const { data: currentData } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", USER_ID)
      .single()

    // Merge with new settings
    const newSettings = {
      ...(currentData?.settings || DEFAULT_SETTINGS),
      ...settings,
    }

    const { error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: USER_ID,
          settings: newSettings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (error) {
      console.error("Error saving settings:", error)
      return NextResponse.json(
        { error: "Failed to save settings" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, settings: newSettings })
  } catch (error) {
    console.error("Error in POST /api/settings:", error)
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
