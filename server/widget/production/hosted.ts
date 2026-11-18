import { selectionMessages, selectionFormat, SELECTION_LIMITS } from '../../../src/lib/widget/strict-grounding/selection';
import { INTENDED_RESPONSES_URL, readBoundedResponse, responsesRequestInit } from '../../../src/lib/widget/strict-grounding/http-transport';
import type { GroundedTurn } from '../../../src/lib/widget/strict-grounding/turn';
import type { HistoryTurn } from '../../../src/lib/widget/types';
import { RESERVED_INPUT_TOKENS, MAX_OUTPUT_TOKENS, type ProductionConfig } from './config';
import { SharedStore } from './store';
import { hostedVisitor } from './visitor';
import { deadline } from './deadline';

export async function selectHosted(config: ProductionConfig, store: SharedStore, run: typeof fetch, ip: string, turn: GroundedTurn, question: string, history: HistoryTurn[]) {
  if (!config.hosted) throw Error('Hosted unavailable');
  const messages = selectionMessages(turn);
  const payload = { model: 'gpt-6-luna', store: false, tools: [], tool_choice: 'none', max_output_tokens: MAX_OUTPUT_TOKENS,
    input: [{role: 'developer', content: messages[0].content}, {role: 'user', content: JSON.stringify({
      ...JSON.parse(messages[1].content), visitor: hostedVisitor(question, history) })}], text: selectionFormat(turn.evidence.map(e => e.id)) };
  if (Buffer.byteLength(JSON.stringify(payload)) > SELECTION_LIMITS.requestBytes) throw Error('Input exceeded');
  if (await store.admit(ip, 'hosted') !== 'claimed') throw Error('Hosted limited');
  return deadline(20000, async signal => {
    const response = await run(INTENDED_RESPONSES_URL, responsesRequestInit(payload, config.key, 'proj_x5lsraSwfXTsmg43isUlNxs8', signal));
    if (!response.ok) { await response.body?.cancel(); throw Error('Hosted unavailable'); }
    const raw = await readBoundedResponse(response) as any;
    if (raw?.status !== 'completed' || raw.error || raw.incomplete_details || !Number.isInteger(raw.usage?.input_tokens) || raw.usage.input_tokens < 0 || raw.usage.input_tokens > RESERVED_INPUT_TOKENS || !Number.isInteger(raw.usage?.output_tokens) || raw.usage.output_tokens < 0 || raw.usage.output_tokens > MAX_OUTPUT_TOKENS) throw Error('Invalid response');
    // Reasoning metadata is discarded. Tools, refusals and extra message blocks fail closed.
    if (!Array.isArray(raw.output) || raw.output.length > 4 || raw.output.some((item: any) => !['reasoning','message'].includes(item?.type))) throw Error('Invalid output');
    const messages = raw.output.filter((item: any) => item.type === 'message');
    if (messages.length !== 1 || messages[0].role !== 'assistant' || messages[0].content?.length !== 1 || messages[0].content[0]?.type !== 'output_text' || typeof messages[0].content[0]?.text !== 'string') throw Error('Invalid output');
    return messages[0].content[0].text as string;
  });
}
