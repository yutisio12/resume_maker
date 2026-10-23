import { v4 as uuidv4 } from 'uuid';
import { ResumeDocument } from '../models/types';

export const SCHEMA_VERSION = 1;

export const createEmptyRichText = (): { html: string; text: string } => ({
  html: '',
  text: '',
});

export const createDefaultResume = (): ResumeDocument => {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: uuidv4(),
    metadata: {
      createdAt: now,
      updatedAt: now,
    },
    personalInfo: {
      fullName: '',
      headline: '',
      location: '',
      phone: '',
      email: '',
      linkedin: '',
      github: '',
      website: '',
      photoId: null,
      showPhoto: false,
    },
    summary: createEmptyRichText(),
    sections: [
      {
        id: uuidv4(),
        type: 'experience',
        title: 'Pengalaman Kerja',
        visible: true,
        order: 0,
        items: [],
      },
      {
        id: uuidv4(),
        type: 'education',
        title: 'Pendidikan',
        visible: true,
        order: 1,
        items: [],
      },
      {
        id: uuidv4(),
        type: 'skills',
        title: 'Keahlian',
        visible: true,
        order: 2,
        items: [],
      },
      {
        id: uuidv4(),
        type: 'projects',
        title: 'Proyek',
        visible: true,
        order: 3,
        items: [],
      },
      {
        id: uuidv4(),
        type: 'certifications',
        title: 'Sertifikasi',
        visible: true,
        order: 4,
        items: [],
      },
      {
        id: uuidv4(),
        type: 'languages',
        title: 'Bahasa',
        visible: true,
        order: 5,
        items: [],
      },
    ],
    settings: {
      template: 'ats-classic',
      showPhoto: false,
    },
  };
};
