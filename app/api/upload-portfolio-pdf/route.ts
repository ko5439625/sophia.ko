import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 })
    }

    // Check file size (5MB limit for DB storage)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB" }, { status: 400 })
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    const supabase = createClient()

    // Store in portfolio_content table as base64
    const { error: upsertError } = await supabase
      .from("portfolio_content")
      .upsert({
        user_id: USER_ID,
        language: "ko",
        content_key: "portfolio_pdf_data",
        content_value: base64,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,language,content_key'
      })

    if (upsertError) {
      console.error("DB save error:", upsertError)
      return NextResponse.json({ error: "Failed to save PDF: " + upsertError.message }, { status: 500 })
    }

    // Save filename separately
    await supabase
      .from("portfolio_content")
      .upsert({
        user_id: USER_ID,
        language: "ko",
        content_key: "portfolio_pdf_name",
        content_value: file.name,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,language,content_key'
      })

    // Return the API URL for downloading
    const downloadUrl = `/api/download-portfolio-pdf`

    return NextResponse.json({
      success: true,
      url: downloadUrl,
      fileName: file.name
    })

  } catch (error: any) {
    console.error("Portfolio PDF upload error:", error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}
