import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

export async function GET() {
  try {
    const supabase = createClient()

    // Get PDF data from portfolio_content
    const { data: pdfData } = await supabase
      .from("portfolio_content")
      .select("content_value")
      .eq("user_id", USER_ID)
      .eq("language", "ko")
      .eq("content_key", "portfolio_pdf_data")
      .single()

    if (!pdfData?.content_value) {
      return NextResponse.json({ error: "No PDF found" }, { status: 404 })
    }

    // Get filename
    const { data: nameData } = await supabase
      .from("portfolio_content")
      .select("content_value")
      .eq("user_id", USER_ID)
      .eq("language", "ko")
      .eq("content_key", "portfolio_pdf_name")
      .single()

    const fileName = nameData?.content_value || "portfolio.pdf"

    // Decode base64 to buffer
    const pdfBuffer = Buffer.from(pdfData.content_value, 'base64')

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error("PDF download error:", error)
    return NextResponse.json(
      { error: error.message || "Download failed" },
      { status: 500 }
    )
  }
}
