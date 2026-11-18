import { sanitizeHistory } from "../history";
import { LIMITS } from "../limits";
import type { ChatMessage } from "../prompt";
import { findPrivateDetails, privacyMessage } from "../privacy";
import type { ResponsesTransport } from "../responses";
import type { ChatResult, HistoryTurn } from "../types";
import { CATALOG_VERSION, passageCitation, availablePassages } from "./catalog";
import { planGroundedTurn, type GroundedTurn } from "./turn";

const ABSTAIN = "I do not have approved public information for that question. I can help with published services, payments, websites, AI assistants, guides, and privacy information. Try naming a service, assistant, or specific public guide.";
const LIMITATION = "That published information does not confirm a particular feature, compatibility, or a need to switch your setup.";

function result(answer: string, reason: string, status: ChatResult["status"] = "abstained"): ChatResult {
  let contentVersion = `${CATALOG_VERSION}:unavailable`;
  if (availablePassages().length === 254) contentVersion = CATALOG_VERSION;
  return { status, answer, reason, citations: [], notices: [], followUpQuestion: null, nextAction: "none", mode: "extractive", contentVersion };
}

function render(turn: GroundedTurn, ids: string[], mode: ChatResult["mode"], reason: string): ChatResult {
  // Server owns ordering, strings, links and action. Only approved literals render.
  const current = new Set(availablePassages().map(e=>e.id));
  const selected = turn.evidence.filter((e) => ids.includes(e.id) && current.has(e.id));
  if (!selected.length) return result(ABSTAIN, reason);
  // The server retains reviewed scope/caveats even if the selector chooses only
  // a detailed passage. Context must already be approved in this turn's enum.
  const routes = new Set(selected.map(e=>e.route));
  for (const context of turn.evidence) {
    if (routes.has(context.route) && current.has(context.id) && !selected.includes(context) &&
      ((context.route.startsWith("/guides/") && context.heading===context.title) || context.heading==="Connectors by time saved and input / output")) selected.push(context);
  }
  const citations = [...new Map(selected.map((e) => [e.sourceId, passageCitation(e)])).values()];
  const answer = selected.map((e) => e.passage).join("\n\n") + (turn.topic === "partners" ? `\n\n${LIMITATION}` : "");
  return { ...result(answer, reason, "answered"), mode, citations, followUpQuestion: turn.followUp };
}

export async function strictAnswerQuestion(question: string, history: HistoryTurn[], opts: {
  signal?: AbortSignal; processorConsent?: boolean; responsesTransport?: ResponsesTransport;
  /** Legacy test seam retained for source compatibility; it is never invoked. */
  call?: (m: ChatMessage[], o: { signal: AbortSignal }) => Promise<string>;
} = {}): Promise<ChatResult> {
  if (typeof question !== "string" || !question.trim() || question.length > LIMITS.questionChars) return result(ABSTAIN, "invalid_question");
  const q = question.trim();
  const pii = findPrivateDetails(q);
  if (pii.length) return result(privacyMessage(pii), "privacy", "clarify");
  if (/\b(?:book me|book a call|reserve (?:a|an|the)|(?:your|my|live|today.?s) availability|(?:check|show|see) (?:the |your )?(?:calendar|availability)|(?:available|open) (?:today|tomorrow|times|slots))\b/i.test(q)) {
    return result("I cannot check live availability or book an appointment in chat. Use the site's Book a Call form to choose an available time.", "availability");
  }
  const turns = sanitizeHistory(history);
  let turn: GroundedTurn;
  try { turn = planGroundedTurn(q, turns); }
  catch { return result(ABSTAIN, "catalog_unavailable"); }
  if (!turn.evidence.length) {
    const local = result(turn.followUp ? "Thanks for the context." : ABSTAIN, "no_approved_evidence", turn.followUp ? "clarify" : "abstained");
    local.followUpQuestion = turn.followUp;
    return local;
  }
  const local = () => render(turn, turn.evidence.map((e) => e.id), "extractive", "approved_local");
  // Release has no hosted processor configured. Consent cannot enable a provider.
  return local();
}
