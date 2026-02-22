import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 400 })
    }

    const supabase = createClient()
    const results = {
      content: 0,
      experience: 0,
      projects: 0,
      errors: [] as string[]
    }

    // 1. Migrate portfolio_content
    console.log("Migrating portfolio_content...")
    const { data: koContent } = await supabase
      .from("portfolio_content")
      .select("*")
      .eq("user_id", USER_ID)
      .eq("language", "ko")

    for (const item of koContent || []) {
      try {
        const translatedValue = await translateText(item.content_value, apiKey, "en")

        await supabase
          .from("portfolio_content")
          .upsert({
            user_id: USER_ID,
            language: "en",
            content_key: item.content_key,
            content_value: translatedValue,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,language,content_key'
          })

        results.content++
      } catch (error: any) {
        results.errors.push(`Content ${item.content_key}: ${error.message}`)
      }
    }

    // 2. Migrate experience_sections
    console.log("Migrating experience_sections...")
    const { data: koExperience } = await supabase
      .from("experience_sections")
      .select("*")
      .eq("user_id", USER_ID)
      .eq("language", "ko")

    for (const item of koExperience || []) {
      try {
        const translatedContent = await translateExperienceContent(item.content, item.section_type, apiKey)

        await supabase
          .from("experience_sections")
          .insert({
            user_id: USER_ID,
            language: "en",
            section_type: item.section_type,
            content: translatedContent,
            display_order: item.display_order,
            updated_at: new Date().toISOString(),
          })

        results.experience++
      } catch (error: any) {
        results.errors.push(`Experience ${item.section_type}: ${error.message}`)
      }
    }

    // 3. Migrate projects
    console.log("Migrating projects...")
    const { data: koProjects } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", USER_ID)
      .eq("language", "ko")

    for (const project of koProjects || []) {
      try {
        const translatedProject = await translateProject(project, apiKey)

        await supabase
          .from("projects")
          .insert({
            ...translatedProject,
            language: "en",
            updated_at: new Date().toISOString(),
          })

        results.projects++
      } catch (error: any) {
        results.errors.push(`Project ${project.title}: ${error.message}`)
      }
    }

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error: any) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { error: error.message || "Migration failed" },
      { status: 500 }
    )
  }
}

async function translateText(text: string, apiKey: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === "") return text

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate Korean text to ${targetLang === 'en' ? 'English' : 'Korean'}. Maintain the tone, style, and meaning. Return only the translation without any explanations.`
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error('Translation API failed')
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || text
  } catch (error) {
    console.error("Translation error:", error)
    return text
  }
}

async function translateExperienceContent(content: any, sectionType: string, apiKey: string): Promise<any> {
  const translated = { ...content }

  switch (sectionType) {
    case 'timeline':
      if (content.role) translated.role = await translateText(content.role, apiKey, 'en')
      if (content.company) translated.company = await translateText(content.company, apiKey, 'en')
      if (content.focus) translated.focus = await translateText(content.focus, apiKey, 'en')
      break

    case 'highlight':
      if (content.title) translated.title = await translateText(content.title, apiKey, 'en')
      if (content.description) translated.description = await translateText(content.description, apiKey, 'en')
      if (content.impact) translated.impact = await translateText(content.impact, apiKey, 'en')
      break

    case 'metric':
      if (content.label) translated.label = await translateText(content.label, apiKey, 'en')
      if (content.description) translated.description = await translateText(content.description, apiKey, 'en')
      break

    case 'skill':
      if (content.category) translated.category = await translateText(content.category, apiKey, 'en')
      break

    case 'certification':
      if (content.name) translated.name = await translateText(content.name, apiKey, 'en')
      if (content.issuer) translated.issuer = await translateText(content.issuer, apiKey, 'en')
      break

    case 'approach':
      if (content.title) translated.title = await translateText(content.title, apiKey, 'en')
      if (content.description) translated.description = await translateText(content.description, apiKey, 'en')
      break
  }

  return translated
}

async function translateProject(project: any, apiKey: string): Promise<any> {
  return {
    user_id: project.user_id,
    project_id: project.project_id,
    category: project.category,
    title: await translateText(project.title, apiKey, 'en'),
    overview: await translateText(project.overview, apiKey, 'en'),
    background: project.background ? await translateText(project.background, apiKey, 'en') : null,
    tech_stack: project.tech_stack,
    details: project.details ? {
      ...project.details,
      type: project.details.type ? await translateText(project.details.type, apiKey, 'en') : null,
      achievements: project.details.achievements ? await translateText(project.details.achievements, apiKey, 'en') : null,
    } : null,
    display_order: project.display_order
  }
}
