import {
  recentBusiness,
  recentNeed,
  ellipticalChoice,
  detectConversationIntent,
  isServicesOverviewQuestion,
  type BusinessKind,
  type NeedKind,
} from "./conversation";
import type { HistoryTurn } from "./types";

const BUSINESS_QUESTION_RE = /what kind of business|what industry|what type of shop|what do you (?:run|own)/i;

export type ConfirmedDetail = { key: string; value: string };

export type VisitorContext = {
  business: BusinessKind | null;
  need: NeedKind | null;
  confirmedDetails: ConfirmedDetail[];
  unanswered: string[];
  askedBusinessQuestion: boolean;
};

function turnsText(history: HistoryTurn[], extra = ""): { user: string; assistant: string } {
  const user = [...history.filter((h) => h.role === "user").map((h) => h.content), extra].join("\n");
  const assistant = history.filter((h) => h.role === "assistant").map((h) => h.content).join("\n");
  return { user, assistant };
}

function needLabel(need: NeedKind): string {
  if (need === "payments") return "payments and checkout";
  if (need === "leads") return "getting more leads";
  return "saving time on admin";
}

function businessLabel(kind: BusinessKind): string {
  switch (kind) {
    case "restaurant":
      return "restaurant";
    case "retail":
      return "retail shop";
    case "trade":
      return "trade or field business";
    case "salon":
      return "salon";
    case "healthcare":
      return "clinic or practice";
    case "professional":
      return "professional service";
    default:
      return "small business";
  }
}

export function accumulateVisitorContext(question: string, history: HistoryTurn[]): VisitorContext {
  const { user, assistant } = turnsText(history, question);
  const choice = ellipticalChoice(question, history);
  const business = recentBusiness(question, history);
  const intent = detectConversationIntent(question, history);
  const need = (intent.kind === "need" || intent.kind === "business_context" ? intent.need : null) ?? recentNeed(question, history);
  const askedBusinessQuestion = BUSINESS_QUESTION_RE.test(assistant);
  const confirmedDetails: ConfirmedDetail[] = [];
  if (business) confirmedDetails.push({ key: "business", value: businessLabel(business) });
  if (need) confirmedDetails.push({ key: "need", value: needLabel(need) });
  if (choice) confirmedDetails.push({ key: "stated_choice", value: choice });

  const unanswered: string[] = [];
  if (!business && (askedBusinessQuestion || isServicesOverviewQuestion(question) || history.some((h) => isServicesOverviewQuestion(h.content)))) {
    unanswered.push("What kind of business they run");
  }
  if (business && !need) {
    unanswered.push("Whether the first leak is card fees and checkout, getting more leads, or repeat admin work");
  }
  if (need === "payments" && !/\b(?:volume|statement|\$\d)/i.test(user)) {
    unanswered.push("What checkout looks like today, or whether they want a statement review");
  }
  if (need === "leads" && !/\b(?:google|booking|enquir|inquir|found online)/i.test(user) && !choice) {
    unanswered.push("Whether the bigger gap is getting found online or turning visitors into bookings");
  }
  if (need === "admin" && !/\b(?:missed calls?|follow[\s-]?ups?|schedul)/i.test(user)) {
    unanswered.push("Which repeat job to tackle first: missed calls, follow-ups, or scheduling");
  }

  return {
    business,
    need,
    confirmedDetails,
    unanswered,
    askedBusinessQuestion,
  };
}

export function followUpRepeatsKnownBusiness(followUp: string | null, ctx: VisitorContext): boolean {
  if (!followUp || !ctx.business) return false;
  return BUSINESS_QUESTION_RE.test(followUp);
}

export function contextSummaryForPrompt(ctx: VisitorContext): string {
  const known = ctx.confirmedDetails.map((d) => `${d.key}: ${d.value}`).join("; ") || "none yet";
  const unanswered = ctx.unanswered.join("; ") || "none listed";
  return `KNOWN VISITOR FACTS (only these are confirmed): ${known}\nUNANSWERED (do not treat as facts): ${unanswered}\nDo not ask the business-type question again if a business is already known.`;
}
