import { findPrivateDetails } from '../../../src/lib/widget/privacy';
import { sanitizeHistory } from '../../../src/lib/widget/history';
import type { HistoryTurn } from '../../../src/lib/widget/types';

export function redact(text: string) {
  return text.replace(/\b(?:my name is|my name's|i am called|call me)\s+[^,.!?;\n]+/gi, '[name removed]')
    .replace(/\b(?:my|our) (?:company|business)(?: name)? is\s+[^,.!?;\n]+/gi, '[company removed]')
    .replace(/https?:\/\/\S+|www\.\S+/gi, '[link removed]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+/gi, '[email removed]')
    .replace(/(?:\+?\d[\d ().-]{5,}\d)/g, '[number removed]');
}
/** Drop sensitive turns before clipping. Assistant history is not needed by the selector.
 * Only bounded user intent is eligible; no form state or transcript is stored. */
export function hostedVisitor(question: string, history: HistoryTurn[]) {
  const eligible = (s: string) => !findPrivateDetails(s).length && !/\b(?:password|secret|api.?key|ssn|social security|account number|routing number)\b/i.test(s);
  return { question: eligible(question) ? redact(question).slice(0, 1000) : '[private message omitted]',
    history: sanitizeHistory(history).filter(h => h.role === 'user' && eligible(h.content)).slice(-4)
      .map(h => ({ role: 'user', content: redact(h.content).slice(0, 400) })) };
}
