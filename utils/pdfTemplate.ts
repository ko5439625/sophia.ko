export const generatePDFTemplate = (language: "ko" | "en") => {
  const content = {
    ko: {
      title: "고아현 - QA 엔지니어 포트폴리오",
      subtitle: "Senior QA Engineer • 5년차 전문가 • 99.7% 프로젝트 성공률",
      executiveSummary:
        "5년간의 체계적인 QA 경험을 바탕으로 품질 혁신과 프로세스 개선을 통해 팀 성과 향상에 기여하는 전문가입니다. 15개 이상의 주요 프로젝트에서 99.7%의 성공률을 달성하며, 예방적 품질 관리와 데이터 기반 의사결정으로 조직의 품질 문화를 혁신해왔습니다.",
      quote: "완벽한 제품보다는 사용자가 행복한 제품을 만드는 데 기여하고 싶습니다",
      contact: {
        name: "고아현",
        position: "Senior QA Engineer",
        experience: "5년차 (2020.01 ~ 현재)",
        education: "컴퓨터공학과 학사",
        email: "sophia.ko@email.com",
        phone: "010-1234-5678",
        github: "github.com/sophia-ko",
        linkedin: "linkedin.com/in/sophia-ko",
      },
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
    },
  }

  const currentContent = content[language]

  return `
<div style="font-family: ${language === "ko" ? "'Noto Sans KR'" : "'Inter'"}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: white; line-height: 1.5; color: #374151; font-size: 12px;">
    
    <!-- Page 1: Executive Summary -->
    <div class="pdf-page" style="min-height: 800px; padding: 40px 50px; page-break-after: always; position: relative;">
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">
            <h1 style="color: #1e40af; font-size: 22px; margin: 0 0 6px 0; font-weight: 700;">${currentContent.title}</h1>
            <p style="color: #6b7280; margin: 0; font-size: 14px;">${currentContent.subtitle}</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #3b82f6; padding: 15px; margin: 15px 0; border-radius: 6px;">
            <h2 style="margin-top: 0; border: none; color: #1e40af; font-size: 18px; font-weight: 600;">Executive Summary</h2>
            <p style="margin: 0 0 15px 0; font-weight: 500; line-height: 1.6;">
                ${currentContent.executiveSummary}
            </p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin: 15px 0; gap: 12px;">
            <div style="text-align: center; flex: 1; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <span style="font-size: 20px; font-weight: 700; color: #1e40af; display: block;">99.7%</span>
                <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">${language === "ko" ? "프로젝트 성공률" : "Project Success Rate"}</div>
            </div>
            <div style="text-align: center; flex: 1; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <span style="font-size: 20px; font-weight: 700; color: #1e40af; display: block;">70%</span>
                <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">${language === "ko" ? "테스트 시간 단축" : "Test Time Reduction"}</div>
            </div>
            <div style="text-align: center; flex: 1; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <span style="font-size: 20px; font-weight: 700; color: #1e40af; display: block;">8${language === "ko" ? "개" : ""}</span>
                <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">${language === "ko" ? "플랫폼 테스트 경험" : "Platform Test Experience"}</div>
            </div>
            <div style="text-align: center; flex: 1; padding: 12px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                <span style="font-size: 20px; font-weight: 700; color: #1e40af; display: block;">15+</span>
                <div style="font-size: 10px; color: #6b7280; margin-top: 4px;">${language === "ko" ? "주요 프로젝트 참여" : "Major Projects"}</div>
            </div>
        </div>
        
        <h2 style="color: #1e40af; font-size: 18px; margin: 20px 0 10px 0; font-weight: 600;">${language === "ko" ? "핵심 강점" : "Core Strengths"}</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <h3 style="color: #374151; font-size: 14px; margin: 12px 0 6px 0; font-weight: 600;">${language === "ko" ? "기술적 전문성" : "Technical Expertise"}</h3>
                <ul style="margin: 6px 0; padding-left: 14px; font-size: 11px;">
                    <li>${language === "ko" ? "모바일/웹 크로스 플랫폼 테스트" : "Mobile/Web Cross-platform Testing"}</li>
                    <li>${language === "ko" ? "API 테스트 및 자동화 구축" : "API Testing & Automation"}</li>
                    <li>${language === "ko" ? "성능 최적화 및 보안 검증" : "Performance Optimization & Security"}</li>
                    <li>${language === "ko" ? "CI/CD 파이프라인 통합" : "CI/CD Pipeline Integration"}</li>
                </ul>
            </div>
            <div>
                <h3 style="color: #374151; font-size: 14px; margin: 12px 0 6px 0; font-weight: 600;">${language === "ko" ? "조직 기여" : "Organizational Contribution"}</h3>
                <ul style="margin: 6px 0; padding-left: 14px; font-size: 11px;">
                    <li>${language === "ko" ? "QA 프로세스 표준화 주도" : "QA Process Standardization"}</li>
                    <li>${language === "ko" ? "개발팀과의 효율적 협업" : "Efficient Dev Team Collaboration"}</li>
                    <li>${language === "ko" ? "지속적인 품질 문화 정착" : "Quality Culture Establishment"}</li>
                    <li>${language === "ko" ? "데이터 기반 의사결정 체계" : "Data-Driven Decision Framework"}</li>
                </ul>
            </div>
        </div>
        
        <div style="background: #f0f9ff; padding: 12px; border-radius: 6px; margin-top: 15px; text-align: center;">
            <p style="margin: 0; font-style: italic; color: #1e40af; font-size: 13px;">
                "${currentContent.quote}"
            </p>
        </div>
        
        <div style="position: absolute; bottom: 15px; right: 50px; color: #9ca3af; font-size: 10px; font-weight: 500;">1</div>
    </div>

    <!-- Page 2: Contact & Skills -->
    <div class="pdf-page" style="min-height: 800px; padding: 40px 50px; page-break-after: always; position: relative;">
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">
            <h1 style="color: #1e40af; font-size: 22px; margin: 0 0 6px 0; font-weight: 700;">${language === "ko" ? "연락처 및 기술 스택" : "Contact & Technical Skills"}</h1>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0;">
            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #374151; font-size: 14px; font-weight: 600;">${language === "ko" ? "기본 정보" : "Basic Information"}</h3>
                <div style="margin: 5px 0; font-size: 11px;"><strong style="display: inline-block; width: 60px; color: #4b5563;">${language === "ko" ? "성명:" : "Name:"}</strong> ${currentContent.contact.name}</div>
                <div style="margin: 5px 0; font-size: 11px;"><strong style="display: inline-block; width: 60px; color: #4b5563;">${language === "ko" ? "직무:" : "Position:"}</strong> ${currentContent.contact.position}</div>
                <div style="margin: 5px 0; font-size: 11px;"><strong style="display: inline-block; width: 60px; color: #4b5563;">${language === "ko" ? "경력:" : "Experience:"}</strong> ${currentContent.contact.experience}</div>
                <div style="margin: 5px 0; font-size: 11px;"><strong style="display: inline-block; width: 60px; color: #4b5563;">${language === "ko" ? "학력:" : "Education:"}</strong> ${currentContent.contact.education}</div>
            </div>
            
            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #374151; font-size: 14px; font-weight: 600;">${language === "ko" ? "연락처" : "Contact"}</h3>
                <div style="margin: 5px 0; font-size: 11px;"><strong style="display: inline-block; width: 60px; color: #4b5563;">${language === "ko" ? "이메일:" : "Email:"}</strong> ${currentContent.contact.email}</div>
                <div style="margin: 5px 0; font-size: 11px;"><strong style="display: inline-block; width: 60px; color: #4b5563;">${language === "ko" ? "전화:" : "Phone:"}</strong> ${currentContent.contact.phone}</div>
                <div style="margin: 5px 0; font-size: 11px;"><strong style="display: inline-block; width: 60px; color: #4b5563;">GitHub:</strong> ${currentContent.contact.github}</div>
                <div style="margin: 5px 0; font-size: 11px;"><strong style="display: inline-block; width: 60px; color: #4b5563;">LinkedIn:</strong> ${currentContent.contact.linkedin}</div>
            </div>
        </div>
        
        <h2 style="color: #1e40af; font-size: 18px; margin: 20px 0 10px 0; font-weight: 600;">${language === "ko" ? "주요 기술 스택" : "Key Technical Skills"}</h2>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin: 8px 0;">
            <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">${language === "ko" ? "모바일 테스팅" : "Mobile Testing"}</h3>
            <div style="margin: 6px 0;">
                <strong style="font-size: 12px;">iOS Testing (5/5):</strong>
                <span style="font-size: 11px; color: #6b7280;"> XCTest, XCUITest, TestFlight</span>
            </div>
            <div style="margin: 6px 0;">
                <strong style="font-size: 12px;">Android Testing (5/5):</strong>
                <span style="font-size: 11px; color: #6b7280;"> Espresso, UI Automator, Firebase Test Lab</span>
            </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin: 8px 0;">
            <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">${language === "ko" ? "웹 테스팅" : "Web Testing"}</h3>
            <div style="margin: 6px 0;">
                <strong style="font-size: 12px;">Frontend Testing (4/5):</strong>
                <span style="font-size: 11px; color: #6b7280;"> Selenium, Cypress, Playwright</span>
            </div>
            <div style="margin: 6px 0;">
                <strong style="font-size: 12px;">API Testing (5/5):</strong>
                <span style="font-size: 11px; color: #6b7280;"> Postman, REST Assured, Newman</span>
            </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin: 8px 0;">
            <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">${language === "ko" ? "자동화 & DevOps" : "Automation & DevOps"}</h3>
            <div style="margin: 6px 0;">
                <strong style="font-size: 12px;">Test Automation (4/5):</strong>
                <span style="font-size: 11px; color: #6b7280;"> Python, Java, Jenkins, GitHub Actions</span>
            </div>
            <div style="margin: 6px 0;">
                <strong style="font-size: 12px;">Performance Testing (4/5):</strong>
                <span style="font-size: 11px; color: #6b7280;"> JMeter, K6, Artillery</span>
            </div>
        </div>
        
        <div style="position: absolute; bottom: 15px; right: 50px; color: #9ca3af; font-size: 10px; font-weight: 500;">2</div>
    </div>

    <!-- Page 3: Major Projects -->
    <div class="pdf-page" style="min-height: 800px; padding: 40px 50px; position: relative;">
        <div style="border-bottom: 2px solid #3b82f6; padding-bottom: 15px; margin-bottom: 25px;">
            <h1 style="color: #1e40af; font-size: 22px; margin: 0 0 6px 0; font-weight: 700;">${language === "ko" ? "주요 프로젝트" : "Major Projects"}</h1>
        </div>
        
        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 12px 0; background: #fafbfc;">
            <h3 style="color: #1e40af; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">${language === "ko" ? "결제 시스템 품질 보증" : "Payment System Quality Assurance"}</h3>
            <div style="margin: 8px 0; font-size: 11px; color: #6b7280;">2022.03 - 2022.08 | Lead QA Engineer</div>
            <p style="margin: 8px 0; font-size: 11px; line-height: 1.4;">
                ${
                  language === "ko"
                    ? "금융 서비스의 특성상 단 하나의 오류도 용납할 수 없는 상황에서 다양한 결제 수단과 예외 상황을 체계적으로 검증했습니다."
                    : "Systematically verified various payment methods and exception scenarios in financial services where zero tolerance for errors was required."
                }
            </p>
            <div style="margin: 8px 0;">
                <strong style="font-size: 11px;">${language === "ko" ? "핵심 성과:" : "Key Results:"}</strong>
                <span style="font-size: 10px; color: #047857;"> 43${language === "ko" ? "개 버그 발견" : " bugs found"}, 99.7% ${language === "ko" ? "성공률" : "success rate"}, ${language === "ko" ? "치명적 이슈 0건" : "zero critical issues"}</span>
            </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 12px 0; background: #fafbfc;">
            <h3 style="color: #1e40af; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">${language === "ko" ? "모바일 앱 성능 최적화" : "Mobile App Performance Optimization"}</h3>
            <div style="margin: 8px 0; font-size: 11px; color: #6b7280;">2023.05 - 2023.12 | Senior QA Engineer</div>
            <p style="margin: 8px 0; font-size: 11px; line-height: 1.4;">
                ${
                  language === "ko"
                    ? "사용자 증가로 인한 앱 성능 저하와 높은 크래시율 문제를 해결하기 위해 다양한 디바이스와 네트워크 환경에서 성능 테스트를 수행했습니다."
                    : "Performed performance testing across various devices and network environments to resolve app performance degradation and high crash rates due to user growth."
                }
            </p>
            <div style="margin: 8px 0;">
                <strong style="font-size: 11px;">${language === "ko" ? "핵심 성과:" : "Key Results:"}</strong>
                <span style="font-size: 10px; color: #047857;"> ${language === "ko" ? "로딩 시간 50% 개선" : "50% loading time improvement"}, ${language === "ko" ? "크래시율 0.1%" : "0.1% crash rate"}, ${language === "ko" ? "사용자 만족도 95%" : "95% user satisfaction"}</span>
            </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin: 12px 0; background: #fafbfc;">
            <h3 style="color: #1e40af; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">${language === "ko" ? "테스트 자동화 프레임워크 구축" : "Test Automation Framework Development"}</h3>
            <div style="margin: 8px 0; font-size: 11px; color: #6b7280;">2021.01 - 2021.06 | Automation Engineer</div>
            <p style="margin: 8px 0; font-size: 11px; line-height: 1.4;">
                ${
                  language === "ko"
                    ? "Page Object Model 패턴을 적용한 확장 가능한 자동화 프레임워크를 설계하고 CI/CD 파이프라인과 통합했습니다."
                    : "Designed scalable automation framework using Page Object Model pattern and integrated with CI/CD pipelines."
                }
            </p>
            <div style="margin: 8px 0;">
                <strong style="font-size: 11px;">${language === "ko" ? "핵심 성과:" : "Key Results:"}</strong>
                <span style="font-size: 10px; color: #047857;"> ${language === "ko" ? "테스트 시간 70% 단축" : "70% test time reduction"}, ${language === "ko" ? "커버리지 95%" : "95% coverage"}, CI/CD ${language === "ko" ? "통합" : "integration"}</span>
            </div>
        </div>

        <h2 style="color: #1e40af; font-size: 18px; margin: 25px 0 10px 0; font-weight: 600;">${language === "ko" ? "인증 및 수상" : "Certifications & Awards"}</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div style="background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <h4 style="margin: 0 0 5px 0; font-size: 12px; color: #374151;">ISTQB Foundation Level</h4>
                <div style="font-size: 10px; color: #6b7280;">ISTQB • 2021</div>
            </div>
            <div style="background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <h4 style="margin: 0 0 5px 0; font-size: 12px; color: #374151;">AWS Cloud Practitioner</h4>
                <div style="font-size: 10px; color: #6b7280;">Amazon • 2022</div>
            </div>
        </div>
        
        <div style="position: absolute; bottom: 15px; right: 50px; color: #9ca3af; font-size: 10px; font-weight: 500;">3</div>
    </div>
</div>
  `
}
