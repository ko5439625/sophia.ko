interface QuestionnaireContent {
  language: "ko" | "en"
}

export const generateInteractiveQuestionnaire = async ({ language }: QuestionnaireContent) => {
  try {
    // 새 창에서 인터랙티브 HTML 폼 열기
    const htmlContent = generateInteractiveTemplate(language)
    const newWindow = window.open("", "_blank", "width=1200,height=800,scrollbars=yes,resizable=yes")

    if (newWindow) {
      newWindow.document.write(htmlContent)
      newWindow.document.close()
      newWindow.focus()
    } else {
      // 팝업이 차단된 경우 다운로드로 대체
      downloadHTMLFile(htmlContent, language)
    }
  } catch (error) {
    console.error("질문지 생성 오류:", error)
    alert(language === "ko" ? "질문지 생성에 실패했습니다." : "Failed to generate questionnaire.")
  }
}

export const generateQuestionnairePDF = async ({ language }: QuestionnaireContent) => {
  // 참고용 PDF도 브라우저 인쇄 기능 사용
  const content = createQuestionnaireReferenceContent(language)
  openPrintWindow(content, language, "questionnaire")
}

function createQuestionnaireReferenceContent(language: "ko" | "en") {
  const sections = getQuestionSections(language)
  const title = language === "ko" ? "포트폴리오 질문지 (참고용)" : "Portfolio Questionnaire (Reference)"

  let content = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 30px; line-height: 1.6; color: #333;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
        <h1 style="color: #1e40af; font-size: 24px; margin: 0;">${title}</h1>
        <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 14px;">
          ${
            language === "ko"
              ? "이 문서는 참고용입니다. 실제 작성은 인터랙티브 HTML 버전을 사용하세요."
              : "This document is for reference only. Use the interactive HTML version for actual completion."
          }
        </p>
      </div>
  `

  sections.forEach((section, index) => {
    content += `
      <div style="margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #1e40af; color: white; padding: 15px;">
          <h2 style="margin: 0; font-size: 18px;">${section.title}</h2>
          ${section.description ? `<p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">${section.description}</p>` : ""}
        </div>
        <div style="padding: 20px; background: #fafbfc;">
    `

    section.questions.forEach((question, qIndex) => {
      if (question.trim()) {
        content += `
          <div style="margin: 15px 0; padding: 12px; background: white; border: 1px solid #e2e8f0; border-radius: 6px;">
            <h3 style="color: #374151; font-size: 14px; margin: 0 0 8px 0; font-weight: 600;">${question}</h3>
            <div style="height: 60px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px; color: #9ca3af; font-size: 12px;">
              ${language === "ko" ? "여기에 답변을 작성하세요..." : "Write your answer here..."}
            </div>
          </div>
        `
      }
    })

    content += `
        </div>
      </div>
    `
  })

  content += `</div>`
  return content
}

function openPrintWindow(content: string, language: "ko" | "en", type: string) {
  const fileName =
    type === "questionnaire"
      ? language === "ko"
        ? "포트폴리오_질문지_참고용"
        : "Portfolio_Questionnaire_Reference"
      : language === "ko"
        ? "고아현_QA_포트폴리오"
        : "Goahyun_Ko_QA_Portfolio"

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
        <p style="margin-bottom: 15px; font-size: 16px; line-height: 1.6;">
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

const downloadHTMLFile = (content: string, language: "ko" | "en") => {
  const blob = new Blob([content], { type: "text/html;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = language === "ko" ? "포트폴리오_질문지_작성용.html" : "Portfolio_Questionnaire_Fillable.html"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const generateInteractiveTemplate = (language: "ko" | "en") => {
  const content = {
    ko: {
      title: "포트폴리오 개인화 질문지",
      subtitle: "작성 가능한 인터랙티브 버전",
      description: "아래 질문들에 직접 답변을 입력하고 PDF로 저장하세요. 모든 답변은 자동으로 저장됩니다.",
      backButton: "← 원래 화면으로 돌아가기",
      exportPdfButton: "📄 작성 완료 - PDF로 저장",
      printButton: "🖨️ 인쇄하기",
      resetButton: "🗑️ 모두 지우기",
      addProjectButton: "+ 프로젝트 추가",
      removeProjectButton: "× 삭제",
      instructions:
        "💡 작성 팁: 구체적이고 정량적으로 작성해주세요. STAR 방법론(상황-과제-행동-결과)을 활용하면 더 좋습니다.",
    },
    en: {
      title: "Portfolio Personalization Questionnaire",
      subtitle: "Interactive Fillable Version",
      description: "Fill in your answers directly below and save as PDF. All answers are automatically saved.",
      backButton: "← Back to Main Screen",
      exportPdfButton: "📄 Complete - Save as PDF",
      printButton: "🖨️ Print",
      resetButton: "🗑️ Clear All",
      addProjectButton: "+ Add Project",
      removeProjectButton: "× Remove",
      instructions:
        "💡 Writing Tips: Be specific and quantitative. Use the STAR method (Situation-Task-Action-Result) for better responses.",
    },
  }

  const currentContent = content[language]
  const sections = getQuestionSections(language)

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${currentContent.title}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: ${language === "ko" ? "'Noto Sans KR'" : "'Inter'"}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            color: #374151;
            background: #f9fafb;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: 700;
        }
        .header h2 {
            font-size: 18px;
            margin: 0 0 15px 0;
            font-weight: 400;
            opacity: 0.9;
        }
        .header p {
            margin: 0;
            font-size: 14px;
            opacity: 0.8;
        }
        .controls {
            padding: 20px;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            justify-content: center;
        }
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 14px;
            text-decoration: none;
            display: inline-block;
        }
        .btn-back {
            background: #6b7280;
            color: white;
        }
        .btn-back:hover {
            background: #4b5563;
        }
        .btn-primary {
            background: #3b82f6;
            color: white;
        }
        .btn-primary:hover {
            background: #2563eb;
        }
        .btn-success {
            background: #10b981;
            color: white;
        }
        .btn-success:hover {
            background: #059669;
        }
        .btn-secondary {
            background: #6b7280;
            color: white;
        }
        .btn-secondary:hover {
            background: #4b5563;
        }
        .btn-danger {
            background: #ef4444;
            color: white;
        }
        .btn-danger:hover {
            background: #dc2626;
        }
        .instructions {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px;
            border-radius: 6px;
            font-size: 14px;
        }
        .content {
            padding: 0 20px 20px;
        }
        .section {
            margin: 30px 0;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        .section-header {
            background: #1e40af;
            color: white;
            padding: 15px 20px;
        }
        .section-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        .section-header p {
            margin: 10px 0 0 0;
            font-size: 13px;
            opacity: 0.9;
        }
        .section-content {
            padding: 20px;
            background: #fafbfc;
        }
        .question-group {
            margin: 20px 0;
        }
        .question-label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .question-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 6px;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.2s;
            min-height: 80px;
            resize: vertical;
        }
        .question-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .question-input.short {
            min-height: 40px;
        }
        @media (max-width: 768px) {
            body { padding: 10px; }
            .controls { flex-direction: column; }
            .btn { width: 100%; }
        }
        @media print {
            .controls { display: none; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${currentContent.title}</h1>
            <h2>${currentContent.subtitle}</h2>
            <p>${currentContent.description}</p>
        </div>
        
        <div class="controls">
            <button class="btn btn-back" onclick="goBack()">${currentContent.backButton}</button>
            <button class="btn btn-success" onclick="exportToPDF()">${currentContent.exportPdfButton}</button>
            <button class="btn btn-secondary" onclick="window.print()">${currentContent.printButton}</button>
            <button class="btn btn-danger" onclick="clearAll()">${currentContent.resetButton}</button>
        </div>
        
        <div class="instructions">
            ${currentContent.instructions}
        </div>
        
        <div class="content" id="questionnaire">
            ${generateSections(sections, language, currentContent)}
        </div>
    </div>

    <script>
        // 뒤로가기 기능
        function goBack() {
            if (window.opener && !window.opener.closed) {
                window.close();
            } else {
                window.history.back();
            }
        }

        // PDF로 내보내기 - 브라우저 인쇄 기능 사용
        function exportToPDF() {
            // 답변들을 수집
            const answers = collectAnswers();
            
            if (Object.keys(answers).length === 0) {
                alert('${language === "ko" ? "작성된 답변이 없습니다. 먼저 질문에 답변해주세요." : "No answers found. Please answer the questions first."}');
                return;
            }
            
            // PDF용 HTML 생성
            const pdfContent = generatePDFContent(answers, '${language}');
            
            // 새 창에서 인쇄 가능한 형태로 열기
            const printWindow = window.open('', '_blank', 'width=900,height=700');
            if (printWindow) {
                printWindow.document.write(\`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${language === "ko" ? "내_포트폴리오_답변서" : "My_Portfolio_Answers"}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                            @media print { body { margin: 0; } .no-print { display: none; } }
                            .print-header { background: #3b82f6; color: white; padding: 20px; text-align: center; margin-bottom: 20px; }
                            .print-button { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; margin: 10px; }
                        </style>
                    </head>
                    <body>
                        <div class="print-header no-print">
                            <h1>${language === "ko" ? "포트폴리오 답변서" : "Portfolio Answers"}</h1>
                            <p>${language === "ko" ? "아래 버튼을 클릭하여 PDF로 저장하세요" : "Click the button below to save as PDF"}</p>
                            <button class="print-button" onclick="window.print()">🖨️ ${language === "ko" ? "PDF로 저장" : "Save as PDF"}</button>
                            <button class="print-button" onclick="window.close()" style="background: #6b7280;">❌ ${language === "ko" ? "닫기" : "Close"}</button>
                        </div>
                        \${pdfContent}
                    </body>
                    </html>
                \`);
                printWindow.document.close();
                printWindow.focus();
            }
        }

        // 답변 수집
        function collectAnswers() {
            const answers = {};
            const sections = document.querySelectorAll('.section');

            sections.forEach(section => {
                const title = section.querySelector('.section-header h3').textContent;
                const sectionAnswers = {};
    
                const inputs = section.querySelectorAll('.question-input');
                inputs.forEach(input => {
                    const label = input.previousElementSibling.textContent;
                    const value = input.value.trim();
                    if (value) {
                        sectionAnswers[label] = value;
                    }
                });
    
                if (Object.keys(sectionAnswers).length > 0) {
                    answers[title] = sectionAnswers;
                }
            });

            return answers;
        }

        // PDF 내용 생성
        function generatePDFContent(answers, language) {
            const title = language === 'ko' ? '포트폴리오 질문지 답변서' : 'Portfolio Questionnaire Answers';
            const date = new Date().toLocaleDateString(language === 'ko' ? 'ko-KR' : 'en-US');
            
            let content = \`
            <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; color: #374151;">
                <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
                    <h1 style="color: #1e40af; font-size: 24px; margin: 0 0 10px 0;">\${title}</h1>
                    <p style="color: #6b7280; margin: 0; font-size: 14px;">${language === "ko" ? "작성일" : "Date"}: \${date}</p>
                </div>
            \`;
            
            Object.keys(answers).forEach(sectionTitle => {
                content += \`
                <div style="margin: 25px 0; page-break-inside: avoid;">
                    <h2 style="background: #1e40af; color: white; padding: 12px 15px; margin: 0 0 15px 0; border-radius: 6px; font-size: 18px;">\${sectionTitle}</h2>
                \`;
                
                Object.keys(answers[sectionTitle]).forEach(question => {
                    const answer = answers[sectionTitle][question];
                    content += \`
                    <div style="margin: 15px 0; padding: 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 4px;">
                        <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">\${question}</h3>
                        <p style="color: #6b7280; font-size: 13px; margin: 0; white-space: pre-wrap; line-height: 1.5;">\${answer}</p>
                    </div>
                    \`;
                });
                
                content += '</div>';
            });
            
            content += '</div>';
            return content;
        }

        // 모두 지우기
        function clearAll() {
            if (confirm('${language === "ko" ? "모든 답변을 지우시겠습니까?" : "Are you sure you want to clear all answers?"}')) {
                document.querySelectorAll('.question-input').forEach(input => input.value = '');
                localStorage.removeItem('portfolioQuestionnaire_${language}');
            }
        }

        // 자동 저장 기능
        function autoSave() {
            const formData = {};
            document.querySelectorAll('.question-input').forEach(input => {
                if (input.value.trim()) {
                    formData[input.id] = input.value;
                }
            });
            localStorage.setItem('portfolioQuestionnaire_${language}', JSON.stringify(formData));
        }

        // 자동 로드 기능
        function autoLoad() {
            const saved = localStorage.getItem('portfolioQuestionnaire_${language}');
            if (saved) {
                const formData = JSON.parse(saved);
                Object.keys(formData).forEach(id => {
                    const input = document.getElementById(id);
                    if (input) input.value = formData[id];
                });
            }
        }

        // 이벤트 리스너
        document.addEventListener('DOMContentLoaded', function() {
            autoLoad();
            
            document.addEventListener('input', function(e) {
                if (e.target.classList.contains('question-input')) {
                    autoSave();
                }
            });
        });
    </script>
</body>
</html>
  `
}

const generateSections = (sections: any, language: "ko" | "en", currentContent: any) => {
  return sections
    .map((section: any, index: number) => {
      return `
      <div class="section">
        <div class="section-header">
          <h3>${section.title}</h3>
          ${section.description ? `<p>${section.description}</p>` : ""}
        </div>
        <div class="section-content">
          ${section.questions
            .map((question: string, qIndex: number) => {
              if (!question.trim()) return ""

              const isShort =
                question.includes("성명") ||
                question.includes("Name") ||
                question.includes("이메일") ||
                question.includes("Email") ||
                question.includes("전화") ||
                question.includes("Phone") ||
                question.includes("GitHub") ||
                question.includes("LinkedIn") ||
                question.includes("기간") ||
                question.includes("Duration") ||
                question.includes("역할") ||
                question.includes("Role")

              const id = `q_${index}_${qIndex}`

              return `
              <div class="question-group">
                <label class="question-label" for="${id}">${question}</label>
                <textarea 
                  class="question-input ${isShort ? "short" : ""}" 
                  id="${id}"
                  placeholder="${language === "ko" ? "여기에 답변을 입력하세요..." : "Enter your answer here..."}"
                ></textarea>
              </div>
            `
            })
            .join("")}
        </div>
      </div>
    `
    })
    .join("")
}

const getQuestionSections = (language: "ko" | "en") => {
  if (language === "ko") {
    return [
      {
        title: "1. 기본 정보",
        questions: [
          "성명 (한글/영문):",
          "직무/포지션:",
          "총 경력 기간:",
          "학력 (최종학력):",
          "이메일 주소:",
          "전화번호:",
          "GitHub 주소:",
          "LinkedIn 주소:",
          "기타 포트폴리오 사이트:",
        ],
      },
      {
        title: "2. 개인 철학 & 동기",
        questions: [
          "현재 직무를 시작하게 된 계기는 무엇인가요?",
          "업무에서 가장 중요하게 생각하는 가치나 원칙은 무엇인가요?",
          "다른 동료들과 차별화되는 본인만의 강점은 무엇인가요?",
          "가장 기억에 남는 프로젝트나 성취는 무엇인가요?",
          "본인을 한 문장으로 표현한다면?",
          "좌우명이나 업무 철학이 있다면?",
        ],
      },
      {
        title: "3. 기술 스택 & 전문성",
        questions: [
          "주요 프로그래밍 언어 (숙련도 1-5점과 함께 상세히):",
          "프레임워크/라이브러리 (사용 경험과 함께):",
          "데이터베이스 (설계 및 관리 경험):",
          "클라우드/인프라 (AWS, Azure, GCP 등):",
          "개발 도구 & IDE (선호하는 도구와 이유):",
          "협업 도구 (Jira, Slack, Notion 등 활용 경험):",
          "버전 관리 (Git 워크플로우, 브랜치 전략 등):",
        ],
      },
      {
        title: "4. 프로젝트 경험",
        description: "주요 프로젝트들을 상세히 작성해주세요. 프로젝트 추가 버튼으로 여러 개 작성 가능합니다.",
        questions: [], // 동적으로 생성됨
      },
      {
        title: "5. 성과 & 지표",
        questions: [
          "정량적 성과 지표 (프로젝트 성공률, 성능 개선 수치 등):",
          "보유 자격증 (자격증명, 발급기관, 취득연도):",
          "수상 경력 (상명, 수상 기관, 연도, 사유):",
          "특별한 인정이나 피드백 받은 경험:",
        ],
      },
      {
        title: "6. 업무 접근 방식",
        questions: [
          "본인만의 업무 접근 방식 1 (제목, 설명, 실행 방법, 성과):",
          "본인만의 업무 접근 방식 2:",
          "본인만의 업무 접근 방식 3:",
          "본인만의 업무 접근 방식 4:",
          "문제 해결 시 주로 사용하는 방법론이나 프로세스:",
        ],
      },
      {
        title: "7. 미래 비전 & 목표",
        questions: [
          "단기 목표 (1년 내) - 목표, 실행 계획, 예상 임팩트:",
          "중기 목표 (2-3년) - 목표, 실행 계획, 예상 임팩트:",
          "장기 목표 (5년 이상) - 목표, 실행 계획, 예상 임팩트:",
          "업계나 조직에 기여하고 싶은 방향:",
          "개인적으로 도전하고 싶은 새로운 기술이나 분야:",
        ],
      },
      {
        title: "8. 추가 정보",
        questions: [
          "특별한 경험이나 배경 (군 경력, 해외 경험, 창업 등):",
          "사이드 프로젝트나 오픈소스 기여 경험:",
          "블로그나 기술 글 작성 경험 (링크 포함):",
          "컨퍼런스 발표나 참여 경험:",
          "멘토링이나 교육 경험:",
          "특별한 취미나 관심사 (업무와 연관된):",
          "재미있는 사실이나 특이한 경험:",
        ],
      },
      {
        title: "QA 전문 질문",
        description: "QA 엔지니어인 경우 작성해주세요",
        questions: [
          "모바일 테스팅 경험 (iOS/Android, 사용 도구, 특별한 경험):",
          "웹 테스팅 경험 (크로스 브라우저, 반응형, 접근성 등):",
          "API 테스팅 경험 (REST, GraphQL, 도구, 자동화):",
          "테스트 자동화 경험 (프레임워크, 언어, 구축 경험):",
          "성능 테스팅 경험 (도구, 시나리오, 개선 사례):",
          "보안 테스팅 경험 (OWASP, 침투 테스트, 취약점 발견):",
          "테스트 계획 수립 및 전략 경험:",
          "버그 리포팅 및 추적 프로세스:",
          "QA 프로세스 개선 경험:",
          "개발팀과의 협업 방식 및 경험:",
        ],
      },
      {
        title: "개발자 전문 질문",
        description: "개발자인 경우 작성해주세요",
        questions: [
          "프론트엔드 개발 경험 (React, Vue, Angular 등 상세 경험):",
          "백엔드 개발 경험 (Node.js, Python, Java 등 상세 경험):",
          "풀스택 개발 경험 (전체 아키텍처 설계 및 구현):",
          "모바일 앱 개발 경험 (네이티브, 하이브리드, 크로스 플랫폼):",
          "데이터베이스 설계 및 관리 경험 (SQL, NoSQL, 최적화):",
          "API 설계 및 개발 경험 (RESTful, GraphQL, 문서화):",
          "시스템 아키텍처 설계 경험:",
          "마이크로서비스 아키텍처 경험:",
          "클라우드 아키텍처 및 DevOps 경험:",
          "코드 리뷰 및 품질 관리 경험:",
          "테스트 주도 개발(TDD) 경험:",
          "애자일/스크럼 개발 프로세스 경험:",
        ],
      },
      {
        title: "9. 사용자 추가 정보",
        description: "위 항목에서 다루지 못한 추가적인 정보나 특별히 강조하고 싶은 내용을 자유롭게 작성해주세요.",
        questions: [
          "추가로 언급하고 싶은 프로젝트나 경험:",
          "특별한 성취나 인정받은 사례:",
          "업무 외 활동이나 자기계발 노력:",
          "면접관에게 꼭 전달하고 싶은 메시지:",
          "기타 자유 기술란:",
        ],
      },
    ]
  } else {
    return [
      {
        title: "1. Basic Information",
        questions: [
          "Full Name (Korean/English):",
          "Job Title/Position:",
          "Total Years of Experience:",
          "Education (Highest Degree):",
          "Email Address:",
          "Phone Number:",
          "GitHub URL:",
          "LinkedIn URL:",
          "Other Portfolio Sites:",
        ],
      },
      {
        title: "2. Personal Philosophy & Motivation",
        questions: [
          "What motivated you to start your current career?",
          "What values or principles do you consider most important in your work?",
          "What are your unique strengths that differentiate you from colleagues?",
          "What is your most memorable project or achievement?",
          "How would you describe yourself in one sentence?",
          "Do you have a personal motto or work philosophy?",
        ],
      },
      {
        title: "3. Technical Skills & Expertise",
        questions: [
          "Main Programming Languages (with proficiency 1-5 and details):",
          "Frameworks/Libraries (with usage experience):",
          "Databases (design and management experience):",
          "Cloud/Infrastructure (AWS, Azure, GCP, etc.):",
          "Development Tools & IDEs (preferred tools and reasons):",
          "Collaboration Tools (Jira, Slack, Notion, etc.):",
          "Version Control (Git workflow, branching strategies, etc.):",
        ],
      },
      {
        title: "4. Project Experience",
        description:
          "Please describe your major projects in detail. You can add multiple projects using the add button.",
        questions: [], // Generated dynamically
      },
      {
        title: "5. Achievements & Metrics",
        questions: [
          "Quantitative Performance Metrics (project success rate, performance improvements, etc.):",
          "Certifications (name, issuing organization, year obtained):",
          "Awards & Recognition (award name, organization, year, reason):",
          "Special recognition or feedback received:",
        ],
      },
      {
        title: "6. Work Approach",
        questions: [
          "Your unique work approach 1 (title, description, implementation, results):",
          "Your unique work approach 2:",
          "Your unique work approach 3:",
          "Your unique work approach 4:",
          "Methodology or process you typically use for problem-solving:",
        ],
      },
      {
        title: "7. Future Vision & Goals",
        questions: [
          "Short-term Goals (within 1 year) - goal, action plan, expected impact:",
          "Medium-term Goals (2-3 years) - goal, action plan, expected impact:",
          "Long-term Goals (5+ years) - goal, action plan, expected impact:",
          "How you want to contribute to the industry or organization:",
          "New technologies or fields you want to challenge personally:",
        ],
      },
      {
        title: "8. Additional Information",
        questions: [
          "Special experiences or background (military, overseas, startup, etc.):",
          "Side projects or open source contributions:",
          "Blog or technical writing experience (with links):",
          "Conference presentations or participation:",
          "Mentoring or teaching experience:",
          "Special hobbies or interests (work-related):",
          "Fun facts or unique experiences:",
        ],
      },
      {
        title: "QA Specific Questions",
        description: "Please fill out if you are a QA Engineer",
        questions: [
          "Mobile Testing Experience (iOS/Android, tools used, special experiences):",
          "Web Testing Experience (cross-browser, responsive, accessibility, etc.):",
          "API Testing Experience (REST, GraphQL, tools, automation):",
          "Test Automation Experience (frameworks, languages, implementation):",
          "Performance Testing Experience (tools, scenarios, improvement cases):",
          "Security Testing Experience (OWASP, penetration testing, vulnerability discovery):",
          "Test Planning and Strategy Experience:",
          "Bug Reporting and Tracking Process:",
          "QA Process Improvement Experience:",
          "Collaboration Methods and Experience with Development Teams:",
        ],
      },
      {
        title: "Developer Specific Questions",
        description: "Please fill out if you are a Developer",
        questions: [
          "Frontend Development Experience (React, Vue, Angular, etc. detailed experience):",
          "Backend Development Experience (Node.js, Python, Java, etc. detailed experience):",
          "Full-stack Development Experience (overall architecture design and implementation):",
          "Mobile App Development Experience (native, hybrid, cross-platform):",
          "Database Design and Management Experience (SQL, NoSQL, optimization):",
          "API Design and Development Experience (RESTful, GraphQL, documentation):",
          "System Architecture Design Experience:",
          "Microservices Architecture Experience:",
          "Cloud Architecture and DevOps Experience:",
          "Code Review and Quality Management Experience:",
          "Test-Driven Development (TDD) Experience:",
          "Agile/Scrum Development Process Experience:",
        ],
      },
      {
        title: "9. User Additional Information",
        description:
          "Please freely write any additional information or content you'd like to emphasize that wasn't covered in the above sections.",
        questions: [
          "Additional projects or experiences you'd like to mention:",
          "Special achievements or recognition received:",
          "Activities outside work or self-development efforts:",
          "Message you definitely want to convey to interviewers:",
          "Other free description:",
        ],
      },
    ]
  }
}
