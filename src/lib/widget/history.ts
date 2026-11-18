import { findPrivateDetails } from './privacy';
import { LIMITS } from './limits';
import type { HistoryTurn } from './types';
export function sanitizeHistory(history: unknown): HistoryTurn[] {
  if (!Array.isArray(history)) return [];
  return history.filter(h => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string' && !findPrivateDetails(h.content).length)
    .slice(-LIMITS.historyTurns).map(h => ({ role: h.role, content: h.content.slice(0, LIMITS.historyChars) }));
}
