# Sophia Ko - QA Engineer Portfolio

5년 경력의 Senior QA Engineer 고아현의 포트폴리오 웹사이트입니다.

## 주요 기능

- ✅ 한국어/영어 지원
- ✅ 관리자 모드로 실시간 콘텐츠 편집
- ✅ Supabase를 통한 데이터 영구 저장
- ✅ 프로필 이미지 업로드 및 크롭 기능
- ✅ AI 기반 자동 콘텐츠 생성
- ✅ 15개 프로젝트 포트폴리오
- ✅ 반응형 디자인

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **UI 컴포넌트**: Radix UI
- **데이터베이스**: Supabase (PostgreSQL)
- **스토리지**: Supabase Storage
- **배포**: Vercel

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 설정

자세한 설정 방법은 [SETUP.md](./SETUP.md)를 참고하세요.

간단 요약:
1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. `supabase-schema.sql` 실행하여 테이블 생성
3. Storage 버킷 `profile-images` 생성
4. `.env.local` 파일에 환경 변수 설정

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인

### 4. 관리자 모드

1. 홈페이지에서 "sophia.ko" 이름을 10번 클릭
2. 로그인:
   - ID: `sophia.ko`
   - Password: `aaaa1111`
3. 페이지의 텍스트를 클릭하여 편집

## 프로젝트 구조

```
├── app/                    # Next.js App Router 페이지
│   ├── about/             # About 페이지
│   ├── experience/        # Experience 페이지
│   ├── blog/              # Blog 페이지
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
│   ├── admin-bar.tsx     # 관리자 모드 바
│   └── editable-field.tsx # 편집 가능한 필드
├── lib/                   # 유틸리티 및 헬퍼
│   ├── supabase/         # Supabase 클라이언트
│   ├── content-store.ts  # 콘텐츠 관리
│   └── profile-image-store.ts # 이미지 관리
├── public/                # 정적 파일
└── supabase-schema.sql   # 데이터베이스 스키마
```

## 주요 파일

- `supabase-schema.sql`: 데이터베이스 테이블 스키마
- `seed-projects.sql`: 프로젝트 데이터 (한국어)
- `seed-projects-en.sql`: 프로젝트 데이터 (영어)
- `SETUP.md`: 상세 설정 가이드

## 배포

### Vercel 배포

1. GitHub에 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 배포 완료!

## 프로젝트 하이라이트

이 포트폴리오에는 다음 프로젝트들이 포함되어 있습니다:

1. **AI 기반 JIRA 버그 리포팅 시스템** - RAG 기반 자동 버그 작성
2. **Excel Diff Viewer** - Perforce 연동 Excel 비교 도구
3. **BM 테이블 검증 & 확률 검증 자동화**
4. **JIRA 데이터 분석 & 성과 대시보드**
5. **Excel to JIRA / JIRA to JIRA 이관 툴**
6. **Confluence 자동 업로드** - Claude Skill 활용
7. **게임 QA 방법론 & 프로세스**
8. AI 학습 및 도구 활용 경험 (6개 항목)
9. HTML 기반 문서 제작
10. AI × QA 비전

자세한 내용은 [프로젝트 문서](./ahyun_learning_chunks_v3.md)를 참고하세요.

## 라이선스

© 2026 Ko Ah-hyun (Sophia Ko). All rights reserved.

## 문의

- Email: sophia.ko@email.com
- GitHub: [github.com/sophia-ko](https://github.com/sophia-ko)
- LinkedIn: [linkedin.com/in/sophia-ko](https://linkedin.com/in/sophia-ko)
