'use client';

import { useResume } from '@/store/resume-context';
import TiptapWrapper from '@/components/editor/TiptapWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResumePreview from '@/components/preview/ResumePreview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HeaderActions from '@/components/shared/HeaderActions';
import ExportPdfButton from '@/components/shared/ExportPdfButton';
import SaveStatus from '@/components/shared/SaveStatus';
import FormSections from '@/components/form/FormSections';
import PhotoUpload from '@/components/form/PhotoUpload';
import ResumeSettings from '@/components/form/ResumeSettings';
import MobileTabs from '@/components/layout/MobileTabs';

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
    <main className='app-shell min-h-screen bg-[#272822]'>
      <header className='app-header border-b border-[#75715e] bg-[#3e3d32] sticky top-0 z-10 text-[#f8f8f2]' data-app-ui='true'>
        <div className='max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2'>
          <h1 className='text-base sm:text-lg font-semibold truncate'>Resume Maker</h1>
          <div className='flex items-center gap-1 sm:gap-2 shrink-0'>
            <SaveStatus />
            <ExportPdfButton />
            <HeaderActions />
          </div>
        </div>
      </header>
      <div className='max-w-7xl mx-auto p-4'>
        <MobileTabs />
        <div className='hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-4'>
          <section className='form-panel space-y-4' data-app-ui='true'>
            <ResumeSettings />

            <Card>
              <CardHeader><CardTitle>Informasi Pribadi</CardTitle></CardHeader>
              <CardContent className='space-y-3'>
                <div><Label>Nama Lengkap</Label><Input aria-label='Nama Lengkap' value={doc.personalInfo.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} /></div>
                <div><Label>Headline/Jabatan</Label><Input aria-label='Headline/Jabatan' value={doc.personalInfo.headline} onChange={(e) => updatePersonal('headline', e.target.value)} /></div>
                <div className='grid grid-cols-2 gap-2'>
                  <div><Label>Email</Label><Input aria-label='Email' value={doc.personalInfo.email} onChange={(e) => updatePersonal('email', e.target.value)} /></div>
                  <div><Label>Telepon</Label><Input aria-label='Telepon' value={doc.personalInfo.phone} onChange={(e) => updatePersonal('phone', e.target.value)} /></div>
                </div>
                <div><Label>Lokasi</Label><Input aria-label='Lokasi' value={doc.personalInfo.location} onChange={(e) => updatePersonal('location', e.target.value)} /></div>
                <div className='grid grid-cols-3 gap-2'>
                  <div><Label>LinkedIn</Label><Input aria-label='LinkedIn' value={doc.personalInfo.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} /></div>
                  <div><Label>GitHub</Label><Input aria-label='GitHub' value={doc.personalInfo.github} onChange={(e) => updatePersonal('github', e.target.value)} /></div>
                  <div><Label>Website</Label><Input aria-label='Website' value={doc.personalInfo.website} onChange={(e) => updatePersonal('website', e.target.value)} /></div>
                </div>
              </CardContent>
            </Card>

            <PhotoUpload />

            <Card>
              <CardHeader><CardTitle>Ringkasan Profesional</CardTitle></CardHeader>
              <CardContent>
                <TiptapWrapper content={doc.summary.html} onChange={updateSummary} label='Ringkasan Profesional' />
              </CardContent>
            </Card>

            <FormSections />
          </section>

          <section className='preview-panel'>
            <ResumePreview />
          </section>
        </div>
      </div>
      <div className='print-only' aria-hidden='true'>
        <ResumePreview id='resume-preview-print' />
      </div>
    </main>
  );
}
