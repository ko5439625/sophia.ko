import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // PDF text extraction is disabled for now
  // To enable: install pdf-parse (npm install pdf-parse)

  return NextResponse.json({
    error: "PDF text extraction feature is currently disabled",
    fallback: "PDF 파일에서 텍스트를 추출하는 기능은 현재 비활성화되어 있습니다. 텍스트를 직접 입력해주세요.",
    message: "This feature requires the pdf-parse library. Please enter text manually instead."
  }, { status: 501 })

  /* ORIGINAL CODE - Enable if pdf-parse is installed
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      const pdfParse = (await import('pdf-parse')).default
      const data = await pdfParse(buffer)

      return NextResponse.json({
        success: true,
        text: data.text,
        pages: data.numpages
      })
    } catch (error) {
      return NextResponse.json({
        error: "PDF parsing failed",
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
  */
}
