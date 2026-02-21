-- Insert projects data (Korean version) - FIXED
-- 15 projects from ahyun_learning_chunks_v3.md

-- Delete existing data first (optional)
-- DELETE FROM projects WHERE user_id = 'sophia.ko';

-- Project 1: AI JIRA Bug Reporting
INSERT INTO projects (user_id, language, project_id, title, category, overview, background, tech_stack, display_order, details) VALUES
('sophia.ko', 'ko', 'ai-jira-bug-reporting', 'AI 기반 JIRA 버그 리포팅 시스템', 'project',
'JIRA 클라우드의 느린 접속 속도와 접속 오류 문제를 해결하기 위해 개발한 Streamlit 기반 미러링 사이트. JIRA 데이터를 로컬에서 빠르게 조회하면서, RAG 기반 AI 버그 자동 작성 기능까지 통합.',
'JIRA 클라우드 접속 문제: 팀 전체가 공감하는 느린 속도와 잦은 접속 오류. 버그 등록 시 접속까지 오래 걸리고 접속 실패도 빈번.',
ARRAY['Python', 'Streamlit', 'OpenAI API', 'JIRA REST API', 'Chroma DB'],
1,
jsonb_build_object(
  'accuracy', 'AI 작성 결과 약 85% 수준 유지',
  'status', '팀에서 사용 중, 타 프로젝트 확산 대기',
  'knowledge_base', '3000건 분석, 컴포넌트별 패턴화'
)
);

-- Project 2: Excel Diff Viewer
INSERT INTO projects (user_id, language, project_id, title, category, overview, background, tech_stack, display_order, details) VALUES
('sophia.ko', 'ko', 'excel-diff-viewer', 'Excel Diff Viewer (GGM-Diff)', 'project',
'Perforce에서 관리되는 Excel 테이블 파일의 리비전 간 변경사항을 시각적으로 비교하는 QA 전용 도구. Beyond Compare를 대체하며, 하루 수십 번 사용하는 핵심 업무 도구.',
'P4V 기본 Diff는 Excel 바이너리 비교 불가. Beyond Compare는 회사 정책상 사용 불가. 수동 비교는 파일당 10-20분 소요.',
ARRAY['Python', 'CustomTkinter', 'openpyxl', 'pandas', 'PyInstaller'],
2,
jsonb_build_object(
  'time_saved', '파일당 10-20분에서 1분으로 단축 (90% 감소)',
  'accuracy', '100% (휴먼 에러 제거)',
  'usage', '호연BSS, BSH브레이커스, AION2 - 하루 수십 번 사용'
)
);

-- Project 3: BM Table Validation
INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko', 'ko', 'bm-table-validation', 'BM 테이블 검증 및 확률 검증 자동화', 'project',
'Excel Diff Viewer의 확장 기능으로, BM 테이블 데이터의 유효성 검증과 확률형 아이템 확률 검증을 자동화.',
NULL,
ARRAY['Python', 'openpyxl', 'pandas'],
3,
jsonb_build_object(
  'validation_types', '상점 패키지, 가챠 확률, 이벤트 보상',
  'impact', '실제 라이브 오류 사전 방지',
  'users', '주로 본인 사용'
)
);

-- Project 4: JIRA Dashboard
INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko', 'ko', 'jira-dashboard', 'JIRA 데이터 분석 및 성과 대시보드', 'project',
'JIRA REST API로 버그 데이터를 가져와 QA 성과를 수치화하는 Streamlit 웹앱.',
'호연, BSH 프로젝트 인원 변동으로 버그 추적 어려움. 평가 시즌 성과 수치 확인 필요.',
ARRAY['Python', 'Streamlit', 'JIRA REST API'],
4,
jsonb_build_object(
  'personal_stats', '팀 11053건 중 개인 3184건 (28.8%), 고위험 이슈 42%',
  'analysis_sections', '버그 발견수, 중요도, Fix율, 보고서 품질',
  'period', '2023/11 ~ 2025/11'
)
);

-- Project 5: JIRA Migration Tool
INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko', 'ko', 'jira-migration-tool', 'Excel to JIRA / JIRA to JIRA 이관 툴', 'project',
'Excel에서 JIRA로, 또는 JIRA 프로젝트 간 이슈를 자동으로 이관하는 도구.',
NULL,
ARRAY['Python', 'JIRA REST API', 'openpyxl'],
5,
jsonb_build_object(
  'time_saved', '수작업 8-16시간에서 수분으로 단축',
  'volume', '100건 이상 일괄 등록 가능',
  'use_case', '테스트의 날 이관, 단기 테스터 버그 일괄 등록'
)
);

-- Project 6: Confluence Auto-upload
INSERT INTO projects (user_id, language, project_id, title, category, overview, tech_stack, display_order, details) VALUES
('sophia.ko', 'ko', 'confluence-auto-upload', 'Claude Skill로 위키 자동 업로드', 'project',
'Claude Code에서 코드 수정 후 명령어 한 줄로 Confluence 위키 문서 자동 생성. 실무 사용 중.',
'Excel Diff Viewer 업데이트 노트를 개인 Confluence에 자동 업로드하여 문서화 부담 감소.',
ARRAY['Claude Code', 'MCP', 'Confluence API'],
6,
jsonb_build_object(
  'time_saved', '10-15분에서 1분으로 단축',
  'benefits', '포맷 일관성, 변경사항 누락 방지',
  'status', '실무 사용 중'
)
);

-- Project 7: QA Methodology
INSERT INTO projects (user_id, language, project_id, title, category, overview, display_order, details) VALUES
('sophia.ko', 'ko', 'qa-methodology', '게임 QA 방법론 및 프로세스', 'methodology',
'효율화, 인프라 구축, 자동화, 프로세스 표준화에 집중한 QA 방법론.',
7,
jsonb_build_object(
  'methodologies', '로그 기반 QA, SET팀 협업, 확률 검증, 게임 구조 분석, 론칭 QA',
  'philosophy', '비용-효율 최적화된 품질 보증',
  'achievements', 'GPT 체크리스트 5시간→1시간, 멘토링 적응기간 50% 단축'
)
);

-- AI Learning projects (8-13)
INSERT INTO projects (user_id, language, project_id, title, category, overview, display_order, details) VALUES
('sophia.ko', 'ko', 'ai-tools-ecosystem', 'AI 개발 도구 생태계 및 비용 최적화', 'ai_learning',
'v0, Lovable, Bolt.new, Cursor, Claude Code 등 AI 개발 도구 학습 및 비용 전략 수립.',
8,
jsonb_build_object('tools', 'v0, Lovable, Bolt, Cursor, Claude Code', 'focus', '비용 최적화 및 모델 선택 전략')
),
('sophia.ko', 'ko', 'mcp-learning', 'MCP 학습 및 활용', 'ai_learning',
'Model Context Protocol을 활용한 Claude와 외부 서비스 연결.',
9,
jsonb_build_object('applications', 'Confluence MCP (실무 사용), JIRA API, 로컬 파일 분석')
),
('sophia.ko', 'ko', 'claude-workflow', 'Claude Code 워크플로우 자동화', 'ai_learning',
'Boris Cherny 워크플로우 학습 및 실무 적용.',
10,
jsonb_build_object('features', 'Plan Mode, Slash Commands, Subagents, 검증 피드백 루프')
),
('sophia.ko', 'ko', 'ai-frameworks', 'AI 프레임워크 및 기술 스택', 'ai_learning',
'RAG, LangChain, Chroma DB, DSPy 등 AI 프레임워크 학습.',
11,
jsonb_build_object('applied', 'RAG (JIRA 버그 리포팅), Chroma DB (실제 적용)')
),
('sophia.ko', 'ko', 'ai-trends-research', 'AI 도구 트렌드 리서치', 'ai_learning',
'Playwright, Flutter, AutoHotkey 등 최신 도구 실험.',
12,
jsonb_build_object('areas', 'Playwright CLI, Flutter 앱, OCR 자동화, Play Store 출시')
),
('sophia.ko', 'ko', 'claude-skills-design', 'Claude Code Skills 설계', 'ai_learning',
'Skills vs Subagents 역할 분리 및 작업별 방법론 매핑.',
13,
jsonb_build_object('mapping', 'Boris Cherny (신규), Debug-first (유지보수), TDD (테스트)')
);

-- Skill project
INSERT INTO projects (user_id, language, project_id, title, category, overview, display_order, details) VALUES
('sophia.ko', 'ko', 'html-documentation', 'HTML 기반 업무 가이드 제작', 'skill',
'단일 HTML 파일로 모든 리소스를 포함한 오프라인 문서 제작.',
14,
jsonb_build_object('strategy', '단일 파일 (HTML+CSS+JS+Base64 이미지), 오프라인 작동')
);

-- Vision
INSERT INTO projects (user_id, language, project_id, title, category, overview, display_order, details) VALUES
('sophia.ko', 'ko', 'ai-qa-vision', '비전: AI × QA의 미래', 'vision',
'AI를 활용한 QA는 이미 시작되었다. 지금까지 만든 도구들은 AI가 QA 전체 프로세스에 녹아드는 미래의 첫 걸음이다.',
15,
jsonb_build_object(
  'message', 'AI가 검증해야 할 것을 스스로 판단하고, QA 엔지니어가 진짜 중요한 판단에 집중할 수 있는 환경을 만드는 것',
  'directions', 'QA 자동화 확대, 테스트 케이스 자동 생성, 버그 예측, 도구 AI 고도화, 프로세스 표준화'
)
);
