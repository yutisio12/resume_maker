import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface ResumeDB extends DBSchema {
  drafts: {
    key: string;
    value: unknown;
  };
  photos: {
    key: string;
    value: Blob;
  };
}

let dbPromise: Promise<IDBPDatabase<ResumeDB>> | null = null;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ResumeDB>('resume-maker-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts');
        }
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos');
        }
      },
    });
  }
  return dbPromise;
};

export const saveDraft = async (draft: unknown) => {
  const db = await getDB();
  await db.put('drafts', draft, 'current');
};

export const loadDraft = async () => {
  const db = await getDB();
  return db.get('drafts', 'current');
};

export const clearDraft = async () => {
  const db = await getDB();
  await db.delete('drafts', 'current');
};

export const savePhoto = async (id: string, blob: Blob) => {
  const db = await getDB();
  await db.put('photos', blob, id);
};

export const loadPhoto = async (id: string): Promise<Blob | undefined> => {
  const db = await getDB();
  return db.get('photos', id);
};

export const deletePhoto = async (id: string) => {
  const db = await getDB();
  await db.delete('photos', id);
};
