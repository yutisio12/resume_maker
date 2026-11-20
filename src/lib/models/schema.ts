import { z } from 'zod';

// Import files are capped at 2 MB. These limits keep a single valid document
// from expanding into thousands of fields or items that freeze the UI.
export const MAX_ID_LENGTH = 128;
export const MAX_TEXT_LENGTH = 500;
export const MAX_LONG_TEXT_LENGTH = 5000;
export const MAX_HTML_LENGTH = 50000;
export const MAX_URL_LENGTH = 2048;
export const MAX_SECTIONS = 30;
export const MAX_ITEMS_PER_SECTION = 100;

const idSchema = z.string().min(1).max(MAX_ID_LENGTH);
const textSchema = z.string().max(MAX_TEXT_LENGTH);
const dateSchema = z.string().max(64);
const urlSchema = z.string().max(MAX_URL_LENGTH);

const richTextSchema = z.object({
  html: z.string().max(MAX_HTML_LENGTH).default(''),
  text: z.string().max(MAX_LONG_TEXT_LENGTH).default(''),
}).default({ html: '', text: '' });

const sectionItemSchema = z.object({
  id: idSchema,
  position: textSchema.optional(),
  company: textSchema.optional(),
  location: textSchema.optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  current: z.boolean().optional(),
  description: richTextSchema.optional(),
  school: textSchema.optional(),
  degree: textSchema.optional(),
  grade: textSchema.optional(),
  notes: richTextSchema.optional(),
  name: textSchema.optional(),
  url: urlSchema.optional(),
  period: dateSchema.optional(),
  issuer: textSchema.optional(),
  date: dateSchema.optional(),
  credentialUrl: urlSchema.optional(),
  level: textSchema.optional(),
});

const sectionSchema = z.object({
  id: idSchema,
  type: z.enum([
    'experience',
    'education',
    'projects',
    'certifications',
    'languages',
    'skills',
    'custom',
  ]),
  title: textSchema.default(''),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).max(1000).default(0),
  items: z.array(sectionItemSchema).max(MAX_ITEMS_PER_SECTION).default([]),
});

const personalInfoSchema = z.object({
  fullName: textSchema.default(''),
  headline: textSchema.default(''),
  location: textSchema.default(''),
  phone: dateSchema.default(''),
  email: dateSchema.default(''),
  linkedin: urlSchema.default(''),
  github: urlSchema.default(''),
  website: urlSchema.default(''),
  photoId: z.string().max(MAX_ID_LENGTH).nullable().optional().default(null),
  showPhoto: z.boolean().default(false),
});

const settingsSchema = z.object({
  template: z.string().default('ats-classic'),
  showPhoto: z.boolean().default(false),
  fontFamily: z.string().max(100).default('Arial'),
}).default({ template: 'ats-classic', showPhoto: false, fontFamily: 'Arial' });

export const resumeDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  id: idSchema,
  metadata: z.object({
    createdAt: dateSchema,
    updatedAt: dateSchema,
  }),
  personalInfo: personalInfoSchema,
  summary: richTextSchema,
  sections: z.array(sectionSchema).max(MAX_SECTIONS).default([]),
  settings: settingsSchema,
});

export type ParsedResumeDocument = z.infer<typeof resumeDocumentSchema>;

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
