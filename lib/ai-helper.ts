import { getGPTApiKey } from "./settings-store"

export interface AIGenerateOptions {
  type: 'timeline' | 'highlight' | 'metric' | 'skill' | 'certification' | 'project'
  context?: string
  language?: 'ko' | 'en'
}

/**
 * GPT API를 사용하여 콘텐츠 자동 생성
 */
export async function generateContent(
  prompt: string,
  options: AIGenerateOptions
): Promise<Record<string, any> | null> {
  const apiKey = await getGPTApiKey()

  if (!apiKey) {
    throw new Error("GPT API 키가 설정되지 않았습니다. 관리자 설정에서 API 키를 입력하세요.")
  }

  const systemPrompt = getSystemPrompt(options.type, options.language || 'ko')
  const userPrompt = `${options.context ? `배경: ${options.context}\n\n` : ''}${prompt}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
      throw new Error(error.error?.message || 'GPT API 호출 실패')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('GPT 응답이 비어있습니다.')
    }

    // JSON 응답 파싱
    try {
      return JSON.parse(content)
    } catch {
      // JSON이 아닌 경우 텍스트로 반환
      return { text: content }
    }
  } catch (error) {
    console.error('AI 생성 오류:', error)
    throw error
  }
}

/**
 * 타입별 시스템 프롬프트 생성
 */
function getSystemPrompt(type: string, language: 'ko' | 'en'): string {
  const lang = language === 'ko' ? '한국어' : '영어'

  const prompts: Record<string, string> = {
    timeline: `당신은 QA 엔지니어의 경력 타임라인을 작성하는 전문가입니다.
사용자가 제공하는 간단한 정보를 바탕으로 상세하고 전문적인 타임라인 항목을 ${lang}로 생성하세요.

다음 JSON 형식으로 응답하세요:
{
  "year": "년도",
  "role": "직책",
  "company": "회사명",
  "focus": "주요 업무 및 성과"
}

focus는 구체적이고 임팩트 있게 작성하세요.`,

    highlight: `당신은 QA 엔지니어의 핵심 강점을 강조하는 전문가입니다.
사용자가 제공하는 정보를 바탕으로 매력적이고 임팩트 있는 강점 항목을 ${lang}로 생성하세요.

다음 JSON 형식으로 응답하세요:
{
  "title": "강점 제목",
  "description": "상세 설명",
  "impact": "구체적인 성과 지표"
}

숫자와 퍼센트를 사용하여 임팩트를 명확히 하세요.`,

    metric: `당신은 QA 성과 지표를 작성하는 전문가입니다.
사용자가 제공하는 정보를 바탕으로 인상적인 성과 지표를 ${lang}로 생성하세요.

다음 JSON 형식으로 응답하세요:
{
  "label": "지표명",
  "value": "수치 (예: 99.7%, 50+)",
  "description": "설명"
}`,

    skill: `당신은 기술 스택을 정리하는 전문가입니다.
사용자가 제공하는 정보를 바탕으로 카테고리별 기술 스택을 ${lang}로 생성하세요.

다음 JSON 형식으로 응답하세요:
{
  "category": "카테고리명",
  "tools": ["도구1", "도구2", "도구3"]
}`,

    certification: `당신은 자격증 정보를 작성하는 전문가입니다.
사용자가 제공하는 정보를 바탕으로 자격증 항목을 ${lang}로 생성하세요.

다음 JSON 형식으로 응답하세요:
{
  "name": "자격증명",
  "issuer": "발급기관",
  "year": "취득년도"
}`,

    project: `당신은 QA 프로젝트를 문서화하는 전문가입니다.
사용자가 제공하는 간단한 정보를 바탕으로 상세하고 전문적인 프로젝트 설명을 ${lang}로 생성하세요.

다음 JSON 형식으로 응답하세요:
{
  "title": "프로젝트명",
  "overview": "프로젝트 개요 (2-3줄)",
  "background": "프로젝트 배경 및 상세 설명 (4-5줄)",
  "tech_stack": ["기술1", "기술2", "기술3"],
  "type": "프로젝트 유형",
  "period": "기간 (예: 2024.01 - 2024.06)"
}

구체적이고 측정 가능한 성과를 포함하세요.`
  }

  return prompts[type] || prompts.project
}

/**
 * 콘텐츠 보강 (기존 내용을 더 풍부하게)
 */
export async function enhanceContent(
  content: string,
  type: string
): Promise<string> {
  const apiKey = await getGPTApiKey()

  if (!apiKey) {
    throw new Error("GPT API 키가 설정되지 않았습니다.")
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '당신은 QA 엔지니어의 포트폴리오 콘텐츠를 개선하는 전문가입니다. 주어진 내용을 더 전문적이고 임팩트 있게 작성하세요.'
          },
          {
            role: 'user',
            content: `다음 ${type} 내용을 더 상세하고 전문적으로 개선해주세요:\n\n${content}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error('GPT API 호출 실패')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || content
  } catch (error) {
    console.error('AI 보강 오류:', error)
    return content // 실패 시 원본 반환
  }
}
