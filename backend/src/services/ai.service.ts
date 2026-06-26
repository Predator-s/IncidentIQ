import type { Incident, Severity } from "@prisma/client";
import ApiError from "../utils/ApiError.js";

/**
 * Provider-agnostic LLM client targeting the OpenAI-compatible
 * `/chat/completions` endpoint. Works with any open-source stack:
 *   - Groq      (LLM_BASE_URL=https://api.groq.com/openai/v1, model=llama-3.3-70b-versatile)
 *   - Ollama    (LLM_BASE_URL=http://localhost:11434/v1,      model=llama3.1)
 *   - LM Studio / vLLM / llama.cpp server, etc.
 *
 * If no endpoint/key is configured, each helper falls back to a transparent
 * rule-based heuristic so the feature still works in a demo.
 */

const BASE_URL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const API_KEY = process.env.LLM_API_KEY || "";
const MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";

export const llmConfigured = (): boolean => Boolean(BASE_URL);

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function chat(messages: ChatMessage[], maxTokens = 400): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(502, `LLM request failed (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new ApiError(502, "LLM returned an empty response");
  return content;
}

const SYSTEM =
  "You are an SRE incident-management assistant. Be concise, technical, and practical. " +
  "Never invent facts beyond what the incident provides.";

// ---- 1. Incident summary -------------------------------------------------

export async function summarize(incident: Incident): Promise<{ result: string; source: string }> {
  if (!llmConfigured()) {
    const firstLine = incident.description.split("\n")[0].slice(0, 200);
    return {
      result: `${incident.title} — ${firstLine} (severity: ${incident.severity}, status: ${incident.status}).`,
      source: "fallback",
    };
  }
  const result = await chat([
    { role: "system", content: SYSTEM },
    {
      role: "user",
      content:
        `Summarize this incident in 2-3 sentences for an on-call engineer.\n\n` +
        `Title: ${incident.title}\nSeverity: ${incident.severity}\nStatus: ${incident.status}\n` +
        `Description: ${incident.description}`,
    },
  ]);
  return { result, source: MODEL };
}

// ---- 2. Severity recommendation -----------------------------------------

const SEVERITY_KEYWORDS: Record<Severity, RegExp> = {
  CRITICAL: /\b(outage|down|data loss|breach|all users|production down|cannot|unavailable)\b/i,
  HIGH: /\b(error|fail|degraded|slow|timeout|crash|exception|impact)\b/i,
  MEDIUM: /\b(intermittent|some users|minor|warning|delay)\b/i,
  LOW: /\b(cosmetic|typo|suggestion|question|low)\b/i,
};

function heuristicSeverity(text: string): Severity {
  for (const sev of ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as Severity[]) {
    if (SEVERITY_KEYWORDS[sev].test(text)) return sev;
  }
  return "MEDIUM";
}

export async function recommendSeverity(
  title: string,
  description: string
): Promise<{ severity: Severity; reason: string; source: string }> {
  const text = `${title}\n${description}`;
  if (!llmConfigured()) {
    const severity = heuristicSeverity(text);
    return { severity, reason: "Matched keyword heuristics (LLM not configured).", source: "fallback" };
  }
  const raw = await chat(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content:
          `Classify the severity of this incident as one of LOW, MEDIUM, HIGH, CRITICAL. ` +
          `Respond ONLY with strict JSON: {"severity":"...","reason":"one short sentence"}.\n\n` +
          `Title: ${title}\nDescription: ${description}`,
      },
    ],
    150
  );
  try {
    const json = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const severity = String(json.severity).toUpperCase() as Severity;
    const valid: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    if (!valid.includes(severity)) throw new Error("bad severity");
    return { severity, reason: json.reason || "", source: MODEL };
  } catch {
    return { severity: heuristicSeverity(text), reason: "Could not parse model output; used heuristic.", source: "fallback" };
  }
}

// ---- 3. Root-cause suggestions ------------------------------------------

export async function suggestRootCause(
  incident: Incident
): Promise<{ result: string; source: string }> {
  if (!llmConfigured()) {
    return {
      result:
        "LLM not configured. Common starting points: recent deploys/config changes, " +
        "dependency or upstream outages, resource exhaustion (CPU/memory/disk), and expired credentials/certs.",
      source: "fallback",
    };
  }
  const result = await chat(
    [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content:
          `Suggest 3-4 likely root causes and a next diagnostic step for each, as a short markdown list.\n\n` +
          `Title: ${incident.title}\nSeverity: ${incident.severity}\nDescription: ${incident.description}`,
      },
    ],
    500
  );
  return { result, source: MODEL };
}

// ---- 4. Conversational assistant ----------------------------------------

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function chatAssistant(
  history: ChatTurn[],
  context: string
): Promise<{ reply: string; source: string }> {
  if (!llmConfigured()) {
    return {
      reply:
        "The AI assistant isn't configured. Set LLM_BASE_URL (e.g. Groq or Ollama) to enable chat.",
      source: "fallback",
    };
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        `${SYSTEM}\nYou are the IncidentIQ assistant. Help the user understand, triage, and ` +
        `manage their incidents. Keep answers short and actionable. If asked about specific ` +
        `incidents, use only the context below; if it isn't there, say so.\n\n` +
        `Current incident context:\n${context}`,
    },
    ...history.slice(-10),
  ];

  const reply = await chat(messages, 500);
  return { reply, source: MODEL };
}
