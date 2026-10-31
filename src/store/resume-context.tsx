'use client';

import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { ResumeDocument } from '@/lib/models/types';
import { createDefaultResume } from '@/lib/constants/defaults';
import { loadDraft, saveDraft } from '@/lib/storage/db';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type Action =
  | { type: 'SET_DOCUMENT'; payload: ResumeDocument }
  | { type: 'UPDATE_PERSONAL'; payload: Partial<ResumeDocument['personalInfo']> }
  | { type: 'UPDATE_SUMMARY'; payload: ResumeDocument['summary'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<ResumeDocument['settings']> }
  | { type: 'ADD_SECTION'; payload: ResumeDocument['sections'][0] }
  | { type: 'REMOVE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: ResumeDocument['sections'] }
  | { type: 'UPDATE_SECTION'; payload: { id: string; data: Partial<ResumeDocument['sections'][0]> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVE_STATUS'; payload: { status: SaveStatus; error?: string | null } }
  | { type: 'RESET'; payload: ResumeDocument };

interface ResumeState {
  document: ResumeDocument;
  isLoading: boolean;
  saveStatus: SaveStatus;
  saveError: string | null;
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
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload.status, saveError: action.payload.error ?? null };
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
    saveStatus: 'idle',
    saveError: null,
  });
  const loadedRef = useRef(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const saved = await loadDraft();
        if (!cancelled && saved) {
          dispatch({ type: 'SET_DOCUMENT', payload: saved as ResumeDocument });
        }
      } catch {
        if (!cancelled) {
          dispatch({
            type: 'SET_SAVE_STATUS',
            payload: {
              status: 'error',
              error: 'Draft tidak dapat dimuat dari perangkat ini.',
            },
          });
        }
      } finally {
        if (!cancelled) {
          loadedRef.current = true;
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loadedRef.current || state.isLoading) return;

    dirtyRef.current = true;
    let cancelled = false;
    dispatch({ type: 'SET_SAVE_STATUS', payload: { status: 'saving', error: null } });

    const timer = setTimeout(async () => {
      try {
        await saveDraft(state.document);
        if (!cancelled) {
          dirtyRef.current = false;
          dispatch({ type: 'SET_SAVE_STATUS', payload: { status: 'saved', error: null } });
        }
      } catch {
        if (!cancelled) {
          dispatch({
            type: 'SET_SAVE_STATUS',
            payload: {
              status: 'error',
              error: 'Gagal menyimpan ke perangkat ini. Periksa ruang penyimpanan browser.',
            },
          });
        }
      }
    }, 800);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [state.document, state.isLoading]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

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
