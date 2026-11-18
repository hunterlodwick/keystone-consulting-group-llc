import { availablePassages } from './strict-grounding/catalog';
function questionNamesPublishedPartner(question: string, context = ''): string[] {
  const passage = availablePassages().find(e => e.id === 'public.home.725.0')?.passage ?? '';
  const hay = `${question} ${context}`.toLowerCase();
  return passage.replace(/^.*?: /, '').split(/, | and /).map(s => s.replace(/[.]$/, '').trim()).filter(name => name && hay.includes(name.toLowerCase()));
}
import type { ChatResult, HistoryTurn } from "./types";

export type NeedKind = "payments" | "leads" | "admin";
export type BusinessKind =
  | "restaurant"
  | "retail"
  | "trade"
  | "salon"
  | "healthcare"
  | "professional"
  | "other";

export type ConversationIntent =
  | { kind: "services_overview" }
  | { kind: "need"; need: NeedKind; choice?: string }
  | { kind: "business_context"; business: BusinessKind; need: NeedKind | null; choice?: string }
  | { kind: "financing" }
  | { kind: "none" };

const SERVICES_FOLLOW_UP = "What kind of business do you run?";

const SERVICES_ANSWER =
  "We help small businesses in three areas: Payments for POS and checkout, Websites that bring in leads and bookings, and AI solutions that take repeat admin work off your plate.";

export const NEED_STARTERS: { need: NeedKind; label: string }[] = [
  { need: "payments", label: "Take payments" },
  { need: "leads", label: "Get more leads" },
  { need: "admin", label: "Save time on admin" },
];

const SERVICES_RE =
  /\b(?:what(?:\s+(?:kind|types?|sort))?\s+(?:of\s+)?(?:services?|solutions?|offerings?)?\s+(?:do\s+you\s+(?:offer|provide|do|sell|help\s+with)|are\s+(?:available|offered))|what\s+do\s+you\s+(?:guys\s+|people\s+)?(?:do|offer|provide|help\s+with)|how\s+can\s+you\s+help(?:\s+(?:my|our)\s+business)?|what\s+can\s+you\s+(?:do|help)\s+(?:for|with)|tell\s+me\s+about\s+(?:your|the)\s+(?:services|offerings)|services?\s+(?:overview|list)|what(?:'s| is)\s+(?:on\s+)?(?:offer|available))\b/i;

const POS_INTENT_RE =
  /\b(?:(?:need|want|looking\s+for|get(?:ting)?|buy|replace|upgrade)\s+(?:a\s+|an\s+|me\s+(?:a\s+|an\s+)?)?(?:new\s+)?pos\b|(?:new\s+)?pos\s+(?:system|systems|hardware|terminal|terminals|placement|setup)\b|merchant.{0,48}\bpos\b|\bpos\b.{0,48}merchant)\b/i;

const SERVICE_TYPOS: [RegExp, string][] = [
  [/\bservcies\b/gi, "services"],
  [/\bserivces\b/gi, "services"],
  [/\bservises\b/gi, "services"],
  [/\bservces\b/gi, "services"],
  [/\bsevice\b/gi, "service"],
  [/\bsevices\b/gi, "services"],
];

const FINANCING_RE =
  /\b(?:financ(?:e|ing|ial)|loan|loans|bnpl|buy[\s-]?now[\s-]?pay[\s-]?later|flexxbuy|pay\s+over\s+time|customer\s+financ)\b/i;

const BUSINESS_PATTERNS: [RegExp, BusinessKind][] = [
  [/\b(?:restaurant|cafe|café|food\s+truck|diner|bar|kitchen|eatery|pizza|taco)\b/i, "restaurant"],
  [/\b(?:retail|store|shop|boutique)\b/i, "retail"],
  [/\b(?:trade|contractor|plumber|electrician|hvac|field\s+crew|auto\s+repair|mechanic|roofer)\b/i, "trade"],
  [/\b(?:salon|spa|barber|stylist)\b/i, "salon"],
  [/\b(?:clinic|dental|dentist|healthcare|medical|practice|chiro)\b/i, "healthcare"],
  [/\b(?:lawyer|attorney|accountant|agency|consultant|professional\s+service)\b/i, "professional"],
];

const NEED_PATTERNS: [RegExp, NeedKind][] = [
  [/\b(?:take\s+payments?|accept\s+cards?|pos\b|checkout|processing\s+fees?|card\s+fees?|payment\s+processing|split(?:ting)?\s+checks?|tableside)\b/i, "payments"],
  [/\b(?:more\s+leads?|get\s+(?:more\s+)?(?:leads?|customers?|bookings?)|(?:getting\s+)?found\s+online|google\s+(?:presence|listing)|local\s+search|website|web\s+site|convert|enquir(?:y|ies)|inquir(?:y|ies)|online\s+(?:orders?|booking))\b/i, "leads"],
  [/\b(?:save\s+time(?:\s+on\s+admin)?|admin\b|automat(?:e|ion)|ai\s+(?:agent|assistant|solutions?)|repeat\s+(?:work|tasks?|admin)|missed\s+calls?|follow[\s-]?ups?)\b/i, "admin"],
];

const BUSINESS_ONLY_RE =
  /\b(?:i\s+(?:run|own|have|operate|manage)|we(?:'re|\s+are|\s+run|\s+own)|my\s+(?:business|shop|restaurant|store|salon|clinic)|(?:it'?s|its)\s+a)\b/i;

function normalize(q: string): string {
  return q.replace(/\s+/g, " ").trim();
}

export function normalizeQuestionTypos(question: string): string {
  let next = normalize(question);
  for (const [re, to] of SERVICE_TYPOS) next = next.replace(re, to);
  return next;
}

export function isPosIntent(question: string): boolean {
  return POS_INTENT_RE.test(normalizeQuestionTypos(question));
}

export function priorAssistantQuestion(history: HistoryTurn[]): string | null {
  const turn = history.slice(-6).reverse().find((h) => h.role === "assistant");
  const matches = turn?.content.slice(0, 600).match(/[^.!?\n]{6,180}\?/g);
  return matches?.at(-1)?.trim() ?? null;
}

function optionPhrases(question: string): string[] {
  const body = question.replace(/\?+$/g, "");
  return body
    .split(/\s*,\s*or\s+|\s+or\s+|;\s+|,\s+(?=[a-z])/i)
    .map((part) =>
      part
        .replace(/^(?:is the bigger gap|which is costing you more right now|which repeat job should we tackle first|want to start with)[:\s]+/i, "")
        .replace(/[?.!]+$/g, "")
        .trim()
        .toLowerCase(),
    )
    .filter((part) => part.length >= 6 && part.length <= 80);
}

export function ellipticalChoice(question: string, history: HistoryTurn[]): string | null {
  const q = normalizeQuestionTypos(question).toLowerCase().replace(/[?.!]+$/g, "");
  if (!q || q.length > 72) return null;
  if (isServicesOverviewQuestion(q) || isPosIntent(q) || isFinancingQuestion(q)) return null;
  // The current widget sends answer text without the separate followUpQuestion.
  // These explicit goals stand on their own; never guess what "yes" or "that" means.
  if (/^(?:(?:getting )?found online|google (?:presence|listing)|local search|turning visitors into bookings|missed calls|follow-ups|scheduling|(?:a )?(?:processing )?statement review)$/.test(q)) return q;
  const prior = priorAssistantQuestion(history);
  if (!prior) return null;
  const options = optionPhrases(prior);
  for (const opt of options) {
    if (q === opt || (q.length >= 6 && (` ${opt} `).includes(` ${q} `))) return opt;
  }
  return null;
}

export function detectNeed(text: string): NeedKind | null {
  for (const [re, need] of NEED_PATTERNS) {
    if (re.test(text)) return need;
  }
  return null;
}

export function detectBusiness(text: string): BusinessKind | null {
  // The last explicit, non-negated correction wins, including a trailing "instead".
  const clauses = text.split(/\b(?:actually|instead|rather|but)\b/i).reverse();
  for (const clause of clauses) {
    const positive = clause.replace(/\b(?:not|no longer)\s+(?:a[n]?\s+)?(?:restaurant|cafe|retail(?: store| shop)?|store|shop|trade|contractor|salon|clinic)\b/gi, '');
    for (const [re, kind] of BUSINESS_PATTERNS) {
      if (re.test(positive)) return kind;
    }
    if (/\bbusiness\b/i.test(positive) && BUSINESS_ONLY_RE.test(positive)) return "other";
  }
  return null;
}

export function recentNeed(question: string, history: HistoryTurn[]): NeedKind | null {
  return detectNeed(question) ?? [...history].reverse()
    .filter((h) => h.role === "user")
    .map((h) => detectNeed(h.content)).find((need) => need !== null) ?? null;
}

export function recentBusiness(question: string, history: HistoryTurn[]): BusinessKind | null {
  return detectBusiness(question) ?? [...history].reverse()
    .filter((h) => h.role === "user")
    .map((h) => detectBusiness(h.content)).find((business) => business !== null) ?? null;
}

function priorAskedServices(history: HistoryTurn[]): boolean {
  return history.some((h) => h.role === "user" && isServicesOverviewQuestion(h.content));
}

function priorServicesAnswer(history: HistoryTurn[]): boolean {
  return history.some(
    (h) =>
      h.role === "assistant" &&
      /Payments for POS|three areas|AI solutions that take repeat/i.test(h.content),
  );
}

export function isServicesOverviewQuestion(question: string): boolean {
  const q = normalizeQuestionTypos(question);
  if (!q || FINANCING_RE.test(q) || isPosIntent(q)) return false;
  if (SERVICES_RE.test(q)) return true;
  if (/^(?:services|your services|what services)\??$/i.test(q)) return true;
  if (/^what do you (?:guys )?do\??$/i.test(q)) return true;
  return false;
}

export function isFinancingQuestion(question: string): boolean {
  return FINANCING_RE.test(question);
}

function isNeedStarter(question: string): NeedKind | null {
  const q = normalize(question).toLowerCase();
  for (const row of NEED_STARTERS) {
    if (q === row.label.toLowerCase() || q === `${row.label.toLowerCase()}?`) return row.need;
  }
  return null;
}

function needFromChoice(choice: string, history: HistoryTurn[]): NeedKind | null {
  if (/found online|google|search|map pack|seo|local presence/i.test(choice)) return "leads";
  if (/booking|visitor|convert|enquir|inquir/i.test(choice)) return "leads";
  if (/card fees|checkout|statement|pos|payments?/i.test(choice)) return "payments";
  if (/missed calls|follow-?ups|schedul|admin/i.test(choice)) return "admin";
  return recentNeed("", history);
}

function followUpAlreadyAsked(history: HistoryTurn[], followUp: string): boolean {
  const needle = followUp.replace(/[?.!]/g, "").trim().toLowerCase();
  if (!needle) return false;
  return history.some(
    (h) => h.role === "assistant" && h.content.replace(/[?.!]/g, "").toLowerCase().includes(needle),
  );
}

function nextFollowUp(history: HistoryTurn[], preferred: string | null, business: BusinessKind | null): string | null {
  const fallback = business ? null : SERVICES_FOLLOW_UP;
  const candidate = preferred && !followUpAlreadyAsked(history, preferred) ? preferred : fallback;
  if (!candidate) return null;
  // Earlier follow-ups are not carried by the widget. Avoid cycling back to
  // generic intake after an assistant reply; a specific goal question is enough.
  if (candidate === SERVICES_FOLLOW_UP && history.some((h) => h.role === "assistant")) return null;
  if (followUpAlreadyAsked(history, candidate)) return null;
  if (business && /what kind of business|what industry/i.test(candidate)) return null;
  return candidate;
}

export function detectConversationIntent(question: string, history: HistoryTurn[]): ConversationIntent {
  const q = normalizeQuestionTypos(question);
  if (!q) return { kind: "none" };

  if (isFinancingQuestion(q)) return { kind: "financing" };
  if (isPosIntent(q)) {
    const business = recentBusiness(q, history);
    if (business) return { kind: "business_context", business, need: "payments" };
    return { kind: "need", need: "payments" };
  }
  if (isServicesOverviewQuestion(q)) return { kind: "services_overview" };

  const choice = ellipticalChoice(q, history);
  const need = detectNeed(q) ?? isNeedStarter(q) ?? (choice ? needFromChoice(choice, history) : null);
  const business = detectBusiness(q);
  const afterServices = priorAskedServices(history) || priorServicesAnswer(history);
  const priorBusiness = recentBusiness("", history);
  const priorNeed = recentNeed("", history);

  if (business && (afterServices || BUSINESS_ONLY_RE.test(q) || need || history.length > 0)) {
    return { kind: "business_context", business, need: need ?? priorNeed, choice: choice ?? undefined };
  }

  // Reuse earlier business context for need follow-ups ("Get more leads" after "I run a restaurant").
  if (priorBusiness && need && (afterServices || history.length > 0)) {
    return { kind: "business_context", business: priorBusiness, need, choice: choice ?? undefined };
  }

  if (
    !business &&
    priorBusiness &&
    afterServices &&
    /^(?:that|the first|payments?|leads?|admin|website|pos|cards?|fees?)\b/i.test(q)
  ) {
    return { kind: "business_context", business: priorBusiness, need, choice: choice ?? undefined };
  }

  if (need && (isNeedStarter(q) || q.length <= 72 || Boolean(choice))) {
    return { kind: "need", need, choice: choice ?? undefined };
  }

  return { kind: "none" };
}

function businessLabel(kind: BusinessKind): string {
  switch (kind) {
    case "restaurant":
      return "restaurants";
    case "retail":
      return "retail shops";
    case "trade":
      return "trade and field businesses";
    case "salon":
      return "salons";
    case "healthcare":
      return "clinics and practices";
    case "professional":
      return "professional services";
    default:
      return "shops like yours";
  }
}

function needFollowUp(need: NeedKind | null): string {
  if (need === "payments") {
    return "Want to start with a processing statement review, or tell me what checkout looks like today?";
  }
  if (need === "leads") {
    return "Is the bigger gap getting found online, or turning visitors into bookings?";
  }
  if (need === "admin") {
    return "Which repeat job should we tackle first: missed calls, follow-ups, or scheduling?";
  }
  return "Which is costing you more right now: card fees and checkout, getting more leads, or repeat admin work?";
}

function answerForNeed(need: NeedKind, business: BusinessKind | null, choice?: string): string {
  const shop = business ? `For ${businessLabel(business)}, ` : "";
  if (need === "payments") {
    if (choice && /statement/i.test(choice)) {
      return `${shop}we start with a processing statement review, then match POS and checkout to how you actually sell.`.replace(/^./, (c) => c.toUpperCase());
    }
    return `${shop}we set up POS and checkout so fees stay readable and the counter or table flow matches how you sell.`.replace(/^./, (c) => c.toUpperCase());
  }
  if (need === "leads") {
    if (choice && /found online|google|search|map pack|seo|local presence/i.test(choice)) {
      return `${shop}we work on getting the shop found: a site people and search can actually locate, plus Google Business details, then one enquiry or booking path.`.replace(/^./, (c) => c.toUpperCase());
    }
    if (choice && /booking|visitor|convert|enquir|inquir/i.test(choice)) {
      return `${shop}we build the site around one clear enquiry or booking path so visitors can take the next step without hunting.`.replace(/^./, (c) => c.toUpperCase());
    }
    return `${shop}we build websites around one clear enquiry or booking path so visitors can take the next step without hunting.`.replace(/^./, (c) => c.toUpperCase());
  }
  if (choice && /missed calls/i.test(choice)) {
    return `${shop}we configure AI to catch missed calls and turn them into a follow-up the owner still reviews.`.replace(/^./, (c) => c.toUpperCase());
  }
  return `${shop}we configure AI solutions for repeat admin work like follow-ups and intake, with a named person reviewing before anything goes out.`.replace(/^./, (c) => c.toUpperCase());
}

function answerForBusiness(
  business: BusinessKind,
  need: NeedKind | null,
  choice?: string,
): { answer: string; followUp: string | null } {
  if (need) {
    return { answer: answerForNeed(need, business, choice), followUp: choice ? null : needFollowUp(need) };
  }
  switch (business) {
    case "restaurant":
      return {
        answer:
          "For restaurants, we usually tighten how cards move at the table and whether the site fills seats with bookings or online orders.",
        followUp: needFollowUp(null),
      };
    case "retail":
      return {
        answer:
          "For retail shops, we usually start with faster checkout and a site that turns browsers into store visits or orders.",
        followUp: needFollowUp(null),
      };
    case "trade":
      return {
        answer:
          "For trade and field businesses, we usually fix mobile take-payment on the job and a site that captures quote requests the same day.",
        followUp: needFollowUp(null),
      };
    case "salon":
      return {
        answer:
          "For salons, we usually tighten chair-side payments, deposits, and a booking path that protects your calendar.",
        followUp: needFollowUp(null),
      };
    case "healthcare":
      return {
        answer:
          "For clinics, we usually simplify patient payments and a site path that books the right visit without phone tag.",
        followUp: needFollowUp(null),
      };
    case "professional":
      return {
        answer:
          "For professional services, we usually tighten intake, follow-up, and a site that turns enquiries into booked conversations.",
        followUp: needFollowUp(null),
      };
    default:
      return {
        answer:
          "Got it. We can focus on Payments for POS and checkout, a website that captures leads, or AI for the admin that keeps repeating.",
        followUp: needFollowUp(null),
      };
  }
}

export type ConversationReply = Pick<
  ChatResult,
  "status" | "answer" | "citations" | "notices" | "followUpQuestion" | "nextAction" | "reason"
>;

export function conversationReply(question: string, history: HistoryTurn[]): ConversationReply | null {
  const intent = detectConversationIntent(question, history);
  if (intent.kind !== "services_overview" && questionNamesPublishedPartner(question, history.map((h) => h.content).join("\n")).length) return null;
  if (intent.kind === "none" || intent.kind === "financing") return null;

  if (intent.kind === "services_overview") {
    const priorNeed = recentNeed("", history);
    const business = recentBusiness("", history);
    const preferred = priorNeed ? needFollowUp(priorNeed) : SERVICES_FOLLOW_UP;
    return {
      status: "answered",
      answer: SERVICES_ANSWER,
      citations: [],
      notices: [],
      followUpQuestion: nextFollowUp(history, preferred, business),
      nextAction: "none",
      reason: "services_overview",
    };
  }

  if (intent.kind === "need") {
    const follow = nextFollowUp(history, SERVICES_FOLLOW_UP, null);
    return {
      status: "answered",
      answer: answerForNeed(intent.need, null, intent.choice),
      citations: [],
      notices: [],
      followUpQuestion: follow,
      nextAction: "none",
      reason: intent.choice ? `need_${intent.need}_clarify` : `need_${intent.need}`,
    };
  }

  if (intent.kind === "business_context") {
    const { answer, followUp } = answerForBusiness(intent.business, intent.need, intent.choice);
    return {
      status: "answered",
      answer,
      citations: [],
      notices: [],
      followUpQuestion: nextFollowUp(history, followUp, intent.business),
      nextAction: "none",
      reason: `business_${intent.business}${intent.need ? `_${intent.need}` : ""}`,
    };
  }

  return null;
}

export const CONVERSATION_COPY = {
  servicesAnswer: SERVICES_ANSWER,
  servicesFollowUp: SERVICES_FOLLOW_UP,
};
