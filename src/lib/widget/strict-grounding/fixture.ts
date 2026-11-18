import type { ResponsesTransport } from "../responses";

/** Only schema enum IDs are echoed. No visitor text or legacy model sentences. */
export const selectionFixture: ResponsesTransport = async (request) => ({
  status: "completed",
  output_text: JSON.stringify({ sourceIds: request.text.format.schema.properties.sourceIds.items.enum.slice(0, 3) }),
  usage: { input_tokens: 100, output_tokens: 30, total_tokens: 130 },
});
