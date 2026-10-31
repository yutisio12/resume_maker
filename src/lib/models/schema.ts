import { z } from 'zod';

const richTextSchema = z.object({
  html: z.string().default(''),
  text: z.string().default(''),
}).default({ html: '', text: '' });

const sectionItemSchema = z.object({
  id: z.string().min(1),
  position: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: richTextSchema.optional(),
  school: z.string().optional(),
  degree: z.string().optional(),
  grade: z.string().optional(),
  notes: richTextSchema.optional(),
  name: z.string().optional(),
  url: z.string().optional(),
  period: z.string().optional(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  credentialUrl: z.string().optional(),
  level: z.string().optional(),
});

const sectionSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    'experience',
    'education',
    'projects',
    'certifications',
    'languages',
    'skills',
    'custom',
  ]),
  title: z.string().default(''),
  visible: z.boolean().default(true),
  order: z.number().default(0),
  items: z.array(sectionItemSchema).default([]),
});

const personalInfoSchema = z.object({
  fullName: z.string().default(''),
  headline: z.string().default(''),
  location: z.string().default(''),
  phone: z.string().default(''),
  email: z.string().default(''),
  linkedin: z.string().default(''),
  github: z.string().default(''),
  website: z.string().default(''),
  photoId: z.string().nullable().optional().default(null),
  showPhoto: z.boolean().default(false),
});

const settingsSchema = z.object({
  template: z.string().default('ats-classic'),
  showPhoto: z.boolean().default(false),
  fontFamily: z.string().default('Arial'),
}).default({ template: 'ats-classic', showPhoto: false, fontFamily: 'Arial' });

export const resumeDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  metadata: z.object({
    createdAt: z.string(),
    updatedAt: z.string(),
  }),
  personalInfo: personalInfoSchema,
  summary: richTextSchema,
  sections: z.array(sectionSchema).default([]),
  settings: settingsSchema,
});

export type ParsedResumeDocument = z.infer<typeof resumeDocumentSchema>;

export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
