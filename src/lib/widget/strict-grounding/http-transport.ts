import { SELECTION_LIMITS } from "./selection";

export const INTENDED_RESPONSES_URL = "https://api.openai.com/v1/responses";

/** Fixed destination; redirects never transfer authorization to another host. */
export function responsesRequestInit(payload: unknown, key: string, project: string, signal: AbortSignal): RequestInit {
  return { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json", "OpenAI-Project": project },
    body: JSON.stringify(payload), signal, cache: "no-store", redirect: "error", credentials: "omit" };
}

/** Bound decoded bytes while streaming; no response/error bodies are logged. */
export async function readBoundedResponse(response: Response): Promise<unknown> {
  if (!response.body) throw new Error("Missing response body");
  const reader = response.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > SELECTION_LIMITS.responseBytes) throw new Error("Response byte bound exceeded");
      chunks.push(value);
    }
    const buffer = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(buffer));
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
