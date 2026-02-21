import { generateText, Output } from "ai"
import { z } from "zod"

export async function POST(req: Request) {
  const { rawText, language } = await req.json()

  const result = await generateText({
    model: "openai/gpt-4o-mini",
    system: `You are a portfolio content generator for a QA engineer. 
Given raw text about a person's career, generate structured portfolio content in ${language === "ko" ? "Korean" : "English"}.
Be professional, concise, and highlight quantitative achievements.
Use the person's actual information from the raw text. Do not make up facts.`,
    prompt: `Based on this information, generate complete portfolio content:

${rawText}

Generate structured JSON content for all sections of the portfolio.`,
    output: Output.object({
      schema: z.object({
        about: z.object({
          name: z.string(),
          role: z.string(),
          email: z.string(),
          phone: z.string(),
          location: z.string(),
          experience: z.string(),
          summary: z.string(),
          faq: z.array(z.object({
            question: z.string(),
            answer: z.string(),
          })),
          funFacts: z.array(z.string()),
        }),
        experience: z.object({
          title: z.string(),
          subtitle: z.string(),
          summary: z.string(),
          highlights: z.array(z.object({
            title: z.string(),
            description: z.string(),
            impact: z.string(),
          })),
          timeline: z.array(z.object({
            year: z.string(),
            role: z.string(),
            company: z.string(),
            focus: z.string(),
          })),
          skillCategories: z.array(z.object({
            categoryTitle: z.string(),
            skills: z.array(z.object({
              name: z.string(),
              details: z.string(),
            })),
          })),
          qaProjects: z.array(z.object({
            title: z.string(),
            challenge: z.string(),
            solution: z.string(),
            result: z.string(),
          })),
          processProjects: z.array(z.object({
            title: z.string(),
            challenge: z.string(),
            solution: z.string(),
            result: z.string(),
          })),
          metrics: z.array(z.object({
            value: z.string(),
            label: z.string(),
            description: z.string(),
          })),
          certifications: z.array(z.object({
            name: z.string(),
            issuer: z.string(),
            year: z.string(),
          })),
          awards: z.array(z.object({
            title: z.string(),
            organization: z.string(),
            year: z.string(),
          })),
        }),
        vision: z.object({
          title: z.string(),
          subtitle: z.string(),
          philosophyQuote: z.string(),
          philosophyAuthor: z.string(),
          philosophyDescription: z.string(),
          approaches: z.array(z.object({
            title: z.string(),
            description: z.string(),
            details: z.string(),
            impact: z.string(),
          })),
          goals: z.array(z.object({
            timeline: z.string(),
            title: z.string(),
            description: z.string(),
            expectedImpact: z.string(),
            keyActions: z.array(z.string()),
          })),
          ctaTitle: z.string(),
          ctaDescription: z.string(),
        }),
      }),
    }),
  })

  return Response.json(result.output)
}
