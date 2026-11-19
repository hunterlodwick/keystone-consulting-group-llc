import { detectConversationIntent, isFinancingQuestion, isPosIntent, isServicesOverviewQuestion, recentBusiness } from "../conversation";
import type { HistoryTurn } from "../types";
import { availablePassages, type ApprovedId, type ApprovedPassage } from "./catalog";

import { retrievePublic, isExcludedRouteQuestion } from "./retrieval";

export type Topic = "overview" | "payments" | "websites" | "ai" | "partners" | "financing" | "privacy" | "public" | "none";
export type Focus = "general" | "pos" | "restaurant" | "retail" | "trade" | "search" | "enquiry";
export type GroundedTurn = { topic: Topic; focus: Focus; evidence: ApprovedPassage[]; followUp: string | null };

const FOLLOWUPS = {
  business: "What kind of business do you run?",
  need: "Which area should we focus on: payments, websites, or AI?",
  payments: "Which part of checkout needs attention: card fees, the counter, or table service?",
  websites: "Is the bigger gap getting found online, or turning visitors into bookings?",
  ai: "Which repeat job needs attention: customer questions, follow-ups, or scheduling?",
} as const;

/** History supplies bounded intent hints only, never business evidence or response copy. */
export function planGroundedTurn(question: string, history: HistoryTurn[]): GroundedTurn {
  const q = question.toLowerCase();
  const partnerFollowup = /\b(?:switch|keep|replace|compatible|compatibility|integrate)\b/.test(q) &&
    [...history].reverse().find(h => h.role === 'user' && /\b(?:square|clover|partners?|payments?|website|ai)\b/i.test(h.content))?.content.match(/\b(?:square|clover|partners?)\b/i);
  const approved = availablePassages();
  if (isExcludedRouteQuestion(question)) return {topic:"none",focus:"general",evidence:[],followUp:null};
  const broad = retrievePublic(question, approved);
  if (broad) return {...broad, focus:"general", followUp:null};
  const intent = detectConversationIntent(question, history);
  const business = recentBusiness(question, history);
  let topic: Topic = "none";
  let focus: Focus = "general";
  let ids: ApprovedId[] = [];
  let follow: string | null = null;
  if (isServicesOverviewQuestion(question)) topic = "overview";
  else if (/\bprivacy|what (?:do you|data do you) collect\b/.test(q)) topic = "privacy";
  else if (isFinancingQuestion(question)) topic = "financing";
  else if (partnerFollowup || /\b(?:square|clover|partners?|integrat(?:e|ion))\b/.test(q)) topic = "partners";
  else if (/\b(?:pos|payments?|fees?|checkout|statement|split checks?|table service)\b/.test(q)) topic = "payments";
  else if (/\b(?:website|websites|web design|found online|google|seo|enquir(?:y|ies)|more leads|visitors into bookings)\b/.test(q)) topic = "websites";
  else if (/\b(?:ai|virtual assistants?|admin|automation|missed calls?|follow-ups|scheduling)\b/.test(q)) topic = "ai";
  else if (intent.kind === "need" || intent.kind === "business_context") {
    topic = intent.need === "payments" ? "payments" : intent.need === "leads" ? "websites" : intent.need === "admin" ? "ai" : "none";
    if (topic === "none") follow = FOLLOWUPS.need;
  }
  // Ambiguous acknowledgments do not revive an earlier unrelated topic.
  if (/^(?:yes|no|that|okay|ok|sure)[.!?]*$/.test(q)) topic = "none";

  if (topic === "overview") ids = ["services.overview", "websites.overview", "ai.overview"];
  if (topic === "payments") {
    focus = isPosIntent(question) ? "pos" : business === "restaurant" || business === "retail" || business === "trade" ? business : "general";
    ids = focus === "pos" ? ["payments.placement", "payments.workflow"] : focus === "restaurant" ? ["payments.restaurant", "payments.workflow"] : focus === "retail" ? ["payments.retail", "payments.workflow"] : focus === "trade" ? ["payments.trade", "payments.workflow"] : ["payments.workflow"];
  }
  if (topic === "websites") {
    focus = /found online|google|search|seo/.test(q) ? "search" : /booking|enquir|visitor/.test(q) ? "enquiry" : "general";
    ids = focus === "search" ? ["websites.search"] : focus === "enquiry" ? ["websites.enquiry", "websites.overview"] : ["websites.overview"];
  }
  if (topic === "ai") ids = ["ai.overview"];
  if (topic === "partners") ids = ["public.home.689.0"];
  if (topic === "financing") ids = ["financing.scope"];
  if (topic === "privacy") ids = ["privacy.collection"];

  if (topic === "overview") follow = business ? FOLLOWUPS.need : FOLLOWUPS.business;
  if (topic === "payments") follow = focus === "pos" || focus === "general" ? FOLLOWUPS.payments : null;
  if (topic === "websites") follow = focus === "general" ? FOLLOWUPS.websites : null;
  if (topic === "ai" && !/missed calls?|follow-ups|schedul|customer questions/.test(q)) follow = FOLLOWUPS.ai;
  if (follow === FOLLOWUPS.business && history.some((h) => h.role === "assistant")) follow = null;
  if (follow && history.some((h) => h.role === "assistant" && h.content.includes(follow!))) follow = null;
  if (follow && history.some((h) => h.role === "user" && h.content.trim().toLowerCase() === q)) follow = null;
  return { topic, focus, evidence: ids.map((id) => approved.find((e) => e.id === id)).filter((e): e is ApprovedPassage => !!e), followUp: follow };
}
