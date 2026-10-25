'use client';

import { useResume } from '@/store/resume-context';
import TiptapWrapper from '@/components/editor/TiptapWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PreviewPhoto from '@/components/preview/PreviewPhoto';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import HeaderActions from '@/components/shared/HeaderActions';
import ExportPdfButton from '@/components/shared/ExportPdfButton';
import FormSections from '@/components/form/FormSections';
import PhotoUpload from '@/components/form/PhotoUpload';
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
    <main className='min-h-screen bg-[#272822]'>
      <header className='app-header border-b border-[#75715e] bg-[#3e3d32] sticky top-0 z-10 text-[#f8f8f2]' data-app-ui='true'>
        <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-between'>
          <h1 className='text-lg font-semibold'>Resume Maker</h1>
          <div className='flex items-center gap-2'>
            <ExportPdfButton />
            <HeaderActions />
          </div>
        </div>
      </header>
      <div className='max-w-7xl mx-auto p-4'>
        <MobileTabs />
        <div className='hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-4'>
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

            <PhotoUpload />

            <Card>
              <CardHeader><CardTitle>Ringkasan Profesional</CardTitle></CardHeader>
              <CardContent>
                <TiptapWrapper content={doc.summary.html} onChange={updateSummary} />
              </CardContent>
            </Card>

            <FormSections />
          </section>

          <section className='preview-panel'>
            <div id='resume-preview' className='bg-white shadow mx-auto' style={{ width: '210mm', minHeight: '297mm' }}>
              <div className='p-10 space-y-4'>
                <div className='flex gap-4 items-start'>
                  <PreviewPhoto />
                  <div className='flex-1 text-black'>
                    <h1 className='text-3xl font-bold text-black'>{doc.personalInfo.fullName || 'Nama Lengkap'}</h1>
                    <p className='text-black'>{doc.personalInfo.headline || 'Headline Profesional'}</p>
                    <div className='text-sm text-black mt-1 flex flex-wrap gap-2'>
                      {doc.personalInfo.email && <span>{doc.personalInfo.email}</span>}
                      {doc.personalInfo.phone && <span>| {doc.personalInfo.phone}</span>}
                      {doc.personalInfo.location && <span>| {doc.personalInfo.location}</span>}
                    </div>
                  </div>
                </div>
                {doc.summary.html && (
                  <div className='text-black'>
                    <h2 className='text-lg font-semibold border-b mb-2 text-black'>Profil</h2>
                    <div className='prose prose-sm max-w-none text-black' dangerouslySetInnerHTML={{ __html: doc.summary.html }} />
                  </div>
                )}
                {doc.sections.filter(s=>s.visible).sort((a,b)=>a.order-b.order).map((s) => (
                  <div key={s.id} className='text-black'>
                    <h2 className='text-lg font-semibold border-b mb-2 text-black'>{s.title}</h2>
                    {s.type === 'experience' && (s.items || []).map((item: { id: string; position?: string; company?: string; location?: string; startDate?: string; endDate?: string; current?: boolean; description?: { html?: string } }) => (
                      <div key={item.id} className='mb-3'>
                        <div className='flex justify-between'>
                          <div>
                            <p className='font-semibold text-black'>{item.position || ''}</p>
                            <p className='text-sm text-black'>{item.company || ''} {item.location ? `| ${item.location}` : ''}</p>
                          </div>
                          <p className='text-sm text-black'>{item.startDate || ''} {item.endDate || item.current ? (item.current ? ' - Sekarang' : ` - ${item.endDate}`) : ''}</p>
                        </div>
                        {item.description?.html && (
                          <div className='prose prose-sm max-w-none text-black' dangerouslySetInnerHTML={{ __html: item.description.html }} />
                        )}
                      </div>
                    ))}
                    {s.type === 'education' && <p className='text-sm text-gray-600 italic'>Item pendidikan belum ditampilkan</p>}
                    {s.type === 'skills' && <p className='text-sm text-gray-600 italic'>Isi di form</p>}
                    {(s.items || []).length === 0 && s.type !== 'experience' && <p className='text-sm text-gray-500 italic'>Belum ada item</p>}
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
