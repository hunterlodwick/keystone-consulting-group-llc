import artifact from '../../../../server/generated/approved-evidence.json';
import { APPROVED_ARTIFACT_HASH } from '../../../../server/generated/approved-evidence-pin';
import { validateArtifact } from '../../../../server/widget/artifact';
import type { Citation, WidgetIndex } from '../types';
export type ApprovedPassage = { id: string; sourceId: string; route: string; href: string; label: string; passage: string; title?: string; heading?: string; parentHeading?: string };
export type ApprovedId = string;
export const CATALOG_VERSION = 'kcg-approved-release-v1';
export const APPROVED_PASSAGES: readonly ApprovedPassage[] = Object.freeze(validateArtifact(artifact, APPROVED_ARTIFACT_HASH).map(e => Object.freeze(e)));
export function availablePassages(_index?: WidgetIndex): ApprovedPassage[] { return [...APPROVED_PASSAGES]; }
export function passageCitation(entry: ApprovedPassage): Citation { return { id: entry.sourceId, label: entry.label, href: entry.href }; }
