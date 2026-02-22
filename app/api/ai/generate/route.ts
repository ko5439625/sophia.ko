import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

interface AIGenerateRequest {
  prompt: string
  type: 'timeline' | 'highlight' | 'metric' | 'skill' | 'certification' | 'project' | 'blog' | 'about'
  context?: string
  language?: 'ko' | 'en'
  formData?: Record<string, any>
}

export async function POST(request: Request) {
  try {
    const { prompt, type, context, language = 'ko', formData }: AIGenerateRequest = await request.json()

    // Get API key from settings
    const supabase = createClient()
    const { data: settingsData } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", USER_ID)
      .single()

    const apiKey = settingsData?.settings?.gpt_api_key
    const aiEnabled = settingsData?.settings?.ai_enabled
    const aiModel = settingsData?.settings?.ai_model || 'gpt-4'
    const userContext = settingsData?.settings?.user_context || ''
    const projectGuidelines = settingsData?.settings?.project_guidelines || ''

    if (!aiEnabled || !apiKey) {
      return NextResponse.json(
        { error: "AI 기능이 비활성화되어 있거나 API 키가 설정되지 않았습니다." },
        { status: 400 }
      )
    }

    const systemPrompt = getSystemPrompt(type, language, userContext, projectGuidelines)
    const userPrompt = buildUserPrompt(type, context, formData, language)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("OpenAI API error:", error)
      return NextResponse.json(
        { error: error.error?.message || 'GPT API 호출 실패' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'GPT 응답이 비어있습니다.' },
        { status: 500 }
      )
    }

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(content)
      return NextResponse.json(parsed)
    } catch {
      // If not JSON, return as text
      return NextResponse.json({ text: content })
    }
  } catch (error) {
    console.error("Error in AI generate:", error)
    return NextResponse.json(
      { error: "AI 생성 중 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

function buildUserPrompt(type: string, context: string | undefined, formData: Record<string, any> | undefined, language: 'ko' | 'en'): string {
  if (!formData || Object.keys(formData).length === 0) {
    return `${context ? `배경: ${context}\n\n` : ''}기본 정보를 바탕으로 내용을 생성해주세요.`
  }

  const currentContent = JSON.stringify(formData, null, 2)

  if (language === 'ko') {
    return `${context ? `배경: ${context}\n\n` : ''}현재 입력된 내용:\n${currentContent}\n\n위 내용을 개선하고 더 전문적이고 상세하게 다시 작성해주세요. 사용자가 입력한 핵심 내용은 유지하되, 표현을 더 매력적이고 임팩트 있게 만들어주세요.`
  } else {
    return `${context ? `Context: ${context}\n\n` : ''}Current content:\n${currentContent}\n\nPlease improve and rewrite the above content to be more professional and detailed. Keep the core information provided by the user, but make the expressions more attractive and impactful.`
  }
}

function getSystemPrompt(type: string, language: 'ko' | 'en', userContext: string = '', projectGuidelines: string = ''): string {
  const lang = language === 'ko' ? '한국어' : '영어'

  // Build context prefix if available
  let contextPrefix = ''
  if (userContext || projectGuidelines) {
    contextPrefix = '다음 정보를 참고하여 작성하세요:\n\n'
    if (userContext) {
      contextPrefix += `[사용자 정보]\n${userContext}\n\n`
    }
    if (projectGuidelines) {
      contextPrefix += `[작성 가이드라인]\n${projectGuidelines}\n\n`
    }
    contextPrefix += '---\n\n'
  }

  const prompts: Record<string, string> = {
    timeline: `${contextPrefix}당신은 QA 엔지니어의 경력 타임라인을 개선하는 전문가입니다.
사용자가 작성한 내용을 바탕으로 더 전문적이고 임팩트 있는 타임라인 항목을 ${lang}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "year": "년도",
  "role": "직책",
  "company": "회사명",
  "focus": "주요 업무 및 성과"
}

사용자가 입력한 핵심 정보는 유지하되, focus를 더 구체적이고 임팩트 있게 개선하세요.`,

    highlight: `${contextPrefix}당신은 QA 엔지니어의 핵심 강점을 더 매력적으로 표현하는 전문가입니다.
사용자가 작성한 내용을 바탕으로 더 임팩트 있는 강점 항목을 ${lang}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "title": "강점 제목",
  "description": "상세 설명",
  "impact": "구체적인 성과 지표"
}

사용자가 입력한 내용을 기반으로 하되, 더 구체적인 숫자와 퍼센트를 활용하여 임팩트를 명확히 하세요.`,

    metric: `${contextPrefix}당신은 QA 성과 지표를 더 인상적으로 표현하는 전문가입니다.
사용자가 작성한 내용을 바탕으로 더 매력적인 성과 지표를 ${lang}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "label": "지표명",
  "value": "수치 (예: 99.7%, 50+)",
  "description": "설명"
}

사용자가 입력한 정보를 유지하되, 표현을 더 전문적으로 개선하세요.`,

    skill: `${contextPrefix}당신은 기술 스택을 더 체계적으로 정리하는 전문가입니다.
사용자가 작성한 내용을 바탕으로 카테고리별 기술 스택을 ${lang}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "category": "카테고리명",
  "tools": ["도구1", "도구2", "도구3"]
}

사용자가 입력한 도구들을 유지하되, 더 체계적으로 정리하고 필요시 추가 관련 도구를 제안하세요.`,

    certification: `${contextPrefix}당신은 자격증 정보를 더 명확하게 작성하는 전문가입니다.
사용자가 작성한 내용을 바탕으로 자격증 항목을 ${lang}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "name": "자격증명",
  "issuer": "발급기관",
  "year": "취득년도"
}

사용자가 입력한 정보를 유지하되, 공식 명칭과 정확한 발급기관명을 사용하세요.`,

    project: `${contextPrefix}당신은 QA 프로젝트 문서를 더 전문적으로 작성하는 전문가입니다.
사용자가 작성한 내용을 바탕으로 더 상세하고 임팩트 있는 프로젝트 설명을 ${lang}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "title": "프로젝트명",
  "overview": "프로젝트 개요 (2-3줄)",
  "background": "프로젝트 배경 및 상세 설명 (4-5줄)",
  "achievements": "주요 성과 및 결과물 (구체적인 숫자와 지표 포함)",
  "tech_stack": ["기술1", "기술2", "기술3"],
  "type": "프로젝트 유형",
  "period": "기간 (예: 2024.01 - 2024.06)"
}

사용자가 입력한 핵심 내용은 유지하되, 표현을 더 전문적으로 개선하고 구체적이며 측정 가능한 성과를 추가하세요.`,

    blog: `${contextPrefix}당신은 QA 엔지니어의 기술 블로그 글을 더 매력적으로 작성하는 전문가입니다.
사용자가 작성한 내용을 바탕으로 더 읽기 쉽고 전문적인 블로그 글을 ${lang}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "title": "글 제목",
  "content": "본문 내용 (개선된 버전)",
  "tags": "태그1, 태그2, 태그3"
}

사용자가 입력한 핵심 메시지와 경험은 유지하되, 다음을 개선하세요:
- 더 매력적이고 명확한 제목
- 읽기 쉬운 문단 구성
- 구체적인 예시와 숫자 추가
- 핵심 교훈을 명확하게 정리
- 관련성 높은 태그 제안`,

    about: `${contextPrefix}당신은 QA 엔지니어의 자기소개 Q&A를 더 매력적으로 작성하는 전문가입니다.
사용자가 작성한 질문과 답변을 바탕으로 더 전문적이고 인상적인 내용을 ${lang}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "question": "개선된 질문",
  "answer": "개선된 답변"
}

사용자가 입력한 핵심 내용과 경험은 유지하되, 다음을 개선하세요:
- 질문을 더 명확하고 매력적으로
- 답변에 구체적인 경험과 숫자 추가
- 전문성과 열정이 느껴지도록 표현
- 간결하면서도 임팩트 있게 작성`
  }

  return prompts[type] || prompts.project
}
