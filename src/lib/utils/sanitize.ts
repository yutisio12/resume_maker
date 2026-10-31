import DOMPurify from 'dompurify';
import type { ResumeDocument, RichTextContent } from '@/lib/models/types';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

const SAFE_PROTOCOL_RE = /^(?:https?:|mailto:|tel:)/i;

let safeLinkHookInstalled = false;

function installSafeLinkHook() {
  if (safeLinkHookInstalled) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    const element = node as Element;
    if (element.tagName !== 'A') return;

    const href = element.getAttribute('href');
    const safeHref = sanitizeUrl(href);
    if (!safeHref) {
      element.removeAttribute('href');
      element.removeAttribute('target');
      element.removeAttribute('rel');
      return;
    }

    element.setAttribute('href', safeHref);
    element.setAttribute('target', '_blank');
    element.setAttribute('rel', 'noopener noreferrer');
  });
  safeLinkHookInstalled = true;
}

export function sanitizeUrl(value: string | null | undefined): string {
  if (!value) return '';
  const raw = value.trim().replace(/[\u0000-\u001f\u007f]/g, '');
  if (!raw || !SAFE_PROTOCOL_RE.test(raw)) return '';

  if (/^https?:/i.test(raw)) {
    try {
      const url = new URL(raw);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
      return url.toString();
    } catch {
      return '';
    }
  }

  if (/^mailto:/i.test(raw)) {
    const address = raw.slice(7).trim();
    if (!address || /\s/.test(address)) return '';
    return `mailto:${address}`;
  }

  if (/^tel:/i.test(raw)) {
    const number = raw.slice(4).trim();
    if (!number || !/^[+0-9().\-\s]+$/.test(number)) return '';
    return `tel:${number}`;
  }

  return '';
}

export function sanitizeExternalUrl(value: string | null | undefined): string {
  if (!value) return '';
  const raw = value.trim().replace(/[\u0000-\u001f\u007f]/g, '');
  if (!raw) return '';

  if (SAFE_PROTOCOL_RE.test(raw)) return sanitizeUrl(raw);
  if (raw.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(raw) || /\s/.test(raw)) return '';

  return sanitizeUrl(`https://${raw}`);
}

export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') return '';
  installSafeLinkHook();

  return DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: SAFE_PROTOCOL_RE,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'img', 'svg', 'math'],
    FORBID_ATTR: ['style', 'srcset'],
  });
}

export function stripHtml(html: string): string {
  if (typeof window === 'undefined') return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = sanitizeHtml(html);
  return tmp.textContent || tmp.innerText || '';
}

export function sanitizeRichText(content: RichTextContent | null | undefined): RichTextContent {
  const html = sanitizeHtml(content?.html || '');
  const text = typeof content?.text === 'string' && content.text.length > 0
    ? content.text
    : stripHtml(html);

  return { html, text };
}

export function sanitizeResumeDocument(doc: ResumeDocument): ResumeDocument {
  return {
    ...doc,
    personalInfo: {
      ...doc.personalInfo,
      linkedin: sanitizeExternalUrl(doc.personalInfo.linkedin),
      github: sanitizeExternalUrl(doc.personalInfo.github),
      website: sanitizeExternalUrl(doc.personalInfo.website),
    },
    summary: sanitizeRichText(doc.summary),
    sections: (doc.sections || []).map((section) => ({
      ...section,
      items: (section.items || []).map((item) => ({
        ...item,
        description: item.description ? sanitizeRichText(item.description) : item.description,
        notes: item.notes ? sanitizeRichText(item.notes) : item.notes,
        url: item.url ? sanitizeExternalUrl(item.url) : item.url,
        credentialUrl: item.credentialUrl ? sanitizeExternalUrl(item.credentialUrl) : item.credentialUrl,
      })),
    })),
  };
}
