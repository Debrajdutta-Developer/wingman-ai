import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import type { AnalysisResult } from "./analysis.types";

const InputSchema = z.object({
  resumeText: z.string().min(20, "Please provide more resume content (min 20 chars)").max(20000),
  manualSkills: z.array(z.string()).optional().default([]),
});

const SYSTEM_PROMPT = `You are the COORDINATOR AGENT of NayePankh AI — an elite multi-agent talent discovery system for students seeking internships. You orchestrate 6 specialized sub-agents:

1. RESUME AGENT — extracts name, skills, projects, experience level
2. SKILL ANALYSIS AGENT — identifies strengths, weaknesses, missing industry skills, learning priorities
3. INTERNSHIP MATCHING AGENT — matches candidate against 8 domains (AI Development, AI Agent Development, Python Development, Data Analytics, Frontend Development, Web Development, Backend Development, Full Stack Development) with reasoning
4. INTERVIEW INTELLIGENCE AGENT — generates technical + HR interview questions with focus areas
5. ROADMAP AGENT — generates 30/60/90 day learning roadmaps with weekly milestones
6. RECRUITER SUMMARY AGENT — produces a recruiter-ready summary with strengths, risks, recommended roles

Combine all agent outputs into a single JSON document that strictly matches the provided schema. Be honest, specific, and actionable. Tailor everything to what's in the candidate's resume. Never invent credentials. If information is missing, infer conservatively. Generate insightful, non-generic suggestions.

Return ONLY valid JSON — no markdown fences, no commentary.`;

function buildUserPrompt(resumeText: string, manualSkills: string[]) {
  const skillsBlock = manualSkills.length
    ? `\n\nManually-entered skills (treat as confirmed):\n- ${manualSkills.join("\n- ")}`
    : "";

  return `Analyze this candidate and return a JSON object with this EXACT shape:

{
  "profile": {
    "name": string,
    "headline": string (one-line professional headline),
    "experienceLevel": "Beginner" | "Intermediate" | "Advanced",
    "profileScore": number (0-100, overall internship readiness),
    "topSkills": string[] (5-8 top skills),
    "projects": [{ "name": string, "description": string }] (up to 4)
  },
  "skillAnalysis": {
    "strongSkills": string[] (3-6),
    "weakSkills": string[] (2-5),
    "missingIndustrySkills": string[] (3-6 skills the market expects but candidate lacks),
    "learningPriorities": string[] (3-5, ordered by priority)
  },
  "matches": [
    {
      "role": string (specific role title),
      "domain": one of ["AI Development","AI Agent Development","Python Development","Data Analytics","Frontend Development","Web Development","Backend Development","Full Stack Development"],
      "matchPercent": number (0-100),
      "reason": string (1-2 sentences referencing candidate specifics),
      "tags": string[] (2-4 short tags like "Remote", "High Stipend", "Startup")
    }
  ] (4 best matches, sorted by matchPercent desc),
  "interview": {
    "technical": [{ "question": string, "focus": string }] (5 questions),
    "hr": [{ "question": string, "focus": string }] (4 questions),
    "improvementTips": string[] (3-5 actionable tips)
  },
  "roadmap": {
    "thirtyDay": {
      "title": string,
      "summary": string,
      "milestones": [{ "week": number (1-4), "title": string, "tasks": string[] }]
    },
    "sixtyDay": { same shape, weeks 5-8 },
    "ninetyDay": { same shape, weeks 9-12 }
  },
  "recruiter": {
    "summary": string (2-3 sentence executive summary),
    "strengths": string[] (3-5),
    "risks": string[] (2-4),
    "recommendedRoles": string[] (2-4),
    "hireRecommendation": "Strong Hire" | "Hire" | "Hold" | "Pass",
    "riskLevel": "Low" | "Medium" | "High"
  }
}

CANDIDATE RESUME:
---
${resumeText}
---${skillsBlock}

Return ONLY the JSON object. No markdown. No prose.`;
}

function extractJson(text: string): unknown {
  // Strip code fences if model added them
  let cleaned = text.trim();
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) cleaned = fence[1].trim();
  // Find first { and last }
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("No JSON object found in model output");
  return JSON.parse(cleaned.slice(first, last + 1));
}

export const analyzeCandidate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const modelName = "google/gemini-3-flash-preview";
    const model = gateway(modelName);
    const started = Date.now();

    let usageLog: {
      model: string;
      prompt_tokens: number | null;
      completion_tokens: number | null;
      total_tokens: number | null;
      latency_ms: number;
      success: boolean;
      error: string | null;
    } = {
      model: modelName,
      prompt_tokens: null,
      completion_tokens: null,
      total_tokens: null,
      latency_ms: 0,
      success: true,
      error: null,
    };

    try {
      const result = await generateText({
        model,
        system: SYSTEM_PROMPT,
        prompt: buildUserPrompt(data.resumeText, data.manualSkills ?? []),
      });

      const usage = (result as unknown as {
        usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
      }).usage;
      usageLog = {
        ...usageLog,
        prompt_tokens: usage?.promptTokens ?? null,
        completion_tokens: usage?.completionTokens ?? null,
        total_tokens: usage?.totalTokens ?? null,
        latency_ms: Date.now() - started,
      };

      const parsed = extractJson(result.text) as AnalysisResult;
      if (Array.isArray(parsed.matches)) {
        parsed.matches.sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0));
      }

      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("ai_usage_logs").insert(usageLog);
      } catch (e) {
        console.warn("usage log failed", e);
      }

      return parsed;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      usageLog = { ...usageLog, latency_ms: Date.now() - started, success: false, error: msg };
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("ai_usage_logs").insert(usageLog);
      } catch {}
      if (msg.includes("429")) throw new Error("AI rate limit reached. Please try again in a moment.");
      if (msg.includes("402")) throw new Error("AI credits exhausted. Please add credits to your Lovable workspace.");
      throw new Error(`Analysis failed: ${msg}`);
    }
  });
