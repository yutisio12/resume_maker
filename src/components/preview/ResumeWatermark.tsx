'use client';

import { WATERMARK_BRAND, getWatermarkFingerprint } from '@/lib/watermark';
import { ResumeDocument } from '@/lib/models/types';

const WATERMARK_CELLS = Array.from({ length: 18 });

export function ResumeWatermark() {
  return (
    <div className='resume-watermark' aria-hidden='true'>
      {WATERMARK_CELLS.map((_, index) => (
        <span key={index}>{WATERMARK_BRAND}</span>
      ))}
    </div>
  );
}

export function PrintWatermark({ document }: { document: ResumeDocument }) {
  return (
    <div className='print-watermark' aria-hidden='true'>
      {getWatermarkFingerprint(document)}
    </div>
  );
}
