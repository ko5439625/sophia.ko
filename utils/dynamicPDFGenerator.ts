import { createClient } from "@/lib/supabase"
import { getContent } from "@/lib/content-store"
import { loadProjects } from "@/lib/projects-store"

const USER_ID = "sophia.ko"

interface PDFContent {
  language: "ko" | "en"
}

export const generateDynamicPortfolioPDF = async ({ language }: PDFContent) => {
  console.log("동적 포트폴리오 PDF 생성 시작...")

  // Load all dynamic data
  const [aboutData, experienceData, projectsData] = await Promise.all([
    loadAboutData(language),
    loadExperienceData(language),
    loadProjects(language)
  ])

  const content = createDynamicPortfolioContent(language, aboutData, experienceData, projectsData)
  openPrintWindow(content, language, "portfolio")
}

async function loadAboutData(language: "ko" | "en") {
  // Load contact info
  const name = getContent(`about.${language}.name`, language === "ko" ? "고아현" : "Goahyun Ko")
  const position = getContent(`about.${language}.position`, "QA Engineer")
  const experience = getContent(`about.${language}.experience`, language === "ko" ? "QA 전문가" : "QA Specialist")
  const quote = getContent(`about.${language}.quote`, language === "ko" ? "품질은 행동이 아니라 습관이다" : "Quality is not an act, it is a habit")

  // Load contact details
  const contacts = []
  for (let i = 0; i < 4; i++) {
    contacts.push({
      label: getContent(`about.${language}.contact_${i}_l`, ""),
      value: getContent(`about.${language}.contact_${i}_v`, "")
    })
  }

  return { name, position, experience, quote, contacts }
}

async function loadExperienceData(language: "ko" | "en") {
  const supabase = createClient()

  const [highlights, metrics, skills] = await Promise.all([
    supabase.from("experience_sections").select("*").eq("user_id", USER_ID).eq("language", language).eq("section_type", "highlight").order("display_order"),
    supabase.from("experience_sections").select("*").eq("user_id", USER_ID).eq("language", language).eq("section_type", "metric").order("display_order"),
    supabase.from("experience_sections").select("*").eq("user_id", USER_ID).eq("language", language).eq("section_type", "skill").order("display_order")
  ])

  return {
    highlights: highlights.data || [],
    metrics: metrics.data || [],
    skills: skills.data || []
  }
}

function createDynamicPortfolioContent(language: "ko" | "en", aboutData: any, experienceData: any, projectsData: any) {
  return `
<div style="font-family: ${language === "ko" ? "'Noto Sans KR'" : "'Inter'"}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: white; line-height: 1.6; color: #000;">

    <!-- Cover Page -->
    <div style="padding: 50mm 35mm; page-break-after: always; min-height: 100vh; background: #000; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: 64px; margin: 0 0 8px 0; font-weight: 700; letter-spacing: -3px; color: #fff; line-height: 1;">${aboutData.name}</h1>
        <div style="width: 80px; height: 4px; background: #fff; margin: 0 0 40px 0;"></div>
        <p style="font-size: 32px; margin: 0 0 12px 0; font-weight: 400; color: #fff;">${aboutData.position}</p>
        <p style="font-size: 18px; margin: 0; color: rgba(255,255,255,0.7); font-weight: 300;">${aboutData.experience}</p>
    </div>

    <!-- Page 2: Profile & Contact -->
    <div style="padding: 30mm 35mm; page-break-after: always; min-height: 100vh;">
        <h2 style="font-size: 36px; margin: 0 0 8px 0; font-weight: 700; letter-spacing: -1px; color: #000;">${language === "ko" ? "프로필" : "Profile"}</h2>
        <div style="width: 60px; height: 3px; background: #000; margin: 0 0 40px 0;"></div>

        <div style="background: #f9fafb; padding: 30px; margin-bottom: 50px; border-left: 4px solid #000;">
            <p style="font-size: 15px; line-height: 1.8; margin: 0; color: #374151; font-style: italic;">"${aboutData.quote}"</p>
        </div>

        <h3 style="font-size: 20px; margin: 0 0 20px 0; font-weight: 600; color: #000;">${language === "ko" ? "연락처" : "Contact"}</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            ${aboutData.contacts.filter((c: any) => c.value).map((contact: any) => `
                <div style="padding: 15px 0; border-bottom: 1px solid #e5e7eb;">
                    <div style="font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">${contact.label}</div>
                    <div style="font-size: 13px; color: #000; font-weight: 500;">${contact.value}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- Page 3: Key Metrics -->
    <div style="padding: 30mm 35mm; page-break-after: always; min-height: 100vh;">
        <h2 style="font-size: 36px; margin: 0 0 8px 0; font-weight: 700; letter-spacing: -1px; color: #000;">${language === "ko" ? "핵심 성과" : "Key Metrics"}</h2>
        <div style="width: 60px; height: 3px; background: #000; margin: 0 0 40px 0;"></div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px;">
            ${experienceData.metrics.slice(0, 6).map((metric: any) => `
                <div style="padding: 30px; background: #000; color: #fff; border-radius: 2px;">
                    <div style="font-size: 42px; font-weight: 700; margin-bottom: 12px; letter-spacing: -1px;">${metric.content.value}</div>
                    <div style="font-size: 15px; font-weight: 600; margin-bottom: 8px;">${metric.content.label}</div>
                    <div style="font-size: 11px; opacity: 0.7; line-height: 1.5;">${metric.content.description}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- Page 4: Key Strengths -->
    <div style="padding: 30mm 35mm; page-break-after: always; min-height: 100vh;">
        <h2 style="font-size: 36px; margin: 0 0 8px 0; font-weight: 700; letter-spacing: -1px; color: #000;">${language === "ko" ? "핵심 강점" : "Key Strengths"}</h2>
        <div style="width: 60px; height: 3px; background: #000; margin: 0 0 40px 0;"></div>

        ${experienceData.highlights.slice(0, 4).map((highlight: any, idx: number) => `
            <div style="margin-bottom: 40px; padding-bottom: 30px; ${idx < 3 ? 'border-bottom: 1px solid #e5e7eb;' : ''}">
                <h3 style="font-size: 20px; margin: 0 0 12px 0; font-weight: 600; color: #000;">${highlight.content.title}</h3>
                <p style="font-size: 13px; line-height: 1.7; margin: 0 0 12px 0; color: #374151;">${highlight.content.description}</p>
                <div style="display: inline-block; padding: 6px 12px; background: #000; color: #fff; font-size: 11px; font-weight: 500;">
                    ${highlight.content.impact}
                </div>
            </div>
        `).join('')}
    </div>

    <!-- Page 5: Skills -->
    <div style="padding: 30mm 35mm; page-break-after: always; min-height: 100vh;">
        <h2 style="font-size: 36px; margin: 0 0 8px 0; font-weight: 700; letter-spacing: -1px; color: #000;">${language === "ko" ? "기술 스택" : "Tech Stack"}</h2>
        <div style="width: 60px; height: 3px; background: #000; margin: 0 0 40px 0;"></div>

        ${experienceData.skills.map((skill: any) => `
            <div style="margin-bottom: 35px;">
                <h3 style="font-size: 16px; margin: 0 0 15px 0; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">${skill.content.category}</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${skill.content.tools.map((tool: string) => `
                        <span style="padding: 8px 16px; background: #f9fafb; border: 1px solid #e5e7eb; font-size: 12px; font-weight: 500; color: #000;">${tool}</span>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>

    <!-- Projects Pages -->
    ${projectsData.map((project: any, idx: number) => `
        <div style="padding: 30mm 35mm; page-break-after: always; min-height: 100vh;">
            <div style="font-size: 11px; color: #6b7280; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 1px;">
                ${language === "ko" ? "프로젝트" : "Project"} ${idx + 1} / ${projectsData.length}
            </div>
            <h2 style="font-size: 32px; margin: 0 0 8px 0; font-weight: 700; letter-spacing: -1px; color: #000; line-height: 1.2;">${project.title}</h2>
            <div style="width: 60px; height: 3px; background: #000; margin: 0 0 30px 0;"></div>

            <div style="margin-bottom: 30px;">
                <h3 style="font-size: 14px; margin: 0 0 12px 0; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">${language === "ko" ? "개요" : "Overview"}</h3>
                <p style="font-size: 13px; line-height: 1.7; margin: 0; color: #374151;">${project.overview}</p>
            </div>

            ${project.background ? `
                <div style="margin-bottom: 30px;">
                    <h3 style="font-size: 14px; margin: 0 0 12px 0; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">${language === "ko" ? "배경" : "Background"}</h3>
                    <p style="font-size: 13px; line-height: 1.7; margin: 0; color: #374151;">${project.background}</p>
                </div>
            ` : ''}

            ${project.details?.achievements ? `
                <div style="background: #000; color: #fff; padding: 25px; margin: 30px 0;">
                    <h3 style="font-size: 14px; margin: 0 0 12px 0; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${language === "ko" ? "주요 성과" : "Key Achievements"}</h3>
                    <p style="font-size: 13px; line-height: 1.7; margin: 0;">${project.details.achievements}</p>
                </div>
            ` : ''}

            ${project.tech_stack && project.tech_stack.length > 0 ? `
                <div style="margin-top: 30px;">
                    <h3 style="font-size: 14px; margin: 0 0 15px 0; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">${language === "ko" ? "기술 스택" : "Tech Stack"}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${project.tech_stack.map((tech: string) => `
                            <span style="padding: 8px 16px; background: #f9fafb; border: 1px solid #e5e7eb; font-size: 12px; font-weight: 500; color: #000;">${tech}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('')}

    <!-- Last Page: Thank You -->
    <div style="padding: 50mm 35mm; min-height: 100vh; background: #000; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: #fff;">
        <h2 style="font-size: 48px; font-weight: 700; margin: 0 0 30px 0; letter-spacing: -2px;">${language === "ko" ? "감사합니다" : "Thank You"}</h2>
        <p style="font-size: 18px; margin: 0 0 60px 0; opacity: 0.8; max-width: 500px; line-height: 1.6;">
            ${language === "ko"
                ? "포트폴리오를 검토해 주셔서 감사합니다. 언제든지 연락 주세요."
                : "Thank you for reviewing my portfolio. Feel free to reach out anytime."}
        </p>

        <div style="width: 100%; max-width: 400px;">
            ${aboutData.contacts.filter((c: any) => c.value).map((contact: any) => `
                <div style="padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div style="font-size: 11px; opacity: 0.6; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1px;">${contact.label}</div>
                    <div style="font-size: 15px; font-weight: 500;">${contact.value}</div>
                </div>
            `).join('')}
        </div>
    </div>

</div>
  `
}

function openPrintWindow(content: string, language: "ko" | "en", type: string) {
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    alert(language === "ko" ? "팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요." : "Popup blocked. Please allow popups and try again.")
    return
  }

  const title = type === "portfolio"
    ? (language === "ko" ? "포트폴리오" : "Portfolio")
    : (language === "ko" ? "질문지" : "Questionnaire")

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @page {
          size: A4;
          margin: 0;
        }

        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      ${content}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        };
      </script>
    </body>
    </html>
  `)

  printWindow.document.close()
}
