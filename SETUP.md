# 포트폴리오 Supabase 설정 가이드

이 가이드는 포트폴리오 사이트에서 수정한 내용과 이미지를 Supabase에 저장하는 방법을 설명합니다.

## 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입/로그인
2. "New Project" 클릭
3. 프로젝트 이름 입력 (예: sophia-ko-portfolio)
4. 데이터베이스 비밀번호 설정 (안전한 곳에 저장!)
5. 리전 선택 (Northeast Asia (Seoul) 권장)
6. "Create new project" 클릭

## 2. 데이터베이스 테이블 생성

1. Supabase 대시보드에서 **SQL Editor** 클릭
2. "New query" 클릭
3. `supabase-schema.sql` 파일의 내용을 복사하여 붙여넣기
4. "Run" 버튼 클릭하여 실행

이렇게 하면 다음 테이블들이 생성됩니다:
- `portfolio_content`: 텍스트 콘텐츠 저장
- `profile_images`: 프로필 이미지 및 크롭 설정 저장
- `projects`: 프로젝트 데이터 저장

## 3. Storage Bucket 생성

1. Supabase 대시보드에서 **Storage** 클릭
2. "Create a new bucket" 클릭
3. 다음 정보 입력:
   - Name: `profile-images`
   - Public bucket: ✅ (체크)
4. "Create bucket" 클릭

### Storage 정책 설정

생성한 `profile-images` 버킷을 클릭한 후:

1. "Policies" 탭 클릭
2. "New policy" 클릭
3. "For full customization" 선택

**읽기 정책 (Public Read Access):**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');
```

**쓰기 정책 (Public Upload Access - 나중에 인증으로 변경 권장):**
```sql
CREATE POLICY "Public upload access"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-images');
```

**업데이트 정책:**
```sql
CREATE POLICY "Public update access"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-images');
```

**삭제 정책:**
```sql
CREATE POLICY "Public delete access"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-images');
```

## 4. 프로젝트 데이터 삽입 (선택사항)

프로젝트 데이터를 미리 넣고 싶다면:

1. SQL Editor에서 새 쿼리 생성
2. `seed-projects.sql` (한국어) 또는 `seed-projects-en.sql` (영어) 파일 내용 복사
3. 붙여넣고 "Run" 실행

## 5. 환경 변수 설정

1. Supabase 대시보드에서 **Settings** > **API** 클릭
2. 다음 값들을 복사:
   - Project URL
   - `anon` `public` key

3. 프로젝트 루트에 `.env.local` 파일 생성:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **중요**: `.env.local` 파일은 절대 Git에 커밋하지 마세요! (이미 `.gitignore`에 포함되어 있습니다)

## 6. 로컬에서 테스트

```bash
# 의존성 설치 (아직 안 했다면)
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000/about` 접속

## 7. 관리자 모드로 테스트

1. 홈페이지에서 "sophia.ko" 이름을 10번 클릭
2. 관리자 바가 나타나면 로그인:
   - ID: `sophia.ko`
   - Password: `aaaa1111`
3. About 페이지에서 텍스트 클릭하여 수정
4. 프로필 이미지 업로드
5. 페이지 새로고침하여 데이터가 유지되는지 확인

## 8. Vercel 배포 설정

Vercel에 배포할 때 환경 변수 설정:

1. Vercel 대시보드에서 프로젝트 선택
2. **Settings** > **Environment Variables** 클릭
3. 다음 변수들 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
4. "Save" 클릭
5. 프로젝트 재배포

## 트러블슈팅

### 데이터가 저장되지 않아요

1. 브라우저 콘솔(F12)을 열어 에러 메시지 확인
2. Supabase 프로젝트 URL과 anon key가 올바른지 확인
3. `.env.local` 파일이 프로젝트 루트에 있는지 확인
4. 개발 서버를 재시작 (`npm run dev`)

### 이미지가 업로드되지 않아요

1. Storage 버킷 이름이 `profile-images`인지 확인
2. 버킷이 Public으로 설정되어 있는지 확인
3. Storage 정책이 올바르게 설정되어 있는지 확인

### 브라우저 콘솔 에러: "relation does not exist"

- 테이블이 생성되지 않은 것입니다
- `supabase-schema.sql` 파일을 다시 실행하세요

## 추가 보안 설정 (프로덕션 환경)

현재 설정은 누구나 데이터를 수정할 수 있습니다. 프로덕션 환경에서는 다음을 권장합니다:

1. **Supabase Auth 설정**: 실제 사용자 인증 구현
2. **Row Level Security (RLS) 강화**: 인증된 사용자만 수정 가능하도록
3. **Admin 비밀번호 변경**: `lib/admin-context.tsx`에서 비밀번호 변경

## 문의

문제가 발생하면 다음을 확인하세요:
- [Supabase 문서](https://supabase.com/docs)
- [Next.js + Supabase 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
