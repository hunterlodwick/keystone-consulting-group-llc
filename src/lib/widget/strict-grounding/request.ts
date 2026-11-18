import { LIMITS } from "../limits";

const CHAT_FIELDS = new Set(["question", "history", "processorConsent"]);

/** The chat endpoint has no delivery fields, model options, URLs, paths or tools. */
export function validChatBody(raw: unknown): boolean {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const o = raw as Record<string, unknown>;
  if (Object.keys(o).some((key) => !CHAT_FIELDS.has(key))) return false;
  if (typeof o.question !== "string" || !o.question.trim() || o.question.length > LIMITS.questionChars) return false;
  if (o.processorConsent !== undefined && typeof o.processorConsent !== "boolean") return false;
  if (o.history === undefined) return true;
  if (!Array.isArray(o.history) || o.history.length > LIMITS.historyTurns) return false;
  return o.history.every((turn) => turn && typeof turn === "object" && !Array.isArray(turn) &&
    Object.keys(turn).every((key) => key === "role" || key === "content") &&
    (turn.role === "user" || turn.role === "assistant") &&
    // The UI sends whole turns; sanitizeHistory clips accepted turns to historyChars.
    typeof turn.content === "string" && turn.content.length <= LIMITS.questionChars);
}
