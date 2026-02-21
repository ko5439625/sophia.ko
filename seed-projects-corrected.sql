-- Insert projects data from ahyun_learning_chunks_v3.md
-- Korean version

-- Project 1: AI JIRA Bug Reporting System
INSERT INTO projects (user_id, language, project_id, title, category, overview, background, tech_stack, display_order, details) VALUES
('sophia.ko", 'ko", 'ai-jira-bug-reporting", 'AI 기반 JIRA 버그 리포팅 시스템", 'project',
'JIRA 클라우드의 느린 접속 속도와 접속 오류 문제를 해결하기 위해 개발한 Streamlit 기반 미러링 사이트. JIRA 데이터를 로컬에서 빠르게 조회하면서, RAG 기반 AI 버그 자동 작성 기능까지 통합.',
'JIRA 클라우드 접속 문제: 팀 전체가 공감하는 느린 속도와 잦은 접속 오류. 버그 등록 시 접속까지 오래 걸리고 접속 실패도 빈번. 미러링 사이트 기획 → 등록 표준화 → 편리함 확보가 시작점',
ARRAY['Python", 'Streamlit", 'OpenAI API", 'JIRA REST API", 'Chroma DB", 'OpenAI Embedding'],
1,
jsonb_build_object(
  'key_features', jsonb_build_array(
    'JIRA 클라우드 미러링 (빠른 조회)',
    '미러링 → JIRA 자동 동기화 (버그 등록)',
    'RAG 기반 버그 자동 작성',
    '컴포넌트별 패턴 분석',
    '벡터 검색 추가 (Chroma DB + OpenAI Embedding 하이브리드)',
    '프로젝트 특이사항 주입'
  ),
  'achievements', jsonb_build_array(
    'AI 작성 결과의 약 85% 수준 유지 (수정 비율 약 15%)',
    '팀에서 사용 중, 인프라팀을 통해 타 프로젝트 사용 대기',
    'Knowledge Base: 3,000건 분석 → 컴포넌트별 키워드/재현스텝/기대결과 패턴화',
    'Few-shot Learning: 팀원 작성 버그 20건 분석 → 작성 스타일/톤/포맷 추출'
  ),
  'rag_architecture", '버그 작성 요청 → 3000개 버그 DB에서 유사 버그 검색 (키워드 매칭 + 벡터 유사도) → 검색된 과거 버그 + 팀 스타일 + 프로젝트 정보 → GPT에 전달 → GPT가 맥락 이해하고 버그 리포트 생성 → 미러링 사이트에서 확인/수정 → JIRA에 자동 동기화'
)
);

-- Project 2: Excel Diff Viewer
INSERT INTO projects (user_id, language, project_id, title, category, overview, background, tech_stack, display_order, details) VALUES
('sophia.ko", 'ko", 'excel-diff-viewer", 'Excel Diff Viewer (GGM-Diff / heungum)", 'project',
'Perforce에서 관리되는 Excel 테이블 파일의 리비전 간 변경사항을 시각적으로 비교하는 QA 전용 도구. Beyond Compare를 대체하며, 하루 수십 번 사용하는 핵심 업무 도구.',
'P4V 기본 Diff: Excel은 바이너리라 실질적 비교 불가. Beyond Compare: 회사 정책상 사용 불가. 수동 비교: 파일당 10~20분, 휴먼 에러 발생',
ARRAY['Python", 'CustomTkinter", 'openpyxl", 'pandas", 'PyInstaller", 'Perforce p4python'],
2,
jsonb_build_object(
  'key_features', jsonb_build_array(
    'Perforce 자동 연동 (p4python)',
    '파일 트리 및 검색',
    '리비전 히스토리 조회',
    '2-Way Diff 비교 (키 컬럼 기준)',
    '색상 하이라이팅 (추가: 초록, 삭제: 빨강, 수정: 노랑)',
    '변경사항만 보기 / 전체 보기 토글',
    'Excel 내보내기',
    '접기/펴기 기능',
    '시트 선택 기능',
    '키 컬럼 자동 감지 + 수동 지정'
  ),
  'achievements', jsonb_build_array(
    '검증 시간: 파일당 10~20분 → 1분 (90% 감소)',
    '정확도: 100% (휴먼 에러 제거)',
    '하루 처리 가능 파일 수: 3배 증가',
    'Beyond Compare 대체 (유료 도구 비용 절감)',
    'WIKI 문서화로 전사 공유'
  ),
  'usage", '사용 프로젝트: 호연(BSS), BSH(브레이커스), AION2 / 하루에 수십 번 사용',
  'development_approach", '메인 개발 및 개선: 아현 (혼자 설계/구현) / 피드백: 동료들이 실사용하면서 피드백 / 실사용 피드백 루프로 지속 개선'
)
);

-- Project 3: BM Table Validation & Probability Verification
INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko", 'ko", 'bm-table-validation", 'BM 테이블 검증 & 확률 검증 자동화", 'project',
'Excel Diff Viewer의 확장 기능으로, BM(Business Model) 테이블 데이터의 유효성 검증과 확률형 아이템 확률 검증을 자동화.',
NULL,
ARRAY['Python", 'openpyxl", 'pandas'],
3,
jsonb_build_object(
  'validation_targets', jsonb_build_array(
    '상점 패키지 (가격/구성품)',
    '가챠 확률 테이블',
    '이벤트 보상 테이블'
  ),
  'key_features', jsonb_build_array(
    '기획서(Excel) vs 테이블 비교',
    '확률 총합 100% 검증',
    'UI에서 바로 확인 (하이라이팅)',
    'API 호출 웹사이트에서 박스 아이템 구성품 확률 확인',
    '등급별 확률 분포 분석',
    '불일치 발견 시 JIRA 이슈 등록'
  ),
  'achievements", '실제로 라이브에 잘못된 값이 나간 적 있음 → 이 도구의 필요성 확인 / 수작업 검증 시 누락/오류 위험 제거',
  'usage", '호연(BSS)에서 적용, 주로 아현 본인이 사용'
)
);

-- Project 4: JIRA Data Analysis & Performance Dashboard
INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko", 'ko", 'jira-dashboard", 'JIRA 데이터 분석 & 성과 대시보드", 'project',
'JIRA REST API로 버그 데이터를 가져와 QA 성과를 수치화하는 Streamlit 웹앱.',
'호연, BSH 프로젝트에서 인원 변동(8명→4명)으로 버그 추적이 어려운 상황 발생. 평가 시즌에 바로 성과 수치 확인 가능',
ARRAY['Python", 'Streamlit", 'JIRA REST API'],
4,
jsonb_build_object(
  'analysis_sections', jsonb_build_array(
    '버그 발견 수: 팀 전체 대비 개인 등록 버그 비율',
    '버그 중요도: S1~S2 고위험 버그 수',
    '버그 Fix율: S1~S2 중 Fixed된 비율',
    '버그 보고서 품질: 유효 등록 버그 수, Summary 길이, 키워드 체크'
  ),
  'personal_achievements', jsonb_build_object(
    'total_bugs", '팀 전체 11,053건 중 개인 3,184건 등록 (28.8%)',
    'severity", '심각도 높은 이슈 42% 비중'
  ),
  'projects': '프로젝트: BSH, BSS, BR (호연) / 기간: 2023/11 ~ 2025/11',
  'usage': '평가 때, 버그 추적 필요할 때 간헐적 사용'
)
);

-- Project 5: Excel to JIRA / JIRA to JIRA Migration Tool
INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko", 'ko", 'jira-migration-tool", 'Excel to JIRA / JIRA to JIRA 이관 툴", 'project',
'Excel에서 JIRA로, 또는 JIRA 프로젝트 간 이슈를 자동으로 이관하는 도구. 단기 테스터나 권한 없는 사용자의 버그를 QA가 검수 후 일괄 등록.',
NULL,
ARRAY['Python", 'JIRA REST API", 'openpyxl'],
5,
jsonb_build_object(
  'use_cases', jsonb_build_object(
    'excel_to_jira", '단기 테스터나 JIRA 권한이 없는 사람 → Excel에 버그 선등록 → QA 확인/검수 → 툴로 일괄 등록',
    'jira_to_jira", '테스트의 날 행사 - 타 프로젝트 QA들이 전용 JIRA에 등록 → 우리 프로젝트 JIRA로 이관'
  ),
  'achievements', jsonb_build_array(
    '수작업: 한 건당 5~10분 × 100건 = 8~16시간',
    '자동화: 수 분 내 완료',
    '100건 이상 JIRA에 일괄 등록 가능'
  )
)
);

-- Project 6: Confluence Auto-Upload with Claude Skill
INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko", 'ko", 'confluence-auto-upload", 'Claude Skill로 위키(Confluence) 자동 업로드", 'project',
'Claude Code에서 코드 수정 후 "오늘 업데이트 사항 위키 작성해줘"만 입력하면 Confluence 위키 문서가 자동 생성되는 플로우. 실제 실무에서 사용 중.',
'Excel Diff Viewer 업데이트 노트를 개인 Confluence에 자동 업로드하여 문서화 부담 감소',
ARRAY['Claude Code", 'MCP", 'Confluence API", 'Git/Perforce'],
6,
jsonb_build_object(
  'components', jsonb_build_object(
    'SKILL_md", '제목 포맷: v{버전} 업데이트 노트 (날짜) / 카테고리: [추가], [수정], [버그픽스] 분류',
    'MCP", 'Claude가 위키 API를 직접 호출 / ADF (Atlassian Document Format) JSON 포맷',
    'Claude_Code", 'Git/Perforce 변경사항 자동 분석 / SKILL.md 규칙 참조하여 작성'
  ),
  'achievements', jsonb_build_array(
    '작성 시간: 10~15분 → 1분',
    '포맷 일관성 확보',
    '변경사항 누락 방지'
  ),
  'status': '실제 실무에서 사용 중'
)
);

-- Project 7: Game QA Methodology & Process
INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko", 'ko", 'qa-methodology", '게임 QA 방법론 & 프로세스 (효율화 중심)", 'methodology',
'인게임 QA보다는 효율화/인프라 구축/자동화/프로세스 표준화에 집중한 QA 방법론.',
NULL,
ARRAY['Data Analysis", 'Process Design", 'Automation'],
7,
jsonb_build_object(
  'methodologies', jsonb_build_object(
    '로그 기반 QA", '사용자 진행률/이탈 포인트 데이터 분석 / 데이터 기반 콘텐츠 개선 제안 (호연 라이브)',
    'SET팀 협업", '보스 보상 드랍 리포트 체계 구축 / 고객 제보 대응 리소스 월 5~10건 → 0건 (완전 자동화)',
    '확률 검증 자동화", 'API 로그 기반 확률 데이터 추출 → 자동 검증 체계',
    '게임 구조 분해 분석", '3단계 레이어 구조: Smoke Test → 상세 기능 → 사용성/경험 품질 / BSH 5층 시스템 분류 + 의존성 매트릭스 (매칭률 95~98%)',
    '론칭 QA 경험", 'FGT 수행 / 정기 점검 QA / ESG 검증 / iOS/AOS 플랫폼 심사 대응 가이드 문서 제작'
  ),
  'philosophy", 'QA 핵심 목표 = "완벽한 품질"이 아닌 "비용-효율 최적화된 품질 보증" / 적정 품질에서 적시 출시가 수익 극대화 전략',
  'ai_tools", 'GPT 기반 체크리스트 자동 생성: 기획서 업로드 → GPT 분석 → 체크리스트 자동 생성 / 작성 시간 5시간 → 1시간 (80% 단축)',
  'mentoring", '신규 입사자 멘토링: 교육 자료 개발 / 적응 기간 50% 단축 / 멘티 만족도 95% / 정착률 100%'
)
);

-- AI Learning 1-6
INSERT INTO projects (user_id, language, project_id, title, category, overview, display_order, details) VALUES
('sophia.ko", 'ko", 'ai-tools-ecosystem", 'AI 개발 도구 생태계 & 비용 최적화", 'ai_learning',
'v0, Lovable, Bolt.new, Cursor, Claude Code 등 AI 개발 도구 생태계 학습 및 비용 최적화 전략 수립',
8,
jsonb_build_object(
  'tools', jsonb_build_object(
    'v0", '프론트엔드 특화, React/Next.js 코드 생성',
    'Lovable", '풀스택 앱 빌드, Supabase 연동',
    'Bolt_new", '브라우저 내 풀스택 개발 환경',
    'Cursor", 'AI 코드 에디터',
    'Claude_Code", 'CLI 기반 에이전틱 코딩'
  ),
  'cost_comparison', jsonb_build_object(
    'Claude_Pro", '$20/월 (Sonnet만)',
    'Claude_Max_5x", '$100/월 (Opus 접근, 5배 사용량)',
    'Claude_Max_20x", '$200/월 (무제한급)'
  ),
  'strategy", '즉시 응답 모델 (Sonnet): 단순 코드 작성, 빠른 반복 / 추론 에이전트 (Opus): 복잡한 설계, 아키텍처 결정'
)
),
('sophia.ko", 'ko", 'mcp-learning", 'MCP 학습 & 활용", 'ai_learning',
'Model Context Protocol을 활용한 Claude와 외부 서비스 연결. Confluence, JIRA, 로컬 파일 등에 접근 가능.',
9,
jsonb_build_object(
  'overview", 'Claude와 외부 서비스를 연결하는 프로토콜 / 로컬 파일, API, 데이터베이스 등에 접근 가능',
  'applications', jsonb_build_array(
    'Confluence MCP: 위키 자동 작성 (구현 완료, 실무 사용 중)',
    'JIRA REST API: 이슈 관리 자동화',
    '로컬 파일 MCP: Perforce 로그, 빌드 결과 분석'
  )
)
),
('sophia.ko", 'ko", 'claude-workflow", 'Claude Code 워크플로우 자동화", 'ai_learning',
'Boris Cherny 워크플로우 핵심을 학습하고 실무에 적용. Plan Mode, Slash Commands, Subagents 활용.',
10,
jsonb_build_object(
  'boris_workflow', jsonb_build_object(
    '병렬 세션", '터미널 5개 + claude.ai 5~10개 동시 운영',
    'Plan_Mode", '계획 확정 후 auto-accept',
    'CLAUDE_md", 'git 관리로 팀 공유',
    'Slash_Commands", '/commit-push-pr 등',
    'Subagents", 'code-simplifier, verify-app 특화',
    '검증 피드백 루프", '최종 결과 품질 2~3배 향상'
  ),
  'cowork", 'Claude Code 에이전트 아키텍처를 비개발자도 사용 가능하게 확장'
)
),
('sophia.ko", 'ko", 'ai-frameworks", 'AI 프레임워크 & 기술 스택", 'ai_learning',
'RAG, LangChain, LlamaIndex, Chroma DB, DSPy 등 AI 프레임워크 학습 및 실무 적용.',
11,
jsonb_build_object(
  'frameworks', jsonb_build_object(
    'RAG", 'JIRA 버그 리포팅에 적용',
    'LangChain_LlamaIndex", 'LLM 앱 프레임워크',
    'Chroma_DB", '로컬 벡터 DB (실제 적용)',
    'DSPy", '답변 품질 최적화'
  )
)
),
('sophia.ko", 'ko", 'ai-trends-research", 'AI 도구 트렌드 리서치", 'ai_learning',
'Playwright, Flutter, AutoHotkey, OCR 등 최신 AI 도구 트렌드 리서치 및 실험.',
12,
jsonb_build_object(
  'research_areas', jsonb_build_array(
    'Playwright CLI: 브라우저 자동화',
    'Flutter 앱 개발 (Android Studio + Claude Code)',
    '게임 내 텍스트 복사 자동화 (AutoHotkey + OCR)',
    'Google Play Store 출시 가이드'
  )
)
),
('sophia.ko", 'ko", 'claude-skills-design", 'Claude Code Skills/Subagents/Commands 설계", 'ai_learning',
'Skills vs Subagents 역할 분리 및 작업 유형별 방법론 매핑.',
13,
jsonb_build_object(
  'roles', jsonb_build_object(
    'Skills", '교육 자료/매뉴얼 (키워드 자동 활성화)',
    'Subagents", '전문 직원 (별도 컨텍스트 독립 실행)'
  ),
  'methodology_mapping', jsonb_build_object(
    '신규", 'Boris Cherny: Plan → Auto-accept → 검증 루프',
    '유지보수", 'Debug-first: 재현 → 원인분석 → 최소수정',
    '테스트", 'TDD: Red → Green → Refactor',
    '문서화", 'Template-driven: 템플릿 → 내용 채우기'
  )
)
);

-- Skill: HTML-based Documentation
INSERT INTO projects (user_id, language, project_id, title, category, overview, display_order, details) VALUES
('sophia.ko", 'ko", 'html-documentation", 'HTML 기반 업무 가이드 & 발표자료 제작", 'skill',
'단일 HTML 파일로 모든 리소스를 포함하여 오프라인 작동 가능한 문서 및 발표자료 제작.',
14,
jsonb_build_object(
  'examples', jsonb_build_array(
    'QA 포트폴리오 (10페이지 HTML)',
    '게이머에서 QA로 발표자료',
    'IT 생산성 분석 기획서',
    '인터랙티브 체크리스트'
  ),
  'packaging_strategy", '단일 파일 (HTML+CSS+JS+Base64 이미지) / 오프라인 작동 / 카카오톡/이메일 첨부 간편'
)
);

-- Vision: AI × QA Future
INSERT INTO projects (user_id, language, project_id, title, category, overview, display_order, details) VALUES
('sophia.ko", 'ko", 'ai-qa-vision", '비전: AI × QA의 미래", 'vision',
'AI를 활용한 QA는 이미 시작되었다. 지금까지 만든 도구들은 AI가 QA 전체 프로세스에 녹아드는 미래의 첫 걸음이다.',
15,
jsonb_build_object(
  'storyline", '지금까지 개발한 도구들은 각각 QA의 특정 문제를 해결했다. 하지만 이것들은 개별 솔루션이 아니라, AI가 QA 전체 프로세스에 녹아드는 미래의 첫 걸음이다.',
  'vision_directions', jsonb_build_array(
    'AI 기반 QA 자동화 확대: 버그 발견 → 패턴 분석 → 등록 → 리포트 → 문서화까지 원스톱',
    'AI로 테스트 케이스 자동 생성: 기획서 변경 시 테스트 케이스 자동 업데이트, 커버리지 부족 영역 AI 제안',
    'AI로 버그 예측 / 사전 감지: 코드/테이블 변경 시 영향 범위 자동 분석 + 잠재 버그 예측',
    'QA 도구들을 AI로 고도화: 도구들이 AI로 서로 연결되어 컨텍스트 공유',
    'AI 활용 QA 프로세스 표준화: 프로젝트 신규 투입 시 AI가 QA 체계 자동 설계'
  ),
  'key_message", 'AI를 활용한 QA는 이미 시작되었다. 버그 등록 자동화, 테이블 검증, 확률 검증, 체크리스트 생성 — 이것들은 각각 하나의 문제를 해결한 도구가 아니라, AI가 QA 전체에 스며드는 과정의 첫 걸음이다. 다음 단계는 이 도구들을 연결하고, AI가 "검증해야 할 것"을 스스로 판단하고, QA 엔지니어가 진짜 중요한 판단에 집중할 수 있는 환경을 만드는 것이다.'
)
);
