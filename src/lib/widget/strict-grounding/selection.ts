import type { ChatMessage } from "../prompt";
import { availablePassages, type ApprovedPassage } from "./catalog";
import type { Focus, GroundedTurn, Topic } from "./turn";

export const SELECTION_LIMITS = Object.freeze({ candidates: 3, selected: 3, outputChars: 512, requestBytes: 16_384, responseBytes: 16_384 });
const TOPICS: Topic[] = ["overview", "payments", "websites", "ai", "partners", "financing", "privacy", "public"];
const FOCUS: Focus[] = ["general", "pos", "restaurant", "retail", "trade", "search", "enquiry"];
const SYSTEM = 'Select relevant public evidence IDs from the supplied evidence only. Return exactly {"sourceIds":[...]}, or {"sourceIds":[]} if none applies. Do not write sentences, links, actions or follow-up questions. No tools are available.';

export function selectionMessages(turn: Pick<GroundedTurn, "topic" | "focus" | "evidence">): ChatMessage[] {
  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: JSON.stringify({ topic: turn.topic, focus: turn.focus, evidence: turn.evidence.map((e) => ({ id: e.id, passage: e.passage })) }) },
  ];
}

/** Transport rejects legacy free-text prompts as well as arbitrary evidence. */
export function validateSelectionMessages(messages: ChatMessage[], ids: readonly string[]): boolean {
  if (!ids.length || ids.length > SELECTION_LIMITS.candidates || new Set(ids).size !== ids.length) return false;
  if (messages.length !== 2 || messages[0]?.role !== "system" || messages[0].content !== SYSTEM || messages[1]?.role !== "user") return false;
  try {
    const data = JSON.parse(messages[1].content);
    if (!TOPICS.includes(data.topic) || !FOCUS.includes(data.focus)) return false;
    const catalog = availablePassages();
    const evidence = ids.map((id) => catalog.find((e) => e.id === id));
    if (evidence.some((e) => !e)) return false;
    const expected = selectionMessages({ topic: data.topic, focus: data.focus, evidence: evidence as ApprovedPassage[] });
    return expected[1].content === messages[1].content;
  } catch { return false; }
}

export function selectionFormat(ids: readonly string[]) {
  return { format: { type: "json_schema" as const, name: "kcg_public_evidence_selection", strict: true as const,
    schema: { type: "object", additionalProperties: false, required: ["sourceIds"], properties: {
      sourceIds: { type: "array", maxItems: SELECTION_LIMITS.selected, items: { type: "string", enum: [...ids] } },
    } },
  } };
}

/** Whole-document grammar also rejects duplicate keys, wrappers and extra properties. */
export function parseSelection(raw: string, evidence: readonly ApprovedPassage[]): string[] | null {
  if (raw.length > SELECTION_LIMITS.outputChars || !/^\s*\{\s*"sourceIds"\s*:\s*\[\s*(?:"[a-z0-9.-]+"\s*(?:,\s*"[a-z0-9.-]+"\s*)*)?\]\s*\}\s*$/.test(raw)) return null;
  try {
    const ids = JSON.parse(raw).sourceIds as string[];
    if (ids.length > SELECTION_LIMITS.selected || new Set(ids).size !== ids.length || ids.some((id) => !evidence.some((e) => e.id === id))) return null;
    return ids;
  } catch { return null; }
}
