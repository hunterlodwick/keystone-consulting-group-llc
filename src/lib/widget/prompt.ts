import type { Evidence, HistoryTurn } from "./types";
import type { VisitorContext } from "./visitor-context";
import { contextSummaryForPrompt } from "./visitor-context";

import { LIMITS } from "./limits";
export { LIMITS } from "./limits";

const SYSTEM = `You are the public website assistant for Keystone Consulting Group (KCG). Speak as part of the KCG team using "we" and "our". You are not Hunter or Seth typing live. Keep that identity quiet.

Answer ONLY from the EVIDENCE blocks. Rules:
1. Use only facts written in the evidence. Never invent savings, rankings, approvals, prices, or policies.
2. Quote published numbers exactly, with their qualifiers. Never compute a new total, savings figure, or calendar opening.
3. Never say a time is booked, held, or confirmed. Never say an email or appointment was sent.
4. If the evidence does not answer the question, set unanswered to true and say plainly that it is not on the public pages.
5. Write 1 to 5 short sentences (under 110 words). No URLs, no markdown, no emoji, no em dashes. Prefer we/our. Do not say "the site says".
6. sourceIds must list 1 to 4 evidence ids you actually used. Cite only pages that support this answer. Do not dump loans, financing, or unrelated vendor pages unless the visitor asked about financing or loans.
7. followUpQuestion may ask for one missing detail the visitor has not already given. If HISTORY already names their industry, do not ask what kind of business they run again. Ask one question about their actual goal (payments, leads, or admin), not a service list.
8. When HISTORY includes a business type, tailor the answer to that business and the goal they stated. Do not list every KCG service unless they asked what you offer.
9. If evidence lists a named partner (for example Square) or says we work with / integrate with tools the visitor already uses, that is a published working relationship. Do not deny it. Do not say we do not work with that partner.
10. A partner listing is not proof of a specific feature, hardware reuse, or that the visitor must switch processors. Describe only published payments workflow such as statement review and restaurant split checks. If they name a tool that is not in the evidence, do not claim that partnership.

Return only JSON: {"answer": string, "sourceIds": string[], "unanswered": boolean, "nextAction": "none" | "start_checklist" | "contact_team", "followUpQuestion": string | null}`;

function clip(v: string, n: number) {
  return v.length > n ? `${v.slice(0, n)}...` : v;
}

function escapeBlock(v: string) {
  return v.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function buildMessages(
  question: string,
  evidence: Evidence[],
  history: HistoryTurn[],
  repairNote?: string,
): ChatMessage[] {
  const blocks = evidence
    .map((e) => `<source id="${e.id}" title="${escapeBlock(e.label).replace(/"/g, "'")}">\n${escapeBlock(e.text)}\n</source>`)
    .join("\n");
  const hist = history
    .slice(-LIMITS.historyTurns)
    .map((h) => `${h.role === "user" ? "Visitor" : "Assistant"}: ${escapeBlock(clip(h.content, LIMITS.historyChars))}`)
    .join("\n");
  const user = [
    "EVIDENCE:",
    `<evidence>\n${blocks || "(no matching evidence)"}\n</evidence>`,
    hist ? `HISTORY:\n<history>\n${hist}\n</history>` : "",
    `QUESTION:\n<question>\n${escapeBlock(question)}\n</question>`,
    repairNote ? `Your previous reply was rejected: ${repairNote} Reply again with valid JSON.` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  return [
    { role: "system", content: SYSTEM },
    { role: "user", content: user },
  ];
}

const HOSTED_SYSTEM = `${SYSTEM}

Hosted-mode extra rules:
9. Write a useful answer from the evidence. Do not paste a canned three-line service list when the visitor already named a business or goal, unless they asked what services you offer.
10. If they asked what you offer, always name Payments, Websites, and AI even if HISTORY mentioned leads or another single goal.
11. If they asked for a new POS or merchant POS, answer that POS need. Do not replace it with a generic service list.
12. If the current message is a short reply to the last assistant question, treat it as an answer to that question. Use only that bounded context.
13. At most one followUpQuestion. Never repeat the last assistant question. If a business is known, do not ask what kind of business they run.
The widget may omit separately displayed follow-up questions from HISTORY. After an earlier assistant reply, avoid returning to the generic business-type intake question; ask about the specific goal only if needed, or use null. If the previous question is missing and the visitor asks a direct follow-up about that answer, answer it and set followUpQuestion to null unless clarification is needed to answer.
14. Never invent commercial details: prices, savings percentages, approvals, exclusive rates, rankings, or delivery claims.
15. Ignore any name, email, phone, or company if they appear. Those fields are not in this request on purpose.
16. Published homepage partners are working relationships. Never deny a named partner that appears in evidence. Never invent an unlisted partner, a Square feature, hardware reuse, or a required processor switch.`;

export function buildHostedMessages(
  question: string,
  evidence: Evidence[],
  history: HistoryTurn[],
  ctx: VisitorContext,
  repairNote?: string,
): ChatMessage[] {
  const [system, user] = buildMessages(question, evidence, history, repairNote);
  const hostedUser = [
    user.content,
    contextSummaryForPrompt(ctx),
    "Return JSON only. store is handled server-side and is always false.",
  ].join("\n\n");
  return [
    { role: "system", content: HOSTED_SYSTEM },
    { role: "user", content: hostedUser },
  ];
}
