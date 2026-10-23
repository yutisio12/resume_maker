'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { ResumeDocument } from '@/lib/models/types';
import { createDefaultResume } from '@/lib/constants/defaults';
import { loadDraft, saveDraft } from '@/lib/storage/db';

type Action =
  | { type: 'SET_DOCUMENT'; payload: ResumeDocument }
  | { type: 'UPDATE_PERSONAL'; payload: Partial<ResumeDocument['personalInfo']> }
  | { type: 'UPDATE_SUMMARY'; payload: ResumeDocument['summary'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ResumeDocument['settings']> }
  | { type: 'ADD_SECTION'; payload: ResumeDocument['sections'][0] }
  | { type: 'REMOVE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: ResumeDocument['sections'] }
  | { type: 'UPDATE_SECTION'; payload: { id: string; data: Partial<ResumeDocument['sections'][0]> } }
  | { type: 'RESET'; payload: ResumeDocument };

interface ResumeState {
  document: ResumeDocument;
  isLoading: boolean;
}

const ResumeContext = createContext<{
  state: ResumeState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function reducer(state: ResumeState, action: Action): ResumeState {
  switch (action.type) {
    case 'SET_DOCUMENT':
      return { ...state, document: { ...action.payload, metadata: { ...action.payload.metadata, updatedAt: new Date().toISOString() } } };
    case 'UPDATE_PERSONAL':
      return { ...state, document: { ...state.document, personalInfo: { ...state.document.personalInfo, ...action.payload }, metadata: { ...state.document.metadata, updatedAt: new Date().toISOString() } } };
    case 'UPDATE_SUMMARY':
      return { ...state, document: { ...state.document, summary: action.payload, metadata: { ...state.document.metadata, updatedAt: new Date().toISOString() } } };
    case 'UPDATE_SETTINGS':
      return { ...state, document: { ...state.document, settings: { ...state.document.settings, ...action.payload }, metadata: { ...state.document.metadata, updatedAt: new Date().toISOString() } } };
    case 'ADD_SECTION':
      return { ...state, document: { ...state.document, sections: [...state.document.sections, action.payload], metadata: { ...state.document.metadata, updatedAt: new Date().toISOString() } } };
    case 'REMOVE_SECTION':
      return { ...state, document: { ...state.document, sections: state.document.sections.filter(s => s.id !== action.payload), metadata: { ...state.document.metadata, updatedAt: new Date().toISOString() } } };
    case 'REORDER_SECTIONS':
      return { ...state, document: { ...state.document, sections: action.payload, metadata: { ...state.document.metadata, updatedAt: new Date().toISOString() } } };
    case 'UPDATE_SECTION':
      return { ...state, document: { ...state.document, sections: state.document.sections.map(s => s.id === action.payload.id ? { ...s, ...action.payload.data } : s), metadata: { ...state.document.metadata, updatedAt: new Date().toISOString() } } };
    case 'RESET':
      return { ...state, document: action.payload };
    default:
      return state;
  }
}

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    document: createDefaultResume(),
    isLoading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const saved = await loadDraft();
        if (saved) {
          dispatch({ type: 'SET_DOCUMENT', payload: saved as ResumeDocument });
        }
      } catch {
        // ignore
      } finally {
        // keep loading false after attempt
      }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      saveDraft(state.document).catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [state.document]);

  return (
    <ResumeContext.Provider value={{ state, dispatch }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
}
