"use client"

import { useState, useEffect } from "react"
import { useAdmin } from "@/lib/admin-context"
import { getContent, setOverride } from "@/lib/content-store"
import EditableField from "@/components/editable-field"

export default function ExperiencePage() {
  const [language, setLanguage] = useState<"ko" | "en">("ko")
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "vision">("overview")
  const { isAdmin } = useAdmin()
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "ko" | "en"
    if (savedLanguage) setLanguage(savedLanguage)
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab")
    if (tab && ["overview", "projects", "vision"].includes(tab)) {
      setActiveTab(tab as typeof activeTab)
    }
  }, [])

  const handleLanguageChange = (newLanguage: "ko" | "en") => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
  }

  const c = (key: string, fallback: string) => getContent(`exp.${language}.${key}`, fallback)
  const save = (key: string) => (val: string) => { setOverride(`exp.${language}.${key}`, val); forceUpdate(n => n + 1) }
  const vc = (key: string, fallback: string) => getContent(`vision.${language}.${key}`, fallback)
  const vsave = (key: string) => (val: string) => { setOverride(`vision.${language}.${key}`, val); forceUpdate(n => n + 1) }

  const content = {
    ko: {
      title: "Experience",
      subtitle: "5년간 제품에 품질을 구축해온 경험",
      backButton: "검색으로 돌아가기",
      tabs: { overview: "개요", projects: "프로젝트", vision: "비전" },
      overview: {
        summary: "5년간 다양한 도메인에서 QA 업무를 수행하며 품질 보증의 전 영역을 경험했습니다. 단순한 테스트 실행을 넘어 품질 문화 구축과 프로세스 개선에 집중하고 있습니다.",
        highlights: [
          { title: "테스트 자동화 전문성", description: "Selenium, Cypress, Appium을 활용한 E2E 자동화 구축", impact: "테스트 시간 70% 단축" },
          { title: "크로스 플랫폼 경험", description: "iOS, Android, Web 플랫폼 전반의 테스트 경험", impact: "8개 플랫폼 동시 지원" },
          { title: "보안 테스트 전문성", description: "OWASP 기반 보안 취약점 검증 및 침투 테스트", impact: "보안 이슈 0건 달성" },
          { title: "성능 최적화", description: "부하 테스트 및 성능 병목 지점 분석", impact: "응답 시간 50% 개선" },
        ],
        timeline: [
          { year: "2020", role: "Junior QA Engineer", company: "스타트업 A", focus: "모바일 앱 테스팅" },
          { year: "2021", role: "QA Engineer", company: "스타트업 A", focus: "테스트 자동화" },
          { year: "2022", role: "Senior QA Engineer", company: "핀테크 B", focus: "결제 시스템 QA" },
          { year: "2023", role: "Senior QA Engineer", company: "핀테크 B", focus: "보안 & 성능 테스트" },
          { year: "2024", role: "Lead QA Engineer", company: "테크 C", focus: "QA 프로세스 혁신" },
        ],
      },
      skills: [
        { category: "모바일 테스팅", tools: ["XCTest", "XCUITest", "TestFlight", "Espresso", "UI Automator", "Firebase Test Lab"] },
        { category: "웹 테스팅", tools: ["Selenium", "Cypress", "Playwright", "Postman", "REST Assured", "Newman"] },
        { category: "자동화 & DevOps", tools: ["Python", "Java", "Jenkins", "GitHub Actions", "JMeter", "K6"] },
      ],
      qaProjects: [
        {
          title: "결제 시스템 품질 보증", period: "2022.03 - 2022.08", type: "금융", role: "Lead QA Engineer", team: "QA 2명, 개발 5명",
          achievements: ["43개 버그 발견", "99.7% 성공률", "치명적 이슈 0건", "PCI DSS 인증 통과"], tags: ["보안", "결제", "금융", "규제"],
          challenge: "금융 서비스의 특성상 단 하나의 오류도 용납할 수 없는 상황에서 다양한 결제 수단과 예외 상황을 모두 검증해야 했습니다.",
          solution: "체계적인 테스트 시나리오 설계와 보안 테스트를 통해 모든 결제 플로우를 검증했습니다. 특히 동시 결제, 네트워크 오류, 부분 결제 등의 엣지 케이스를 집중적으로 테스트했습니다.",
          result: "99.7%의 높은 성공률을 달성하며 서비스 출시 후 6개월간 결제 관련 치명적 이슈가 발생하지 않았습니다. PCI DSS 인증도 성공적으로 통과했습니다.",
          technologies: ["Postman", "JMeter", "OWASP ZAP", "Burp Suite"],
        },
        {
          title: "모바일 앱 성능 최적화", period: "2023.05 - 2023.12", type: "모바일", role: "Senior QA Engineer", team: "QA 3명, 개발 8명",
          achievements: ["로딩 시간 50% 개선", "0.1% 크래시율", "사용자 만족도 95%", "메모리 사용량 30% 감소"], tags: ["성능", "모바일", "UX", "최적화"],
          challenge: "사용자 증가로 인한 앱 성능 저하와 높은 크래시율로 인해 사용자 이탈이 증가하는 상황이었습니다.",
          solution: "다양한 디바이스와 네트워크 환경에서의 성능 테스트를 수행하고, 메모리 누수와 배터리 소모 패턴을 분석했습니다.",
          result: "앱 로딩 시간을 50% 단축하고 크래시율을 0.1%까지 낮췄습니다. 사용자 만족도가 95%까지 향상되었습니다.",
          technologies: ["Xcode Instruments", "Android Profiler", "Firebase Performance", "New Relic"],
        },
        {
          title: "API 보안 강화 프로젝트", period: "2023.01 - 2023.04", type: "보안", role: "Security QA Specialist", team: "QA 2명, 보안팀 3명, 개발 4명",
          achievements: ["15개 취약점 발견", "100% 보안 커버리지", "보안 침해 0건", "보안 가이드라인 수립"], tags: ["보안", "API", "침투테스트", "OWASP"],
          challenge: "외부 API 연동 증가와 함께 보안 위협이 높아져 체계적인 보안 테스트가 필요한 상황이었습니다.",
          solution: "OWASP API Top 10을 기반으로 한 보안 테스트 체크리스트를 작성하고, 자동화된 보안 스캔 도구를 도입했습니다.",
          result: "15개의 보안 취약점을 사전에 발견하여 수정했고, 서비스 운영 중 보안 침해 사고가 0건 발생했습니다.",
          technologies: ["OWASP ZAP", "Burp Suite", "Nessus", "Postman"],
        },
      ],
      processProjects: [
        {
          title: "테스트 자동화 프레임워크 구축", period: "2021.01 - 2021.06", type: "자동화", role: "Automation Engineer", team: "QA 2명, DevOps 2명",
          achievements: ["테스트 시간 70% 단축", "커버리지 95%", "CI/CD 통합", "유지보수성 향상"], tags: ["자동화", "프레임워크", "CI/CD", "효율성"],
          challenge: "수동 테스트로 인한 긴 테스트 사이클과 반복적인 회귀 테스트로 인해 개발 속도가 저하되고 있었습니다.",
          solution: "Page Object Model 패턴을 적용한 확장 가능한 자동화 프레임워크를 설계했습니다.",
          result: "테스트 실행 시간을 70% 단축하고 테스트 커버리지를 95%까지 향상시켰습니다.",
          technologies: ["Selenium", "Python", "Jenkins", "Docker", "Allure"],
        },
        {
          title: "QA 프로세스 표준화", period: "2023.03 - 2023.09", type: "프로세스", role: "QA Process Lead", team: "QA 5명, PM 2명, 개발팀 리더 3명",
          achievements: ["팀 효율성 40% 향상", "문서화 완료", "타팀 도입", "교육 프로그램 운영"], tags: ["프로세스", "표준화", "효율성", "협업"],
          challenge: "팀별로 다른 QA 프로세스로 인해 일관성이 부족하고, 신규 팀원의 온보딩이 어려운 상황이었습니다.",
          solution: "애자일 환경에 맞는 QA 프로세스를 재설계하고, 테스트 케이스 관리 도구를 도입했습니다.",
          result: "팀 효율성이 40% 향상되었고, 신규 팀원 온보딩 시간이 50% 단축되었습니다.",
          technologies: ["Jira", "TestRail", "Confluence", "Slack"],
        },
        {
          title: "품질 문화 혁신 이니셔티브", period: "2024.01 - Present", type: "문화", role: "Quality Culture Lead", team: "QA 전체 8명, 개발팀 전체 25명",
          achievements: ["교육 프로그램 런칭", "품질 지표 대시보드", "크로스팀 협업 강화", "품질 마인드셋 확산"], tags: ["문화", "교육", "리더십", "혁신"],
          challenge: "개발팀과 QA팀 간의 사일로 현상과 품질에 대한 인식 차이로 인해 협업 효율성이 떨어지는 상황이었습니다.",
          solution: "전사 품질 교육 프로그램을 기획하고, 개발자 대상 테스트 작성 가이드를 제작했습니다.",
          result: "개발팀의 품질 의식이 크게 향상되었고, 버그 발견 시점이 개발 단계로 앞당겨졌습니다.",
          technologies: ["Grafana", "Elasticsearch", "Slack", "Notion"],
        },
      ],
      achievements: {
        metrics: [
          { label: "프로젝트 성공률", value: "99.7%", description: "15개 프로젝트 중 모든 프로젝트 성공적 완료" },
          { label: "버그 발견율", value: "95%", description: "프로덕션 배포 전 95% 이상의 버그 사전 발견" },
          { label: "테스트 자동화율", value: "85%", description: "반복 테스트의 85%를 자동화로 전환" },
          { label: "팀 효율성 향상", value: "40%", description: "프로세스 개선을 통한 팀 생산성 향상" },
        ],
        certifications: [
          { name: "ISTQB Foundation Level", year: "2021", issuer: "ISTQB" },
          { name: "AWS Certified Cloud Practitioner", year: "2022", issuer: "Amazon" },
          { name: "Certified Ethical Hacker (CEH)", year: "2023", issuer: "EC-Council" },
        ],
        awards: [
          { title: "올해의 QA 엔지니어", year: "2023", organization: "회사 내부" },
          { title: "프로세스 혁신상", year: "2023", organization: "회사 내부" },
          { title: "고객 만족 기여상", year: "2024", organization: "회사 내부" },
        ],
      },
      vision: {
        philosophy: { quote: "품질은 우연이 아니라 의도의 결과입니다", author: "- Sophia Ko", description: "5년간의 경험을 통해 깨달은 것은 진정한 품질은 마지막에 테스트로 만들어지는 것이 아니라, 처음부터 품질을 염두에 두고 설계하고 개발할 때 나온다는 것입니다." },
        approach: [
          { title: "사용자 중심 사고", description: "기술적 완성도보다 사용자 경험을 우선시합니다", impact: "사용자 만족도 95% 달성" },
          { title: "데이터 기반 의사결정", description: "직감이 아닌 명확한 데이터로 우선순위를 결정합니다", impact: "의사결정 속도 60% 향상" },
          { title: "예방적 품질 관리", description: "문제를 찾는 것보다 문제가 생기지 않게 하는 것", impact: "프로덕션 버그 80% 감소" },
          { title: "지속적인 개선", description: "완벽한 프로세스는 없다, 계속 발전시켜야 한다", impact: "팀 효율성 40% 향상" },
        ],
        goals: [
          { timeline: "2025년", title: "AI 기반 QA 도구 개발", description: "머신러닝을 활용한 자동 테스트 케이스 생성 도구를 개발하여 테스트 효율성을 극대화합니다.", expectedImpact: "테스트 케이스 작성 시간 70% 단축" },
          { timeline: "2026년", title: "QA 교육 플랫폼 구축", description: "주니어 QA 엔지니어들을 위한 체계적인 교육 플랫폼을 만들어 업계 전체의 품질 수준을 높입니다.", expectedImpact: "업계 QA 역량 전반적 향상" },
          { timeline: "2027년+", title: "품질 우선 문화 전파", description: "기업 문화 차원에서 품질을 최우선으로 생각하는 조직을 만드는 컨설팅을 제공합니다.", expectedImpact: "품질 우선 기업 문화 확산" },
        ],
        contacts: [
          { label: "이메일", value: "sophia.ko@email.com", icon: "M" },
          { label: "전화", value: "+82 10-1234-5678", icon: "P" },
          { label: "GitHub", value: "github.com/sophia-ko", icon: "G" },
          { label: "LinkedIn", value: "linkedin.com/in/sophia-ko", icon: "L" },
        ],
        ctaTitle: "함께 품질을 구축할 준비가 되셨나요?",
        ctaDescription: "사용자가 사랑하고 개발자가 자랑스러워하는 제품을 만들어봅시다.",
      },
    },
    en: {
      title: "Experience",
      subtitle: "5 years of building quality into products",
      backButton: "Back to Search",
      tabs: { overview: "Overview", projects: "Projects", vision: "Vision" },
      overview: {
        summary: "Over 5 years of QA experience across various domains, covering all aspects of quality assurance. Focus on building quality culture and process improvement beyond simple test execution.",
        highlights: [
          { title: "Test Automation Expertise", description: "E2E automation using Selenium, Cypress, and Appium", impact: "70% reduction in test time" },
          { title: "Cross-Platform Experience", description: "Testing experience across iOS, Android, and Web platforms", impact: "Supporting 8 platforms simultaneously" },
          { title: "Security Testing Expertise", description: "OWASP-based security vulnerability verification and penetration testing", impact: "Zero security issues achieved" },
          { title: "Performance Optimization", description: "Load testing and performance bottleneck analysis", impact: "50% improvement in response time" },
        ],
        timeline: [
          { year: "2020", role: "Junior QA Engineer", company: "Startup A", focus: "Mobile App Testing" },
          { year: "2021", role: "QA Engineer", company: "Startup A", focus: "Test Automation" },
          { year: "2022", role: "Senior QA Engineer", company: "Fintech B", focus: "Payment System QA" },
          { year: "2023", role: "Senior QA Engineer", company: "Fintech B", focus: "Security & Performance Testing" },
          { year: "2024", role: "Lead QA Engineer", company: "Tech C", focus: "QA Process Innovation" },
        ],
      },
      skills: [
        { category: "Mobile Testing", tools: ["XCTest", "XCUITest", "TestFlight", "Espresso", "UI Automator", "Firebase Test Lab"] },
        { category: "Web Testing", tools: ["Selenium", "Cypress", "Playwright", "Postman", "REST Assured", "Newman"] },
        { category: "Automation & DevOps", tools: ["Python", "Java", "Jenkins", "GitHub Actions", "JMeter", "K6"] },
      ],
      qaProjects: [
        {
          title: "Payment System Quality Assurance", period: "2022.03 - 2022.08", type: "Financial", role: "Lead QA Engineer", team: "2 QA, 5 Developers",
          achievements: ["43 bugs found", "99.7% success rate", "Zero critical issues", "PCI DSS certification passed"], tags: ["Security", "Payment", "Financial", "Compliance"],
          challenge: "In financial services, zero tolerance for errors required verification of all payment methods and exception scenarios.",
          solution: "Systematic test scenario design and security testing verified all payment flows.",
          result: "Achieved 99.7% success rate with no critical payment-related issues for 6 months post-launch.",
          technologies: ["Postman", "JMeter", "OWASP ZAP", "Burp Suite"],
        },
        {
          title: "Mobile App Performance Optimization", period: "2023.05 - 2023.12", type: "Mobile", role: "Senior QA Engineer", team: "3 QA, 8 Developers",
          achievements: ["50% loading time improvement", "0.1% crash rate", "95% user satisfaction", "30% memory reduction"], tags: ["Performance", "Mobile", "UX", "Optimization"],
          challenge: "App performance degradation and high crash rates due to user growth were causing increased user churn.",
          solution: "Performed performance testing across various devices and network environments, analyzed memory leaks and battery consumption patterns.",
          result: "Reduced app loading time by 50% and crash rate to 0.1%. User satisfaction improved to 95%.",
          technologies: ["Xcode Instruments", "Android Profiler", "Firebase Performance", "New Relic"],
        },
        {
          title: "API Security Enhancement Project", period: "2023.01 - 2023.04", type: "Security", role: "Security QA Specialist", team: "2 QA, 3 Security Team, 4 Developers",
          achievements: ["15 vulnerabilities found", "100% security coverage", "Zero security breaches", "Security guidelines established"], tags: ["Security", "API", "Penetration Testing", "OWASP"],
          challenge: "Increasing external API integrations raised security threats, requiring systematic security testing.",
          solution: "Created security test checklist based on OWASP API Top 10 and introduced automated security scanning tools.",
          result: "Discovered and fixed 15 security vulnerabilities proactively, with zero security incidents during service operation.",
          technologies: ["OWASP ZAP", "Burp Suite", "Nessus", "Postman"],
        },
      ],
      processProjects: [
        {
          title: "Test Automation Framework Development", period: "2021.01 - 2021.06", type: "Automation", role: "Automation Engineer", team: "2 QA, 2 DevOps",
          achievements: ["70% test time reduction", "95% coverage", "CI/CD integration", "Improved maintainability"], tags: ["Automation", "Framework", "CI/CD", "Efficiency"],
          challenge: "Long test cycles due to manual testing and repetitive regression testing were slowing down development speed.",
          solution: "Designed scalable automation framework using Page Object Model pattern.",
          result: "Reduced test execution time by 70% and improved test coverage to 95%.",
          technologies: ["Selenium", "Python", "Jenkins", "Docker", "Allure"],
        },
        {
          title: "QA Process Standardization", period: "2023.03 - 2023.09", type: "Process", role: "QA Process Lead", team: "5 QA, 2 PM, 3 Dev Team Leaders",
          achievements: ["40% team efficiency improvement", "Documentation completed", "Cross-team adoption", "Training program operation"], tags: ["Process", "Standardization", "Efficiency", "Collaboration"],
          challenge: "Different QA processes across teams lacked consistency and made onboarding new team members difficult.",
          solution: "Redesigned QA processes for agile environments and introduced test case management tools.",
          result: "Improved team efficiency by 40% and reduced new team member onboarding time by 50%.",
          technologies: ["Jira", "TestRail", "Confluence", "Slack"],
        },
        {
          title: "Quality Culture Innovation Initiative", period: "2024.01 - Present", type: "Culture", role: "Quality Culture Lead", team: "8 QA Total, 25 Developers Total",
          achievements: ["Training program launch", "Quality metrics dashboard", "Enhanced cross-team collaboration", "Quality mindset spread"], tags: ["Culture", "Training", "Leadership", "Innovation"],
          challenge: "Silos between development and QA teams and different perceptions of quality were reducing collaboration efficiency.",
          solution: "Planned company-wide quality education program and created test writing guides for developers.",
          result: "Significantly improved development team's quality awareness, moving bug discovery earlier to development phase.",
          technologies: ["Grafana", "Elasticsearch", "Slack", "Notion"],
        },
      ],
      achievements: {
        metrics: [
          { label: "Project Success Rate", value: "99.7%", description: "Successfully completed all 15 projects" },
          { label: "Bug Detection Rate", value: "95%", description: "95%+ bugs found before production deployment" },
          { label: "Test Automation Rate", value: "85%", description: "85% of repetitive tests converted to automation" },
          { label: "Team Efficiency Improvement", value: "40%", description: "Team productivity improvement through process enhancement" },
        ],
        certifications: [
          { name: "ISTQB Foundation Level", year: "2021", issuer: "ISTQB" },
          { name: "AWS Certified Cloud Practitioner", year: "2022", issuer: "Amazon" },
          { name: "Certified Ethical Hacker (CEH)", year: "2023", issuer: "EC-Council" },
        ],
        awards: [
          { title: "QA Engineer of the Year", year: "2023", organization: "Company Internal" },
          { title: "Process Innovation Award", year: "2023", organization: "Company Internal" },
          { title: "Customer Satisfaction Contribution Award", year: "2024", organization: "Company Internal" },
        ],
      },
      vision: {
        philosophy: { quote: "Quality is never an accident; it is always the result of intention", author: "- Sophia Ko", description: "Through 5 years of experience, I've learned that true quality isn't created by testing at the end, but by designing and developing with quality in mind from the beginning." },
        approach: [
          { title: "User-Centric Thinking", description: "Prioritizing user experience over technical perfection", impact: "95% user satisfaction achieved" },
          { title: "Data-Driven Decisions", description: "Making decisions based on clear data, not intuition", impact: "60% faster decision making" },
          { title: "Preventive Quality Management", description: "Preventing problems rather than finding them", impact: "80% reduction in production bugs" },
          { title: "Continuous Improvement", description: "No process is perfect, it must keep evolving", impact: "40% improvement in team efficiency" },
        ],
        goals: [
          { timeline: "2025", title: "AI-Powered QA Tool Development", description: "Develop automated test case generation tools using machine learning to maximize testing efficiency.", expectedImpact: "70% reduction in test case writing time" },
          { timeline: "2026", title: "QA Education Platform", description: "Create systematic education platform for junior QA engineers to raise industry-wide quality standards.", expectedImpact: "Overall improvement in industry QA capabilities" },
          { timeline: "2027+", title: "Quality-First Culture Evangelism", description: "Provide consulting to create organizations that prioritize quality at the corporate culture level.", expectedImpact: "Spread quality-first corporate culture" },
        ],
        contacts: [
          { label: "Email", value: "sophia.ko@email.com", icon: "M" },
          { label: "Phone", value: "+82 10-1234-5678", icon: "P" },
          { label: "GitHub", value: "github.com/sophia-ko", icon: "G" },
          { label: "LinkedIn", value: "linkedin.com/in/sophia-ko", icon: "L" },
        ],
        ctaTitle: "Ready to Build Quality Together?",
        ctaDescription: "Let's create products that users love and developers are proud of.",
      },
    },
  }

  const currentContent = content[language]

  const SectionHeader = ({ title, editKey }: { title: string; editKey?: string }) => (
    <div className="mb-8">
      {editKey ? (
        <EditableField value={c(editKey, title)} onSave={save(editKey)} as="h2" className="text-2xl font-semibold text-gray-900 mb-2" />
      ) : (
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
      )}
      <div className="w-12 h-0.5 bg-blue-600 rounded-full"></div>
    </div>
  )

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 ${isAdmin ? "pt-10" : ""}`}>
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => (window.location.href = "/")} className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              {currentContent.backButton}
            </button>
            <div className="flex items-center space-x-8">
              <div className="flex space-x-8">
                <button onClick={() => (window.location.href = "/about")} className="text-gray-600 hover:text-gray-900 pb-4 transition-colors">About</button>
                <div className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">Experience</div>
                <button onClick={() => (window.location.href = "/blog")} className="text-gray-600 hover:text-gray-900 pb-4 transition-colors">Blog</button>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-sm transition-colors ${language === "ko" ? "text-gray-900 font-medium" : "text-gray-500"}`}>한국어</span>
                <button
                  onClick={() => handleLanguageChange(language === "ko" ? "en" : "ko")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${language === "en" ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${language === "en" ? "translate-x-6" : "translate-x-1"}`} />
                </button>
                <span className={`text-sm transition-colors ${language === "en" ? "text-gray-900 font-medium" : "text-gray-500"}`}>EN</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <EditableField value={c("title", currentContent.title)} onSave={save("title")} as="h1" className="text-4xl font-light text-gray-900 mb-4" />
          <EditableField value={c("subtitle", currentContent.subtitle)} onSave={save("subtitle")} as="p" className="text-gray-600 text-lg" />
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-2 border border-gray-200/50">
            {Object.entries(currentContent.tabs).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as typeof activeTab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${activeTab === key ? "bg-blue-600 text-white shadow-md" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === "overview" && (
          <div className="space-y-12">
            {/* Summary - top */}
            <div className="relative overflow-hidden">
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-3xl p-8 relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full -translate-y-8 translate-x-8"></div>
                <div className="relative z-10">
                  <EditableField value={c("summaryTitle", "Summary")} onSave={save("summaryTitle")} as="h2" className="text-2xl font-light text-gray-900 mb-6" />
                  <EditableField value={c("summary", currentContent.overview.summary)} onSave={save("summary")} as="p" className="text-gray-800 text-lg leading-relaxed" multiline />
                </div>
              </div>
            </div>

            {/* Key Highlights */}
            <div>
              <SectionHeader title={language === "ko" ? "핵심 강점" : "Key Highlights"} editKey="highlightsTitle" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentContent.overview.highlights.map((highlight, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <EditableField value={c(`hl_${index}_t`, highlight.title)} onSave={save(`hl_${index}_t`)} as="h3" className="font-semibold text-gray-900 text-lg mb-3" />
                    <EditableField value={c(`hl_${index}_d`, highlight.description)} onSave={save(`hl_${index}_d`)} as="p" className="text-gray-700 mb-4" />
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <EditableField value={c(`hl_${index}_i`, highlight.impact)} onSave={save(`hl_${index}_i`)} as="span" className="text-green-700 font-medium text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Performance Metrics */}
            <div>
              <SectionHeader title={language === "ko" ? "핵심 성과" : "Key Metrics"} editKey="metricsTitle" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {currentContent.achievements.metrics.map((metric, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <EditableField value={c(`mt_${index}_v`, metric.value)} onSave={save(`mt_${index}_v`)} as="div" className="text-2xl font-light text-blue-600 mb-1" />
                    <EditableField value={c(`mt_${index}_l`, metric.label)} onSave={save(`mt_${index}_l`)} as="div" className="font-semibold text-gray-900 text-sm mb-1" />
                    <EditableField value={c(`mt_${index}_d`, metric.description)} onSave={save(`mt_${index}_d`)} as="div" className="text-xs text-gray-500" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Stack & Certifications - side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <SectionHeader title={language === "ko" ? "기술 스택" : "Tech Stack"} editKey="techTitle" />
                <div className="space-y-3">
                  {currentContent.skills.map((skillGroup, gi) => (
                    <div key={gi} className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4">
                      <EditableField value={c(`skCat_${gi}`, skillGroup.category)} onSave={save(`skCat_${gi}`)} as="h3" className="font-semibold text-gray-900 mb-2 text-sm" />
                      <div className="flex flex-wrap gap-1.5">
                        {skillGroup.tools.map((tool, ti) => (
                          <span key={ti} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium border border-blue-100">{tool}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <SectionHeader title={language === "ko" ? "전문 자격증" : "Certifications"} editKey="certsTitle" />
                <div className="space-y-3">
                  {currentContent.achievements.certifications.map((cert, index) => (
                    <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-4 flex items-center justify-between">
                      <EditableField value={c(`cert_${index}_n`, cert.name)} onSave={save(`cert_${index}_n`)} as="span" className="font-medium text-gray-900 text-sm" />
                      <div className="flex items-center gap-2 text-xs text-gray-500 flex-shrink-0 ml-3">
                        <EditableField value={c(`cert_${index}_i`, cert.issuer)} onSave={save(`cert_${index}_i`)} as="span" className="text-gray-500" />
                        <span>{"/"}</span>
                        <EditableField value={c(`cert_${index}_y`, cert.year)} onSave={save(`cert_${index}_y`)} as="span" className="text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== PROJECTS TAB ===== */}
        {activeTab === "projects" && (() => {
          const timelineColors = [
            { bg: "bg-blue-600", light: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
            { bg: "bg-teal-600", light: "bg-teal-50", border: "border-teal-200", text: "text-teal-700" },
            { bg: "bg-amber-600", light: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
            { bg: "bg-rose-600", light: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
            { bg: "bg-violet-600", light: "bg-violet-50", border: "border-violet-200", text: "text-violet-700" },
          ]
          const companies = [...new Set(currentContent.overview.timeline.map(t => t.company))]
          if (expandedCompany === null && companies.length > 0) {
            setTimeout(() => setExpandedCompany(companies[companies.length - 1]), 0)
          }
          const companyColorMap: Record<string, number> = {}
          companies.forEach((co, i) => { companyColorMap[co] = i % timelineColors.length })

          const allProjects = [
            ...currentContent.qaProjects.map((p, i) => ({ ...p, _key: `qa_${i}`, _idx: i, _section: "qa" as const })),
            ...currentContent.processProjects.map((p, i) => ({ ...p, _key: `pp_${i}`, _idx: i, _section: "process" as const })),
          ]

          const grouped: Record<string, typeof allProjects> = {}
          currentContent.overview.timeline.forEach(t => {
            if (!grouped[t.company]) grouped[t.company] = []
          })
          allProjects.forEach(p => {
            const year = p.period.slice(0, 4)
            const matchedCompany = currentContent.overview.timeline.find(t => t.year === year)?.company
            const key = matchedCompany || companies[companies.length - 1]
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(p)
          })

          return (
            <div className="space-y-12">
              {/* Career Timeline */}
              <div>
                <SectionHeader title={language === "ko" ? "커리어 타임라인" : "Career Timeline"} editKey="timelineTitle" />
                <div className="relative">
                  <div className="hidden md:block absolute top-8 left-8 right-8 h-0.5 bg-gray-200 z-0"></div>
                  <div className="flex flex-wrap gap-3 relative z-10">
                    {currentContent.overview.timeline.map((item, index) => {
                      const colorIdx = companyColorMap[item.company] ?? 0
                      const color = timelineColors[colorIdx]
                      return (
                        <div key={index} className={`flex-1 min-w-[150px] ${color.light} rounded-2xl shadow-sm border ${color.border} p-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
                          <div className={`inline-block ${color.bg} text-white text-xs font-bold px-2.5 py-1 rounded-lg mb-2`}>
                            <EditableField value={c(`tl_${index}_y`, item.year)} onSave={save(`tl_${index}_y`)} as="span" className="text-white font-bold text-xs" />
                          </div>
                          <EditableField value={c(`tl_${index}_r`, item.role)} onSave={save(`tl_${index}_r`)} as="p" className="font-medium text-gray-900 text-sm mb-0.5" />
                          <EditableField value={c(`tl_${index}_c`, item.company)} onSave={save(`tl_${index}_c`)} as="p" className={`${color.text} text-xs font-medium mb-0.5`} />
                          <EditableField value={c(`tl_${index}_f`, item.focus)} onSave={save(`tl_${index}_f`)} as="p" className="text-gray-600 text-xs" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Projects grouped by company */}
              {companies.map((company, ci) => {
                const colorIdx = companyColorMap[company]
                const color = timelineColors[colorIdx]
                const companyProjects = grouped[company] || []
                if (companyProjects.length === 0) return null
                const companyYears = currentContent.overview.timeline.filter(t => t.company === company).map(t => t.year)
                const yearRange = companyYears.length > 1 ? `${companyYears[0]} - ${companyYears[companyYears.length - 1]}` : companyYears[0]

                return (
                  <div key={ci}>
                    <button
                      onClick={() => setExpandedCompany(expandedCompany === company ? null : company)}
                      className={`w-full flex items-center justify-between mb-6 p-4 rounded-2xl ${color.light} border ${color.border} hover:shadow-md transition-all duration-200 cursor-pointer`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 ${color.bg} rounded-full`}></div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900 text-lg">{company}</h3>
                          <p className="text-gray-500 text-sm">{yearRange} / {companyProjects.length} {language === "ko" ? "개 프로젝트" : "projects"}</p>
                        </div>
                      </div>
                      <svg className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${expandedCompany === company ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {expandedCompany === company && (
                      <div className={`space-y-6 ml-4 pl-4 border-l-2 ${["border-blue-200","border-teal-200","border-amber-200","border-rose-200","border-violet-200"][colorIdx]}`}>
                        {companyProjects.map((project) => {
                          const projId = project._section === "qa" ? project._idx : project._idx + 100
                          const prefix = project._section === "qa" ? "qp" : "pp"
                          return (
                            <div key={project._key} className="space-y-3">
                              <div
                                className={`bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg hover:bg-white/80 transition-all duration-300 cursor-pointer ${selectedProject === projId ? "ring-2 ring-offset-1 ring-blue-400" : ""}`}
                                onClick={() => setSelectedProject(selectedProject === projId ? null : projId)}
                              >
                                <div className="p-6">
                                  <div className="flex items-start justify-between mb-4">
                                    <div>
                                      <EditableField value={c(`${prefix}_${project._idx}_t`, project.title)} onSave={save(`${prefix}_${project._idx}_t`)} as="h3" className="text-xl font-semibold text-gray-900 mb-1" />
                                      <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>{project.period}</span><span>{"/"}</span><span>{project.role}</span>
                                      </div>
                                    </div>
                                    <span className={`${color.light} ${color.text} px-3 py-1 rounded-full text-xs font-medium border ${color.border}`}>{project.type}</span>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                    {project.achievements.map((a, i) => (<div key={i} className="text-center py-2 bg-gray-50/80 rounded-xl"><div className="text-sm font-semibold text-gray-900">{a}</div></div>))}
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {project.tags.map((tag, i) => (<span key={i} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">{tag}</span>))}
                                  </div>
                                </div>
                              </div>
                              {selectedProject === projId && (
                                <div className={`${color.light} rounded-2xl p-6 border ${color.border} shadow-sm`}>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div><h4 className="font-semibold text-gray-900 mb-2 text-sm">Challenge</h4><EditableField value={c(`${prefix}_${project._idx}_ch`, project.challenge)} onSave={save(`${prefix}_${project._idx}_ch`)} as="p" className="text-gray-700 text-sm leading-relaxed" multiline /></div>
                                    <div><h4 className="font-semibold text-gray-900 mb-2 text-sm">Solution</h4><EditableField value={c(`${prefix}_${project._idx}_sl`, project.solution)} onSave={save(`${prefix}_${project._idx}_sl`)} as="p" className="text-gray-700 text-sm leading-relaxed" multiline /></div>
                                    <div><h4 className="font-semibold text-gray-900 mb-2 text-sm">Result</h4><EditableField value={c(`${prefix}_${project._idx}_rs`, project.result)} onSave={save(`${prefix}_${project._idx}_rs`)} as="p" className="text-gray-700 text-sm leading-relaxed" multiline /></div>
                                  </div>
                                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">Technologies</h4>
                                    <div className="flex flex-wrap gap-1.5">{project.technologies.map((t, i) => (<span key={i} className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">{t}</span>))}</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })()}



        {/* ===== VISION TAB ===== */}
        {activeTab === "vision" && (
          <div className="space-y-16">
            {/* Philosophy */}
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-200/50">
              <EditableField value={vc("phQuote", currentContent.vision.philosophy.quote)} onSave={vsave("phQuote")} as="p" className="text-2xl font-light mb-4 italic text-gray-900" />
              <EditableField value={vc("phAuthor", currentContent.vision.philosophy.author)} onSave={vsave("phAuthor")} as="p" className="text-gray-600 text-lg" />
              <EditableField value={vc("phDesc", currentContent.vision.philosophy.description)} onSave={vsave("phDesc")} as="p" className="text-gray-700 mt-6 max-w-3xl mx-auto leading-relaxed" multiline />
            </div>

            {/* My Approach */}
            <div>
              <SectionHeader title={language === "ko" ? "나의 접근 방식" : "My Approach"} editKey="approachTitle" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentContent.vision.approach.map((item, index) => (
                  <div key={index} className="group bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="flex items-start mb-4">
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <EditableField value={vc(`ap_${index}_t`, item.title)} onSave={vsave(`ap_${index}_t`)} as="h3" className="font-semibold text-gray-900 text-lg mb-1" />
                        <EditableField value={vc(`ap_${index}_d`, item.description)} onSave={vsave(`ap_${index}_d`)} as="p" className="text-gray-600 text-sm" />
                      </div>
                    </div>
                    <div className="flex items-center pt-3 border-t border-gray-100">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <EditableField value={vc(`ap_${index}_i`, item.impact)} onSave={vsave(`ap_${index}_i`)} as="span" className="text-green-700 font-medium text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Future Goals */}
            <div>
              <SectionHeader title={language === "ko" ? "미래 목표" : "Future Goals"} editKey="goalsTitle" />
              <div className="space-y-6">
                {currentContent.vision.goals.map((goal, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start">
                      <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mr-6 flex-shrink-0 shadow-lg">
                        <EditableField value={vc(`gl_${index}_tl`, goal.timeline)} onSave={vsave(`gl_${index}_tl`)} as="span" className="text-white font-light text-sm" />
                      </div>
                      <div className="flex-1">
                        <EditableField value={vc(`gl_${index}_t`, goal.title)} onSave={vsave(`gl_${index}_t`)} as="h3" className="font-semibold text-gray-900 text-xl mb-2" />
                        <EditableField value={vc(`gl_${index}_d`, goal.description)} onSave={vsave(`gl_${index}_d`)} as="p" className="text-gray-700 leading-relaxed mb-3" multiline />
                        <div className="bg-green-50 rounded-xl px-4 py-2 border border-green-100 inline-block">
                          <EditableField value={vc(`gl_${index}_ei`, goal.expectedImpact)} onSave={vsave(`gl_${index}_ei`)} as="span" className="text-green-800 font-medium text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact + CTA */}
            <div className="bg-gray-900 rounded-3xl p-10 text-center text-white shadow-2xl">
              <EditableField value={vc("ctaTitle", currentContent.vision.ctaTitle)} onSave={vsave("ctaTitle")} as="h2" className="text-3xl font-light mb-3 text-white" />
              <EditableField value={vc("ctaDesc", currentContent.vision.ctaDescription)} onSave={vsave("ctaDesc")} as="p" className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {currentContent.vision.contacts.map((contact, i) => (
                  <div key={i} className="text-center">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">{contact.icon}</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-1">{contact.label}</p>
                    <p className="text-white text-sm font-mono">{contact.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
