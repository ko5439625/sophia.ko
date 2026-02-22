# 5년차 QA 포트폴리오 개발 작업 일지

**작업 기간**: 2024년
**개발자**: 고아현 (Sophia Ko)
**프로젝트**: Next.js 기반 인터랙티브 QA 포트폴리오 웹사이트

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [오늘 작업한 주요 기능](#오늘-작업한-주요-기능)
3. [기술적 의사결정과 고민](#기술적-의사결정과-고민)
4. [새롭게 배운 것들](#새롭게-배운-것들)
5. [트러블슈팅 기록](#트러블슈팅-기록)
6. [기술 스택 및 아키텍처](#기술-스택-및-아키텍처)
7. [다음 단계](#다음-단계)

---

## 프로젝트 개요

### 목표
5년차 QA 엔지니어의 경력을 효과적으로 보여줄 수 있는 인터랙티브 포트폴리오 웹사이트 구축

### 핵심 컨셉
- **Google 검색 UI 패러디**: 친숙한 UX로 포트폴리오 탐색
- **AI 기반 콘텐츠 개선**: GPT-4를 활용한 자동 콘텐츠 개선
- **다국어 지원**: 한국어/영어 완벽 지원
- **PDF 생성**: 면접관용 포트폴리오 자동 생성

---

## 오늘 작업한 주요 기능

### 1️⃣ 포트폴리오 PDF 업로드 시스템

**문제 인식**:
- 동적 PDF 생성은 매번 시간이 걸림
- 생성된 PDF를 검토하고 수정할 수 없음
- 일관성 있는 버전 관리 어려움

**해결 방안**:
```typescript
// app/api/upload-portfolio-pdf/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  // 파일 검증
  if (!file || file.type !== 'application/pdf') {
    return NextResponse.json({ error: "Only PDF files allowed" }, { status: 400 })
  }

  // 파일 크기 제한 (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File size exceeds 10MB" }, { status: 400 })
  }

  const supabase = createClient()
  const fileName = `portfolio-${USER_ID}-${Date.now()}.pdf`

  // Supabase Storage에 업로드
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('portfolios')
    .upload(fileName, file, {
      contentType: 'application/pdf',
      upsert: true
    })

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

**고민의 흔적**:
- 처음에는 동적 생성만 생각했지만, 실무에서는 검토된 PDF를 배포하는 게 더 안전함을 깨달음
- Supabase Storage의 public/private bucket 개념을 이해하게 됨
- 파일명에 타임스탬프를 넣어 버전 관리 가능하도록 설계

**결과**:
- ✅ 관리자 설정에서 PDF 업로드 가능
- ✅ 메인 페이지에서 업로드된 PDF 우선 사용
- ✅ PDF 없으면 "준비중" 알림 표시

---

### 2️⃣ AI 컨텍스트 시스템

**문제 인식**:
- AI가 생성하는 콘텐츠가 일반적이고 개성이 없음
- 매번 같은 스타일의 콘텐츠가 생성됨
- 사용자 경험과 전문성을 반영하지 못함

**해결 방안**:
```typescript
// app/api/ai/generate/route.ts
function getSystemPrompt(
  type: string,
  language: 'ko' | 'en',
  userContext: string = '',
  projectGuidelines: string = ''
): string {
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
    project: `${contextPrefix}당신은 QA 프로젝트 문서를 더 전문적으로 작성하는 전문가입니다...`,
    // ... 모든 프롬프트에 contextPrefix 추가
  }
}
```

**고민의 흔적**:
- PDF에서 텍스트를 추출하는 기능도 추가 (pdf-parse 라이브러리)
- 하지만 optional dependency로 만들어 빌드 실패 방지
- 사용자가 이력서 PDF를 업로드하면 자동으로 텍스트 추출하여 컨텍스트로 활용 가능

**새로운 발견**:
- GPT-4의 시스템 프롬프트에 컨텍스트를 주입하면 훨씬 개인화된 결과 생성
- PDF 텍스트 추출은 optional로 만들어 의존성 관리 유연하게 가능
- Supabase의 JSONB 타입으로 settings 저장하면 스키마 변경 없이 확장 가능

---

### 3️⃣ 번역 자동 동기화

**문제 인식**:
- AI로 한국어 콘텐츠를 개선하면 영어 버전이 업데이트되지 않음
- 사용자가 수동으로 양쪽 언어를 관리해야 함
- 번역 캐시로 인해 이전 버전이 보이는 문제

**해결 방안**:
```typescript
// app/experience/page.tsx
const handleAIImprove = async (key: string, currentValue: string, type: 'text' | 'quote') => {
  // 1. 현재 언어로 개선
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify({
      prompt: `Improve this ${type} for a QA engineer portfolio`,
      type: 'blog',
      language,
      formData: { content: currentValue }
    }),
  })

  const data = await response.json()
  const improvedContent = data.content || data.text

  if (improvedContent) {
    save(key)(improvedContent)  // 현재 언어 저장

    // 2. 반대 언어로 자동 번역
    const targetLang = language === 'ko' ? 'en' : 'ko'
    const translateResponse = await fetch('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt: `Translate this ${type} to ${targetLang === 'ko' ? 'Korean' : 'English'}`,
        type: 'blog',
        language: targetLang,
        formData: { content: improvedContent }
      }),
    })

    if (translateResponse.ok) {
      const translateData = await translateResponse.json()
      const translatedContent = translateData.content || translateData.text
      if (translatedContent) {
        setOverrideSync(`exp.${targetLang}.${key}`, translatedContent)  // 반대 언어 저장
      }
    }
  }
}
```

**고민의 흔적**:
- 처음에는 번역 캐시 문제인 줄 알았음
- 알고보니 DB에 반대 언어 데이터가 없었음
- AI 개선 시점에 바로 번역하여 양쪽 DB에 저장하는 방식으로 해결
- `setOverrideSync` 함수를 사용해 다른 언어의 store 직접 업데이트

**기술적 교훈**:
- Zustand store의 언어별 분리 구조 이해
- 크로스 언어 데이터 동기화 패턴 습득
- API 호출 체이닝으로 복잡한 워크플로우 구현

---

### 4️⃣ 번역 마이그레이션 시스템

**문제 인식**:
- 이미 작성된 한국어 콘텐츠가 많음
- 영어 DB는 비어있음
- 수동으로 하나씩 번역하기엔 너무 많음

**해결 방안**:
```typescript
// app/api/migrate-translations/route.ts
export async function POST(request: Request) {
  const { apiKey } = await request.json()
  const supabase = createClient()
  const results = { content: 0, experience: 0, projects: 0, errors: [] }

  // 1. portfolio_content 마이그레이션
  const { data: koContent } = await supabase
    .from("portfolio_content")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("language", "ko")

  for (const item of koContent || []) {
    const translatedValue = await translateText(item.content_value, apiKey, "en")
    await supabase.from("portfolio_content").upsert({
      user_id: USER_ID,
      language: "en",
      content_key: item.content_key,
      content_value: translatedValue,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,language,content_key' })
    results.content++
  }

  // 2. experience_sections 마이그레이션
  // 3. projects 마이그레이션
  // ... (동일한 패턴)

  return NextResponse.json({ success: true, results })
}
```

**고민의 흔적**:
- 번역 API 호출 비용 고려 (한번만 실행하면 되므로 OK)
- 에러 발생 시 어느 항목에서 실패했는지 추적 가능하도록 errors 배열 추가
- upsert를 사용해 중복 실행해도 안전하도록 설계

**배운 점**:
- Supabase의 upsert는 conflict resolution이 필요함 (onConflict 옵션)
- 대량 데이터 마이그레이션 시 결과 추적의 중요성
- 한번 실행하는 작업도 재실행 가능하도록 멱등성 보장 필요

---

### 5️⃣ PDF 디자인 리뉴얼 (블랙/화이트 미니멀)

**요구사항**:
- "블랙/화이트/애플/구글 느낌으로 깔끔하게"
- "너무 많은 디자인 요소 쓰지 말고"

**Before (기존)**:
```typescript
// 그라데이션, 컬러풀한 아이콘, 복잡한 레이아웃
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

**After (개선)**:
```typescript
// 순수 블랙/화이트, 타이포그래피 중심
const coverPage = `
<div style="padding: 50mm 35mm; background: #000; color: #fff;">
  <h1 style="font-size: 64px; font-weight: 700; letter-spacing: -3px;">
    ${aboutData.name}
  </h1>
  <div style="width: 80px; height: 4px; background: #fff;"></div>
  <p style="font-size: 32px; font-weight: 400;">
    ${aboutData.position}
  </p>
</div>
`
```

**디자인 철학**:
- **타이포그래피가 주인공**: 64px 대형 제목, -3px 레터스페이싱
- **미니멀 액센트**: 3-4px 두께의 라인만 사용
- **높은 대비**: 순수 검정 (#000) vs 순수 흰색 (#fff)
- **여백의 미**: 충분한 padding으로 고급스러운 느낌
- **인쇄 최적화**: 그라데이션 제거로 프린트 품질 향상

**참고한 디자인**:
- Apple의 제품 매뉴얼 (타이포그래피 중심)
- Google의 Material Design (깔끔한 레이아웃)
- Stripe의 문서 (블랙/화이트 대비)

---

## 기술적 의사결정과 고민

### 1. Supabase vs Firebase

**선택**: Supabase ✅

**이유**:
- PostgreSQL 기반으로 복잡한 쿼리 가능
- Row Level Security로 보안 강화
- Storage와 Database가 통합되어 관리 편함
- 오픈소스라 self-hosting 가능 (미래 확장성)

**배운 점**:
```typescript
// Supabase Storage 사용법
const { data, error } = await supabase.storage
  .from('portfolios')  // bucket 이름
  .upload(fileName, file, {
    contentType: 'application/pdf',
    upsert: true  // 같은 파일명 있으면 덮어쓰기
  })

// Public URL 생성
const { data: { publicUrl } } = supabase.storage
  .from('portfolios')
  .getPublicUrl(fileName)
```

**주의사항**:
- Storage bucket은 수동으로 생성해야 함
- Public bucket과 Private bucket 구분 필요
- RLS (Row Level Security) 정책 설정 필수

---

### 2. Zustand Store 구조 설계

**선택한 구조**:
```typescript
// 언어별 store 분리
const usePortfolioContentStore = create((set) => ({
  'about.ko.name': '고아현',
  'about.en.name': 'Sophia Ko',
  // ...
}))
```

**고민했던 점**:
- 언어별로 store를 분리할까? → 아니, key에 언어 포함
- JSONB로 저장할까, 컬럼으로 분리할까? → JSONB (유연성)
- 번역 캐시를 어디에 둘까? → 서버 사이드에서 처리

**배운 점**:
- `setOverrideSync` 같은 헬퍼 함수로 크로스 언어 업데이트 가능
- Store의 키 네이밍 컨벤션이 중요 (일관성)
- 로컬스토리지와 동기화 시 debounce 필요

---

### 3. AI 프롬프트 엔지니어링

**초기 프롬프트**:
```
"QA 엔지니어의 프로젝트를 설명해주세요"
```

**개선 후**:
```typescript
const prompt = `
[사용자 정보]
5년차 QA 엔지니어, 테스트 자동화 전문, 15+ 프로젝트 경험

[작성 가이드라인]
- 구체적인 숫자와 지표 사용
- STAR 기법 활용 (Situation, Task, Action, Result)
- 기술 스택은 카테고리별로 분류

---

당신은 QA 프로젝트 문서를 더 전문적으로 작성하는 전문가입니다.
사용자가 작성한 내용을 바탕으로 더 상세하고 임팩트 있는 프로젝트 설명을 작성하세요.

다음 JSON 형식으로 응답하세요:
{
  "title": "프로젝트명",
  "overview": "프로젝트 개요 (2-3줄)",
  "achievements": "주요 성과 (구체적인 숫자 포함)"
}
`
```

**효과**:
- 일반적인 내용 → 개인화된 전문적 내용
- 짧은 설명 → 구체적인 성과 지표
- 일관성 없는 형식 → JSON 구조화된 응답

---

### 4. PDF 파싱 Optional Dependency

**문제**:
```
Module not found: Can't resolve 'pdf-parse'
> Build failed because of webpack errors
```

**해결**:
```json
// package.json
{
  "optionalDependencies": {
    "pdf-parse": "^1.1.1"
  }
}
```

```typescript
// extract-pdf/route.ts
try {
  pdfParse = (await import('pdf-parse')).default
} catch (importError) {
  return NextResponse.json({
    error: "PDF parsing library not installed",
    fallback: "텍스트를 직접 입력해주세요"
  }, { status: 501 })
}
```

**배운 점**:
- Optional dependency는 빌드 실패를 방지
- Dynamic import로 런타임에 체크 가능
- Graceful degradation (기능 저하 허용) 패턴

---

## 새롭게 배운 것들

### 1. Supabase 깊이 이해

**Storage**:
```typescript
// 파일 업로드
await supabase.storage.from('bucket').upload(path, file)

// Public URL 생성
const { data: { publicUrl } } = supabase.storage
  .from('bucket')
  .getPublicUrl(path)

// 파일 삭제
await supabase.storage.from('bucket').remove([path])
```

**JSONB 활용**:
```sql
-- settings 컬럼에 JSON 저장
{
  "gpt_api_key": "sk-...",
  "ai_enabled": true,
  "user_context": "5년차 QA...",
  "portfolio_pdf_url": "https://..."
}
```

**장점**:
- 스키마 변경 없이 필드 추가 가능
- PostgreSQL의 JSONB 쿼리 성능 우수
- 타입 안정성 (TypeScript interface로 보완)

---

### 2. Next.js 14 App Router 패턴

**API Route 작성법**:
```typescript
// app/api/upload/route.ts
export async function POST(request: Request) {
  const formData = await request.formData()
  // ...
  return NextResponse.json({ success: true })
}
```

**클라이언트 사용**:
```typescript
const formData = new FormData()
formData.append('file', file)

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})
```

**배운 점**:
- FormData는 자동으로 multipart/form-data 헤더 설정
- NextResponse.json()으로 JSON 응답 간편하게 생성
- Error handling은 try-catch + status code

---

### 3. GPT-4 API 활용 패턴

**프롬프트 구조**:
```typescript
{
  model: 'gpt-4',
  messages: [
    { role: 'system', content: systemPrompt },  // AI 역할 정의
    { role: 'user', content: userPrompt }       // 사용자 요청
  ],
  temperature: 0.7,  // 창의성 수준
  max_tokens: 1000   // 응답 길이 제한
}
```

**JSON 응답 파싱**:
```typescript
const content = data.choices[0]?.message?.content

try {
  const parsed = JSON.parse(content)
  return NextResponse.json(parsed)
} catch {
  // JSON이 아니면 텍스트로 반환
  return NextResponse.json({ text: content })
}
```

**비용 최적화**:
- System prompt는 길어도 OK (한번만 전송)
- User prompt는 짧게 유지
- Temperature 낮추면 토큰 소비 감소

---

### 4. TypeScript 고급 타입 활용

**UserSettings Interface**:
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

**타입 가드**:
```typescript
if (settingsData?.settings?.portfolio_pdf_url) {
  // TypeScript가 portfolio_pdf_url이 string임을 인지
  window.open(portfolioPdfUrl, '_blank')
}
```

**배운 점**:
- Optional property (`?`)로 점진적 확장 가능
- Type inference로 중복 타입 정의 불필요
- Interface는 확장 가능, Type은 유니온에 강함

---

## 트러블슈팅 기록

### 🐛 Issue #1: tech_stack null 참조 에러

**에러 메시지**:
```
TypeError: Cannot read properties of null (reading 'length')
at dynamicPDFGenerator.ts:232
```

**원인**:
```typescript
if (project.tech_stack.length > 0) {
  // tech_stack이 null일 수 있는데 체크 안함
}
```

**해결**:
```typescript
if (project.tech_stack && project.tech_stack.length > 0) {
  // null check 추가
}
```

**교훈**:
- Optional chaining (`?.`) 또는 null check 필수
- TypeScript의 strictNullChecks 활성화 권장

---

### 🐛 Issue #2: 번역이 AI 개선 내용 반영 안됨

**증상**:
- 한국어로 AI 개선 → 영어로 전환 → 이전 번역 보임
- 사용자: "번역이 이상해 지금 ai로 개선한 내용들이 많은데 이전 내용으로 번역되네"

**원인 분석**:
1. AI 개선 → 한국어 DB만 업데이트
2. 영어 전환 → 영어 DB 조회 (비어있음)
3. 번역 캐시에서 이전 버전 로드

**해결**:
```typescript
// 현재 언어 저장 후
save(key)(improvedContent)

// 반대 언어로 번역하여 저장
const targetLang = language === 'ko' ? 'en' : 'ko'
const translated = await translateAPI(improvedContent, targetLang)
setOverrideSync(`key.${targetLang}`, translated)
```

**교훈**:
- 다국어 데이터는 항상 양방향 동기화 필요
- 캐시 무효화보다 데이터 완전성 우선
- 사용자 피드백이 버그 발견에 중요

---

### 🐛 Issue #3: Vercel 빌드 실패 (pdf-parse)

**에러 메시지**:
```
Module not found: Can't resolve 'pdf-parse'
> Build failed because of webpack errors
```

**원인**:
- pdf-parse가 dependencies에 없음
- 하지만 코드에서 import 시도
- Vercel 빌드 시 모듈을 찾을 수 없음

**해결**:
```json
{
  "optionalDependencies": {
    "pdf-parse": "^1.1.1"
  }
}
```

```typescript
try {
  pdfParse = (await import('pdf-parse')).default
} catch (importError) {
  // Gracefully degrade
  return { error: "Feature not available" }
}
```

**교훈**:
- Optional feature는 optional dependency로
- Dynamic import + try-catch로 런타임 체크
- Graceful degradation 패턴 중요

---

### 🐛 Issue #4: Supabase Storage 권한 문제 (예상)

**미래에 발생할 수 있는 이슈**:

**문제**:
- Storage bucket 'portfolios' 생성 안됨
- 또는 Public access 설정 안됨

**해결 방법**:
1. Supabase Dashboard → Storage
2. Create Bucket: `portfolios`
3. Public bucket 체크박스 ON
4. RLS 정책 추가 (필요시)

**미리 준비한 것**:
```typescript
if (uploadError) {
  console.error("Upload error:", uploadError)
  return NextResponse.json({
    error: "Upload failed: " + uploadError.message
  }, { status: 500 })
}
```

---

## 기술 스택 및 아키텍처

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (상태 관리)

### Backend & Database
- **Supabase** (PostgreSQL)
  - Database: 포트폴리오 콘텐츠
  - Storage: PDF 파일
  - RLS: Row Level Security
- **Vercel** (호스팅)

### AI & Integration
- **OpenAI GPT-4**
  - 콘텐츠 개선
  - 번역
  - 컨텍스트 기반 생성
- **pdf-parse** (Optional)
  - PDF 텍스트 추출

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  About   │  │Experience│  │ Projects │              │
│  │  Page    │  │  Page    │  │   Page   │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │              │                     │
│       └─────────────┴──────────────┘                     │
│                     │                                    │
│              ┌──────▼──────┐                            │
│              │ Zustand     │                            │
│              │ Stores      │                            │
│              └──────┬──────┘                            │
└──────────────────────┼──────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼────┐   ┌───▼────┐   ┌───▼────┐
    │ Supabase│   │  GPT-4 │   │ Vercel │
    │         │   │   API  │   │Hosting │
    │ ┌─────┐ │   │        │   └────────┘
    │ │ DB  │ │   │ - 개선 │
    │ └─────┘ │   │ - 번역 │
    │ ┌─────┐ │   └────────┘
    │ │Store│ │
    │ └─────┘ │
    └─────────┘
```

### 데이터 흐름

1. **사용자 입력** → Zustand Store (클라이언트)
2. **저장 버튼** → API Route → Supabase (서버)
3. **AI 개선** → GPT-4 API → 양방향 언어 DB 저장
4. **PDF 업로드** → Supabase Storage → Public URL
5. **PDF 다운로드** → Storage URL 조회 → 직접 다운로드

---

## 다음 단계

### 필수 작업

1. **Supabase Storage Bucket 생성**
   - Bucket 이름: `portfolios`
   - Public access 활성화
   - RLS 정책 설정

2. **AI 컨텍스트 테스트**
   - 실제 이력서 PDF 업로드
   - 생성된 콘텐츠 품질 확인
   - 프롬프트 튜닝

3. **번역 마이그레이션 실행**
   - 기존 한국어 데이터 영어 번역
   - 결과 검토 및 수정

### 개선 아이디어

1. **AI 사용량 모니터링**
   - OpenAI API 비용 추적
   - 사용 횟수 제한 (rate limiting)

2. **PDF 버전 관리**
   - 이전 버전 PDF 보관
   - 버전별 다운로드 가능

3. **SEO 최적화**
   - 메타 태그 추가
   - Open Graph 이미지
   - Sitemap 생성

4. **분석 도구 추가**
   - Google Analytics
   - 다운로드 추적
   - 페이지 체류 시간

---

## 회고

### 잘한 점

1. **사용자 피드백 즉각 반영**
   - "번역이 이상해" → 즉시 양방향 동기화 구현
   - "pdf 디자인" → 당일 완전 재작성

2. **확장 가능한 설계**
   - JSONB로 설정 저장 → 스키마 변경 없이 기능 추가
   - Optional dependency → 빌드 실패 방지

3. **문서화**
   - 코드 주석 충실
   - 작업 일지 작성
   - 트러블슈팅 기록

### 아쉬운 점

1. **테스트 부족**
   - Unit test 없음
   - E2E test 없음
   - 수동 테스트에만 의존

2. **에러 처리 일관성**
   - 어떤 API는 자세한 에러, 어떤 API는 간단한 에러
   - 에러 형식 표준화 필요

3. **타입 안정성**
   - `any` 타입 일부 사용
   - 더 strict한 타입 정의 필요

### 기술적 성장

1. **Supabase 마스터**
   - Storage, Database, RLS 모두 활용
   - PostgreSQL JSONB 이해

2. **AI 통합 경험**
   - GPT-4 API 활용
   - 프롬프트 엔지니어링
   - 비용 최적화

3. **풀스택 개발**
   - Next.js App Router
   - API Routes
   - 상태 관리 (Zustand)
   - 배포 (Vercel)

---

## 마무리

이번 프로젝트를 통해 단순히 포트폴리오 웹사이트를 만드는 것을 넘어서, **AI 기반 콘텐츠 관리 시스템**을 구축했습니다.

특히 인상적이었던 점:
- **사용자 중심 설계**: 면접관이 원하는 형태의 PDF 제공
- **AI 활용**: 반복적인 작업을 자동화하면서도 개인화 유지
- **확장성**: 새로운 기능 추가가 쉬운 구조

5년차 QA 엔지니어로서 배운 **품질**과 **사용자 중심 사고**가 개발에도 그대로 적용되었습니다.

---

**작성일**: 2024년
**작성자**: 고아현 (Sophia Ko)
**프로젝트 저장소**: [GitHub](https://github.com/ko5439625/sophia.ko)
