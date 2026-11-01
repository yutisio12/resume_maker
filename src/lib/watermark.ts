import { ResumeDocument } from '@/lib/models/types';

export const WATERMARK_BRAND = 'Create by github.com/yutisio12';

export function getWatermarkFingerprint(doc: Pick<ResumeDocument, 'id'>): string {
  const id = (doc.id || 'unknown').slice(0, 64);
  return `doc:${id}`;
}
