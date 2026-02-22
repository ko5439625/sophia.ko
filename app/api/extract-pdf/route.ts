import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert PDF to text using pdf-parse or similar
    // For now, we'll use a simple approach with FormData
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // You can use libraries like pdf-parse here
    // For simplicity, we'll return a placeholder
    // In production, install: npm install pdf-parse

    try {
      // Dynamically import pdf-parse
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)

      return NextResponse.json({
        success: true,
        text: data.text,
        pages: data.numpages
      })
    } catch (error) {
      // If pdf-parse is not installed, return error message
      return NextResponse.json({
        error: "PDF parsing library not installed. Please install pdf-parse: npm install pdf-parse",
        fallback: "PDF 파일에서 텍스트를 추출하려면 pdf-parse 라이브러리가 필요합니다. 대신 텍스트를 직접 입력해주세요."
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("PDF extraction error:", error)
    return NextResponse.json(
      { error: error.message || "PDF extraction failed" },
      { status: 500 }
    )
  }
}
