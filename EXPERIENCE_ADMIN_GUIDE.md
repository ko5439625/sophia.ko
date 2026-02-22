# Experience 페이지 관리자 기능 가이드

## ✅ 완료된 기능

### 1. 원래 디자인 복원 ✅
- 탭 네비게이션 (둥근 박스 안에 개요/프로젝트/비전)
- Overview 탭: Summary, 핵심 강점, 핵심 성과, 타임라인, 기술 스택, 자격증
- Projects 탭: 회사별 그룹화 + 접기/펴기 효과
- Vision 탭: 철학 인용구, QA 접근 방식, Value Cards, 3단계 로드맵, R&D 관심 분야

### 2. Supabase 연동 ✅
- `experience_data` 테이블에서 모든 동적 데이터 로드
- Timeline, Highlights, Metrics, Skills, Certifications, Approach 데이터 동적으로 관리
- 페이지 로드 시 자동으로 Supabase에서 데이터 가져오기
- 언어 변경 시 자동으로 해당 언어 데이터 로드

### 3. 관리자 UI - "+ 추가" 버튼 ✅
**Overview 탭:**
- ✅ 타임라인 "+ 년도 추가" 버튼
- ✅ 핵심 강점 "+ 강점 추가" 버튼
- ✅ 핵심 성과 "+ 성과 추가" 버튼
- ✅ 자격증 "+ 자격증 추가" 버튼

**Projects 탭:**
- ✅ 타임라인 "+ 년도 추가" 버튼 (회사 타임라인용)

### 4. CRUD 기능 ✅
- ✅ **추가**: 각 섹션마다 "+ 추가" 버튼 클릭 → 모달 폼 → Supabase에 저장
- ✅ **수정**: 항목에 마우스 hover → 파란색 연필 아이콘 클릭 → 모달에서 수정
- ✅ **삭제**: 항목에 마우스 hover → 빨간색 휴지통 아이콘 클릭 → 확인 후 삭제
- ✅ **자동 새로고침**: 추가/수정/삭제 후 자동으로 화면 업데이트

### 5. AddItemModal 컴포넌트 ✅
- 동적 폼 생성 (itemType에 따라 다른 필드 표시)
- Timeline: 년도, 직책, 회사, 포커스
- Highlight: 제목, 설명, 임팩트
- Metric: 레이블, 값, 설명
- Certification: 자격증명, 발급기관, 취득년도
- 한/영 언어 자동 전환

## 📝 사용 방법

### 관리자 모드 진입
1. 왼쪽 하단 "Admin Login" 클릭
2. 비밀번호 입력 (기본값: admin)
3. "Admin Mode" 활성화

### 새 항목 추가
1. Overview 탭 → 원하는 섹션의 "+ 추가" 버튼 클릭
2. 모달 팝업에서 정보 입력
3. "저장" 클릭
4. Supabase에 자동 저장되고 즉시 화면에 표시

### 항목 수정
1. 수정하려는 항목에 마우스 hover
2. 파란색 연필 아이콘 클릭
3. 모달에서 내용 수정
4. "저장" 클릭

### 항목 삭제
1. 삭제하려는 항목에 마우스 hover
2. 빨간색 휴지통 아이콘 클릭
3. 확인 팝업에서 "확인" 클릭
4. Supabase에서 삭제되고 화면에서 제거

## 🔧 기술 세부사항

### 파일 구조
- `app/experience/page.tsx` - 메인 Experience 페이지 (모든 CRUD 로직 포함)
- `components/add-item-modal.tsx` - 추가/수정 모달 컴포넌트
- `lib/experience-store.ts` - Supabase CRUD 헬퍼 함수
- `supabase/migrations/create-experience-data.sql` - DB 스키마 및 시드 데이터

### 데이터 구조
```typescript
interface ExperienceData {
  id: string
  user_id: string
  language: 'ko' | 'en'
  data_type: 'timeline' | 'highlight' | 'metric' | 'skill' | 'certification' | 'approach'
  content: Record<string, any>
  display_order: number
  created_at?: string
  updated_at?: string
}
```

### 상태 관리
- 각 data_type별로 useState로 관리
- loadAllExperienceData() 함수로 모든 데이터 병렬 로드
- 언어 변경 시 자동으로 해당 언어 데이터 로드
- 추가/수정/삭제 후 자동으로 데이터 reload

## 🚀 다음 단계 (선택사항)

### A. 순서 변경 기능
- [ ] 드래그 앤 드롭으로 항목 순서 변경
- [ ] ↑↓ 버튼으로 순서 변경
- [ ] display_order 필드 업데이트

### B. Tech Stack 관리
- [ ] 기술 스택 추가/삭제 UI
- [ ] 카테고리별 관리

### C. Projects 관리
- [ ] "+ 회사 추가" 버튼
- [ ] "+ 프로젝트 추가" 버튼
- [ ] 프로젝트 상세 정보 수정

### D. Vision 탭 관리
- [ ] QA 접근 방식 추가/삭제
- [ ] Value Cards 관리
- [ ] R&D 관심 분야 관리

