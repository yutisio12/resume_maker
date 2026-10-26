export type TemplateType = 'ats-classic' | 'minimal';

export interface RichTextContent {
  html: string;
  text: string;
}

export interface PersonalInfo {
  fullName: string;
  headline: string;
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  website: string;
  photoId?: string | null;
  showPhoto: boolean;
}

export interface ExperienceItem {
  id: string;
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: RichTextContent;
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  notes?: RichTextContent;
}

export interface ProjectItem {
  id: string;
  name: string;
  link?: string;
  period?: string;
  description: RichTextContent;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  credentialUrl?: string;
  description?: RichTextContent;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export type SectionType =
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'languages'
  | 'skills'
  | 'custom';

export interface SectionItem {
  id: string;
  position?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: RichTextContent;
  school?: string;
  degree?: string;
  name?: string;
  url?: string;
  issuer?: string;
  date?: string;
  level?: string;
}

export interface ResumeSection {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  order: number;
  items: SectionItem[];
}

export interface ResumeSettings {
  template: TemplateType;
  showPhoto: boolean;
  fontFamily?: string;
}

export interface ResumeDocument {
  schemaVersion: number;
  id: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
  personalInfo: PersonalInfo;
  summary: RichTextContent;
  sections: ResumeSection[];
  settings: ResumeSettings;
}
