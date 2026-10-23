'use client';

import { useResume } from '@/store/resume-context';
import TiptapWrapper from '@/components/editor/TiptapWrapper';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import HeaderActions from '@/components/shared/HeaderActions';
import ExportPdfButton from '@/components/shared/ExportPdfButton';

export default function AppShell() {
  const { state, dispatch } = useResume();
  const doc = state.document;

  const updatePersonal = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_PERSONAL', payload: { [field]: value } });
  };

  const updateSummary = (html: string, text: string) => {
    dispatch({ type: 'UPDATE_SUMMARY', payload: { html, text } });
  };

  return (
    <main className='min-h-screen bg-gray-50'>
      <header className='app-header border-b bg-white sticky top-0 z-10' data-app-ui='true'>
        <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
          <h1 className='text-lg font-semibold'>Resume Maker</h1>
          <div className='flex items-center gap-2'>
            <ExportPdfButton />
            <HeaderActions />
          </div>
        </div>
      </header>
      <div className='max-w-7xl mx-auto p-4'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <section className='form-panel space-y-4' data-app-ui='true'>
            <Card>
              <CardHeader><CardTitle>Informasi Pribadi</CardTitle></CardHeader>
              <CardContent className='space-y-3'>
                <div><Label>Nama Lengkap</Label><Input value={doc.personalInfo.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} /></div>
                <div><Label>Headline/Jabatan</Label><Input value={doc.personalInfo.headline} onChange={(e) => updatePersonal('headline', e.target.value)} /></div>
                <div className='grid grid-cols-2 gap-2'>
                  <div><Label>Email</Label><Input value={doc.personalInfo.email} onChange={(e) => updatePersonal('email', e.target.value)} /></div>
                  <div><Label>Telepon</Label><Input value={doc.personalInfo.phone} onChange={(e) => updatePersonal('phone', e.target.value)} /></div>
                </div>
                <div><Label>Lokasi</Label><Input value={doc.personalInfo.location} onChange={(e) => updatePersonal('location', e.target.value)} /></div>
                <div className='grid grid-cols-3 gap-2'>
                  <div><Label>LinkedIn</Label><Input value={doc.personalInfo.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} /></div>
                  <div><Label>GitHub</Label><Input value={doc.personalInfo.github} onChange={(e) => updatePersonal('github', e.target.value)} /></div>
                  <div><Label>Website</Label><Input value={doc.personalInfo.website} onChange={(e) => updatePersonal('website', e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Ringkasan Profesional</CardTitle></CardHeader>
              <CardContent>
                <TiptapWrapper content={doc.summary.html} onChange={updateSummary} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle>Bagian</CardTitle>
                <Button size='sm' variant='outline'><Plus className='w-4 h-4 mr-1' />Tambah</Button>
              </CardHeader>
              <CardContent className='space-y-2'>
                {doc.sections.sort((a,b)=>a.order-b.order).map((s) => (
                  <div key={s.id} className='flex items-center justify-between border rounded p-2'>
                    <span>{s.title}</span>
                    <Button size='sm' variant='ghost'><Trash2 className='w-4 h-4' /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className='preview-panel'>
            <div id='resume-preview' className='bg-white shadow mx-auto' style={{ width: '210mm', minHeight: '297mm' }}>
              <div className='p-10 space-y-4'>
                <div>
                  <h1 className='text-3xl font-bold'>{doc.personalInfo.fullName || 'Nama Lengkap'}</h1>
                  <p className='text-gray-700'>{doc.personalInfo.headline || 'Headline Profesional'}</p>
                  <div className='text-sm text-gray-600 mt-1 flex flex-wrap gap-2'>
                    {doc.personalInfo.email && <span>{doc.personalInfo.email}</span>}
                    {doc.personalInfo.phone && <span>| {doc.personalInfo.phone}</span>}
                    {doc.personalInfo.location && <span>| {doc.personalInfo.location}</span>}
                  </div>
                </div>
                {doc.summary.html && (
                  <div>
                    <h2 className='text-lg font-semibold border-b mb-2'>Profil</h2>
                    <div className='prose prose-sm max-w-none' dangerouslySetInnerHTML={{ __html: doc.summary.html }} />
                  </div>
                )}
                {doc.sections.filter(s=>s.visible).sort((a,b)=>a.order-b.order).map((s) => (
                  <div key={s.id}>
                    <h2 className='text-lg font-semibold border-b mb-2'>{s.title}</h2>
                    <p className='text-sm text-gray-500 italic'>Belum ada item</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
