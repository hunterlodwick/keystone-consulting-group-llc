export type WidgetDisclosureSurface = "unknown" | "hosted" | "local";

/** Exact visitor-data claim for hosted opt-in. Keep this phrase stable for tests. */
export const HOSTED_MESSAGE_SCOPE = "this message and recent chat messages";

export const DISCLOSURE = {
  loadingMode: "Checking how answers are processed.",
  hostedOffered: "Hosted answers are offered after OpenAI processor opt-in.",
  hostedOfferedModel: (model: string) =>
    `Hosted ${model} is offered after OpenAI processor opt-in. Access is unverified.`,
  hostedIfOptIn: `If you opt in, ${HOSTED_MESSAGE_SCOPE} are sent to OpenAI.`,
  hostedOptedIn: `${HOSTED_MESSAGE_SCOPE.charAt(0).toUpperCase()}${HOSTED_MESSAGE_SCOPE.slice(1)} will be sent to OpenAI.`,
  localNoThirdParty: "Messages are processed by this site. No AI provider is used; chat is not saved by this widget.",
  localLlama: (model: string) => `Local ${model} on this computer`,
  extractive: "Extractive answers from this site. No live model in use.",
  hostedAnswer: "Approved passages selected with OpenAI. Contact form fields were not sent.",
  /** Compact checkbox label. Longer scope lives under Details. */
  processorConsent: "Allow OpenAI to answer using this message and recent chat.",
  processorDetailsSummary: "Details",
  processorBody: `OpenAI is a separate processor. If you opt in, ${HOSTED_MESSAGE_SCOPE}, plus public page excerpts, leave this computer so OpenAI can select approved passages. Eligible user messages are bounded and redacted; keep private details out of chat. You can keep using site answers without this.`,
  aiOn: "OpenAI on",
  turnOff: "Turn off",
  checklistStored:
    "This follow-up stores the checklist title, summary, and steps. It does not attach the chat. If you already opted in, those chat messages may already have been sent to OpenAI.",
} as const;

/** Phrases that promise a local-only chat transcript. Forbidden on the hosted panel, including while status is loading. */
export const LOCAL_ONLY_TRANSCRIPT_PROMISE =
  /no transcript is sent to a third party|transcript stays on this (?:device|computer)|local-only transcript|stays on this device/i;

/**
 * Footer transcript line. Hosted ready state leaves this empty so the compact
 * opt-in / AI-on control owns the disclosure (no duplicate footer copy).
 */
export function transcriptNotice(surface: WidgetDisclosureSurface, optedIn: boolean): string {
  if (surface === "local") return DISCLOSURE.localNoThirdParty;
  if (surface === "hosted") return "";
  void optedIn;
  return "Messages are sent to this site to find approved public information.";
}

export function modeLabelForStatus(d: {
  hosted?: { available?: boolean; model?: string | null } | null;
  mode?: string;
  model?: string | null;
}): string {
  if (d.hosted?.available) {
    // Technical preview model names stay out of the visitor footer.
    return "";
  }
  if (d.mode === "llama3-loopback" && d.model) return DISCLOSURE.localLlama(d.model);
  if (d.mode === "llama3-loopback") return "Local llama3 on this computer";
  return DISCLOSURE.extractive;
}

export function hostedPanelForbidsLocalOnlyPromise(surface: WidgetDisclosureSurface): boolean {
  return surface !== "local";
}
