export type SourceKind = "page-section" | "summary";

export type WidgetSource = {
  id: string;
  route: string;
  href: string;
  pageTitle: string;
  section: string;
  text: string;
  kind: SourceKind;
  topics: string[];
};

export type HomepagePartners = {
  names: string[];
  sourceId: string;
  href: string;
};

export type WidgetIndex = {
  contentVersion: string;
  builtAt: string;
  publicRoutes: string[];
  sources: WidgetSource[];
  homepagePartners: HomepagePartners;
};

export type Evidence = {
  id: string;
  label: string;
  route: string;
  text: string;
  kind: SourceKind;
  topics: string[];
};

export type Citation = { id: string; label: string; href: string };

export type ChatStatus =
  | "answered"
  | "partial"
  | "clarify"
  | "abstained"
  | "unavailable"
  | "invalid_output"
  | "error";

export type HistoryTurn = { role: "user" | "assistant"; content: string };

export type ChatResult = {
  status: ChatStatus;
  answer: string;
  citations: Citation[];
  notices: string[];
  followUpQuestion: string | null;
  nextAction: "none" | "start_checklist" | "contact_team";
  mode: "llama3-loopback" | "extractive" | "openai-responses";
  contentVersion: string;
  reason?: string;
};

export type ChecklistAnswers = {
  shop: "restaurant" | "retail" | "trade" | "professional" | "other";
  leak: "processing" | "website" | "missed-calls" | "ai-ops" | "not-sure";
  volume?: "under-20k" | "20-100k" | "over-100k" | "not-sure";
  google?: "yes" | "weak" | "no" | "not-sure";
  intake?: "owner" | "staff" | "nobody" | "mixed";
  notes?: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  label: string;
};

export type ChecklistResult = {
  title: string;
  summary: string;
  items: ChecklistItem[];
  citations: Citation[];
  contentVersion: string;
};

export type ContactLead = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export type LeadBriefPayload = {
  confirmed: { business: string; need: string; details: string[] };
  unanswered: string[];
};

export type LeadSubmitInput = ContactLead & {
  submissionId?: string;
  consent: boolean;
  reviewed: boolean;
  checklistTitle?: string;
  brief?: LeadBriefPayload;
};

export type LeadSubmitResult =
  | {
      ok: true;
      reference: string;
      sink: "local-file";
      message: string;
    }
  | {
      ok: false;
      reason: "not_localhost" | "no_consent" | "not_reviewed" | "invalid" | "conflict" | "adapter_error";
      message: string;
    };
