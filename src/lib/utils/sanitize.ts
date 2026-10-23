import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span'
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};

export const stripHtml = (html: string): string => {
  if (typeof window === 'undefined') return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = sanitizeHtml(html);
  return tmp.textContent || tmp.innerText || '';
};
