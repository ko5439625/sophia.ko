import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Read the file as text - basic extraction
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Simple PDF text extraction without external library
    // Extract readable text between stream markers
    const pdfString = buffer.toString('latin1')
    const textChunks: string[] = []

    // Method 1: Extract text between BT/ET markers (PDF text objects)
    const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g
    let match
    while ((match = btEtRegex.exec(pdfString)) !== null) {
      const textBlock = match[1]
      // Extract text from Tj and TJ operators
      const tjRegex = /\(([^)]*)\)\s*Tj/g
      let tjMatch
      while ((tjMatch = tjRegex.exec(textBlock)) !== null) {
        const decoded = tjMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\')
        if (decoded.trim()) textChunks.push(decoded)
      }

      // TJ array operator
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g
      let tjArrMatch
      while ((tjArrMatch = tjArrayRegex.exec(textBlock)) !== null) {
        const parts = tjArrMatch[1]
        const strRegex = /\(([^)]*)\)/g
        let strMatch
        let line = ''
        while ((strMatch = strRegex.exec(parts)) !== null) {
          line += strMatch[1]
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\')
        }
        if (line.trim()) textChunks.push(line)
      }
    }

    let extractedText = textChunks.join('\n').trim()

    // If basic extraction got nothing useful, inform the user
    if (!extractedText || extractedText.length < 10) {
      return NextResponse.json({
        success: true,
        text: `[PDF 파일: ${file.name}]\n\n이 PDF에서 텍스트를 자동 추출할 수 없습니다.\n파일 내용을 직접 복사하여 붙여넣어 주세요.`,
        pages: 0,
        note: "automatic_extraction_limited"
      })
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      pages: 0
    })

  } catch (error: any) {
    console.error("PDF extraction error:", error)
    return NextResponse.json(
      { error: error.message || "PDF extraction failed" },
      { status: 500 }
    )
  }
}
