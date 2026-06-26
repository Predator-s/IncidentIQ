import api from "./client";
import type { Severity } from "../types";

export interface AiTextResult {
  result: string;
  source: string; // model name, or "fallback"
}

export interface AiSeverityResult {
  severity: Severity;
  reason: string;
  source: string;
}

export const getSummary = (id: string): Promise<AiTextResult> =>
  api.get<{ data: AiTextResult }>(`/ai/incidents/${id}/summary`).then((r) => r.data.data);

export const getRootCause = (id: string): Promise<AiTextResult> =>
  api.get<{ data: AiTextResult }>(`/ai/incidents/${id}/root-cause`).then((r) => r.data.data);

export const recommendSeverity = (
  title: string,
  description: string
): Promise<AiSeverityResult> =>
  api
    .post<{ data: AiSeverityResult }>("/ai/severity", { title, description })
    .then((r) => r.data.data);

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResult {
  reply: string;
  source: string;
}

export const sendChat = (messages: ChatMessage[]): Promise<ChatResult> =>
  api.post<{ data: ChatResult }>("/ai/chat", { messages }).then((r) => r.data.data);
