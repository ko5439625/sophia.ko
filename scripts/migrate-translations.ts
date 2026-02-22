import { createClient } from "@/lib/supabase"

const USER_ID = "sophia.ko"

async function migrateContentTranslations() {
  const supabase = createClient()

  console.log("🔄 Starting translation migration...")

  // 1. Migrate portfolio_content
  console.log("\n📝 Migrating portfolio_content...")
  const { data: koContent, error: koError } = await supabase
    .from("portfolio_content")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("language", "ko")

  if (koError) {
    console.error("Error loading Korean content:", koError)
    return
  }

  console.log(`Found ${koContent?.length || 0} Korean content items`)

  // Translate and save each item
  for (const item of koContent || []) {
    try {
      const translatedValue = await translateWithAI(item.content_value, "ko", "en")

      const { error: insertError } = await supabase
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

      if (insertError) {
        console.error(`Error inserting ${item.content_key}:`, insertError)
      } else {
        console.log(`✅ Translated: ${item.content_key}`)
      }

      // Wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error translating ${item.content_key}:`, error)
    }
  }

  // 2. Migrate experience_sections
  console.log("\n📊 Migrating experience_sections...")
  const { data: koExperience, error: expError } = await supabase
    .from("experience_sections")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("language", "ko")

  if (expError) {
    console.error("Error loading Korean experience:", expError)
    return
  }

  console.log(`Found ${koExperience?.length || 0} Korean experience items`)

  for (const item of koExperience || []) {
    try {
      const translatedContent = await translateExperienceContent(item.content, item.section_type)

      const { error: insertError } = await supabase
        .from("experience_sections")
        .insert({
          user_id: USER_ID,
          language: "en",
          section_type: item.section_type,
          content: translatedContent,
          display_order: item.display_order,
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error(`Error inserting ${item.section_type}:`, insertError)
      } else {
        console.log(`✅ Translated: ${item.section_type} - ${translatedContent.title || translatedContent.label}`)
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error translating ${item.section_type}:`, error)
    }
  }

  // 3. Migrate projects
  console.log("\n🚀 Migrating projects...")
  const { data: koProjects, error: projError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", USER_ID)
    .eq("language", "ko")

  if (projError) {
    console.error("Error loading Korean projects:", projError)
    return
  }

  console.log(`Found ${koProjects?.length || 0} Korean projects`)

  for (const project of koProjects || []) {
    try {
      const translatedProject = await translateProject(project)

      const { error: insertError } = await supabase
        .from("projects")
        .insert({
          ...translatedProject,
          language: "en",
          updated_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error(`Error inserting project ${project.title}:`, insertError)
      } else {
        console.log(`✅ Translated project: ${translatedProject.title}`)
      }

      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`Error translating project ${project.title}:`, error)
    }
  }

  console.log("\n✨ Migration complete!")
}

async function translateWithAI(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === "") return text

  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Translate the following text from ${sourceLang} to ${targetLang}. Maintain the tone and meaning.`,
        type: 'blog',
        language: targetLang,
        formData: {
          title: 'Translation',
          content: text
        }
      }),
    })

    if (!response.ok) {
      throw new Error('Translation failed')
    }

    const data = await response.json()
    return data.content || data.text || text
  } catch (error) {
    console.error("Translation error:", error)
    return text
  }
}

async function translateExperienceContent(content: any, sectionType: string): Promise<any> {
  const translated = { ...content }

  switch (sectionType) {
    case 'timeline':
      if (content.role) translated.role = await translateWithAI(content.role, 'ko', 'en')
      if (content.company) translated.company = await translateWithAI(content.company, 'ko', 'en')
      if (content.focus) translated.focus = await translateWithAI(content.focus, 'ko', 'en')
      break

    case 'highlight':
      if (content.title) translated.title = await translateWithAI(content.title, 'ko', 'en')
      if (content.description) translated.description = await translateWithAI(content.description, 'ko', 'en')
      if (content.impact) translated.impact = await translateWithAI(content.impact, 'ko', 'en')
      break

    case 'metric':
      if (content.label) translated.label = await translateWithAI(content.label, 'ko', 'en')
      if (content.description) translated.description = await translateWithAI(content.description, 'ko', 'en')
      break

    case 'skill':
      if (content.category) translated.category = await translateWithAI(content.category, 'ko', 'en')
      // Tools usually don't need translation (technical terms)
      break

    case 'certification':
      if (content.name) translated.name = await translateWithAI(content.name, 'ko', 'en')
      if (content.issuer) translated.issuer = await translateWithAI(content.issuer, 'ko', 'en')
      break

    case 'approach':
      if (content.title) translated.title = await translateWithAI(content.title, 'ko', 'en')
      if (content.description) translated.description = await translateWithAI(content.description, 'ko', 'en')
      break
  }

  return translated
}

async function translateProject(project: any): Promise<any> {
  return {
    user_id: project.user_id,
    project_id: project.project_id,
    category: project.category,
    title: await translateWithAI(project.title, 'ko', 'en'),
    overview: await translateWithAI(project.overview, 'ko', 'en'),
    background: project.background ? await translateWithAI(project.background, 'ko', 'en') : null,
    tech_stack: project.tech_stack, // Usually don't translate tech terms
    details: project.details ? {
      ...project.details,
      type: project.details.type ? await translateWithAI(project.details.type, 'ko', 'en') : null,
      achievements: project.details.achievements ? await translateWithAI(project.details.achievements, 'ko', 'en') : null,
    } : null,
    display_order: project.display_order
  }
}

// Run the migration
migrateContentTranslations().catch(console.error)
