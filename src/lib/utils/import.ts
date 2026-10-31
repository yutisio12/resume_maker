import type { ResumeDocument } from '@/lib/models/types';
import { MAX_IMPORT_BYTES, resumeDocumentSchema } from '@/lib/models/schema';
import { RESUME_FONTS, DEFAULT_FONT_FAMILY } from '@/lib/constants/fonts';
import { sanitizeResumeDocument } from '@/lib/utils/sanitize';

export type ImportResult =
  | { ok: true; document: ResumeDocument }
  | { ok: false; error: string };

function errorMessage(error: string): ImportResult {
  return { ok: false, error };
}

export function parseResumeJson(text: string): ImportResult {
  if (new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) {
    return errorMessage('File terlalu besar. Maksimal 2 MB.');
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return errorMessage('File bukan JSON yang valid.');
  }

  const parsed = resumeDocumentSchema.safeParse(raw);
  if (!parsed.success) {
    return errorMessage('Struktur file tidak sesuai format Resume Maker.');
  }

  const data = parsed.data;
  const template = data.settings.template === 'minimal' ? 'minimal' : 'ats-classic';
  const fontFamily = RESUME_FONTS.includes(data.settings.fontFamily as typeof RESUME_FONTS[number])
    ? data.settings.fontFamily
    : DEFAULT_FONT_FAMILY;

  const document: ResumeDocument = {
    ...data,
    personalInfo: {
      ...data.personalInfo,
      photoId: null,
      showPhoto: false,
    },
    sections: data.sections.map((section) => ({
      ...section,
      items: section.items || [],
    })),
    settings: {
      ...data.settings,
      template,
      showPhoto: false,
      fontFamily,
    },
  };

  return { ok: true, document: sanitizeResumeDocument(document) };
}

export async function parseResumeFile(file: File): Promise<ImportResult> {
  if (file.size > MAX_IMPORT_BYTES) {
    return errorMessage('File terlalu besar. Maksimal 2 MB.');
  }

  try {
    return parseResumeJson(await file.text());
  } catch {
    return errorMessage('File tidak dapat dibaca.');
  }
}
