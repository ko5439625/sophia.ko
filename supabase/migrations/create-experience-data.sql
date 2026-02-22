-- Experience data table for all dynamic content (timeline, highlights, metrics, skills, certifications)
CREATE TABLE IF NOT EXISTS experience_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ko', 'en')),
  data_type TEXT NOT NULL CHECK (data_type IN ('timeline', 'highlight', 'metric', 'skill', 'certification', 'approach')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE experience_data ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public read access for experience data"
  ON experience_data
  FOR SELECT
  USING (true);

-- Create policy for authenticated write access (for admin)
CREATE POLICY "Admin write access for experience data"
  ON experience_data
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_experience_data_user_lang_type ON experience_data(user_id, language, data_type, display_order);

-- Seed initial data for sophia.ko
INSERT INTO experience_data (user_id, language, data_type, content, display_order) VALUES
-- Korean Timeline
('sophia.ko', 'ko', 'timeline', '{"year": "2020", "role": "Junior QA Engineer", "company": "스타트업 A", "focus": "모바일 앱 테스팅"}'::jsonb, 0),
('sophia.ko', 'ko', 'timeline', '{"year": "2021", "role": "QA Engineer", "company": "스타트업 A", "focus": "테스트 자동화"}'::jsonb, 1),
('sophia.ko', 'ko', 'timeline', '{"year": "2022", "role": "Senior QA Engineer", "company": "핀테크 B", "focus": "결제 시스템 QA"}'::jsonb, 2),
('sophia.ko', 'ko', 'timeline', '{"year": "2023", "role": "Senior QA Engineer", "company": "핀테크 B", "focus": "보안 & 성능 테스트"}'::jsonb, 3),
('sophia.ko', 'ko', 'timeline', '{"year": "2024", "role": "Lead QA Engineer", "company": "테크 C", "focus": "QA 프로세스 혁신"}'::jsonb, 4),

-- English Timeline
('sophia.ko', 'en', 'timeline', '{"year": "2020", "role": "Junior QA Engineer", "company": "Startup A", "focus": "Mobile App Testing"}'::jsonb, 0),
('sophia.ko', 'en', 'timeline', '{"year": "2021", "role": "QA Engineer", "company": "Startup A", "focus": "Test Automation"}'::jsonb, 1),
('sophia.ko', 'en', 'timeline', '{"year": "2022", "role": "Senior QA Engineer", "company": "Fintech B", "focus": "Payment System QA"}'::jsonb, 2),
('sophia.ko', 'en', 'timeline', '{"year": "2023", "role": "Senior QA Engineer", "company": "Fintech B", "focus": "Security & Performance Testing"}'::jsonb, 3),
('sophia.ko', 'en', 'timeline', '{"year": "2024", "role": "Lead QA Engineer", "company": "Tech C", "focus": "QA Process Innovation"}'::jsonb, 4),

-- Korean Highlights
('sophia.ko', 'ko', 'highlight', '{"title": "테스트 자동화 전문성", "description": "Selenium, Cypress, Appium을 활용한 E2E 자동화 구축", "impact": "테스트 시간 70% 단축"}'::jsonb, 0),
('sophia.ko', 'ko', 'highlight', '{"title": "크로스 플랫폼 경험", "description": "iOS, Android, Web 플랫폼 전반의 테스트 경험", "impact": "8개 플랫폼 동시 지원"}'::jsonb, 1),
('sophia.ko', 'ko', 'highlight', '{"title": "보안 테스트 전문성", "description": "OWASP 기반 보안 취약점 검증 및 침투 테스트", "impact": "보안 이슈 0건 달성"}'::jsonb, 2),
('sophia.ko', 'ko', 'highlight', '{"title": "성능 최적화", "description": "부하 테스트 및 성능 병목 지점 분석", "impact": "응답 시간 50% 개선"}'::jsonb, 3),

-- English Highlights
('sophia.ko', 'en', 'highlight', '{"title": "Test Automation Expertise", "description": "E2E automation using Selenium, Cypress, and Appium", "impact": "70% reduction in test time"}'::jsonb, 0),
('sophia.ko', 'en', 'highlight', '{"title": "Cross-Platform Experience", "description": "Testing experience across iOS, Android, and Web platforms", "impact": "Supporting 8 platforms simultaneously"}'::jsonb, 1),
('sophia.ko', 'en', 'highlight', '{"title": "Security Testing Expertise", "description": "OWASP-based security vulnerability verification and penetration testing", "impact": "Zero security issues achieved"}'::jsonb, 2),
('sophia.ko', 'en', 'highlight', '{"title": "Performance Optimization", "description": "Load testing and performance bottleneck analysis", "impact": "50% improvement in response time"}'::jsonb, 3),

-- Korean Metrics
('sophia.ko', 'ko', 'metric', '{"label": "프로젝트 성공률", "value": "99.7%", "description": "15개 프로젝트 중 모든 프로젝트 성공적 완료"}'::jsonb, 0),
('sophia.ko', 'ko', 'metric', '{"label": "버그 발견율", "value": "95%", "description": "프로덕션 배포 전 95% 이상의 버그 사전 발견"}'::jsonb, 1),
('sophia.ko', 'ko', 'metric', '{"label": "테스트 자동화율", "value": "85%", "description": "반복 테스트의 85%를 자동화로 전환"}'::jsonb, 2),
('sophia.ko', 'ko', 'metric', '{"label": "팀 효율성 향상", "value": "40%", "description": "프로세스 개선을 통한 팀 생산성 향상"}'::jsonb, 3),

-- English Metrics
('sophia.ko', 'en', 'metric', '{"label": "Project Success Rate", "value": "99.7%", "description": "All 15 projects successfully completed"}'::jsonb, 0),
('sophia.ko', 'en', 'metric', '{"label": "Bug Discovery Rate", "value": "95%", "description": "95%+ bugs found before production"}'::jsonb, 1),
('sophia.ko', 'en', 'metric', '{"label": "Test Automation Rate", "value": "85%", "description": "85% of repetitive tests automated"}'::jsonb, 2),
('sophia.ko', 'en', 'metric', '{"label": "Team Efficiency Improvement", "value": "40%", "description": "Productivity improved through process optimization"}'::jsonb, 3),

-- Korean Skills
('sophia.ko', 'ko', 'skill', '{"category": "모바일 테스팅", "tools": ["XCTest", "XCUITest", "TestFlight", "Espresso", "UI Automator", "Firebase Test Lab"]}'::jsonb, 0),
('sophia.ko', 'ko', 'skill', '{"category": "웹 테스팅", "tools": ["Selenium", "Cypress", "Playwright", "Postman", "REST Assured", "Newman"]}'::jsonb, 1),
('sophia.ko', 'ko', 'skill', '{"category": "자동화 & DevOps", "tools": ["Python", "Java", "Jenkins", "GitHub Actions", "JMeter", "K6"]}'::jsonb, 2),

-- English Skills
('sophia.ko', 'en', 'skill', '{"category": "Mobile Testing", "tools": ["XCTest", "XCUITest", "TestFlight", "Espresso", "UI Automator", "Firebase Test Lab"]}'::jsonb, 0),
('sophia.ko', 'en', 'skill', '{"category": "Web Testing", "tools": ["Selenium", "Cypress", "Playwright", "Postman", "REST Assured", "Newman"]}'::jsonb, 1),
('sophia.ko', 'en', 'skill', '{"category": "Automation & DevOps", "tools": ["Python", "Java", "Jenkins", "GitHub Actions", "JMeter", "K6"]}'::jsonb, 2),

-- Certifications (same for both languages)
('sophia.ko', 'ko', 'certification', '{"name": "ISTQB Foundation Level", "year": "2021", "issuer": "ISTQB"}'::jsonb, 0),
('sophia.ko', 'ko', 'certification', '{"name": "AWS Certified Cloud Practitioner", "year": "2022", "issuer": "Amazon"}'::jsonb, 1),
('sophia.ko', 'ko', 'certification', '{"name": "Certified Ethical Hacker (CEH)", "year": "2023", "issuer": "EC-Council"}'::jsonb, 2),

('sophia.ko', 'en', 'certification', '{"name": "ISTQB Foundation Level", "year": "2021", "issuer": "ISTQB"}'::jsonb, 0),
('sophia.ko', 'en', 'certification', '{"name": "AWS Certified Cloud Practitioner", "year": "2022", "issuer": "Amazon"}'::jsonb, 1),
('sophia.ko', 'en', 'certification', '{"name": "Certified Ethical Hacker (CEH)", "year": "2023", "issuer": "EC-Council"}'::jsonb, 2),

-- Korean Approach
('sophia.ko', 'ko', 'approach', '{"title": "사용자 중심 사고", "description": "기술적 완성도보다 사용자 경험을 우선시합니다"}'::jsonb, 0),
('sophia.ko', 'ko', 'approach', '{"title": "데이터 기반 의사결정", "description": "직감이 아닌 명확한 데이터로 우선순위를 결정합니다"}'::jsonb, 1),
('sophia.ko', 'ko', 'approach', '{"title": "예방적 품질 관리", "description": "문제를 찾는 것보다 문제가 생기지 않게 하는 것"}'::jsonb, 2),
('sophia.ko', 'ko', 'approach', '{"title": "지속적인 개선", "description": "완벽한 프로세스는 없다, 계속 발전시켜야 한다"}'::jsonb, 3),

-- English Approach
('sophia.ko', 'en', 'approach', '{"title": "User-Centric Thinking", "description": "Prioritize user experience over technical perfection"}'::jsonb, 0),
('sophia.ko', 'en', 'approach', '{"title": "Data-Driven Decisions", "description": "Make decisions based on clear data, not intuition"}'::jsonb, 1),
('sophia.ko', 'en', 'approach', '{"title": "Preventive Quality Management", "description": "Prevent problems rather than finding them"}'::jsonb, 2),
('sophia.ko', 'en', 'approach', '{"title": "Continuous Improvement", "description": "No process is perfect, keep evolving"}'::jsonb, 3)

ON CONFLICT DO NOTHING;
