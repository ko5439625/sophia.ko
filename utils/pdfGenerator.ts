interface PDFContent {
  language: "ko" | "en"
}

export const generatePortfolioPDF = async ({ language }: PDFContent) => {
  console.log("포트폴리오 PDF 생성 시작...")

  // html2pdf 대신 브라우저 인쇄 기능 사용
  const content = createPortfolioContent(language)
  openPrintWindow(content, language, "portfolio")
}

function createPortfolioContent(language: "ko" | "en") {
  const content = {
    ko: {
      title: "고아현 - QA 엔지니어 포트폴리오",
      subtitle: "QA Engineer • QA 전문가 • 99.7% 프로젝트 성공률",
      executiveSummary:
        "5년간의 체계적인 QA 경험을 바탕으로 품질 혁신과 프로세스 개선을 통해 팀 성과 향상에 기여하는 전문가입니다. 15개 이상의 주요 프로젝트에서 99.7%의 성공률을 달성하며, 예방적 품질 관리와 데이터 기반 의사결정으로 조직의 품질 문화를 혁신해왔습니다.",
      quote: "완벽한 제품보다는 사용자가 행복한 제품을 만드는 데 기여하고 싶습니다",
      contact: {
        name: "고아현",
        position: "QA Engineer",
        experience: "2020.01 ~ 현재",
        education: "컴퓨터공학과 학사",
        email: "sophia.ko@email.com",
        phone: "010-1234-5678",
        github: "github.com/sophia-ko",
        linkedin: "linkedin.com/in/sophia-ko",
      },
      aboutQA: [
        {
          question: "QA 업무를 시작하게 된 계기는?",
          answer:
            "대학교에서 컴퓨터공학을 전공하며 개발 프로젝트를 진행할 때, 완벽하다고 생각했던 코드에서 예상치 못한 버그들을 발견하는 경험을 했습니다. 그때 '사용자 관점에서 제품을 바라보는 것'의 중요성을 깨달았고, 품질 보증이라는 분야에 매력을 느꼈습니다.",
        },
        {
          question: "5년간 가장 중요하게 생각하는 QA 가치는?",
          answer:
            "예방적 접근법입니다. 버그를 찾아내는 것도 중요하지만, 애초에 버그가 발생하지 않도록 하는 것이 더 중요하다고 생각합니다. 요구사항 분석 단계부터 참여하여 모호한 부분을 명확히 하고, 개발 초기부터 테스트 케이스를 설계하여 품질을 내재화하는 것이 진정한 QA의 가치라고 믿습니다.",
        },
        {
          question: "다른 QA와 차별화되는 강점은?",
          answer:
            "개발팀과의 원활한 소통 능력입니다. 단순히 버그를 보고하는 것이 아니라, 재현 단계를 명확히 정리하고 근본 원인을 함께 분석합니다. 또한 자동화 도구를 활용하여 반복적인 테스트를 효율화하고, 데이터 기반으로 우선순위를 결정하는 체계적인 접근 방식을 가지고 있습니다.",
        },
        {
          question: "가장 기억에 남는 프로젝트는?",
          answer:
            "결제 시스템 품질 검증 프로젝트입니다. 금융 서비스의 특성상 단 하나의 오류도 용납할 수 없는 상황에서, 다양한 결제 시나리오와 예외 상황을 체계적으로 테스트했습니다. 특히 동시 결제, 네트워크 오류, 부분 결제 등의 엣지 케이스를 발견하고 해결하여 99.7%의 성공률을 달성했습니다.",
        },
      ],
      approach: [
        {
          title: "사용자 중심 사고",
          description: "기술적 완성도보다 사용자 경험을 우선시합니다",
          details:
            "실제 사용자 시나리오를 기반으로 테스트 케이스를 설계하고, 사용성 테스트를 통해 진짜 문제를 찾아냅니다. 개발자 관점이 아닌 사용자 관점에서 제품을 바라봅니다.",
          impact: "사용자 만족도 95% 달성",
        },
        {
          title: "데이터 기반 의사결정",
          description: "직감이 아닌 명확한 데이터로 우선순위를 결정합니다",
          details:
            "테스트 커버리지, 버그 발견율, 사용자 피드백 등 정량적 지표를 활용해 객관적인 품질 평가를 수행합니다. 대시보드를 통해 품질 현황을 실시간으로 모니터링합니다.",
          impact: "의사결정 속도 60% 향상",
        },
        {
          title: "예방적 품질 관리",
          description: "문제를 찾는 것보다 문제가 생기지 않게 하는 것",
          details:
            "요구사항 분석 단계부터 참여하여 모호한 부분을 사전에 명확히 하고, 개발 초기부터 품질 기준을 설정합니다. 코드 리뷰와 정적 분석을 통해 버그를 예방합니다.",
          impact: "프로덕션 버그 80% 감소",
        },
        {
          title: "지속적인 개선",
          description: "완벽한 프로세스는 없다, 계속 발전시켜야 한다",
          details:
            "회고를 통해 프로세스의 문제점을 파악하고 개선 방안을 도출합니다. 새로운 도구와 방법론을 적극적으로 도입하여 팀의 생산성을 높입니다.",
          impact: "팀 효율성 40% 향상",
        },
      ],
      goals: [
        {
          timeline: "2025년",
          title: "AI 기반 QA 도구 개발",
          description: "머신러닝을 활용한 자동 테스트 케이스 생성 도구를 개발하여 테스트 효율성을 극대화합니다.",
          expectedImpact: "테스트 케이스 작성 시간 70% 단축",
        },
        {
          timeline: "2026년",
          title: "QA 교육 플랫폼 구축",
          description: "주니어 QA 엔지니어들을 위한 체계적인 교육 플랫폼을 만들어 업계 전체의 품질 수준을 높입니다.",
          expectedImpact: "업계 QA 역량 전반적 향상",
        },
        {
          timeline: "2027년+",
          title: "품질 우선 문화 전파",
          description: "기업 문화 차원에서 품질을 최우선으로 생각하는 조직을 만드는 컨설팅을 제공합니다.",
          expectedImpact: "품질 우선 기업 문화 확산",
        },
      ],
    },
    en: {
      title: "Goahyun Ko - QA Engineer Portfolio",
      subtitle: "Senior QA Professional • 5 Years Experience • 99.7% Project Success Rate",
      executiveSummary:
        "A professional who contributes to team performance improvement through quality innovation and process improvement based on 5 years of systematic QA experience. Achieved 99.7% success rate across 15+ major projects, revolutionizing organizational quality culture through preventive quality management and data-driven decision making.",
      quote: "I want to contribute to creating products that make users happy rather than perfect products",
      contact: {
        name: "Goahyun Ko",
        position: "Senior QA Engineer",
        experience: "5 years (2020.01 ~ Present)",
        education: "Bachelor's in Computer Science",
        email: "sophia.ko@email.com",
        phone: "+82 10-1234-5678",
        github: "github.com/sophia-ko",
        linkedin: "linkedin.com/in/sophia-ko",
      },
      aboutQA: [
        {
          question: "What got you into QA?",
          answer:
            "During my computer science studies, I discovered bugs in what I thought was perfect code. That moment taught me the importance of seeing products from a user's perspective. Quality assurance became my passion because it bridges the gap between developers and users.",
        },
        {
          question: "Core QA philosophy?",
          answer:
            "Prevention over detection. While finding bugs is important, preventing them is crucial. I participate from requirements analysis, clarify ambiguities, and design test cases early to build quality into the product from day one.",
        },
        {
          question: "What makes you different?",
          answer:
            "Seamless communication with dev teams. I don't just report bugs—I provide clear reproduction steps and collaborate on root cause analysis. Plus, I leverage automation tools and make data-driven priority decisions.",
        },
        {
          question: "Most memorable project?",
          answer:
            "Payment system quality verification. With zero tolerance for errors in financial services, I systematically tested various payment scenarios and edge cases, achieving 99.7% success rate. It reinforced my sense of social responsibility as a QA engineer.",
        },
      ],
      approach: [
        {
          title: "User-Centric Thinking",
          description: "Prioritizing user experience over technical perfection",
          details:
            "Design test cases based on real user scenarios and find genuine problems through usability testing. View products from user perspective, not developer perspective.",
          impact: "95% user satisfaction achieved",
        },
        {
          title: "Data-Driven Decisions",
          description: "Making decisions based on clear data, not intuition",
          details:
            "Perform objective quality assessments using quantitative metrics like test coverage, bug detection rate, and user feedback. Monitor quality status in real-time through dashboards.",
          impact: "60% faster decision making",
        },
        {
          title: "Preventive Quality Management",
          description: "Preventing problems rather than finding them",
          details:
            "Participate from requirements analysis stage to clarify ambiguities early and set quality standards from development start. Prevent bugs through code reviews and static analysis.",
          impact: "80% reduction in production bugs",
        },
        {
          title: "Continuous Improvement",
          description: "No process is perfect, it must keep evolving",
          details:
            "Identify process issues through retrospectives and derive improvement solutions. Actively adopt new tools and methodologies to increase team productivity.",
          impact: "40% improvement in team efficiency",
        },
      ],
      goals: [
        {
          timeline: "2025",
          title: "AI-Powered QA Tool Development",
          description:
            "Develop automated test case generation tools using machine learning to maximize testing efficiency.",
          expectedImpact: "70% reduction in test case writing time",
        },
        {
          timeline: "2026",
          title: "QA Education Platform",
          description:
            "Create systematic education platform for junior QA engineers to raise industry-wide quality standards.",
          expectedImpact: "Overall improvement in industry QA capabilities",
        },
        {
          timeline: "2027+",
          title: "Quality-First Culture Evangelism",
          description:
            "Provide consulting to create organizations that prioritize quality at the corporate culture level.",
          expectedImpact: "Spread quality-first corporate culture",
        },
      ],
    },
  }

  const currentContent = content[language]

  return `
<div style="font-family: ${language === "ko" ? "'Noto Sans KR'" : "'Inter'"}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: white; line-height: 1.4; color: #374151; font-size: 12px;">
    
    <!-- Page 1: Cover & Executive Summary -->
    <div style="padding: 25mm 20mm 20mm 20mm; page-break-after: always; page-break-inside: avoid;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1e40af; padding-bottom: 20px;">
            <h1 style="color: #1e40af; font-size: 26px; margin: 0 0 12px 0; font-weight: 700;">${currentContent.title}</h1>
            <p style="color: #6b7280; margin: 0; font-size: 16px; font-weight: 500;">${currentContent.subtitle}</p>
        </div>
        
        <!-- Profile Section -->
        <div style="display: flex; align-items: center; margin: 25px 0; background: #f8fafc; padding: 25px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <div style="width: 90px; height: 90px; background: #374151; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin-right: 25px; flex-shrink: 0;">
                <span style="color: white; font-size: 36px; font-weight: 300;">고</span>
            </div>
            <div style="flex: 1;">
                <h2 style="color: #1e40af; font-size: 20px; margin: 0 0 10px 0; font-weight: 600;">${currentContent.contact.name}</h2>
                <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">${currentContent.contact.position}</p>
                <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">${currentContent.contact.experience}</p>
                <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">${currentContent.contact.education}</p>
                <div style="margin-top: 12px; font-size: 12px;">
                    <span style="color: #374151; margin-right: 20px;">📧 ${currentContent.contact.email}</span>
                    <span style="color: #374151;">📱 ${currentContent.contact.phone}</span>
                </div>
                <div style="margin-top: 6px; font-size: 12px;">
                    <span style="color: #374151; margin-right: 20px;">💻 ${currentContent.contact.github}</span>
                    <span style="color: #374151;">💼 ${currentContent.contact.linkedin}</span>
                </div>
            </div>
        </div>
        
        <!-- Executive Summary -->
        <div style="background: #f0f9ff; border-left: 4px solid #1e40af; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h2 style="margin-top: 0; color: #1e40af; font-size: 18px; font-weight: 600; margin-bottom: 12px;">Executive Summary</h2>
            <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #374151;">
                ${currentContent.executiveSummary}
            </p>
        </div>
        
        <!-- Key Metrics -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 25px 0;">
            <div style="text-align: center; padding: 18px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <div style="font-size: 24px; font-weight: 700; color: #1e40af; margin-bottom: 6px;">99.7%</div>
                <div style="font-size: 10px; color: #6b7280; font-weight: 500;">${language === "ko" ? "프로젝트 성공률" : "Project Success Rate"}</div>
            </div>
            <div style="text-align: center; padding: 18px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <div style="font-size: 24px; font-weight: 700; color: #1e40af; margin-bottom: 6px;">70%</div>
                <div style="font-size: 10px; color: #6b7280; font-weight: 500;">${language === "ko" ? "테스트 시간 단축" : "Test Time Reduction"}</div>
            </div>
            <div style="text-align: center; padding: 18px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <div style="font-size: 24px; font-weight: 700; color: #1e40af; margin-bottom: 6px;">8${language === "ko" ? "개" : ""}</div>
                <div style="font-size: 10px; color: #6b7280; font-weight: 500;">${language === "ko" ? "플랫폼 경험" : "Platform Experience"}</div>
            </div>
            <div style="text-align: center; padding: 18px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
                <div style="font-size: 24px; font-weight: 700; color: #1e40af; margin-bottom: 6px;">15+</div>
                <div style="font-size: 10px; color: #6b7280; font-weight: 500;">${language === "ko" ? "주요 프로젝트" : "Major Projects"}</div>
            </div>
        </div>
    </div>

    <!-- Page 2: About Me -->
    <div style="padding: 25mm 20mm 20mm 20mm; page-break-after: always; page-break-inside: avoid;">
        <div style="border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 30px;">
            <h1 style="color: #1e40af; font-size: 22px; margin: 0; font-weight: 700;">About Me</h1>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">${language === "ko" ? "QA 전문가로서의 핵심 역량과 경험" : "Core Competencies and Experience as QA Professional"}</p>
        </div>
        
        <!-- 핵심 강점 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0;">
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px;">
                <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">${language === "ko" ? "기술적 전문성" : "Technical Expertise"}</h3>
                <ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.6;">
                    <li style="margin-bottom: 8px;">${language === "ko" ? "모바일/웹 크로스 플랫폼 테스트 (iOS, Android, Web)" : "Mobile/Web Cross-platform Testing (iOS, Android, Web)"}</li>
                    <li style="margin-bottom: 8px;">${language === "ko" ? "API 테스트 및 자동화 구축 (REST, GraphQL)" : "API Testing & Automation (REST, GraphQL)"}</li>
                    <li style="margin-bottom: 8px;">${language === "ko" ? "성능 최적화 및 보안 검증 (JMeter, OWASP)" : "Performance Optimization & Security Testing"}</li>
                    <li style="margin-bottom: 8px;">${language === "ko" ? "CI/CD 파이프라인 통합 (Jenkins, GitHub Actions)" : "CI/CD Pipeline Integration"}</li>
                </ul>
            </div>
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px;">
                <h3 style="color: #1e40af; font-size: 16px; margin: 0 0 15px 0; font-weight: 600;">${language === "ko" ? "조직 기여" : "Organizational Impact"}</h3>
                <ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.6;">
                    <li style="margin-bottom: 8px;">${language === "ko" ? "QA 프로세스 표준화 주도 (팀 효율성 40% 향상)" : "QA Process Standardization (40% efficiency improvement)"}</li>
                    <li style="margin-bottom: 8px;">${language === "ko" ? "개발팀과의 효율적 협업 체계 구축" : "Efficient Dev Team Collaboration Framework"}</li>
                    <li style="margin-bottom: 8px;">${language === "ko" ? "지속적인 품질 문화 정착 (버그 80% 감소)" : "Quality Culture Establishment (80% bug reduction)"}</li>
                    <li style="margin-bottom: 8px;">${language === "ko" ? "데이터 기반 의사결정 체계 도입" : "Data-Driven Decision Framework Implementation"}</li>
                </ul>
            </div>
        </div>

        <!-- 핵심 성과 지표 -->
        <div style="background: #f0f9ff; border: 1px solid #dbeafe; border-radius: 10px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #1e40af; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; text-align: center;">${language === "ko" ? "핵심 성과 지표" : "Key Performance Metrics"}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">95%</div>
                    <div style="font-size: 12px; color: #374151; font-weight: 500;">${language === "ko" ? "버그 발견율" : "Bug Detection Rate"}</div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">${language === "ko" ? "프로덕션 배포 전" : "Before Production"}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">85%</div>
                    <div style="font-size: 12px; color: #374151; font-weight: 500;">${language === "ko" ? "테스트 자동화율" : "Test Automation Rate"}</div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">${language === "ko" ? "반복 테스트 자동화" : "Repetitive Test Automation"}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 8px;">0${language === "ko" ? "건" : ""}</div>
                    <div style="font-size: 12px; color: #374151; font-weight: 500;">${language === "ko" ? "치명적 이슈" : "Critical Issues"}</div>
                    <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">${language === "ko" ? "프로덕션 환경" : "Production Environment"}</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 3: Technical Skills -->
    <div style="padding: 25mm 20mm 20mm 20mm; page-break-after: always; page-break-inside: avoid;">
        <div style="border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 25px;">
            <h1 style="color: #1e40af; font-size: 22px; margin: 0; font-weight: 700;">${language === "ko" ? "기술 스택 & 전문성" : "Technical Skills & Expertise"}</h1>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">${language === "ko" ? "5년간 축적된 QA 기술 역량과 성과" : "5 Years of QA Technical Capabilities & Results"}</p>
        </div>
        
        <!-- Mobile Testing -->
        <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 15px 0;">
            <h3 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">📱</span> ${language === "ko" ? "모바일 테스팅" : "Mobile Testing"}
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                        <strong style="font-size: 13px; color: #374151; margin-right: 8px;">iOS Testing</strong>
                        <div style="display: flex; margin-right: 10px;">
                            ${[1, 2, 3, 4, 5].map((i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${i <= 5 ? "#1e40af" : "#e2e8f0"}; margin-right: 2px;"></div>`).join("")}
                        </div>
                        <span style="font-size: 11px; color: #6b7280;">5/5</span>
                    </div>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0 8px 0; line-height: 1.4;">
                        ${language === "ko" ? "네이티브 iOS 앱 테스트, TestFlight 베타 관리" : "Native iOS app testing, TestFlight beta management"}
                    </p>
                    <div style="margin-top: 6px;">
                        <span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">XCTest</span>
                        <span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">XCUITest</span>
                        <span style="background: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 8px; font-size: 9px;">TestFlight</span>
                    </div>
                </div>
                <div>
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                        <strong style="font-size: 13px; color: #374151; margin-right: 8px;">Android Testing</strong>
                        <div style="display: flex; margin-right: 10px;">
                            ${[1, 2, 3, 4, 5].map((i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${i <= 5 ? "#1e40af" : "#e2e8f0"}; margin-right: 2px;"></div>`).join("")}
                        </div>
                        <span style="font-size: 11px; color: #6b7280;">5/5</span>
                    </div>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0 8px 0; line-height: 1.4;">
                        ${language === "ko" ? "Android 파편화 해결, 다양한 디바이스 호환성" : "Android fragmentation resolution, device compatibility"}
                    </p>
                    <div style="margin-top: 6px;">
                        <span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">Espresso</span>
                        <span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">UI Automator</span>
                        <span style="background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 8px; font-size: 9px;">Firebase Test Lab</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Web Testing -->
        <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 15px 0;">
            <h3 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">🌐</span> ${language === "ko" ? "웹 테스팅" : "Web Testing"}
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                        <strong style="font-size: 13px; color: #374151; margin-right: 8px;">Frontend Testing</strong>
                        <div style="display: flex; margin-right: 10px;">
                            ${[1, 2, 3, 4, 5].map((i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${i <= 4 ? "#1e40af" : "#e2e8f0"}; margin-right: 2px;"></div>`).join("")}
                        </div>
                        <span style="font-size: 11px; color: #6b7280;">4/5</span>
                    </div>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0 8px 0; line-height: 1.4;">
                        ${language === "ko" ? "React, Vue.js SPA E2E 테스트, 크로스 브라우저" : "React, Vue.js SPA E2E testing, cross-browser"}
                    </p>
                    <div style="margin-top: 6px;">
                        <span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">Selenium</span>
                        <span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">Cypress</span>
                        <span style="background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 8px; font-size: 9px;">Playwright</span>
                    </div>
                </div>
                <div>
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                        <strong style="font-size: 13px; color: #374151; margin-right: 8px;">API Testing</strong>
                        <div style="display: flex; margin-right: 10px;">
                            ${[1, 2, 3, 4, 5].map((i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${i <= 5 ? "#1e40af" : "#e2e8f0"}; margin-right: 2px;"></div>`).join("")}
                        </div>
                        <span style="font-size: 11px; color: #6b7280;">5/5</span>
                    </div>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0 8px 0; line-height: 1.4;">
                        ${language === "ko" ? "RESTful/GraphQL API 테스트, 계약 테스트" : "RESTful/GraphQL API testing, contract testing"}
                    </p>
                    <div style="margin-top: 6px;">
                        <span style="background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">Postman</span>
                        <span style="background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">REST Assured</span>
                        <span style="background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 8px; font-size: 9px;">Newman</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Automation & DevOps -->
        <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 15px 0;">
            <h3 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; display: flex; align-items: center;">
                <span style="margin-right: 8px;">⚙️</span> ${language === "ko" ? "자동화 & DevOps" : "Automation & DevOps"}
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                        <strong style="font-size: 13px; color: #374151; margin-right: 8px;">Test Automation</strong>
                        <div style="display: flex; margin-right: 10px;">
                            ${[1, 2, 3, 4, 5].map((i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${i <= 4 ? "#1e40af" : "#e2e8f0"}; margin-right: 2px;"></div>`).join("")}
                        </div>
                        <span style="font-size: 11px; color: #6b7280;">4/5</span>
                    </div>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0 8px 0; line-height: 1.4;">
                        ${language === "ko" ? "Page Object Model 프레임워크, CI/CD 통합" : "Page Object Model framework, CI/CD integration"}
                    </p>
                    <div style="margin-top: 6px;">
                        <span style="background: #fce7f3; color: #be185d; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">Python</span>
                        <span style="background: #fce7f3; color: #be185d; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">Java</span>
                        <span style="background: #fce7f3; color: #be185d; padding: 2px 6px; border-radius: 8px; font-size: 9px;">Jenkins</span>
                    </div>
                </div>
                <div>
                    <div style="display: flex; align-items: center; margin-bottom: 6px;">
                        <strong style="font-size: 13px; color: #374151; margin-right: 8px;">Performance Testing</strong>
                        <div style="display: flex; margin-right: 10px;">
                            ${[1, 2, 3, 4, 5].map((i) => `<div style="width: 8px; height: 8px; border-radius: 50%; background: ${i <= 4 ? "#1e40af" : "#e2e8f0"}; margin-right: 2px;"></div>`).join("")}
                        </div>
                        <span style="font-size: 11px; color: #6b7280;">4/5</span>
                    </div>
                    <p style="font-size: 10px; color: #6b7280; margin: 3px 0 8px 0; line-height: 1.4;">
                        ${language === "ko" ? "대용량 트래픽 테스트, 성능 최적화" : "High-volume traffic testing, performance optimization"}
                    </p>
                    <div style="margin-top: 6px;">
                        <span style="background: #f3e8ff; color: #7c3aed; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">JMeter</span>
                        <span style="background: #f3e8ff; color: #7c3aed; padding: 2px 6px; border-radius: 8px; font-size: 9px; margin-right: 4px;">K6</span>
                        <span style="background: #f3e8ff; color: #7c3aed; padding: 2px 6px; border-radius: 8px; font-size: 9px;">Artillery</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Page 4: Project 1 -->
    <div style="padding: 25mm 20mm 20mm 20mm; page-break-after: always; page-break-inside: avoid;">
        <div style="border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 25px;">
            <h1 style="color: #1e40af; font-size: 22px; margin: 0; font-weight: 700;">${language === "ko" ? "주요 프로젝트 성과" : "Major Project Results"}</h1>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">${language === "ko" ? "정량적 성과와 비즈니스 임팩트" : "Quantitative Results & Business Impact"}</p>
        </div>
        
        <!-- Project 1 -->
        <div style="border: 2px solid #e2e8f0; border-radius: 10px; padding: 25px; margin: 20px 0; background: #fafbfc;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <h3 style="color: #1e40af; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">${language === "ko" ? "결제 시스템 품질 보증" : "Payment System Quality Assurance"}</h3>
                    <div style="color: #6b7280; font-size: 12px; margin-bottom: 12px;">2022.03 - 2022.08 | Lead QA Engineer | ${language === "ko" ? "팀 규모: 7명" : "Team Size: 7"}</div>
                </div>
                <div style="background: #dbeafe; color: #1e40af; padding: 8px 12px; border-radius: 15px; font-size: 11px; font-weight: 600;">
                    ${language === "ko" ? "금융" : "Financial"}
                </div>
            </div>
            <p style="margin: 15px 0; font-size: 13px; line-height: 1.6; color: #374151;">
                ${language === "ko" ? "금융 서비스 특성상 제로 오류 요구사항 하에서 다양한 결제 시나리오 검증. 동시 결제, 네트워크 장애, 부분 결제 등 엣지 케이스 집중 테스트를 통해 시스템 안정성을 확보했습니다." : "Zero-error requirement verification for various payment scenarios. Ensured system stability through focused testing on edge cases including concurrent payments, network failures, and partial payments."}
            </p>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 25px 0;">
                <div style="text-align: center; background: white; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 24px; font-weight: 700; color: #059669; margin-bottom: 6px;">43${language === "ko" ? "개" : ""}</div>
                    <div style="font-size: 10px; color: #6b7280; font-weight: 500;">${language === "ko" ? "버그 발견" : "Bugs Found"}</div>
                </div>
                <div style="text-align: center; background: white; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 24px; font-weight: 700; color: #059669; margin-bottom: 6px;">99.7%</div>
                    <div style="font-size: 10px; color: #6b7280; font-weight: 500;">${language === "ko" ? "성공률" : "Success Rate"}</div>
                </div>
                <div style="text-align: center; background: white; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 24px; font-weight: 700; color: #059669; margin-bottom: 6px;">0${language === "ko" ? "건" : ""}</div>
                    <div style="font-size: 10px; color: #6b7280; font-weight: 500;">${language === "ko" ? "치명적 이슈" : "Critical Issues"}</div>
                </div>
                <div style="text-align: center; background: white; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 24px; font-weight: 700; color: #059669; margin-bottom: 6px;">✓</div>
                    <div style="font-size: 10px; color: #6b7280; font-weight: 500;">PCI DSS</div>
                </div>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px; margin-top: 20px;">
                <div style="font-size: 12px; color: #166534; font-weight: 600; margin-bottom: 6px;">${language === "ko" ? "비즈니스 임팩트:" : "Business Impact:"}</div>
                <div style="font-size: 11px; color: #15803d; line-height: 1.5;">${language === "ko" ? "서비스 출시 후 6개월간 결제 관련 장애 0건 달성, 고객 신뢰도 98% 유지, 일일 거래량 300% 증가 지원" : "Zero payment-related incidents for 6 months post-launch, maintained 98% customer trust, supported 300% increase in daily transaction volume"}</div>
            </div>
        </div>
    </div>

    <!-- Page 5: Project 2 & 3 -->
    <div style="padding: 25mm 20mm 20mm 20mm; page-break-after: always; page-break-inside: avoid;">
        <!-- Project 2 -->
        <div style="border: 2px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 0 0 25px 0; background: #fafbfc;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <h3 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${language === "ko" ? "모바일 앱 성능 최적화" : "Mobile App Performance Optimization"}</h3>
                    <div style="color: #6b7280; font-size: 11px; margin-bottom: 10px;">2023.05 - 2023.12 | Senior QA Engineer | ${language === "ko" ? "팀 규모: 11명" : "Team Size: 11"}</div>
                </div>
                <div style="background: #fef3c7; color: #92400e; padding: 6px 10px; border-radius: 15px; font-size: 10px; font-weight: 600;">
                    ${language === "ko" ? "모바일" : "Mobile"}
                </div>
            </div>
            <p style="margin: 12px 0; font-size: 11px; line-height: 1.5; color: #374151;">
                ${language === "ko" ? "사용자 증가로 인한 성능 저하 문제 해결. 다양한 디바이스/네트워크 환경 성능 테스트, 메모리 누수 및 배터리 소모 패턴 분석을 통해 앱 안정성을 크게 향상시켰습니다." : "Resolved performance degradation due to user growth. Significantly improved app stability through performance testing across various devices/networks and memory leak/battery consumption analysis."}
            </p>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0;">
                <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 4px;">50%</div>
                    <div style="font-size: 9px; color: #6b7280; font-weight: 500;">${language === "ko" ? "로딩 시간 개선" : "Loading Time"}</div>
                </div>
                <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 4px;">0.1%</div>
                    <div style="font-size: 9px; color: #6b7280; font-weight: 500;">${language === "ko" ? "크래시율" : "Crash Rate"}</div>
                </div>
                <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 4px;">95%</div>
                    <div style="font-size: 9px; color: #6b7280; font-weight: 500;">${language === "ko" ? "사용자 만족도" : "User Satisfaction"}</div>
                </div>
                <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 4px;">4.8</div>
                    <div style="font-size: 9px; color: #6b7280; font-weight: 500;">${language === "ko" ? "앱스토어 평점" : "App Store Rating"}</div>
                </div>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px; margin-top: 12px;">
                <div style="font-size: 10px; color: #166534; font-weight: 600;">${language === "ko" ? "비즈니스 임팩트:" : "Business Impact:"}</div>
                <div style="font-size: 10px; color: #15803d; margin-top: 3px;">${language === "ko" ? "사용자 이탈률 25% 감소, 일일 활성 사용자 30% 증가" : "25% reduction in user churn, 30% increase in daily active users"}</div>
            </div>
        </div>

        <!-- Project 3 -->
        <div style="border: 2px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 0; background: #fafbfc;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div style="flex: 1;">
                    <h3 style="color: #1e40af; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">${language === "ko" ? "테스트 자동화 프레임워크" : "Test Automation Framework"}</h3>
                    <div style="color: #6b7280; font-size: 11px; margin-bottom: 10px;">2021.01 - 2021.06 | Automation Engineer | ${language === "ko" ? "팀 규모: 4명" : "Team Size: 4"}</div>
                </div>
                <div style="background: #e0e7ff; color: #3730a3; padding: 6px 10px; border-radius: 15px; font-size: 10px; font-weight: 600;">
                    ${language === "ko" ? "자동화" : "Automation"}
                </div>
            </div>
            <p style="margin: 12px 0; font-size: 11px; line-height: 1.5; color: #374151;">
                ${language === "ko" ? "수동 테스트로 인한 개발 속도 저하 해결. Page Object Model 패턴 적용 확장 가능한 자동화 프레임워크 설계 및 CI/CD 통합으로 개발 생산성을 크게 향상시켰습니다." : "Resolved development speed issues from manual testing. Significantly improved development productivity through scalable automation framework design with Page Object Model pattern and CI/CD integration."}
            </p>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 18px 0;">
                <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 4px;">70%</div>
                    <div style="font-size: 9px; color: #6b7280; font-weight: 500;">${language === "ko" ? "시간 단축" : "Time Reduction"}</div>
                </div>
                <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 4px;">95%</div>
                    <div style="font-size: 9px; color: #6b7280; font-weight: 500;">${language === "ko" ? "커버리지" : "Coverage"}</div>
                </div>
                <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 4px;">3${language === "ko" ? "개" : ""}</div>
                    <div style="font-size: 9px; color: #6b7280; font-weight: 500;">${language === "ko" ? "팀 도입" : "Teams Adopted"}</div>
                </div>
                <div style="text-align: center; background: white; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <div style="font-size: 18px; font-weight: 700; color: #059669; margin-bottom: 4px;">↑</div>
                    <div style="font-size: 9px; color: #6b7280; font-weight: 500;">${language === "ko" ? "생산성" : "Productivity"}</div>
                </div>
            </div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px; margin-top: 12px;">
                <div style="font-size: 10px; color: #166534; font-weight: 600;">${language === "ko" ? "비즈니스 임팩트:" : "Business Impact:"}</div>
                <div style="font-size: 10px; color: #15803d; margin-top: 3px;">${language === "ko" ? "릴리즈 주기 2주 단축, 개발팀 생산성 40% 향상" : "2-week shorter release cycle, 40% development team productivity improvement"}</div>
            </div>
        </div>
    </div>

    <!-- Page 6: Achievements & Certifications -->
    <div style="padding: 25mm 20mm 20mm 20mm;">
        <div style="border-bottom: 3px solid #1e40af; padding-bottom: 15px; margin-bottom: 25px;">
            <h1 style="color: #1e40af; font-size: 22px; margin: 0; font-weight: 700;">${language === "ko" ? "성과 & 인증" : "Achievements & Certifications"}</h1>
            <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 14px;">${language === "ko" ? "검증된 전문성과 정량적 성과" : "Verified Expertise & Quantitative Results"}</p>
        </div>
        
        <!-- Key Metrics -->
        <h2 style="color: #1e40af; font-size: 18px; margin: 20px 0 15px 0; font-weight: 600;">${language === "ko" ? "핵심 성과 지표" : "Key Performance Indicators"}</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; margin: 20px 0;">
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 10px;">99.7%</div>
                <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">${language === "ko" ? "프로젝트 성공률" : "Project Success Rate"}</div>
                <div style="font-size: 11px; color: #6b7280; line-height: 1.4;">${language === "ko" ? "15개 주요 프로젝트 중 모든 프로젝트 성공적 완료. 평균 일정 준수율 98%" : "Successfully completed all 15 major projects. 98% average schedule adherence"}</div>
            </div>
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 10px;">95%</div>
                <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">${language === "ko" ? "버그 발견율" : "Bug Detection Rate"}</div>
                <div style="font-size: 11px; color: #6b7280; line-height: 1.4;">${language === "ko" ? "프로덕션 배포 전 95% 이상의 버그 사전 발견. 고객 영향 버그 최소화" : "95%+ bugs found before production deployment. Minimized customer-impacting bugs"}</div>
            </div>
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 10px;">85%</div>
                <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">${language === "ko" ? "테스트 자동화율" : "Test Automation Rate"}</div>
                <div style="font-size: 11px; color: #6b7280; line-height: 1.4;">${language === "ko" ? "반복 테스트의 85%를 자동화로 전환. 테스트 실행 시간 70% 단축" : "85% of repetitive tests converted to automation. 70% reduction in test execution time"}</div>
            </div>
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-align: center;">
                <div style="font-size: 32px; font-weight: 700; color: #1e40af; margin-bottom: 10px;">40%</div>
                <div style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">${language === "ko" ? "팀 효율성 향상" : "Team Efficiency Improvement"}</div>
                <div style="font-size: 11px; color: #6b7280; line-height: 1.4;">${language === "ko" ? "QA 프로세스 개선을 통한 전체 팀 생산성 향상. 릴리즈 주기 단축" : "Overall team productivity improvement through QA process enhancement. Shortened release cycles"}</div>
            </div>
        </div>

        <!-- ROI & Business Impact -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #166534; font-size: 16px; margin: 0 0 15px 0; font-weight: 600; text-align: center;">${language === "ko" ? "비즈니스 임팩트 & ROI" : "Business Impact & ROI"}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #15803d; margin-bottom: 6px;">80%</div>
                    <div style="font-size: 11px; color: #166534; font-weight: 500;">${language === "ko" ? "프로덕션 버그 감소" : "Production Bug Reduction"}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #15803d; margin-bottom: 6px;">60%</div>
                    <div style="font-size: 11px; color: #166534; font-weight: 500;">${language === "ko" ? "의사결정 속도 향상" : "Faster Decision Making"}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #15803d; margin-bottom: 6px;">25%</div>
                    <div style="font-size: 11px; color: #166534; font-weight: 500;">${language === "ko" ? "사용자 이탈률 감소" : "User Churn Reduction"}</div>
                </div>
            </div>
        </div>

        <!-- Certifications -->
        <h2 style="color: #1e40af; font-size: 18px; margin: 25px 0 15px 0; font-weight: 600;">${language === "ko" ? "전문 자격증" : "Professional Certifications"}</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0;">
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                <h3 style="color: #374151; font-size: 13px; font-weight: 600; margin: 0 0 6px 0;">ISTQB Foundation Level</h3>
                <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">ISTQB • 2021</div>
                <div style="color: #1e40af; font-size: 10px;">${language === "ko" ? "소프트웨어 테스팅 국제 표준" : "International Software Testing Standard"}</div>
            </div>
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                <h3 style="color: #374151; font-size: 13px; font-weight: 600; margin: 0 0 6px 0;">AWS Cloud Practitioner</h3>
                <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">Amazon • 2022</div>
                <div style="color: #1e40af; font-size: 10px;">${language === "ko" ? "클라우드 인프라 전문성" : "Cloud Infrastructure Expertise"}</div>
            </div>
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px;">
                <h3 style="color: #374151; font-size: 13px; font-weight: 600; margin: 0 0 6px 0;">Certified Ethical Hacker</h3>
                <div style="color: #6b7280; font-size: 11px; margin-bottom: 4px;">EC-Council • 2023</div>
                <div style="color: #1e40af; font-size: 10px;">${language === "ko" ? "보안 테스팅 전문성" : "Security Testing Expertise"}</div>
            </div>
        </div>

        <!-- Awards -->
        <h2 style="color: #1e40af; font-size: 18px; margin: 25px 0 15px 0; font-weight: 600;">${language === "ko" ? "수상 내역" : "Awards & Recognition"}</h2>
        <div style="margin-bottom: 20px;">
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="color: #374151; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">${language === "ko" ? "올해의 QA 엔지니어" : "QA Engineer of the Year"}</h3>
                        <p style="color: #6b7280; font-size: 10px; margin: 0;">${language === "ko" ? "전사 QA 프로세스 혁신 기여" : "Company-wide QA process innovation contribution"}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 16px; font-weight: 700; color: #f59e0b;">2023</div>
                    </div>
                </div>
            </div>
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="color: #374151; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">${language === "ko" ? "프로세스 혁신상" : "Process Innovation Award"}</h3>
                        <p style="color: #6b7280; font-size: 10px; margin: 0;">${language === "ko" ? "테스트 자동화 프레임워크 구축" : "Test automation framework development"}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 16px; font-weight: 700; color: #f59e0b;">2023</div>
                    </div>
                </div>
            </div>
            <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h3 style="color: #374151; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">${language === "ko" ? "고객 만족 기여상" : "Customer Satisfaction Award"}</h3>
                        <p style="color: #6b7280; font-size: 10px; margin: 0;">${language === "ko" ? "사용자 만족도 95% 달성 기여" : "Contributed to 95% user satisfaction achievement"}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 16px; font-weight: 700; color: #f59e0b;">2024</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Information -->
        <div style="background: #374151; color: white; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
            <h2 style="font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">${language === "ko" ? "연락처" : "Contact Information"}</h2>
            <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
                <div style="text-align: center;">
                    <div style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">📧 Email</div>
                    <div style="font-size: 12px; font-weight: 500;">${currentContent.contact.email}</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">📱 Phone</div>
                    <div style="font-size: 12px; font-weight: 500;">${currentContent.contact.phone}</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">💻 GitHub</div>
                    <div style="font-size: 12px; font-weight: 500;">${currentContent.contact.github}</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #9ca3af; font-size: 11px; margin-bottom: 4px;">💼 LinkedIn</div>
                    <div style="font-size: 12px; font-weight: 500;">${currentContent.contact.linkedin}</div>
                </div>
            </div>
        </div>
    </div>
</div>
  `
}

function openPrintWindow(content: string, language: "ko" | "en", type: string) {
  const fileName =
    type === "portfolio"
      ? language === "ko"
        ? "고아현_QA_포트폴리오"
        : "Goahyun_Ko_QA_Portfolio"
      : language === "ko"
        ? "포트폴리오_질문지"
        : "Portfolio_Questionnaire"

  const printWindow = window.open("", "_blank", "width=900,height=700,scrollbars=yes")

  if (!printWindow) {
    alert(
      language === "ko"
        ? "팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요."
        : "Popup blocked. Please allow popups and try again.",
    )
    return
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${fileName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', 'Malgun Gothic', sans-serif;
          background: white;
          color: #333;
        }
        
        @media print {
          body {
            margin: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .no-print {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 0;
          }
        }
        
        .print-header {
          background: #3b82f6;
          color: white;
          padding: 20px;
          text-align: center;
          margin-bottom: 20px;
        }
        
        .print-instructions {
          background: #f0f9ff;
          border: 2px solid #3b82f6;
          border-radius: 8px;
          padding: 20px;
          margin: 20px;
          text-align: center;
        }
        
        .print-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin: 10px;
        }
        
        .print-button:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="print-header no-print">
        <h1>${fileName}</h1>
        <p>${language === "ko" ? "아래 버튼을 클릭하여 PDF로 저장하세요" : "Click the button below to save as PDF"}</p>
      </div>
      
      <div class="print-instructions no-print">
        <h2 style="color: #1e40af; margin-bottom: 15px;">
          📄 ${language === "ko" ? "PDF 저장 방법" : "How to Save as PDF"}
        </h2>
        <p style="margin-bottom: 15px; font-size: 16px;">
          ${
            language === "ko"
              ? "1. 아래 '인쇄하기' 버튼을 클릭하세요<br>2. 프린터 선택에서 'PDF로 저장' 또는 'Microsoft Print to PDF'를 선택하세요<br>3. '인쇄' 버튼을 클릭하여 PDF 파일을 저장하세요"
              : "1. Click the 'Print' button below<br>2. Select 'Save as PDF' or 'Microsoft Print to PDF' from printer options<br>3. Click 'Print' to save the PDF file"
          }
        </p>
        <button class="print-button" onclick="window.print()">
          🖨️ ${language === "ko" ? "인쇄하기 (PDF 저장)" : "Print (Save as PDF)"}
        </button>
        <button class="print-button" onclick="window.close()" style="background: #6b7280;">
          ❌ ${language === "ko" ? "닫기" : "Close"}
        </button>
      </div>
      
      ${content}
    </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.focus()
}
