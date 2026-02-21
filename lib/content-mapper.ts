import { setOverride } from "./content-store"

interface AIContent {
  about: {
    name: string
    role: string
    email: string
    phone: string
    location: string
    experience: string
    summary: string
    faq: { question: string; answer: string }[]
    funFacts: string[]
  }
  experience: {
    title: string
    subtitle: string
    summary: string
    highlights: { title: string; description: string; impact: string }[]
    timeline: { year: string; role: string; company: string; focus: string }[]
    skillCategories: { categoryTitle: string; skills: { name: string; details: string }[] }[]
    qaProjects: { title: string; challenge: string; solution: string; result: string }[]
    processProjects: { title: string; challenge: string; solution: string; result: string }[]
    metrics: { value: string; label: string; description: string }[]
    certifications: { name: string; issuer: string; year: string }[]
    awards: { title: string; organization: string; year: string }[]
  }
  vision: {
    title: string
    subtitle: string
    philosophyQuote: string
    philosophyAuthor: string
    philosophyDescription: string
    approaches: { title: string; description: string; details: string; impact: string }[]
    goals: { timeline: string; title: string; description: string; expectedImpact: string; keyActions: string[] }[]
    ctaTitle: string
    ctaDescription: string
  }
}

export function applyAIContent(data: AIContent, lang: "ko" | "en") {
  const l = lang

  // About page
  setOverride(`about.${l}.name`, data.about.name)
  setOverride(`about.${l}.role`, data.about.role)
  setOverride(`about.${l}.email`, data.about.email)
  setOverride(`about.${l}.phone`, data.about.phone)
  setOverride(`about.${l}.location`, data.about.location)
  setOverride(`about.${l}.experience`, data.about.experience)
  setOverride(`about.${l}.summary`, data.about.summary)

  data.about.faq.forEach((item, i) => {
    setOverride(`about.${l}.faq_${i}_q`, item.question)
    setOverride(`about.${l}.faq_${i}_a`, item.answer)
  })

  data.about.funFacts.forEach((fact, i) => {
    setOverride(`about.${l}.funfact_${i}`, fact)
  })

  // Experience page
  setOverride(`exp.${l}.title`, data.experience.title)
  setOverride(`exp.${l}.subtitle`, data.experience.subtitle)
  setOverride(`exp.${l}.summary`, data.experience.summary)

  data.experience.highlights.forEach((h, i) => {
    setOverride(`exp.${l}.hl_${i}_t`, h.title)
    setOverride(`exp.${l}.hl_${i}_d`, h.description)
    setOverride(`exp.${l}.hl_${i}_i`, h.impact)
  })

  data.experience.timeline.forEach((t, i) => {
    setOverride(`exp.${l}.tl_${i}_y`, t.year)
    setOverride(`exp.${l}.tl_${i}_r`, t.role)
    setOverride(`exp.${l}.tl_${i}_c`, t.company)
    setOverride(`exp.${l}.tl_${i}_f`, t.focus)
  })

  data.experience.skillCategories.forEach((cat, catIdx) => {
    setOverride(`exp.${l}.skCat_${catIdx}`, cat.categoryTitle)
  })

  data.experience.qaProjects.forEach((p, i) => {
    setOverride(`exp.${l}.qp_${i}_t`, p.title)
    setOverride(`exp.${l}.qp_${i}_ch`, p.challenge)
    setOverride(`exp.${l}.qp_${i}_sl`, p.solution)
    setOverride(`exp.${l}.qp_${i}_rs`, p.result)
  })

  data.experience.processProjects.forEach((p, i) => {
    setOverride(`exp.${l}.pp_${i}_t`, p.title)
    setOverride(`exp.${l}.pp_${i}_ch`, p.challenge)
    setOverride(`exp.${l}.pp_${i}_sl`, p.solution)
    setOverride(`exp.${l}.pp_${i}_rs`, p.result)
  })

  data.experience.metrics.forEach((m, i) => {
    setOverride(`exp.${l}.mt_${i}_v`, m.value)
    setOverride(`exp.${l}.mt_${i}_l`, m.label)
    setOverride(`exp.${l}.mt_${i}_d`, m.description)
  })

  data.experience.certifications.forEach((c, i) => {
    setOverride(`exp.${l}.cert_${i}_n`, c.name)
    setOverride(`exp.${l}.cert_${i}_i`, c.issuer)
    setOverride(`exp.${l}.cert_${i}_y`, c.year)
  })

  data.experience.awards.forEach((a, i) => {
    setOverride(`exp.${l}.aw_${i}_t`, a.title)
    setOverride(`exp.${l}.aw_${i}_o`, a.organization)
    setOverride(`exp.${l}.aw_${i}_y`, a.year)
  })

  // Vision page
  setOverride(`vision.${l}.title`, data.vision.title)
  setOverride(`vision.${l}.subtitle`, data.vision.subtitle)
  setOverride(`vision.${l}.phQuote`, data.vision.philosophyQuote)
  setOverride(`vision.${l}.phAuthor`, data.vision.philosophyAuthor)
  setOverride(`vision.${l}.phDesc`, data.vision.philosophyDescription)
  setOverride(`vision.${l}.ctaTitle`, data.vision.ctaTitle)
  setOverride(`vision.${l}.ctaDesc`, data.vision.ctaDescription)

  data.vision.approaches.forEach((a, i) => {
    setOverride(`vision.${l}.ap_${i}_t`, a.title)
    setOverride(`vision.${l}.ap_${i}_d`, a.description)
    setOverride(`vision.${l}.ap_${i}_dt`, a.details)
    setOverride(`vision.${l}.ap_${i}_i`, a.impact)
  })

  data.vision.goals.forEach((g, i) => {
    setOverride(`vision.${l}.gl_${i}_tl`, g.timeline)
    setOverride(`vision.${l}.gl_${i}_t`, g.title)
    setOverride(`vision.${l}.gl_${i}_d`, g.description)
    setOverride(`vision.${l}.gl_${i}_ei`, g.expectedImpact)
    g.keyActions.forEach((a, j) => {
      setOverride(`vision.${l}.gl_${i}_a${j}`, a)
    })
  })
}
