import type { ChatMessage } from "./prompt";
import { SELECTION_LIMITS, selectionFormat, validateSelectionMessages } from "./strict-grounding/selection";
import { INTENDED_RESPONSES_URL, readBoundedResponse, responsesRequestInit } from "./strict-grounding/http-transport";

/** Official Responses endpoint. Tests must inject a transport; this URL is not configurable. */
export const RESPONSES_API_URL = INTENDED_RESPONSES_URL;
export const DEFAULT_RESPONSES_MODEL = "gpt-6-luna";
/** Dedicated OpenAI project for this widget. Not a secret. */
export const OPENAI_WIDGET_PROJECT_ID = "proj_x5lsraSwfXTsmg43isUlNxs8";
export const OPENAI_PROJECT_HEADER = "OpenAI-Project";
/** This session has not proven Hunter's account can call this model. */
export const RESPONSES_MODEL_ACCESS_VERIFIED = false;

export const RESPONSES_LIMITS = {
  timeoutMs: 20_000,
  maxInputChars: 12_000,
  maxOutputTokens: 400,
  maxOutputChars: 1_600,
  maxConcurrent: 1,
  maxPerWindow: 12,
  windowMs: 10 * 60 * 1000,
  maxUsageOutputTokens: 400,
};

export class ResponsesUnavailableError extends Error {
  constructor(
    message: string,
    readonly kind:
      | "disabled"
      | "no_key"
      | "no_consent"
      | "timeout"
      | "http"
      | "empty"
      | "incomplete"
      | "invalid"
      | "usage"
      | "busy"
      | "network_blocked"
      | "not_preview"
      | "unsupported_transport",
  ) {
    super(message);
  }
}

export type ResponsesTransport = (payload: ResponsesRequest, opts: { signal: AbortSignal }) => Promise<ResponsesRaw>;

export type ResponsesRequest = {
  model: string;
  input: Array<{ role: "developer" | "user"; content: string }>;
  store: false;
  max_output_tokens: number;
  tools: [];
  tool_choice: "none";
  text: ReturnType<typeof selectionFormat>;
};

export type ResponsesRaw = {
  status?: string;
  incomplete_details?: { reason?: string } | null;
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
  usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
  error?: { message?: string };
};

export type ResponsesStatus = {
  enabled: boolean;
  available: boolean;
  previewOnly: true;
  productionActivation: false;
  processor: "openai-responses" | null;
  store: false;
  model: string | null;
  modelAccessVerified: false;
  transport: "none" | "injected" | "fixture" | "live" | "unsupported";
  reason: string | null;
};

let injectedTransport: ResponsesTransport | undefined;
let hostedActive = 0;
const hostedHits: number[] = [];
let fetchImpl: typeof fetch | undefined;

export function setResponsesTransportForTests(transport?: ResponsesTransport) {
  injectedTransport = transport;
}

export function setResponsesFetchForTests(fn?: typeof fetch) {
  fetchImpl = fn;
}

export function resetResponsesRuntime() {
  injectedTransport = undefined;
  fetchImpl = undefined;
  hostedActive = 0;
  hostedHits.length = 0;
}

export function responsesModel(): string {
  return DEFAULT_RESPONSES_MODEL;
}

function intendedModelConfigured(): boolean {
  const requested = process.env.KCG_WIDGET_RESPONSES_MODEL?.trim();
  return !requested || requested === DEFAULT_RESPONSES_MODEL;
}

function dedicatedKey(): string | null {
  const key = process.env.KCG_WIDGET_OPENAI_API_KEY?.trim() || "";
  if (!key) return null;
  return key;
}

function keyIsFixtureMarker(key: string): boolean {
  return key === "fixture-local-only" || key.startsWith("fixture-");
}

export function responsesEnableFlag(): boolean {
  return process.env.KCG_WIDGET_RESPONSES_ENABLE === "1";
}

export function isResponsesPreviewProcess(): boolean {
  return process.env.WIDGET_PREVIEW === "1" && process.env.WIDGET_RESPONSES_PREVIEW === "1";
}

function productionHostSignals(): boolean {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV || process.env.KCG_WIDGET_RESPONSES_PROD === "1");
}

export function transportMode(): ResponsesStatus["transport"] {
  if (injectedTransport) return "injected";
  const raw = (process.env.KCG_WIDGET_RESPONSES_TRANSPORT || "").trim();
  if (!raw) return "none";
  if (raw === "fixture") return "fixture";
  if (raw === "openai") return "live";
  return "unsupported";
}

export function responsesHostedAllowed(): boolean {
  if (process.env.WIDGET_FORCE_EXTRACTIVE === "1") return false;
  if (!isResponsesPreviewProcess()) return false;
  if (productionHostSignals()) return false;
  if (!responsesEnableFlag()) return false;
  if (!intendedModelConfigured()) return false;
  return true;
}

export function responsesWouldUseNetwork(): boolean {
  if (!responsesHostedAllowed()) return false;
  if (injectedTransport) return false;
  const mode = transportMode();
  if (mode === "fixture" || mode === "unsupported" || mode === "none") return false;
  const key = dedicatedKey();
  if (!key || keyIsFixtureMarker(key)) return false;
  return mode === "live";
}

export function responsesStatus(): ResponsesStatus {
  const enabled = responsesEnableFlag();
  const preview = isResponsesPreviewProcess();
  const mode = transportMode();
  const key = mode === "live" && responsesHostedAllowed() ? dedicatedKey() : null;
  const available =
    preview &&
    enabled &&
    process.env.WIDGET_FORCE_EXTRACTIVE !== "1" &&
    !productionHostSignals() &&
    intendedModelConfigured() &&
    mode !== "unsupported" &&
    (Boolean(injectedTransport) || mode === "fixture" || (mode === "live" && Boolean(key && !keyIsFixtureMarker(key))));
  let reason: string | null = null;
  if (!preview) reason = "Hosted answers are preview-process only.";
  else if (productionHostSignals()) reason = "Production activation is refused.";
  else if (!enabled) reason = "KCG_WIDGET_RESPONSES_ENABLE is not set.";
  else if (process.env.WIDGET_FORCE_EXTRACTIVE === "1") reason = "Extractive mode is forced.";
  else if (mode === "unsupported") reason = "Unsupported Responses transport is refused.";
  else if (!intendedModelConfigured()) reason = "Only the intended Luna model is allowed.";
  else if (!available) reason = "No dedicated key and no injected/fixture transport.";
  return {
    enabled,
    available,
    previewOnly: true,
    productionActivation: false,
    processor: available ? "openai-responses" : null,
    store: false,
    model: available ? responsesModel() : null,
    modelAccessVerified: false,
    transport: mode,
    reason,
  };
}

function admitHosted(now = Date.now()): { ok: true; release: () => void } | { ok: false } {
  const kept = hostedHits.filter((t) => now - t < RESPONSES_LIMITS.windowMs);
  hostedHits.length = 0;
  hostedHits.push(...kept);
  if (kept.length >= RESPONSES_LIMITS.maxPerWindow) return { ok: false };
  if (hostedActive >= RESPONSES_LIMITS.maxConcurrent) return { ok: false };
  hostedHits.push(now);
  hostedActive += 1;
  let released = false;
  return {
    ok: true,
    release: () => {
      if (!released) {
        released = true;
        hostedActive -= 1;
      }
    },
  };
}

export function logHostedCause(cause: string): void {
  const safe = String(cause || "unknown")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  console.info(`[kcg-widget] hosted_cause=${safe || "unknown"}`);
}

export function extractResponsesText(raw: ResponsesRaw | null | undefined): string {
  if (!raw || typeof raw !== "object") return "";
  if (typeof raw.output_text === "string" && raw.output_text.trim()) return raw.output_text.trim();
  const parts: string[] = [];
  for (const item of Array.isArray(raw.output) ? raw.output : []) {
    if (!item || item.type !== "message") continue;
    for (const block of Array.isArray(item.content) ? item.content : []) {
      if (block?.type === "output_text" && typeof block.text === "string" && block.text.trim()) parts.push(block.text.trim());
    }
  }
  return parts.join("\n").trim();
}

function hostedOutputState(raw: ResponsesRaw): { text: string; kind: "ok" | "empty" | "incomplete" } {
  const text = extractResponsesText(raw);
  if (raw.status === "incomplete" || raw.incomplete_details != null) return { text, kind: "incomplete" };
  if (!text) return { text, kind: "empty" };
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && !trimmed.endsWith("}")) return { text, kind: "incomplete" };
  if (trimmed.startsWith("{")) {
    try {
      JSON.parse(trimmed);
    } catch {
      return { text, kind: "incomplete" };
    }
  }
  return { text, kind: "ok" };
}

function inputChars(req: ResponsesRequest): number {
  return req.input.reduce((n, part) => n + part.content.length, 0);
}

function toResponsesInput(messages: ChatMessage[]): ResponsesRequest["input"] {
  const developer = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const user = messages
    .filter((m) => m.role !== "system")
    .map((m) => m.content)
    .join("\n\n");
  return [
    { role: "developer", content: developer },
    { role: "user", content: user },
  ];
}

async function liveResponsesCall(req: ResponsesRequest, key: string, signal: AbortSignal): Promise<ResponsesRaw> {
  if (keyIsFixtureMarker(key)) {
    throw new ResponsesUnavailableError("Fixture marker keys cannot call the network.", "network_blocked");
  }
  const run = fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await run(RESPONSES_API_URL, responsesRequestInit(req, key, OPENAI_WIDGET_PROJECT_ID, signal));
  } catch (err) {
    if (signal.aborted) throw new ResponsesUnavailableError("The hosted request timed out.", "timeout");
    throw new ResponsesUnavailableError("Hosted request failed.", "http");
  }
  if (!res.ok) {
    await res.body?.cancel().catch(() => undefined);
    throw new ResponsesUnavailableError(`Hosted provider returned HTTP ${res.status}.`, "http");
  }
  const data = (await readBoundedResponse(res).catch(() => null)) as ResponsesRaw | null;
  if (!data) throw new ResponsesUnavailableError("Hosted provider returned empty JSON.", "empty");
  return data;
}

export async function callResponsesApi(
  messages: ChatMessage[],
  opts: { signal?: AbortSignal; processorConsent: boolean; transport?: ResponsesTransport; allowedSourceIds?: readonly string[] },
): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
  if (!opts.processorConsent) {
    throw new ResponsesUnavailableError("OpenAI processor consent was not given.", "no_consent");
  }
  if (!responsesHostedAllowed()) {
    throw new ResponsesUnavailableError("Hosted answers are not active in this process.", "not_preview");
  }
  const transport = opts.transport ?? injectedTransport;
  const mode = transport ? "injected" : transportMode();
  const key = mode === "live" ? dedicatedKey() : null;
  if (mode === "unsupported") {
    throw new ResponsesUnavailableError("Unsupported Responses transport is refused.", "unsupported_transport");
  }
  if (!transport && mode !== "fixture" && !key) {
    throw new ResponsesUnavailableError("No dedicated KCG_WIDGET_OPENAI_API_KEY.", "no_key");
  }
  if (!transport && mode !== "fixture" && !responsesWouldUseNetwork()) {
    throw new ResponsesUnavailableError("Live Responses calls are not enabled.", "network_blocked");
  }

  const allowedIds = opts.allowedSourceIds ?? [];
  if (!validateSelectionMessages(messages, allowedIds)) {
    throw new ResponsesUnavailableError("Only a bounded public evidence selector request is allowed.", "invalid");
  }
  const req: ResponsesRequest = {
    model: responsesModel(),
    input: toResponsesInput(messages),
    store: false,
    max_output_tokens: RESPONSES_LIMITS.maxOutputTokens,
    tools: [],
    tool_choice: "none",
    text: selectionFormat(allowedIds),
  };
  if (inputChars(req) > RESPONSES_LIMITS.maxInputChars || Buffer.byteLength(JSON.stringify(req), "utf8") > SELECTION_LIMITS.requestBytes) {
    throw new ResponsesUnavailableError("The hosted prompt exceeded the input bound.", "invalid");
  }

  const admission = admitHosted();
  if (admission.ok === false) {
    throw new ResponsesUnavailableError("Hosted answers are at the local concurrency or rate bound.", "busy");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RESPONSES_LIMITS.timeoutMs);
  const onAbort = () => controller.abort();
  opts.signal?.addEventListener("abort", onAbort);
  if (opts.signal?.aborted) controller.abort();
  let onDeadline: () => void = () => {};
  try {
    const timeout = () => new ResponsesUnavailableError("The hosted request timed out.", "timeout");
    if (controller.signal.aborted) throw timeout();
    const deadline = new Promise<never>((_, reject) => {
      onDeadline = () => reject(timeout());
      controller.signal.addEventListener("abort", onDeadline, { once: true });
    });
    // A misbehaving transport must not keep the endpoint pending past the client deadline.
    const request = async (): Promise<ResponsesRaw> => {
      if (transport) return transport(req, { signal: controller.signal });
      if (mode === "fixture") {
        const { selectionFixture } = await import("./strict-grounding/fixture");
        return selectionFixture(req, { signal: controller.signal });
      }
      if (key && responsesWouldUseNetwork()) return liveResponsesCall(req, key, controller.signal);
      throw new ResponsesUnavailableError("No hosted transport is active.", "disabled");
    };
    const raw = await Promise.race([request(), deadline]);
    if (!raw || typeof raw !== "object") throw new ResponsesUnavailableError("The hosted provider returned no JSON.", "empty");
    if (Buffer.byteLength(JSON.stringify(raw), "utf8") > SELECTION_LIMITS.responseBytes) throw new ResponsesUnavailableError("The hosted response exceeded the byte bound.", "usage");
    if (raw.status && raw.status !== "completed") throw new ResponsesUnavailableError("The hosted response did not complete.", "incomplete");
    if (raw.output?.some((item) => item.type !== "message" || item.content?.some((block) => block.type !== "output_text"))) throw new ResponsesUnavailableError("Only selector text is accepted.", "invalid");
    if (raw.error?.message) {
      throw new ResponsesUnavailableError("The hosted provider returned an error.", "http");
    }
    const outputTokens = Number(raw.usage?.output_tokens ?? 0);
    const inputTokens = Number(raw.usage?.input_tokens ?? 0);
    if (!Number.isFinite(outputTokens) || outputTokens < 0 || !Number.isFinite(inputTokens) || inputTokens < 0 || outputTokens > RESPONSES_LIMITS.maxUsageOutputTokens) {
      throw new ResponsesUnavailableError("The hosted reply exceeded the usage bound.", "usage");
    }
    const output = hostedOutputState(raw);
    if (output.kind === "empty") throw new ResponsesUnavailableError("The hosted provider returned no text.", "empty");
    if (output.kind === "incomplete") {
      throw new ResponsesUnavailableError("The hosted provider returned an incomplete reply.", "incomplete");
    }
    const text = output.text;
    if (text.length > RESPONSES_LIMITS.maxOutputChars) {
      throw new ResponsesUnavailableError("The hosted reply exceeded the output bound.", "usage");
    }
    return { text, usage: { input_tokens: inputTokens, output_tokens: outputTokens } };
  } finally {
    clearTimeout(timer);
    controller.signal.removeEventListener("abort", onDeadline);
    opts.signal?.removeEventListener("abort", onAbort);
    admission.release();
  }
}
