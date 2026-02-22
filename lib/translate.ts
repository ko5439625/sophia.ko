// Simple translation utility with caching
// DB에는 한국어만 저장하고, 영어는 실시간으로 번역

const translationCache = new Map<string, string>()

// 간단한 번역 매핑 (자주 사용되는 용어들)
const commonTranslations: Record<string, string> = {
  // 직책/역할
  "시니어 QA 엔지니어": "Senior QA Engineer",
  "QA 엔지니어": "QA Engineer",
  "QA 리드": "QA Lead",
  "테스트 엔지니어": "Test Engineer",
  "소프트웨어 엔지니어": "Software Engineer",
  "프론트엔드 개발자": "Frontend Developer",
  "백엔드 개발자": "Backend Developer",
  "풀스택 개발자": "Full Stack Developer",

  // 회사 관련
  "회사": "Company",
  "프로젝트": "Project",
  "기간": "Period",
  "팀": "Team",
  "부서": "Department",
  "조직": "Organization",

  // 기술 관련
  "테스트 자동화": "Test Automation",
  "성능 테스팅": "Performance Testing",
  "보안 테스팅": "Security Testing",
  "API 테스팅": "API Testing",
  "모바일 테스팅": "Mobile Testing",
  "웹 테스팅": "Web Testing",
  "E2E 테스팅": "E2E Testing",
  "단위 테스트": "Unit Testing",
  "통합 테스트": "Integration Testing",
  "회귀 테스트": "Regression Testing",
  "부하 테스트": "Load Testing",
  "스트레스 테스트": "Stress Testing",

  // 일반 용어
  "개요": "Overview",
  "프로젝트 배경": "Project Background",
  "주요 성과": "Key Achievements",
  "기술 스택": "Tech Stack",
  "핵심 강점": "Key Strengths",
  "핵심 성과": "Key Metrics",
  "전문 자격증": "Certifications",
  "타임라인": "Timeline",
  "비전": "Vision",
  "핵심 가치": "Core Values",
  "비전 로드맵": "Vision Roadmap",
  "경력": "Experience",
  "학력": "Education",
  "자격증": "Certification",
  "수상": "Awards",
  "언어": "Languages",
  "기술": "Skills",
  "도구": "Tools",

  // 동사/동작
  "개발": "Development",
  "개발했습니다": "Developed",
  "구축": "Build",
  "구축했습니다": "Built",
  "향상": "Improvement",
  "향상시켰습니다": "Improved",
  "달성": "Achievement",
  "달성했습니다": "Achieved",
  "감소": "Reduction",
  "감소시켰습니다": "Reduced",
  "증가": "Increase",
  "증가시켰습니다": "Increased",
  "설계": "Design",
  "설계했습니다": "Designed",
  "구현": "Implementation",
  "구현했습니다": "Implemented",
  "최적화": "Optimization",
  "최적화했습니다": "Optimized",
  "관리": "Management",
  "관리했습니다": "Managed",
  "리드": "Lead",
  "리드했습니다": "Led",
  "협업": "Collaboration",
  "협업했습니다": "Collaborated",

  // 성과 관련
  "버그": "Bugs",
  "이슈": "Issues",
  "개선": "Improvements",
  "효율성": "Efficiency",
  "생산성": "Productivity",
  "품질": "Quality",
  "안정성": "Stability",
  "신뢰성": "Reliability",
  "성능": "Performance",
  "속도": "Speed",
  "시간": "Time",
  "비용": "Cost",
  "만족도": "Satisfaction",

  // 측정 단위
  "배": "times",
  "개": "items",
  "건": "cases",
  "명": "people",
  "년": "years",
  "개월": "months",
  "주": "weeks",
  "일": "days",
}

/**
 * 한국어 텍스트를 영어로 번역
 * @param text 한국어 텍스트
 * @param useCache 캐시 사용 여부 (기본값: true)
 * @returns 영어 번역 텍스트
 */
export async function translateToEnglish(text: string, useCache: boolean = true): Promise<string> {
  if (!text || text.trim() === "") return text

  // 캐시 확인
  if (useCache && translationCache.has(text)) {
    return translationCache.get(text)!
  }

  // 일반 매핑에서 찾기
  if (commonTranslations[text]) {
    const translated = commonTranslations[text]
    translationCache.set(text, translated)
    return translated
  }

  // Google Translate API 사용 (클라이언트 사이드)
  try {
    const translated = await translateWithGoogle(text)
    if (useCache) {
      translationCache.set(text, translated)
    }
    return translated
  } catch (error) {
    console.error("Translation error:", error)
    return text // 번역 실패 시 원문 반환
  }
}

/**
 * Google Translate API를 사용한 번역
 */
async function translateWithGoogle(text: string): Promise<string> {
  try {
    // Google Translate API는 CORS 문제가 있을 수 있으므로
    // MyMemory Translation API를 대신 사용 (무료, CORS 지원)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ko|en`

    const response = await fetch(url)
    const data = await response.json()

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }

    throw new Error("Translation API failed")
  } catch (error) {
    console.error("Google Translate error:", error)
    throw error
  }
}

/**
 * 객체의 모든 문자열 값을 번역
 */
export async function translateObject<T extends Record<string, any>>(
  obj: T,
  fieldsToTranslate: string[]
): Promise<T> {
  const translated = { ...obj }

  for (const field of fieldsToTranslate) {
    if (typeof translated[field] === "string") {
      translated[field] = await translateToEnglish(translated[field])
    } else if (Array.isArray(translated[field])) {
      // 배열인 경우 각 항목을 번역
      translated[field] = await Promise.all(
        translated[field].map((item: any) =>
          typeof item === "string" ? translateToEnglish(item) : item
        )
      )
    }
  }

  return translated
}

/**
 * 배열의 모든 객체를 번역
 */
export async function translateArray<T extends Record<string, any>>(
  array: T[],
  fieldsToTranslate: string[]
): Promise<T[]> {
  return Promise.all(
    array.map(item => translateObject(item, fieldsToTranslate))
  )
}

/**
 * 번역 캐시 초기화
 */
export function clearTranslationCache() {
  translationCache.clear()
}

/**
 * 특정 번역을 캐시에 추가
 */
export function addToTranslationCache(korean: string, english: string) {
  translationCache.set(korean, english)
}
