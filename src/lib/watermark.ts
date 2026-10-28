import { ResumeDocument } from '@/lib/models/types';

export const WATERMARK_BRAND = 'Create by github.com/yutisio12';

export function getWatermarkFingerprint(doc: Pick<ResumeDocument, 'id' | 'metadata'>): string {
  const id = (doc.id || 'unknown').slice(0, 64);
  const createdAt = (doc.metadata?.createdAt || '').slice(0, 32);
  return `${WATERMARK_BRAND} | doc:${id} | ${createdAt}`;
}
