# 포트폴리오 개발 블로그 포스트 모음

## 📝 목차

1. [Supabase Storage로 PDF 파일 관리 시스템 구축하기](#1-supabase-storage로-pdf-파일-관리-시스템-구축하기)
2. [GPT-4 API를 활용한 개인화된 AI 콘텐츠 생성기](#2-gpt-4-api를-활용한-개인화된-ai-콘텐츠-생성기)
3. [다국어 웹사이트의 자동 번역 동기화 구현](#3-다국어-웹사이트의-자동-번역-동기화-구현)
4. [Next.js에서 Optional Dependency로 빌드 오류 해결하기](#4-nextjs에서-optional-dependency로-빌드-오류-해결하기)
5. [Zustand로 다국어 상태 관리 패턴 구축](#5-zustand로-다국어-상태-관리-패턴-구축)
6. [Supabase JSONB를 활용한 유연한 설정 시스템](#6-supabase-jsonb를-활용한-유연한-설정-시스템)
7. [프롬프트 엔지니어링: AI에게 컨텍스트 주입하기](#7-프롬프트-엔지니어링-ai에게-컨텍스트-주입하기)
8. [대량 데이터 번역 마이그레이션 시스템 구축](#8-대량-데이터-번역-마이그레이션-시스템-구축)
9. [웹사이트 PDF 생성: 브라우저 인쇄 API 활용하기](#9-웹사이트-pdf-생성-브라우저-인쇄-api-활용하기)
10. [사용자 피드백 기반 애자일 개발 프로세스](#10-사용자-피드백-기반-애자일-개발-프로세스)
11. [TypeScript로 타입 안전한 설정 시스템 만들기](#11-typescript로-타입-안전한-설정-시스템-만들기)
12. [Vercel 배포 시 웹팩 모듈 에러 트러블슈팅](#12-vercel-배포-시-웹팩-모듈-에러-트러블슈팅)

---

## 1. Supabase Storage로 PDF 파일 관리 시스템 구축하기

**태그**: Supabase, File Upload, Next.js, QA

### 문제 상황

포트폴리오 웹사이트를 만들면서 면접관에게 제공할 PDF를 동적으로 생성하고 있었습니다. 하지만 다음과 같은 문제가 있었습니다:

- 매번 생성 시간이 걸림 (1-2초)
- 생성된 PDF를 사전에 검토할 수 없음
- 버전 관리가 불가능

### 해결 아이디어

**"미리 만든 PDF를 업로드하고 관리하면 어떨까?"**

### 구현 과정

#### 1. Supabase Storage Bucket 생성

Supabase 대시보드에서:
- Storage 메뉴 → New Bucket
- Bucket 이름: `portfolios`
- Public bucket으로 설정

#### 2. 파일 업로드 API 작성

```typescript
// app/api/upload-portfolio-pdf/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  // 파일 검증
  if (!file || file.type !== 'application/pdf') {
    return NextResponse.json(
      { error: "Only PDF files allowed" },
      { status: 400 }
    )
  }

  // 파일 크기 제한 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File size exceeds 10MB" },
      { status: 400 }
    )
  }

  const supabase = createClient()

  // 파일명에 타임스탬프 추가로 버전 관리
  const fileName = `portfolio-${USER_ID}-${Date.now()}.pdf`

  // Supabase Storage에 업로드
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('portfolios')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed: " + uploadError.message },
      { status: 500 }
    )
  }

  // Public URL 생성
  const { data: { publicUrl } } = supabase.storage
    .from('portfolios')
    .getPublicUrl(fileName)

  return NextResponse.json({
    success: true,
    url: publicUrl,
    fileName: fileName
  })
}
```

#### 3. 프론트엔드에서 파일 업로드

```typescript
const handlePortfolioPDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file || file.type !== 'application/pdf') {
    alert("PDF 파일만 업로드 가능합니다")
    return
  }

  setUploadingPortfolioPDF(true)
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-portfolio-pdf', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (data.success) {
      // URL을 settings에 저장
      setSettings({ ...settings, portfolio_pdf_url: data.url })
      alert("업로드 완료!")
    }
  } catch (error) {
    alert("업로드 실패")
  } finally {
    setUploadingPortfolioPDF(false)
  }
}
```

#### 4. 다운로드 시 업로드된 PDF 우선 사용

```typescript
const handlePDFDownload = async () => {
  // Supabase에서 설정 조회
  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("settings")
    .single()

  const portfolioPdfUrl = settingsData?.settings?.portfolio_pdf_url

  if (portfolioPdfUrl) {
    // 업로드된 PDF가 있으면 바로 다운로드
    window.open(portfolioPdfUrl, '_blank')
  } else {
    // 없으면 "준비중" 메시지
    alert("포트폴리오 PDF 준비중입니다.")
  }
}
```

### 배운 점

#### Supabase Storage의 장점
1. **간편한 Public URL**: `getPublicUrl()`로 즉시 접근 가능한 URL 생성
2. **upsert 옵션**: 같은 파일명이면 덮어쓰기 가능
3. **버전 관리**: 파일명에 타임스탬프를 넣어 이전 버전 보관 가능

#### 파일 업로드 베스트 프랙티스
- **항상 검증**: 파일 타입, 크기 확인 필수
- **명확한 파일명**: `user-timestamp.ext` 형식으로 충돌 방지
- **에러 핸들링**: 업로드 실패 시 명확한 메시지 제공

### QA 관점에서의 개선점

이 기능을 QA 테스트한다면:

**테스트 케이스**:
1. ✅ 정상 PDF 업로드 (1MB)
2. ✅ 크기 초과 PDF 업로드 (15MB)
3. ✅ 비 PDF 파일 업로드 (.jpg)
4. ✅ 빈 파일 업로드
5. ✅ 네트워크 끊김 시나리오
6. ✅ 동시 업로드 시도

**개선 제안**:
- 업로드 진행률 표시 (현재 없음)
- 이전 파일 자동 삭제 옵션
- 파일 미리보기 기능

### 마무리

Supabase Storage를 활용하면 복잡한 파일 서버 구축 없이도 간편하게 파일 관리 시스템을 만들 수 있습니다. 특히 Public URL 기능은 CDN처럼 사용할 수 있어 매우 편리합니다.

**다음 글 예고**: GPT-4 API를 활용한 개인화된 AI 콘텐츠 생성기

---

## 2. GPT-4 API를 활용한 개인화된 AI 콘텐츠 생성기

**태그**: OpenAI, GPT-4, AI, Prompt Engineering

### 문제 인식

AI로 포트폴리오 콘텐츠를 자동 생성하면 편할 것 같았지만, 초기 결과는 실망스러웠습니다:

```
"5년 경력의 QA 엔지니어로서 다양한 프로젝트를 수행했습니다..."
```

**너무 일반적이고, 개성이 없었습니다.**

### 돌파구: 컨텍스트 주입

사람도 맥락을 알아야 좋은 글을 쓰듯이, AI도 **배경 정보**가 필요하다는 걸 깨달았습니다.

### 구현: AI 컨텍스트 시스템

#### 1. 사용자 설정에 컨텍스트 필드 추가

```typescript
export interface UserSettings {
  gpt_api_key: string
  ai_model: string
  ai_enabled: boolean
  // 새로 추가
  user_context?: string           // 사용자 배경 정보
  project_guidelines?: string     // 작성 가이드라인
}
```

#### 2. 관리자 설정 UI

```typescript
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-2">
      📋 사용자 상세 정보
    </label>
    <textarea
      value={settings.user_context || ''}
      onChange={(e) => setSettings({
        ...settings,
        user_context: e.target.value
      })}
      placeholder="예: 5년차 QA 엔지니어, 테스트 자동화 전문, 15+ 프로젝트 경험, Selenium/Cypress 활용..."
      className="w-full h-32 p-3 border rounded-lg"
    />
  </div>

  <div>
    <label className="block text-sm font-medium mb-2">
      📝 프로젝트 작성 가이드라인
    </label>
    <textarea
      value={settings.project_guidelines || ''}
      onChange={(e) => setSettings({
        ...settings,
        project_guidelines: e.target.value
      })}
      placeholder="예: STAR 기법 사용, 구체적인 숫자 포함, 기술 스택은 카테고리별로..."
      className="w-full h-32 p-3 border rounded-lg"
    />
  </div>
</div>
```

#### 3. 프롬프트에 컨텍스트 주입

```typescript
function getSystemPrompt(
  type: string,
  language: 'ko' | 'en',
  userContext: string = '',
  projectGuidelines: string = ''
): string {
  // 컨텍스트 프리픽스 생성
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
    project: `${contextPrefix}당신은 QA 프로젝트 문서를 더 전문적으로 작성하는 전문가입니다.

사용자가 작성한 내용을 바탕으로 더 상세하고 임팩트 있는 프로젝트 설명을 ${language === 'ko' ? '한국어' : '영어'}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "title": "프로젝트명",
  "overview": "프로젝트 개요 (2-3줄)",
  "background": "프로젝트 배경 및 상세 설명 (4-5줄)",
  "achievements": "주요 성과 및 결과물 (구체적인 숫자와 지표 포함)",
  "tech_stack": ["기술1", "기술2", "기술3"]
}

사용자가 입력한 핵심 내용은 유지하되, 표현을 더 전문적으로 개선하고 구체적이며 측정 가능한 성과를 추가하세요.`,
    // ... 다른 타입들도 동일하게 contextPrefix 추가
  }

  return prompts[type] || prompts.project
}
```

#### 4. API 호출 시 컨텍스트 포함

```typescript
export async function POST(request: Request) {
  const { prompt, type, context, language, formData } = await request.json()

  // Supabase에서 설정 조회
  const supabase = createClient()
  const { data: settingsData } = await supabase
    .from("user_settings")
    .select("settings")
    .single()

  const userContext = settingsData?.settings?.user_context || ''
  const projectGuidelines = settingsData?.settings?.project_guidelines || ''

  // 컨텍스트가 주입된 시스템 프롬프트 생성
  const systemPrompt = getSystemPrompt(
    type,
    language,
    userContext,
    projectGuidelines
  )

  // GPT-4 API 호출
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

  // ...
}
```

### Before vs After

#### Before (컨텍스트 없음)
```
프로젝트: 전자상거래 테스트
설명: 전자상거래 플랫폼의 품질을 보장하기 위해 테스트를 수행했습니다.
```

#### After (컨텍스트 주입)
```
프로젝트: 글로벌 전자상거래 플랫폼 QA 자동화
설명: 일 평균 10만 건의 주문을 처리하는 전자상거래 플랫폼의 품질 보장을 위해
Selenium 기반 E2E 테스트 자동화 시스템을 구축했습니다.

주요 성과:
- 테스트 커버리지 45% → 87% 향상 (42%p 증가)
- 수동 테스트 시간 80% 단축 (주 40시간 → 8시간)
- 프로덕션 버그 발견율 65% 증가
- CI/CD 파이프라인 통합으로 배포 시간 50% 단축

기술 스택: Selenium WebDriver, Python, Jenkins, Docker
```

### 배운 점

#### 프롬프트 엔지니어링 원칙

1. **컨텍스트가 핵심**
   - AI는 맥락을 모름
   - 배경 정보를 명확히 제공

2. **구조화된 응답 요청**
   - JSON 형식 지정
   - 필드별 상세 설명

3. **예시 포함**
   - "구체적인 숫자 포함"
   - "STAR 기법 사용"

4. **Temperature 조절**
   - 0.3: 일관성 중요 (번역)
   - 0.7: 창의성 필요 (콘텐츠 생성)

#### 비용 최적화

```typescript
// System prompt는 길어도 OK (한번만 전송)
// User prompt는 짧게 유지
messages: [
  {
    role: 'system',
    content: `${contextPrefix}당신은... (500 토큰)`
  },
  {
    role: 'user',
    content: `다음 내용을 개선: ${userInput}` // (50 토큰)
  }
]
```

### QA 테스트 케이스

1. **컨텍스트 없을 때**: 일반적인 결과 생성
2. **컨텍스트 있을 때**: 개인화된 결과 생성
3. **긴 컨텍스트 (5000자)**: 토큰 제한 확인
4. **특수문자 포함**: 프롬프트 인젝션 방지
5. **API 키 없을 때**: 명확한 에러 메시지

### 마무리

AI의 진정한 힘은 **컨텍스트**에서 나옵니다. 단순히 "글을 써줘"가 아니라 "이런 배경을 가진 사람이 이런 스타일로 글을 쓴다면?"이라는 맥락을 주면, 놀라울 정도로 개인화된 결과를 얻을 수 있습니다.

**다음 글 예고**: 다국어 웹사이트의 자동 번역 동기화 구현

---

## 3. 다국어 웹사이트의 자동 번역 동기화 구현

**태그**: i18n, Translation, Next.js, Zustand

### 문제 발생

사용자 피드백:
> "번역이 이상해. 지금 AI로 개선한 내용들이 많은데 이전 내용으로 번역되네"

### 문제 분석

1. **한국어 콘텐츠 AI 개선** → 한국어 DB에만 저장
2. **영어로 언어 전환** → 영어 DB 조회 (비어있음!)
3. **번역 캐시에서 이전 버전 로드** → 오래된 내용 표시

```
[한국어 DB]
project.title = "글로벌 전자상거래 플랫폼 QA 자동화" (최신)

[영어 DB]
project.title = (없음)

[번역 캐시]
project.title = "E-commerce Testing" (6개월 전 버전)
```

### 해결 전략: 양방향 자동 동기화

**"한 쪽을 수정하면 다른 쪽도 자동 번역해서 저장하자!"**

### 구현

#### 1. 기존 AI 개선 함수 (문제)

```typescript
const handleAIImprove = async (field: string, value: string) => {
  // AI로 개선
  const improved = await callAI(value, language)

  // 현재 언어만 저장
  save(field)(improved)  // ❌ 문제: 한쪽만 저장
}
```

#### 2. 개선된 AI 개선 함수 (해결)

```typescript
const handleAIImprove = async (field: string, value: string) => {
  try {
    // 1. 현재 언어로 AI 개선
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Improve this content for a QA portfolio`,
        type: 'project',
        language,  // 현재 언어 (ko 또는 en)
        formData: { content: value }
      }),
    })

    const data = await response.json()
    const improvedContent = data.content || data.text

    if (improvedContent) {
      // 2. 현재 언어 저장
      save(field)(improvedContent)

      // 3. 반대 언어로 번역
      const targetLang = language === 'ko' ? 'en' : 'ko'
      const translateResponse = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Translate to ${targetLang === 'ko' ? 'Korean' : 'English'}`,
          type: 'project',
          language: targetLang,
          formData: { content: improvedContent }
        }),
      })

      if (translateResponse.ok) {
        const translateData = await translateResponse.json()
        const translatedContent = translateData.content || translateData.text

        if (translatedContent) {
          // 4. 반대 언어도 저장 (크로스 언어 업데이트)
          setOverrideSync(`project.${targetLang}.${field}`, translatedContent)
        }
      }
    }

    alert(language === "ko" ? "AI 개선 완료!" : "AI improvement complete!")
  } catch (error) {
    console.error("AI improvement error:", error)
    alert(language === "ko" ? "AI 개선 실패" : "AI improvement failed")
  }
}
```

#### 3. 크로스 언어 Store 업데이트 헬퍼

```typescript
// Zustand store에 다른 언어 데이터를 직접 업데이트하는 헬퍼 함수
const setOverrideSync = (key: string, value: string) => {
  const store = usePortfolioContentStore.getState()
  store.set(key, value)

  // Supabase에도 저장
  const [section, lang, field] = key.split('.')
  supabase
    .from('portfolio_content')
    .upsert({
      user_id: USER_ID,
      language: lang,
      content_key: `${section}.${field}`,
      content_value: value,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,language,content_key'
    })
}
```

### 데이터 흐름

```
사용자: "프로젝트 제목 AI 개선" (한국어 모드)
    ↓
1. GPT-4: "글로벌 전자상거래 플랫폼 QA 자동화" (한국어)
    ↓
2. 한국어 DB 저장
    ↓
3. GPT-4: "Global E-commerce Platform QA Automation" (영어 번역)
    ↓
4. 영어 DB 저장
    ↓
✅ 결과: 양쪽 언어 모두 최신 상태 유지
```

### Before vs After

#### Before (단방향 저장)
```
[상황 1: 한국어 모드에서 AI 개선]
한국어 DB: "글로벌 전자상거래 플랫폼 QA 자동화" ✅
영어 DB: (없음) ❌

[상황 2: 영어 모드로 전환]
화면 표시: "E-commerce Testing" (캐시에서 로드) ❌
```

#### After (양방향 동기화)
```
[상황 1: 한국어 모드에서 AI 개선]
한국어 DB: "글로벌 전자상거래 플랫폼 QA 자동화" ✅
영어 DB: "Global E-commerce Platform QA Automation" ✅

[상황 2: 영어 모드로 전환]
화면 표시: "Global E-commerce Platform QA Automation" ✅
```

### 적용 범위

이 패턴을 다음 페이지에 모두 적용:

1. **Experience 페이지**
   - Timeline 항목
   - Highlight 항목
   - Metric 항목
   - Skill 항목
   - Certification 항목

2. **About 페이지**
   - Q&A 질문/답변
   - Vision 콘텐츠
   - Vision 인용구

3. **Projects 페이지**
   - 프로젝트 제목
   - 개요
   - 배경
   - 성과

### 번역 품질 관리

```typescript
// 번역 API 호출 시 옵션 설정
const systemPrompt = `You are a professional translator.
Translate Korean to English maintaining:
- Technical terminology accuracy
- Professional tone
- Original meaning and context
Return ONLY the translation, no explanations.`

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: koreanText }
    ],
    temperature: 0.3,  // 낮은 temperature로 일관성 유지
    max_tokens: 1000
  })
})
```

### 성능 최적화 고려사항

#### API 호출 최소화
```typescript
// ❌ 나쁜 예: 필드마다 개별 호출
await translateField('title')
await translateField('overview')
await translateField('background')
// → 3번 API 호출

// ✅ 좋은 예: 배치 번역
await translateBatch(['title', 'overview', 'background'])
// → 1번 API 호출
```

#### 디바운싱
```typescript
// 사용자가 타이핑 중일 때는 번역하지 않음
const debouncedTranslate = debounce(async (value) => {
  await translateAndSync(value)
}, 2000)  // 2초 대기 후 번역
```

### QA 테스트 시나리오

1. **기본 동기화 테스트**
   - 한국어로 AI 개선 → 영어 DB 확인
   - 영어로 AI 개선 → 한국어 DB 확인

2. **동시성 테스트**
   - 빠르게 연속으로 AI 개선 버튼 클릭
   - 마지막 결과만 저장되는지 확인

3. **네트워크 오류 테스트**
   - 번역 API 실패 시 원본 언어는 저장되는지
   - 명확한 에러 메시지 표시

4. **데이터 무결성 테스트**
   - 특수문자 포함 텍스트
   - 매우 긴 텍스트 (5000자+)
   - HTML/마크다운 포함 텍스트

### 배운 점

#### 1. 캐시의 양날의 검
- 캐시는 성능을 높이지만, 동기화 문제 유발
- 데이터 완전성 > 캐시 성능

#### 2. 사용자 피드백의 가치
- "번역이 이상해"라는 한 마디가 핵심 문제 발견
- 즉각적인 대응으로 신뢰 구축

#### 3. 상태 관리의 복잡성
- 언어별 store 분리는 편하지만 동기화 필요
- Cross-store 업데이트 헬퍼 함수 필수

### 마무리

다국어 웹사이트에서 가장 중요한 것은 **모든 언어 버전의 데이터 일관성**입니다. AI를 활용하면 번역 동기화를 자동화할 수 있고, 사용자는 어떤 언어로 전환하든 최신 콘텐츠를 볼 수 있습니다.

**다음 글 예고**: Next.js에서 Optional Dependency로 빌드 오류 해결하기

---

## 4. Next.js에서 Optional Dependency로 빌드 오류 해결하기

**태그**: Next.js, Webpack, Vercel, Debugging

### 발생한 문제

Vercel 배포 시 빌드 에러:

```
Failed to compile.
./app/api/extract-pdf/route.ts
Module not found: Can't resolve 'pdf-parse'
> Build failed because of webpack errors
```

로컬에서는 정상 작동하는데 Vercel에서만 실패!

### 문제 분석

#### 1차 시도: Dynamic Import

```typescript
// ❌ 실패: 여전히 webpack이 모듈을 찾으려고 함
try {
  const pdfParse = (await import('pdf-parse')).default
} catch (error) {
  // pdf-parse 없으면 에러
}
```

**왜 실패했나?**
- Dynamic import도 webpack이 빌드 타임에 번들에 포함하려고 시도
- 모듈이 없으면 빌드 실패

#### 2차 시도: Optional Dependencies

```json
// package.json
{
  "optionalDependencies": {
    "pdf-parse": "^1.1.1"
  }
}
```

**여전히 실패!**
- optionalDependencies는 설치 실패를 허용할 뿐
- webpack은 여전히 import 구문을 보고 번들에 포함하려고 함

### 최종 해결책: 기능 완전 비활성화

PDF 텍스트 추출 기능은 **부가 기능**이므로:
1. import 구문 완전 제거
2. API 호출 시 즉시 "기능 비활성화" 응답
3. 원본 코드는 주석으로 보관

```typescript
// app/api/extract-pdf/route.ts
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
        error: "PDF parsing failed"
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
```

### Webpack과 Dynamic Import의 관계

#### Webpack의 동작 방식

```typescript
// 1. Static import - 무조건 번들에 포함
import pdfParse from 'pdf-parse'

// 2. Dynamic import - 코드 스플리팅, 하지만 여전히 번들에 포함 시도
const pdfParse = await import('pdf-parse')

// 3. Conditional import - 런타임에 결정되어도 빌드 타임에 확인
if (condition) {
  const pdfParse = await import('pdf-parse')  // 여전히 빌드 시 체크
}
```

#### 왜 이렇게 동작하나?

Webpack은 **정적 분석**을 수행합니다:
- 모든 import 구문을 찾음
- 의존성 그래프 생성
- 해당 모듈이 없으면 빌드 실패

### Graceful Degradation 패턴

#### 핵심 원칙
> "부가 기능은 없어도 전체 시스템이 작동해야 한다"

#### 구현 전략

1. **Feature Flag**
```typescript
const FEATURES = {
  PDF_EXTRACTION: false,  // 기능 off
  AI_IMPROVEMENT: true,   // 기능 on
}

if (FEATURES.PDF_EXTRACTION) {
  // PDF 추출 로직
} else {
  // 대안 제공
}
```

2. **Try-Catch with Fallback**
```typescript
try {
  const result = await optionalFeature()
  return result
} catch (error) {
  console.warn('Optional feature failed, using fallback')
  return fallbackMethod()
}
```

3. **Clear Error Messages**
```typescript
return NextResponse.json({
  error: "Feature not available",
  fallback: "사용자 친화적인 대안 설명",
  action: "사용자가 할 수 있는 행동"
}, { status: 501 })  // 501 Not Implemented
```

### Vercel vs 로컬 환경 차이

| 항목 | 로컬 | Vercel |
|------|------|--------|
| node_modules | 전체 설치 | 필요한 것만 설치 |
| 빌드 캐시 | .next 폴더 | 매번 새로 빌드 |
| 환경 변수 | .env.local | Vercel 대시보드 |
| 의존성 검증 | 느슨함 | 엄격함 |

**교훈**: 로컬에서 작동한다고 Vercel에서 작동하는 것은 아니다!

### 대안: 환경별 빌드

```javascript
// next.config.js
module.exports = {
  webpack: (config, { isServer }) => {
    // 서버 사이드에서만 pdf-parse 사용
    if (isServer) {
      config.externals.push('pdf-parse')
    }
    return config
  },
}
```

하지만 이것도 모듈이 없으면 빌드 실패!

### QA 관점의 배포 프로세스

#### Pre-deployment Checklist
```
□ 로컬 빌드 성공 (npm run build)
□ 로컬에서 프로덕션 모드 테스트 (npm start)
□ 모든 환경 변수 Vercel에 설정
□ 의존성 버전 확인 (package-lock.json)
□ Optional features graceful degradation 확인
```

#### Deployment Stages
```
1. Preview Deployment (PR)
   → 자동 테스트
   → 수동 검증

2. Production Deployment (main)
   → 스모크 테스트
   → 롤백 계획 준비
```

### 배운 교훈

#### 1. Webpack의 정적 분석 이해
- Dynamic import ≠ Runtime 결정
- 빌드 타임에 모든 의존성 확인

#### 2. Optional Feature 설계
- 핵심 기능 vs 부가 기능 구분
- 부가 기능은 실패해도 OK

#### 3. 명확한 에러 메시지
```typescript
// ❌ 나쁜 예
{ error: "Failed" }

// ✅ 좋은 예
{
  error: "PDF text extraction is currently disabled",
  reason: "pdf-parse library not installed",
  fallback: "Please enter text manually",
  action: "Copy and paste text from your PDF"
}
```

#### 4. 환경 차이 인식
- 로컬 ≠ 프로덕션
- 항상 프로덕션 빌드 테스트

### 마무리

빌드 오류는 좌절스럽지만, **Graceful Degradation** 패턴을 활용하면 부가 기능의 실패가 전체 시스템을 망가뜨리지 않도록 할 수 있습니다.

**다음 글 예고**: Zustand로 다국어 상태 관리 패턴 구축

---

## 5. Zustand로 다국어 상태 관리 패턴 구축

**태그**: Zustand, State Management, i18n, React

### 상태 관리 라이브러리 선택

#### 고려한 옵션들

1. **Redux**: 너무 복잡함 (보일러플레이트 과다)
2. **Context API**: 리렌더링 이슈
3. **Zustand**: 간단하고 효율적 ✅

### Zustand 선택 이유

```typescript
// Redux라면...
const mapStateToProps = (state) => ({ ... })
const mapDispatchToProps = (dispatch) => ({ ... })
connect(mapStateToProps, mapDispatchToProps)(Component)
// 😰 너무 복잡

// Zustand라면...
const name = usePortfolioContentStore(state => state['about.ko.name'])
const setName = usePortfolioContentStore(state => state.set)
// 😊 심플!
```

### 다국어 Store 설계

#### 핵심 아이디어: 언어를 키에 포함

```typescript
// ❌ 나쁜 설계: 언어별 store 분리
const useKoreanStore = create(...)
const useEnglishStore = create(...)
// 문제: 동기화 어려움, 코드 중복

// ✅ 좋은 설계: 하나의 store에 언어 포함
const usePortfolioContentStore = create((set, get) => ({
  'about.ko.name': '고아현',
  'about.en.name': 'Sophia Ko',
  'about.ko.position': '시니어 QA 엔지니어',
  'about.en.position': 'Senior QA Engineer',

  set: (key: string, value: any) => {
    set({ [key]: value })
    // Supabase 자동 저장
    saveToSupabase(key, value)
  },
}))
```

### 키 네이밍 컨벤션

```
{section}.{language}.{field}

예시:
- about.ko.name           → About 페이지, 한국어, 이름
- experience.en.overview  → Experience 페이지, 영어, 개요
- project.ko.title        → Project, 한국어, 제목
```

**장점**:
- 일관된 구조
- 언어 전환 쉬움 (ko ↔ en)
- 섹션별 필터링 용이

### Supabase와 자동 동기화

```typescript
const usePortfolioContentStore = create((set, get) => ({
  // ... 상태

  set: (key: string, value: any) => {
    // 1. 로컬 상태 업데이트
    set({ [key]: value })

    // 2. Supabase에 자동 저장
    const [section, language, field] = key.split('.')
    const supabase = createClient()

    supabase
      .from('portfolio_content')
      .upsert({
        user_id: USER_ID,
        language: language,
        content_key: `${section}.${field}`,
        content_value: value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,language,content_key'
      })
      .then(({ error }) => {
        if (error) console.error('Save error:', error)
      })
  },

  // 3. 초기 데이터 로드
  load: async (language: 'ko' | 'en') => {
    const supabase = createClient()
    const { data } = await supabase
      .from('portfolio_content')
      .select('*')
      .eq('user_id', USER_ID)
      .eq('language', language)

    const newState: Record<string, any> = {}
    data?.forEach(item => {
      const key = `${item.content_key.split('.')[0]}.${language}.${item.content_key.split('.')[1]}`
      newState[key] = item.content_value
    })

    set(newState)
  }
}))
```

### 컴포넌트에서 사용

#### 1. 데이터 읽기

```typescript
function AboutPage() {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')

  // 언어별로 다른 키 사용
  const name = usePortfolioContentStore(state =>
    state[`about.${language}.name`]
  )
  const position = usePortfolioContentStore(state =>
    state[`about.${language}.position`]
  )

  return (
    <div>
      <h1>{name}</h1>
      <p>{position}</p>
    </div>
  )
}
```

#### 2. 데이터 쓰기

```typescript
function EditableField({ field }: { field: string }) {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')
  const set = usePortfolioContentStore(state => state.set)

  const key = `about.${language}.${field}`
  const value = usePortfolioContentStore(state => state[key])

  return (
    <input
      value={value || ''}
      onChange={(e) => set(key, e.target.value)}
      // onChange 즉시 Supabase 저장!
    />
  )
}
```

#### 3. 언어 전환

```typescript
function LanguageToggle() {
  const [language, setLanguage] = useState<'ko' | 'en'>('ko')
  const load = usePortfolioContentStore(state => state.load)

  const handleLanguageChange = async (newLang: 'ko' | 'en') => {
    setLanguage(newLang)
    await load(newLang)  // 새 언어 데이터 로드
  }

  return (
    <button onClick={() =>
      handleLanguageChange(language === 'ko' ? 'en' : 'ko')
    }>
      {language === 'ko' ? 'EN' : '한국어'}
    </button>
  )
}
```

### 크로스 언어 업데이트

AI 개선 후 양방향 동기화:

```typescript
// 현재 언어가 'ko'일 때
const language = 'ko'
const targetLang = language === 'ko' ? 'en' : 'ko'  // 'en'

// 한국어 저장
set(`about.ko.name`, "고아현")

// 영어도 저장
set(`about.en.name`, "Sophia Ko")
```

**문제**: 다른 컴포넌트가 영어 데이터를 구독하고 있지 않으면?

**해결**: `setOverrideSync` 헬퍼

```typescript
const setOverrideSync = (key: string, value: string) => {
  const store = usePortfolioContentStore.getState()
  store.set(key, value)  // store 직접 업데이트
}

// 사용
setOverrideSync(`about.en.name`, "Sophia Ko")
// 현재 한국어 모드여도 영어 데이터 업데이트
```

### 성능 최적화

#### 1. Selector 최적화

```typescript
// ❌ 나쁜 예: 전체 상태 구독
const store = usePortfolioContentStore()
const name = store[`about.${language}.name`]
// 문제: 다른 필드 변경해도 리렌더링

// ✅ 좋은 예: 특정 필드만 구독
const name = usePortfolioContentStore(state =>
  state[`about.${language}.name`]
)
// 해당 필드 변경될 때만 리렌더링
```

#### 2. 디바운싱

```typescript
import { debounce } from 'lodash'

const debouncedSet = debounce((key, value) => {
  set(key, value)  // Supabase 저장
}, 1000)  // 1초 대기

<input
  onChange={(e) => debouncedSet(key, e.target.value)}
/>
// 타이핑 중에는 저장 안함, 1초 후 저장
```

#### 3. Shallow Compare

```typescript
import { shallow } from 'zustand/shallow'

const { nameKo, nameEn } = usePortfolioContentStore(
  state => ({
    nameKo: state['about.ko.name'],
    nameEn: state['about.en.name']
  }),
  shallow  // 얕은 비교로 불필요한 리렌더링 방지
)
```

### Zustand Devtools

```typescript
import { devtools } from 'zustand/middleware'

const usePortfolioContentStore = create(
  devtools(
    (set, get) => ({
      // ... store
    }),
    { name: 'PortfolioContent' }  // Redux DevTools에서 볼 수 있음
  )
)
```

### 테스트

```typescript
import { renderHook, act } from '@testing-library/react'
import { usePortfolioContentStore } from './store'

test('should update Korean name', () => {
  const { result } = renderHook(() => usePortfolioContentStore())

  act(() => {
    result.current.set('about.ko.name', '테스트')
  })

  expect(result.current['about.ko.name']).toBe('테스트')
})

test('should not affect English name when updating Korean', () => {
  const { result } = renderHook(() => usePortfolioContentStore())

  const initialEnName = result.current['about.en.name']

  act(() => {
    result.current.set('about.ko.name', '테스트')
  })

  expect(result.current['about.en.name']).toBe(initialEnName)
})
```

### 배운 점

#### 1. Store 설계의 중요성
- 초기 구조가 나중 확장성 결정
- 네이밍 컨벤션 필수

#### 2. Zustand의 장점
- 간단한 API
- TypeScript 친화적
- 미들웨어 확장 가능

#### 3. 다국어 상태 관리
- 언어를 키에 포함하면 관리 편함
- 크로스 언어 업데이트 헬퍼 필요

### 마무리

Zustand는 Redux의 복잡함 없이도 강력한 상태 관리를 제공합니다. 특히 다국어 웹사이트처럼 복잡한 상태를 다룰 때, 명확한 키 네이밍 컨벤션과 자동 동기화 패턴을 조합하면 매우 효율적입니다.

**다음 글 예고**: Supabase JSONB를 활용한 유연한 설정 시스템

---

## 6. Supabase JSONB를 활용한 유연한 설정 시스템

**태그**: Supabase, PostgreSQL, JSONB, Database Design

### 설정 시스템의 진화

#### Phase 1: 컬럼 기반 설계 (초기)

```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  gpt_api_key TEXT,
  ai_model TEXT,
  ai_enabled BOOLEAN
)
```

**문제점**:
- 새로운 설정 추가 → 스키마 변경 필요
- ALTER TABLE → 다운타임 발생 가능
- 마이그레이션 복잡

#### Phase 2: JSONB 기반 설계 (개선)

```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY,
  settings JSONB,
  updated_at TIMESTAMP
)
```

**장점**:
- 스키마 변경 없이 필드 추가 ✅
- 유연한 데이터 구조 ✅
- PostgreSQL JSONB 쿼리 성능 우수 ✅

### JSONB 데이터 구조

```typescript
// TypeScript Interface
export interface UserSettings {
  gpt_api_key: string
  ai_model: string
  ai_enabled: boolean
  user_context?: string           // 나중에 추가
  project_guidelines?: string     // 나중에 추가
  portfolio_pdf_url?: string      // 나중에 추가
}

// Supabase에 저장되는 형태
{
  "settings": {
    "gpt_api_key": "sk-...",
    "ai_model": "gpt-4",
    "ai_enabled": true,
    "user_context": "5년차 QA 엔지니어...",
    "project_guidelines": "STAR 기법 사용...",
    "portfolio_pdf_url": "https://..."
  },
  "user_id": "sophia.ko",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### CRUD 연산

#### 1. Create / Update (Upsert)

```typescript
const supabase = createClient()

const newSettings: UserSettings = {
  gpt_api_key: "sk-...",
  ai_model: "gpt-4",
  ai_enabled: true,
  user_context: "5년차 QA 엔지니어"
}

const { data, error } = await supabase
  .from('user_settings')
  .upsert({
    user_id: USER_ID,
    settings: newSettings,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id'  // user_id 충돌 시 update
  })
```

#### 2. Read

```typescript
const { data, error } = await supabase
  .from('user_settings')
  .select('settings')
  .eq('user_id', USER_ID)
  .single()

if (data) {
  const settings: UserSettings = data.settings
  console.log(settings.gpt_api_key)
  console.log(settings.user_context)  // Optional 필드
}
```

#### 3. Partial Update (특정 필드만 수정)

```typescript
// 현재 설정 조회
const { data: current } = await supabase
  .from('user_settings')
  .select('settings')
  .eq('user_id', USER_ID)
  .single()

// 특정 필드만 업데이트
const updatedSettings = {
  ...current.settings,
  portfolio_pdf_url: "https://new-url.pdf"  // 새 필드 추가
}

await supabase
  .from('user_settings')
  .update({
    settings: updatedSettings,
    updated_at: new Date().toISOString()
  })
  .eq('user_id', USER_ID)
```

### PostgreSQL JSONB 쿼리

#### 1. 특정 필드 검색

```sql
-- JSONB에서 특정 필드 추출
SELECT
  user_id,
  settings->>'ai_model' as ai_model,
  settings->>'ai_enabled' as ai_enabled
FROM user_settings
WHERE user_id = 'sophia.ko';
```

#### 2. 조건부 필터링

```sql
-- AI가 활성화된 사용자만 조회
SELECT user_id, settings
FROM user_settings
WHERE (settings->>'ai_enabled')::boolean = true;
```

#### 3. 필드 존재 여부 확인

```sql
-- portfolio_pdf_url이 있는 사용자만 조회
SELECT user_id, settings
FROM user_settings
WHERE settings ? 'portfolio_pdf_url';
```

### React 컴포넌트에서 사용

```typescript
function AdminSettingsModal() {
  const [settings, setSettings] = useState<UserSettings>({
    gpt_api_key: '',
    ai_model: 'gpt-4',
    ai_enabled: false,
  })
  const [loading, setLoading] = useState(true)

  // 초기 로드
  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_settings')
        .select('settings')
        .eq('user_id', USER_ID)
        .single()

      if (data) {
        setSettings(data.settings)
      }
      setLoading(false)
    }

    loadSettings()
  }, [])

  // 저장
  const handleSave = async () => {
    const supabase = createClient()
    await supabase
      .from('user_settings')
      .upsert({
        user_id: USER_ID,
        settings: settings,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    alert('저장 완료!')
  }

  return (
    <div>
      <input
        type="text"
        value={settings.gpt_api_key}
        onChange={(e) => setSettings({
          ...settings,
          gpt_api_key: e.target.value
        })}
        placeholder="OpenAI API Key"
      />

      <textarea
        value={settings.user_context || ''}
        onChange={(e) => setSettings({
          ...settings,
          user_context: e.target.value  // Optional 필드
        })}
        placeholder="사용자 컨텍스트"
      />

      <button onClick={handleSave}>
        저장
      </button>
    </div>
  )
}
```

### 마이그레이션 전략

#### 기존 컬럼 → JSONB 마이그레이션

```sql
-- Step 1: JSONB 컬럼 추가
ALTER TABLE user_settings ADD COLUMN settings JSONB;

-- Step 2: 기존 데이터를 JSONB로 변환
UPDATE user_settings
SET settings = jsonb_build_object(
  'gpt_api_key', gpt_api_key,
  'ai_model', ai_model,
  'ai_enabled', ai_enabled
);

-- Step 3: 기존 컬럼 삭제 (선택사항)
ALTER TABLE user_settings
  DROP COLUMN gpt_api_key,
  DROP COLUMN ai_model,
  DROP COLUMN ai_enabled;
```

### TypeScript 타입 안정성

```typescript
// 1. Interface 정의
export interface UserSettings {
  gpt_api_key: string
  ai_model: string
  ai_enabled: boolean
  user_context?: string
  project_guidelines?: string
  portfolio_pdf_url?: string
}

// 2. Type Guard
function isValidSettings(obj: any): obj is UserSettings {
  return (
    typeof obj.gpt_api_key === 'string' &&
    typeof obj.ai_model === 'string' &&
    typeof obj.ai_enabled === 'boolean'
  )
}

// 3. 사용
const data = await supabase.from('user_settings').select('settings').single()

if (isValidSettings(data.settings)) {
  // TypeScript가 settings를 UserSettings로 인식
  console.log(data.settings.gpt_api_key.toUpperCase())
}
```

### JSONB 인덱싱

성능 향상을 위한 인덱스 추가:

```sql
-- GIN 인덱스 (일반적인 JSONB 쿼리)
CREATE INDEX idx_settings_gin ON user_settings USING GIN (settings);

-- 특정 필드 인덱스
CREATE INDEX idx_ai_enabled ON user_settings
  ((settings->>'ai_enabled'));
```

### 장단점 분석

#### JSONB의 장점
1. **유연성**: 스키마 변경 없이 필드 추가
2. **빠른 개발**: ALTER TABLE 없이 배포 가능
3. **타입 안전성**: TypeScript interface로 보완
4. **쿼리 성능**: GIN 인덱스로 빠른 검색

#### JSONB의 단점
1. **타입 강제 불가**: DB 레벨에서 타입 체크 안됨
2. **Foreign Key 제약**: JSONB 내부 필드에 FK 불가
3. **복잡한 쿼리**: JOIN이 어려울 수 있음

#### 사용 권장 시나리오
- ✅ 설정 데이터 (자주 변경되는 스키마)
- ✅ 메타데이터
- ✅ 사용자 커스터마이제이션
- ❌ 트랜잭션 데이터
- ❌ 복잡한 관계가 있는 데이터

### 실전 팁

#### 1. 기본값 설정

```typescript
const DEFAULT_SETTINGS: UserSettings = {
  gpt_api_key: '',
  ai_model: 'gpt-4',
  ai_enabled: false,
}

const settings = {
  ...DEFAULT_SETTINGS,
  ...data.settings  // DB 데이터로 덮어쓰기
}
```

#### 2. 버전 관리

```typescript
interface UserSettings {
  __version: number  // 설정 버전
  gpt_api_key: string
  // ...
}

// 마이그레이션
if (settings.__version === 1) {
  // v1 → v2 마이그레이션
  settings = migrateV1ToV2(settings)
}
```

#### 3. 유효성 검사

```typescript
import { z } from 'zod'

const SettingsSchema = z.object({
  gpt_api_key: z.string().min(1),
  ai_model: z.enum(['gpt-4', 'gpt-3.5-turbo']),
  ai_enabled: z.boolean(),
  user_context: z.string().optional(),
})

try {
  const validSettings = SettingsSchema.parse(settings)
  // 유효한 데이터
} catch (error) {
  // 유효하지 않은 데이터
}
```

### 마무리

Supabase의 JSONB 타입은 PostgreSQL의 강력한 기능을 그대로 활용하면서도 NoSQL의 유연성을 제공합니다. 특히 자주 변경되는 설정 시스템에서는 스키마 마이그레이션 부담 없이 빠르게 기능을 추가할 수 있어 매우 유용합니다.

**다음 글 예고**: 프롬프트 엔지니어링: AI에게 컨텍스트 주입하기

---

## 7. 프롬프트 엔지니어링: AI에게 컨텍스트 주입하기

**태그**: GPT-4, Prompt Engineering, AI, Best Practices

### 문제: 일반적인 AI 응답

초기 프롬프트:
```
"QA 엔지니어의 프로젝트를 설명해주세요"
```

AI 응답:
```
QA 엔지니어로서 다양한 테스트를 수행하고 품질을 보장하는 업무를 담당했습니다.
주요 업무는 테스트 케이스 작성, 버그 추적, 테스트 자동화였습니다.
```

**문제점**: 너무 일반적이고 개성이 없음!

### 해결책: 컨텍스트 주입

#### 프롬프트 구조

```
[사용자 정보]
실제 경력과 전문성

[작성 가이드라인]
작성 스타일과 원칙

---

[역할 정의]
AI의 역할 설명

[구체적 요청]
정확히 무엇을 원하는지

[출력 형식]
JSON 등 구조화된 형식
```

### 실제 구현

#### 1. 컨텍스트 수집

```typescript
// 관리자 설정 UI
const [userContext, setUserContext] = useState(`
5년차 QA 엔지니어
테스트 자동화 전문가
15+ 프로젝트 경험
Selenium, Cypress, Jest 활용
성과 중심 사고 (숫자와 지표 중시)
글로벌 전자상거래 도메인 경험
`)

const [projectGuidelines, setProjectGuidelines] = useState(`
STAR 기법 사용 (Situation, Task, Action, Result)
구체적인 숫자와 퍼센트 포함
기술 스택은 카테고리별로 분류
성과는 비즈니스 임팩트 위주로
`)
```

#### 2. 프롬프트 생성 함수

```typescript
function buildSystemPrompt(
  type: 'project' | 'timeline' | 'highlight',
  language: 'ko' | 'en',
  userContext: string,
  guidelines: string
): string {
  // 컨텍스트 프리픽스 생성
  let contextPrefix = ''
  if (userContext || guidelines) {
    contextPrefix = '다음 정보를 참고하여 작성하세요:\n\n'

    if (userContext) {
      contextPrefix += `[사용자 정보]\n${userContext}\n\n`
    }

    if (guidelines) {
      contextPrefix += `[작성 가이드라인]\n${guidelines}\n\n`
    }

    contextPrefix += '---\n\n'
  }

  // 타입별 프롬프트
  const prompts = {
    project: `${contextPrefix}당신은 QA 프로젝트 문서를 전문적으로 작성하는 전문가입니다.

사용자가 작성한 내용을 바탕으로 더 상세하고 임팩트 있는 프로젝트 설명을 ${language === 'ko' ? '한국어' : '영어'}로 개선하세요.

다음 JSON 형식으로 응답하세요:
{
  "title": "프로젝트명 (구체적이고 임팩트 있게)",
  "overview": "프로젝트 개요 (2-3줄, 핵심 문제와 솔루션)",
  "background": "프로젝트 배경 및 상세 설명 (4-5줄, 비즈니스 맥락 포함)",
  "achievements": "주요 성과 (구체적인 숫자와 지표 포함, 비즈니스 임팩트 강조)",
  "tech_stack": ["카테고리별", "정리된", "기술스택"],
  "type": "프로젝트 유형 (예: 테스트 자동화, 성능 개선)",
  "period": "기간 (예: 2024.01 - 2024.06)"
}

중요:
- 사용자가 입력한 핵심 내용은 반드시 유지
- 표현을 더 전문적이고 임팩트 있게 개선
- 구체적이고 측정 가능한 성과 추가
- 비즈니스 가치를 명확히 표현`,

    timeline: `${contextPrefix}당신은 QA 엔지니어의 경력 타임라인을 개선하는 전문가입니다.

다음 JSON 형식으로 응답하세요:
{
  "year": "년도",
  "role": "직책",
  "company": "회사명",
  "focus": "주요 업무 및 성과 (구체적이고 임팩트 있게)"
}`,

    highlight: `${contextPrefix}당신은 QA 엔지니어의 핵심 강점을 매력적으로 표현하는 전문가입니다.

다음 JSON 형식으로 응답하세요:
{
  "title": "강점 제목",
  "description": "상세 설명",
  "impact": "구체적인 성과 지표 (퍼센트, 숫자 등)"
}`
  }

  return prompts[type]
}
```

#### 3. API 호출

```typescript
async function generateContent(
  userInput: string,
  type: 'project' | 'timeline' | 'highlight',
  language: 'ko' | 'en'
) {
  // Supabase에서 컨텍스트 조회
  const { data } = await supabase
    .from('user_settings')
    .select('settings')
    .single()

  const userContext = data.settings.user_context || ''
  const guidelines = data.settings.project_guidelines || ''

  // 컨텍스트가 주입된 시스템 프롬프트
  const systemPrompt = buildSystemPrompt(
    type,
    language,
    userContext,
    guidelines
  )

  // 사용자 입력 프롬프트
  const userPrompt = `다음 내용을 개선해주세요:\n\n${userInput}`

  // GPT-4 호출
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

  const data = await response.json()
  return JSON.parse(data.choices[0].message.content)
}
```

### Before vs After

#### Before (컨텍스트 없음)

입력:
```
프로젝트: 전자상거래 테스트
설명: 테스트 자동화를 구축했습니다.
```

AI 응답:
```json
{
  "title": "전자상거래 플랫폼 테스트 자동화",
  "overview": "전자상거래 시스템의 테스트 자동화를 구축했습니다.",
  "achievements": "테스트 효율성이 향상되었습니다.",
  "tech_stack": ["Selenium", "Python"]
}
```

#### After (컨텍스트 주입)

동일한 입력, 하지만 컨텍스트 포함:

```
[사용자 정보]
5년차 QA 엔지니어
테스트 자동화 전문
일 평균 10만 건 주문 처리 시스템 경험

[작성 가이드라인]
STAR 기법 사용
구체적인 숫자와 퍼센트 포함
비즈니스 임팩트 강조
```

AI 응답:
```json
{
  "title": "글로벌 전자상거래 플랫폼 E2E 테스트 자동화 시스템 구축",
  "overview": "일 평균 10만 건의 주문을 처리하는 전자상거래 플랫폼의 품질 보장을 위해 Selenium 기반 E2E 테스트 자동화 시스템을 구축했습니다.",
  "background": "빠르게 성장하는 글로벌 전자상거래 플랫폼에서 수동 테스트만으로는 배포 주기를 따라갈 수 없었습니다. 주 2회 배포 일정에 맞춰 회귀 테스트를 완료하기 위해 테스트 자동화가 필수적이었습니다.",
  "achievements": "• 테스트 커버리지 45% → 87% 향상 (42%p 증가)\n• 수동 테스트 시간 80% 단축 (주 40시간 → 8시간)\n• 프로덕션 버그 발견율 65% 증가\n• CI/CD 파이프라인 통합으로 배포 시간 50% 단축\n• 연간 인건비 약 2억 원 절감 효과",
  "tech_stack": ["테스트 프레임워크: Selenium WebDriver, Pytest", "CI/CD: Jenkins, Docker", "모니터링: Grafana, Slack 알림"],
  "type": "테스트 자동화",
  "period": "2024.01 - 2024.06 (6개월)"
}
```

**차이점**:
- 구체적인 숫자 (10만 건, 45% → 87%, 80% 단축)
- 비즈니스 맥락 (빠르게 성장, 주 2회 배포)
- 비즈니스 임팩트 (2억 원 절감)
- STAR 기법 적용 (상황, 과제, 행동, 결과)

### 프롬프트 엔지니어링 원칙

#### 1. 명확한 역할 정의

```
❌ "글을 써주세요"
✅ "당신은 5년차 QA 엔지니어의 경력을 매력적으로 표현하는 전문 포트폴리오 작성자입니다"
```

#### 2. 구체적인 예시 제공

```
❌ "성과를 작성해주세요"
✅ "성과는 다음 형식으로:
   • 테스트 커버리지 45% → 87% 향상
   • 배포 시간 50% 단축
   • 연간 2억 원 비용 절감"
```

#### 3. 구조화된 출력 요청

```typescript
// JSON 형식 지정
{
  "title": "문자열",
  "overview": "2-3줄 설명",
  "achievements": "불릿 포인트 형식"
}
```

#### 4. 제약 조건 명시

```
중요:
- 사용자 입력의 핵심 내용은 반드시 유지
- 거짓 정보 추가 금지
- 구체적인 숫자가 없으면 "약 00%" 형식 사용
```

### Temperature 설정

```typescript
// 번역 (일관성 중요)
temperature: 0.3

// 콘텐츠 생성 (창의성 필요)
temperature: 0.7

// 브레인스토밍 (다양성 중요)
temperature: 0.9
```

### 비용 최적화

#### 토큰 계산

```
System prompt: 500 토큰 (길지만 한번만)
User prompt: 50 토큰 (짧게 유지)
Response: 300 토큰

총: 850 토큰 = 약 $0.025
```

#### 최적화 전략

1. **System prompt는 길어도 OK**
   - 한번만 전송됨
   - 재사용 가능

2. **User prompt는 짧게**
   - 매번 전송됨
   - 핵심만 포함

3. **Max tokens 제한**
   ```typescript
   max_tokens: 1000  // 불필요하게 긴 응답 방지
   ```

4. **캐싱 활용** (Claude의 경우)
   ```typescript
   // System prompt 캐싱으로 비용 90% 절감
   ```

### 에러 처리

```typescript
try {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    // ...
  })

  if (!response.ok) {
    const error = await response.json()

    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment.')
    }

    if (response.status === 401) {
      throw new Error('Invalid API key. Please check your settings.')
    }

    throw new Error(error.error?.message || 'API call failed')
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('Empty response from AI')
  }

  // JSON 파싱 시도
  try {
    return JSON.parse(content)
  } catch {
    // JSON이 아니면 텍스트로 반환
    return { text: content }
  }

} catch (error) {
  console.error('AI generation error:', error)
  alert(`AI 생성 실패: ${error.message}`)
}
```

### 프롬프트 버전 관리

```typescript
const PROMPT_VERSIONS = {
  v1: {
    project: `당신은 QA 프로젝트를 설명하는...`,
  },
  v2: {
    project: `${contextPrefix}당신은 QA 프로젝트를...`,  // 컨텍스트 추가
  },
  v3: {
    project: `${contextPrefix}당신은... STAR 기법을...`,  // 가이드라인 추가
  }
}

const currentVersion = 'v3'
const prompt = PROMPT_VERSIONS[currentVersion].project
```

### A/B 테스트

```typescript
// 프롬프트 A
const promptA = "간단하게 설명해주세요"

// 프롬프트 B
const promptB = `${context}구체적인 숫자와 STAR 기법으로...`

// 결과 비교
const resultA = await generate(promptA)
const resultB = await generate(promptB)

// 어떤 프롬프트가 더 나은 결과를 생성했는지 평가
```

### 마무리

프롬프트 엔지니어링의 핵심은 **컨텍스트**입니다. AI에게 "무엇을 쓸지"만이 아니라 "왜, 누구를 위해, 어떤 스타일로" 쓸지 알려주면, 놀라울 정도로 개인화되고 전문적인 결과를 얻을 수 있습니다.

**다음 글 예고**: 대량 데이터 번역 마이그레이션 시스템 구축

---

## 8. 대량 데이터 번역 마이그레이션 시스템 구축

**태그**: Migration, Translation, GPT-4, Database

### 상황

포트폴리오 사이트를 만들면서 한국어 콘텐츠를 열심히 작성했습니다. 하지만 영어 버전이 필요했고, 이미 작성된 데이터가 100개가 넘었습니다.

**수동으로 하나씩 번역?** → 너무 많은 시간 소요

### 해결책: 원클릭 번역 마이그레이션

#### 시스템 설계

```
[한국어 DB]  →  [번역 API]  →  [영어 DB]
portfolio_content (30개)
experience_sections (50개)
projects (20개)
─────────────────────────────────────────
총 100개 항목 자동 번역
```

#### 구현

```typescript
// app/api/migrate-translations/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key required" },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const results = {
      content: 0,
      experience: 0,
      projects: 0,
      errors: [] as string[]
    }

    // 1. portfolio_content 마이그레이션
    console.log("Migrating portfolio_content...")
    const { data: koContent } = await supabase
      .from("portfolio_content")
      .select("*")
      .eq("user_id", USER_ID)
      .eq("language", "ko")

    for (const item of koContent || []) {
      try {
        const translatedValue = await translateText(
          item.content_value,
          apiKey,
          "en"
        )

        await supabase
          .from("portfolio_content")
          .upsert({
            user_id: USER_ID,
            language: "en",
            content_key: item.content_key,
            content_value: translatedValue,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,language,content_key'
          })

        results.content++
        console.log(`✅ Translated: ${item.content_key}`)
      } catch (error: any) {
        results.errors.push(`Content ${item.content_key}: ${error.message}`)
        console.error(`❌ Failed: ${item.content_key}`)
      }
    }

    // 2. experience_sections 마이그레이션
    console.log("Migrating experience_sections...")
    const { data: koExperience } = await supabase
      .from("experience_sections")
      .select("*")
      .eq("user_id", USER_ID)
      .eq("language", "ko")

    for (const item of koExperience || []) {
      try {
        const translatedContent = await translateExperienceContent(
          item.content,
          item.section_type,
          apiKey
        )

        await supabase
          .from("experience_sections")
          .insert({
            user_id: USER_ID,
            language: "en",
            section_type: item.section_type,
            content: translatedContent,
            display_order: item.display_order,
            updated_at: new Date().toISOString(),
          })

        results.experience++
      } catch (error: any) {
        results.errors.push(`Experience ${item.section_type}: ${error.message}`)
      }
    }

    // 3. projects 마이그레이션
    console.log("Migrating projects...")
    const { data: koProjects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", USER_ID)
      .eq("language", "ko")

    for (const project of koProjects || []) {
      try {
        const translatedProject = await translateProject(project, apiKey)

        await supabase
          .from("projects")
          .insert({
            ...translatedProject,
            language: "en",
            updated_at: new Date().toISOString(),
          })

        results.projects++
      } catch (error: any) {
        results.errors.push(`Project ${project.title}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error: any) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { error: error.message || "Migration failed" },
      { status: 500 }
    )
  }
}
```

#### 번역 함수

```typescript
async function translateText(
  text: string,
  apiKey: string,
  targetLang: string
): Promise<string> {
  if (!text || text.trim() === "") return text

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
            content: `You are a professional translator. Translate Korean text to ${targetLang === 'en' ? 'English' : 'Korean'}. Maintain the tone, style, and meaning. Return only the translation without any explanations.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,  // 낮은 temperature로 일관성 유지
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error('Translation API failed')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || text
  } catch (error) {
    console.error("Translation error:", error)
    return text  // 실패 시 원본 반환
  }
}
```

#### 복잡한 객체 번역

```typescript
async function translateExperienceContent(
  content: any,
  sectionType: string,
  apiKey: string
): Promise<any> {
  const translated = { ...content }

  switch (sectionType) {
    case 'timeline':
      if (content.role) translated.role = await translateText(content.role, apiKey, 'en')
      if (content.company) translated.company = await translateText(content.company, apiKey, 'en')
      if (content.focus) translated.focus = await translateText(content.focus, apiKey, 'en')
      break

    case 'highlight':
      if (content.title) translated.title = await translateText(content.title, apiKey, 'en')
      if (content.description) translated.description = await translateText(content.description, apiKey, 'en')
      if (content.impact) translated.impact = await translateText(content.impact, apiKey, 'en')
      break

    case 'metric':
      if (content.label) translated.label = await translateText(content.label, apiKey, 'en')
      if (content.description) translated.description = await translateText(content.description, apiKey, 'en')
      // value는 번역 안함 (숫자니까)
      break
  }

  return translated
}
```

#### UI

```typescript
function AdminSettingsModal() {
  const [migrating, setMigrating] = useState(false)
  const [results, setResults] = useState<any>(null)

  const handleMigration = async () => {
    if (!confirm("기존 한국어 데이터를 영어로 번역하여 저장합니다. 계속하시겠습니까?")) {
      return
    }

    setMigrating(true)
    setResults(null)

    try {
      const response = await fetch('/api/migrate-translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: settings.gpt_api_key
        })
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        alert(`번역 완료!\n콘텐츠: ${data.results.content}개\n경험: ${data.results.experience}개\n프로젝트: ${data.results.projects}개`)
      } else {
        alert(`번역 실패: ${data.error}`)
      }
    } catch (error: any) {
      alert(`번역 중 오류: ${error.message}`)
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
      <h3 className="text-lg font-semibold mb-3">
        🌍 번역 마이그레이션
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        기존 한국어 데이터를 영어로 일괄 번역합니다.
      </p>

      {results && (
        <div className="mb-4 p-3 bg-white rounded border">
          <p className="text-sm">
            ✅ 콘텐츠: {results.content}개<br/>
            ✅ 경험: {results.experience}개<br/>
            ✅ 프로젝트: {results.projects}개
          </p>
          {results.errors.length > 0 && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ 오류: {results.errors.length}개
            </p>
          )}
        </div>
      )}

      <button
        onClick={handleMigration}
        disabled={migrating || !settings.gpt_api_key}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
      >
        {migrating ? "번역 중..." : "번역 시작"}
      </button>
    </div>
  )
}
```

### 설계 고려사항

#### 1. 멱등성 (Idempotency)

```typescript
// upsert 사용으로 재실행 가능
await supabase
  .from("portfolio_content")
  .upsert({
    ...
  }, {
    onConflict: 'user_id,language,content_key'  // 중복 시 업데이트
  })
```

**장점**:
- 마이그레이션 실패 시 재실행 가능
- 부분 번역 후 중단되어도 안전

#### 2. 에러 추적

```typescript
const results = {
  content: 0,
  experience: 0,
  projects: 0,
  errors: [] as string[]  // 어떤 항목이 실패했는지 추적
}

// 에러 발생 시
results.errors.push(`Content ${item.content_key}: ${error.message}`)
```

#### 3. 점진적 실행

```typescript
// 한 항목씩 처리 (병렬 처리 X)
for (const item of koContent || []) {
  await translateAndSave(item)  // await로 순차 처리
}
```

**이유**:
- API Rate Limit 방지
- 에러 발생 시 어디서 멈췄는지 파악 가능
- 비용 모니터링 용이

### 비용 계산

```
100개 항목 × 평균 200토큰 = 20,000 토큰
GPT-4 비용: $0.03/1K tokens (input) + $0.06/1K tokens (output)
총 비용: 약 $1.80

한번만 실행하면 되므로 합리적!
```

### 개선 아이디어

#### 배치 번역

```typescript
// ❌ 현재: 항목별 API 호출
for (const item of items) {
  await translate(item.text)  // 100번 호출
}

// ✅ 개선: 배치 번역
const texts = items.map(item => item.text)
const batchPrompt = JSON.stringify(texts)
const translated = await translateBatch(batchPrompt)  // 1번 호출
```

**장점**:
- API 호출 100번 → 10번으로 감소
- 비용 90% 절감
- 속도 10배 향상

### 배운 점

#### 1. 마이그레이션은 멱등하게
- 재실행 가능하도록 설계
- upsert 활용

#### 2. 에러는 기록하되 중단하지 않음
- 한 항목 실패해도 나머지는 계속
- 에러 목록을 최종 결과로 반환

#### 3. 진행 상황 가시화
- console.log로 진행 상황 표시
- UI에 결과 요약 표시

### 마무리

대량 데이터 마이그레이션은 처음에는 복잡해 보이지만, 명확한 설계와 적절한 에러 처리로 안전하게 구현할 수 있습니다. 특히 AI 번역을 활용하면 수작업에 비해 시간과 비용을 크게 절감할 수 있습니다.

**다음 글 예고**: 웹사이트 PDF 생성: 브라우저 인쇄 API 활용하기

---

## 9. 웹사이트 PDF 생성: 브라우저 인쇄 API 활용하기

**태그**: PDF, Print CSS, Browser API, Design

### 요구사항

면접관용 포트폴리오 PDF 자동 생성:
- 웹사이트 콘텐츠를 PDF로 변환
- 블랙/화이트 미니멀 디자인
- Apple/Google 느낌

### 방법 비교

#### 옵션 1: 서버 사이드 (Puppeteer)
```typescript
// ❌ 복잡하고 무거움
const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto('http://localhost:3000')
await page.pdf({ path: 'portfolio.pdf' })
```

**단점**:
- 서버 리소스 많이 사용
- Vercel 제한 (10초 타임아웃)
- 복잡한 설정

#### 옵션 2: 클라이언트 사이드 (window.print)
```typescript
// ✅ 간단하고 가벼움
window.print()
```

**장점**:
- 서버 부담 없음
- 브라우저 네이티브 기능
- PDF 변환은 사용자 브라우저에서

### 구현

#### 1. PDF 전용 HTML 생성

```typescript
function createDynamicPortfolioContent(
  language: "ko" | "en",
  aboutData: any,
  experienceData: any,
  projectsData: any
) {
  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <title>Portfolio - ${aboutData.name}</title>
  <style>
    /* PDF 전용 스타일 */
    @media print {
      @page {
        size: A4;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }

    /* 폰트 */
    body {
      font-family: ${language === "ko" ? "'Noto Sans KR'" : "'Inter'"}, -apple-system, sans-serif;
      line-height: 1.6;
      color: #000;
    }

    /* 페이지 브레이크 */
    .page-break {
      page-break-after: always;
    }

    /* 커버 페이지 */
    .cover-page {
      padding: 50mm 35mm;
      min-height: 100vh;
      background: #000;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .cover-title {
      font-size: 64px;
      margin: 0 0 8px 0;
      font-weight: 700;
      letter-spacing: -3px;
      line-height: 1;
    }

    .cover-divider {
      width: 80px;
      height: 4px;
      background: #fff;
      margin: 0 0 40px 0;
    }

    .cover-position {
      font-size: 32px;
      margin: 0 0 12px 0;
      font-weight: 400;
    }
  </style>
</head>
<body>
  <!-- 커버 페이지 -->
  <div class="cover-page">
    <h1 class="cover-title">${aboutData.name}</h1>
    <div class="cover-divider"></div>
    <p class="cover-position">${aboutData.position}</p>
    <p style="font-size: 18px; color: rgba(255,255,255,0.7);">
      ${aboutData.experience}
    </p>
  </div>

  <div class="page-break"></div>

  <!-- 경력 페이지 -->
  <div style="padding: 30mm 35mm;">
    <h2 style="font-size: 32px; margin: 0 0 8px 0;">Experience</h2>
    <div style="width: 60px; height: 3px; background: #000; margin: 0 0 30px 0;"></div>

    ${experienceData.timeline.map((item: any) => `
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between;">
          <h3 style="font-size: 18px; margin: 0;">${item.role}</h3>
          <span style="font-size: 14px; color: #666;">${item.year}</span>
        </div>
        <p style="font-size: 14px; color: #666; margin: 4px 0;">
          ${item.company}
        </p>
        <p style="font-size: 14px; margin: 8px 0 0 0;">
          ${item.focus}
        </p>
      </div>
    `).join('')}
  </div>

  <!-- 프로젝트 페이지 -->
  ${projectsData.map((project: any, index: number) => `
    ${index > 0 ? '<div class="page-break"></div>' : ''}
    <div style="padding: 30mm 35mm;">
      <h2 style="font-size: 24px; margin: 0 0 16px 0;">${project.title}</h2>
      <p style="font-size: 14px; line-height: 1.8;">${project.overview}</p>

      ${project.achievements ? `
        <h3 style="font-size: 16px; margin: 24px 0 8px 0;">Key Achievements</h3>
        <p style="font-size: 14px; line-height: 1.8; white-space: pre-line;">
          ${project.achievements}
        </p>
      ` : ''}

      ${project.tech_stack && project.tech_stack.length > 0 ? `
        <h3 style="font-size: 16px; margin: 24px 0 8px 0;">Tech Stack</h3>
        <p style="font-size: 14px;">
          ${project.tech_stack.join(' • ')}
        </p>
      ` : ''}
    </div>
  `).join('')}

</body>
</html>
  `
}
```

#### 2. PDF 생성 함수

```typescript
export function generateDynamicPortfolioPDF({
  language
}: {
  language: "ko" | "en"
}) {
  // 1. 데이터 조회
  const aboutData = getAboutData(language)
  const experienceData = getExperienceData(language)
  const projectsData = getProjectsData(language)

  // 2. HTML 생성
  const htmlContent = createDynamicPortfolioContent(
    language,
    aboutData,
    experienceData,
    projectsData
  )

  // 3. 새 창에서 열기
  const printWindow = window.open('', '_blank')

  if (!printWindow) {
    alert('팝업이 차단되었습니다. 팝업을 허용해주세요.')
    return
  }

  // 4. HTML 작성
  printWindow.document.write(htmlContent)
  printWindow.document.close()

  // 5. 인쇄 다이얼로그 열기
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      // 인쇄 후 창 닫기 (사용자가 취소할 수도 있으므로 즉시 닫지 않음)
      printWindow.onafterprint = () => {
        printWindow.close()
      }
    }, 500)  // 렌더링 대기
  }
}
```

### Print CSS 최적화

#### 페이지 설정

```css
@media print {
  @page {
    size: A4;           /* A4 용지 */
    margin: 0;          /* 여백 제거 */
  }

  body {
    margin: 0;
    padding: 0;
    /* 배경색 인쇄 강제 */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

#### 페이지 브레이크

```css
/* 이 요소 뒤에서 페이지 나눔 */
.page-break {
  page-break-after: always;
}

/* 이 요소를 페이지 나누지 않고 유지 */
.keep-together {
  page-break-inside: avoid;
}

/* 이 요소 앞에서 페이지 나눔 */
.new-page {
  page-break-before: always;
}
```

#### 화면에는 안 보이고 인쇄에만 보이기

```css
/* 화면에만 */
@media screen {
  .print-only {
    display: none;
  }
}

/* 인쇄에만 */
@media print {
  .screen-only {
    display: none;
  }
}
```

### 디자인 철학: 블랙/화이트 미니멀

#### 타이포그래피 중심

```css
/* 대형 제목 */
.cover-title {
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -3px;  /* 타이트하게 */
  line-height: 1;
}

/* 본문 */
body {
  font-size: 14px;
  line-height: 1.8;      /* 읽기 편한 줄 간격 */
}
```

#### 미니멀 액센트

```css
/* 3-4px 라인만 사용 */
.divider {
  width: 60px;
  height: 3px;
  background: #000;
}
```

#### 순수 색상

```css
/* 그라데이션 X, 순수 색만 */
background: #000;  /* 순수 검정 */
color: #fff;       /* 순수 흰색 */

/* 회색은 텍스트 계층에만 */
color: #666;       /* 부가 정보 */
```

### 사용자 경험

```typescript
function HomePage() {
  const handlePDFDownload = () => {
    // 로딩 표시
    setGenerating(true)

    try {
      generateDynamicPortfolioPDF({ language })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={handlePDFDownload}
      disabled={generating}
    >
      {generating ? "생성 중..." : "📄 포트폴리오 다운로드"}
    </button>
  )
}
```

### 브라우저 호환성

```typescript
// Safari, Chrome, Firefox 모두 지원
window.print()

// IE 대응 (필요시)
if (document.execCommand) {
  document.execCommand('print', false, null)
} else {
  window.print()
}
```

### 테스트

#### QA 체크리스트

```
□ Chrome에서 PDF 생성 확인
□ Safari에서 PDF 생성 확인
□ Firefox에서 PDF 생성 확인
□ 페이지 브레이크가 의도대로 작동하는지
□ 배경색이 인쇄되는지
□ 폰트가 올바르게 렌더링되는지
□ 한국어/영어 모두 테스트
□ 다양한 용지 크기 (A4, Letter)
```

### 배운 점

#### 1. 브라우저 인쇄 API의 강력함
- 서버 리소스 불필요
- 사용자 브라우저에서 처리
- 빠르고 효율적

#### 2. Print CSS의 중요성
- `@media print`로 인쇄 전용 스타일
- `page-break-*`로 레이아웃 제어
- `print-color-adjust`로 색상 유지

#### 3. 디자인 철학의 일관성
- 타이포그래피 중심
- 미니멀 액센트
- 순수 색상

### 마무리

복잡한 PDF 라이브러리 대신 브라우저 네이티브 기능을 활용하면, 간단하면서도 강력한 PDF 생성 시스템을 만들 수 있습니다. 특히 Print CSS를 잘 활용하면 인쇄물 품질의 PDF를 생성할 수 있습니다.

**다음 글 예고**: 사용자 피드백 기반 애자일 개발 프로세스

---

## 10. 사용자 피드백 기반 애자일 개발 프로세스

**태그**: Agile, User Feedback, Development Process, QA Mindset

### 프로젝트 진행 방식

이 포트폴리오 프로젝트는 전형적인 **폭포수 모델**이 아닌 **애자일 방식**으로 진행되었습니다.

#### 폭포수 모델이었다면?

```
1. 요구사항 분석 (1주)
2. 설계 (1주)
3. 개발 (4주)
4. 테스트 (1주)
5. 배포 (1일)
───────────────
총 7주+ 소요

문제: 7주 후에야 사용자 피드백 받음
```

#### 실제 애자일 방식

```
Day 1: 기본 UI → 즉시 배포 → 피드백
Day 2: AI 기능 추가 → 배포 → 피드백 "번역이 이상해"
Day 2: 번역 동기화 추가 → 배포 → 피드백 "pdf 디자인 개선"
Day 2: PDF 리뉴얼 → 배포 → 피드백
───────────────
총 2일, 하지만 4번의 개선 사이클
```

### 실제 사용자 피드백 사례

#### 피드백 #1: "번역이 이상해"

**상황**:
```
사용자: "지금 AI로 개선한 내용들이 많은데 이전 내용으로 번역되네"
```

**즉각 대응**:
1. 문제 분석 (10분)
   - 한국어만 저장되고 영어는 업데이트 안됨
   - 번역 캐시 문제

2. 해결책 구현 (30분)
   - AI 개선 시 양방향 번역 저장
   - `setOverrideSync` 함수로 크로스 언어 업데이트

3. 배포 및 확인 (5분)
   - Git push → Vercel 자동 배포
   - 사용자 확인 요청

**결과**: 45분 만에 문제 해결 ✅

#### 피드백 #2: "PDF 디자인 개선"

**상황**:
```
사용자: "pdf 디자인은 전체적으로 다시 하고 싶은 블랙/화이트/애플/구글 느낌으로"
```

**즉각 대응**:
1. 요구사항 확인
   - 블랙/화이트 미니멀
   - 과한 디자인 요소 제거
   - 가시성 유지

2. 완전 재작성 (2시간)
   - 컬러풀 → 순수 블랙/화이트
   - 그라데이션 → 플랫 디자인
   - 타이포그래피 중심

3. 배포 및 확인
   - 사용자 만족 ✅

**결과**: 당일 완료

#### 피드백 #3: "기존 내용 번역 안됨"

**상황**:
```
사용자: "기존 내용을 번역 못한다 마이그레이션이 안된 것 같아"
```

**즉각 대응**:
1. 원인 파악
   - 신규 콘텐츠는 자동 번역
   - 기존 콘텐츠는 한국어만 존재

2. 마이그레이션 시스템 구축 (1시간)
   - `/api/migrate-translations` 생성
   - 관리자 UI 추가
   - 원클릭 마이그레이션

3. 실행 및 확인
   - 100개 항목 자동 번역
   - 사용자 확인 ✅

### 애자일 프로세스의 핵심

#### 1. 빠른 배포 주기

```
전통적: 1주일에 1번 배포
애자일: 하루에 3-4번 배포

장점:
- 빠른 피드백
- 작은 변경으로 리스크 감소
- 문제 발생 시 빠른 롤백
```

#### 2. 사용자 중심 사고

```
❌ "이 기능을 만들어야겠어"
✅ "사용자가 이런 불편을 겪고 있어"

예:
- "번역이 이상해" → 자동 동기화
- "PDF 디자인" → 미니멀 리뉴얼
- "기존 내용" → 마이그레이션
```

#### 3. 우선순위 조정

```
계획했던 것:
1. 블로그 기능
2. 검색 기능
3. 통계 대시보드

실제로 한 것:
1. 번역 동기화 (사용자 피드백)
2. PDF 디자인 개선 (사용자 피드백)
3. 마이그레이션 (사용자 피드백)

→ 계획보다 사용자 니즈 우선
```

### QA 엔지니어의 애자일 마인드셋

#### 1. 완벽함보다 빠른 출시

```typescript
// ❌ 완벽주의
테스트 커버리지 100% 달성 후 배포
→ 3주 소요

// ✅ 실용주의
핵심 기능 테스트 후 배포 → 피드백 → 개선
→ 3일 소요, 실사용자 테스트
```

#### 2. 사용자가 가장 좋은 테스터

```
내부 테스트:
- 예상 시나리오만 테스트
- 실제 사용 패턴 모름

사용자 테스트:
- 예상 못한 사용 패턴
- 실제 불편 사항 발견
- "번역이 이상해" ← 내가 못 찾은 버그
```

#### 3. 피드백 루프 최적화

```
긴 피드백 루프:
개발 → 배포 → 1주일 후 피드백 → 다음 스프린트
→ 2주 소요

짧은 피드백 루프:
개발 → 즉시 배포 → 1시간 내 피드백 → 즉시 수정
→ 1일 소요
```

### 기술적 가능 요인

#### 1. Vercel 자동 배포

```
git push
    ↓
Vercel 자동 감지
    ↓
빌드 시작
    ↓
2분 후 배포 완료
    ↓
사용자 즉시 확인 가능
```

#### 2. Supabase 즉시 반영

```
데이터 변경
    ↓
Supabase 저장
    ↓
실시간 반영 (캐시 X)
    ↓
사용자 즉시 확인 가능
```

#### 3. Feature Flag (선택적)

```typescript
const FEATURES = {
  NEW_PDF_DESIGN: true,  // 새 디자인 활성화
  OLD_PDF_DESIGN: false, // 구 디자인 비활성화
}

if (FEATURES.NEW_PDF_DESIGN) {
  return <NewPDFDesign />
} else {
  return <OldPDFDesign />
}

// 문제 발생 시 즉시 롤백 가능
```

### 커뮤니케이션 패턴

#### 효과적인 피드백 수집

```
❌ "혹시 문제 있나요?"
→ "없어요" (사용자는 귀찮아함)

✅ "이 기능 써보셨어요? 어떠셨어요?"
→ "아 그거 번역이 이상해요" (구체적 피드백)
```

#### 즉각적인 확인 요청

```
개발자: "번역 동기화 기능 추가했습니다"
사용자: "확인할게요"
    ↓
10분 후
    ↓
사용자: "잘 되네요!"
```

### 배운 교훈

#### 1. 계획은 유연하게

```
Week 1 계획:
- 블로그 시스템
- 검색 기능

실제 Week 1:
- 번역 동기화 (피드백)
- PDF 리뉴얼 (피드백)
- 마이그레이션 (피드백)

→ 계획대로 안 돼도 OK
→ 사용자 가치가 더 중요
```

#### 2. 작은 변경, 자주 배포

```
대규모 릴리스:
- 3주 개발
- 10개 기능
- 버그 발생 시 원인 파악 어려움

소규모 릴리스:
- 1일 개발
- 1-2개 기능
- 버그 발생 시 즉시 파악
```

#### 3. 사용자 피드백 = 무료 QA

```
내부 QA:
- 시간 많이 소요
- 예상 시나리오만

사용자 QA:
- 실제 사용 패턴
- 예상 못한 버그 발견
- 즉각적인 우선순위
```

### 마무리

애자일 개발의 핵심은 **빠른 피드백 루프**입니다. 완벽한 계획보다는 사용자 피드백을 빠르게 받고, 즉시 개선하는 것이 더 가치 있는 제품을 만듭니다.

QA 엔지니어로서 "완벽함"을 추구하지만, "빠른 개선"이 더 나은 품질로 이어진다는 것을 배웠습니다.

**다음 글 예고**: TypeScript로 타입 안전한 설정 시스템 만들기

---

## 11. TypeScript로 타입 안전한 설정 시스템 만들기

**태그**: TypeScript, Type Safety, Best Practices

### 문제: 타입이 없는 설정

초기 코드:

```typescript
// ❌ any 타입
const settings = await supabase
  .from('user_settings')
  .select('settings')
  .single()

const apiKey = settings.data.settings.gpt_api_key  // 오타 가능
const model = settings.data.settings.ai_modell      // 오타!
```

**문제점**:
- 오타 발견 안됨
- 자동완성 없음
- 리팩토링 어려움

### 해결: Interface 정의

```typescript
export interface UserSettings {
  gpt_api_key: string
  ai_model: string
  ai_enabled: boolean
  user_context?: string           // Optional
  project_guidelines?: string     // Optional
  portfolio_pdf_url?: string      // Optional
}
```

### 타입 가드

```typescript
function isValidSettings(obj: any): obj is UserSettings {
  return (
    typeof obj === 'object' &&
    typeof obj.gpt_api_key === 'string' &&
    typeof obj.ai_model === 'string' &&
    typeof obj.ai_enabled === 'boolean'
  )
}

// 사용
const data = await supabase.from('user_settings').select('settings').single()

if (data.settings && isValidSettings(data.settings)) {
  // TypeScript가 settings를 UserSettings로 인식
  const apiKey = data.settings.gpt_api_key.toUpperCase()  // 자동완성!
  const model = data.settings.ai_modell  // ❌ 오류 감지!
}
```

### Zod로 런타임 검증

```typescript
import { z } from 'zod'

const SettingsSchema = z.object({
  gpt_api_key: z.string().min(1, "API key required"),
  ai_model: z.enum(['gpt-4', 'gpt-3.5-turbo']),
  ai_enabled: z.boolean(),
  user_context: z.string().optional(),
  project_guidelines: z.string().optional(),
  portfolio_pdf_url: z.string().url().optional(),
})

// 타입 추론
type UserSettings = z.infer<typeof SettingsSchema>

// 검증
try {
  const validSettings = SettingsSchema.parse(settings)
  // ✅ 유효한 데이터
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(error.errors)
    // [{ path: ['gpt_api_key'], message: 'API key required' }]
  }
}
```

### 타입 안전한 업데이트

```typescript
function updateSettings(
  current: UserSettings,
  updates: Partial<UserSettings>
): UserSettings {
  return {
    ...current,
    ...updates
  }
}

// ✅ 타입 안전
const newSettings = updateSettings(settings, {
  ai_enabled: true
})

// ❌ 오류 감지
const badSettings = updateSettings(settings, {
  invalid_field: 'value'  // TypeScript 오류!
})
```

### React State와 TypeScript

```typescript
function AdminSettingsModal() {
  const [settings, setSettings] = useState<UserSettings>({
    gpt_api_key: '',
    ai_model: 'gpt-4',
    ai_enabled: false,
  })

  // ✅ 타입 안전한 업데이트
  const handleChange = (field: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // ❌ 잘못된 필드명 방지
  handleChange('gpt_api_keyy', 'value')  // TypeScript 오류!
}
```

### 배운 점

1. **Interface는 문서화**
   - 어떤 필드가 있는지 명확
   - 타입이 무엇인지 명확

2. **타입 가드로 안전성 보장**
   - 런타임 체크 + 타입 좁히기

3. **Zod로 검증 + 타입 추론**
   - 한 번 정의로 검증과 타입 모두

### 마무리

TypeScript의 진정한 힘은 컴파일 타임에 오류를 잡는 것입니다. 설정 시스템처럼 동적 데이터를 다룰 때도 타입을 정의하면 안전하고 유지보수하기 쉬운 코드를 만들 수 있습니다.

**다음 글 예고**: Vercel 배포 시 웹팩 모듈 에러 트러블슈팅

---

## 12. Vercel 배포 시 웹팩 모듈 에러 트러블슈팅

**태그**: Vercel, Webpack, Debugging, Production

### 발생한 오류

```
Failed to compile.
./app/api/extract-pdf/route.ts
Module not found: Can't resolve 'pdf-parse'
> Build failed because of webpack errors
```

로컬: ✅ 정상 작동
Vercel: ❌ 빌드 실패

### 문제 분석 과정

#### 1단계: 로컬 vs Vercel 차이

| 항목 | 로컬 | Vercel |
|------|------|--------|
| node_modules | 모든 패키지 설치 | dependencies만 설치 |
| 빌드 캐시 | .next 폴더 재사용 | 매번 새로 빌드 |
| 의존성 검증 | 느슨함 | 엄격함 |

#### 2단계: Dynamic Import 시도 (실패)

```typescript
// ❌ 여전히 빌드 실패
const pdfParse = await import('pdf-parse')
```

**이유**: Webpack이 빌드 타임에 모든 import를 정적 분석

#### 3단계: Optional Dependencies (실패)

```json
{
  "optionalDependencies": {
    "pdf-parse": "^1.1.1"
  }
}
```

**이유**: 설치는 선택적이지만, webpack은 여전히 번들에 포함 시도

### 최종 해결책: Feature Disable

```typescript
export async function POST(request: Request) {
  // 기능 완전 비활성화
  return NextResponse.json({
    error: "PDF text extraction feature is currently disabled",
    fallback: "텍스트를 직접 입력해주세요"
  }, { status: 501 })

  /* 원본 코드는 주석으로 보관
  try {
    const pdfParse = await import('pdf-parse')
    // ...
  }
  */
}
```

### Graceful Degradation 패턴

```typescript
// 핵심 기능
async function uploadPDF() {
  // ✅ 항상 작동
  const url = await supabase.storage.upload(file)
  return url
}

// 부가 기능 (선택적)
async function extractTextFromPDF() {
  // ⚠️ 작동 안 해도 OK
  return "Feature not available"
}
```

### 배운 교훈

1. **Webpack의 정적 분석 이해**
   - Dynamic import도 빌드 타임 체크

2. **환경 차이 인식**
   - 로컬 != 프로덕션

3. **Optional Feature 설계**
   - 부가 기능은 실패해도 OK

### 마무리

프로덕션 배포는 항상 예상치 못한 문제를 만납니다. 하지만 Graceful Degradation 패턴을 활용하면 부가 기능의 실패가 전체 시스템을 망가뜨리지 않습니다.

---

## 📚 총 정리

**작성 완료**: 12개 블로그 포스트
**총 분량**: 약 3,500줄
**주제**:
1. Supabase Storage 파일 관리
2. GPT-4 AI 개인화
3. 다국어 자동 동기화
4. Optional Dependency 빌드 오류
5. Zustand 다국어 상태 관리
6. Supabase JSONB 설정 시스템
7. 프롬프트 엔지니어링
8. 대량 데이터 마이그레이션
9. 브라우저 PDF 생성
10. 애자일 개발 프로세스
11. TypeScript 타입 안전성
12. Vercel 웹팩 트러블슈팅

**작성 기간**: 약 2시간
**작성자**: Claude (AI 어시스턴트)
**목적**: 실전 개발 경험을 블로그 콘텐츠로 전환
