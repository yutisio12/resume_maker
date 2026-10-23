'use client';

import { useResume } from '@/store/resume-context';
import { createDefaultResume } from '@/lib/constants/defaults';

export default function Home() {
  const { state, dispatch } = useResume();
  const doc = state.document;

  const reset = () => {
    if (confirm('Mulai resume baru? Data saat ini akan diganti.')) {
      dispatch({ type: 'RESET', payload: createDefaultResume() });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="app-header border-b bg-white" data-app-ui="true">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Resume Maker</h1>
          <div className="flex gap-2">
            <button onClick={reset} className="px-3 py-1 text-sm border rounded">Reset</button>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-4">
        <div className="text-sm text-gray-600 mb-4">Template: {doc.settings.template} | Sections: {doc.sections.filter(s=>s.visible).length}</div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="form-panel bg-white border rounded p-4" data-app-ui="true">
            <h2 className="font-medium mb-2">Form</h2>
            <p className="text-sm text-gray-500">Form sections akan ditambahkan bertahap.</p>
          </section>
          <section className="preview-panel">
            <div id="resume-preview" className="bg-white shadow mx-auto" style={{ width: '210mm', minHeight: '297mm' }}>
              <div className="p-8">
                <h1 className="text-2xl font-bold">{doc.personalInfo.fullName || 'Nama Lengkap'}</h1>
                <p className="text-gray-600">{doc.personalInfo.headline || 'Headline'}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
