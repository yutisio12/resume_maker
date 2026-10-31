'use client';

import { useResume } from '@/store/resume-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ResumePreview from '@/components/preview/ResumePreview';
import TiptapWrapper from '@/components/editor/TiptapWrapper';
import PhotoUpload from '@/components/form/PhotoUpload';
import FormSections from '@/components/form/FormSections';
import ResumeSettings from '@/components/form/ResumeSettings';

export default function MobileTabs() {
  const { state, dispatch } = useResume();
  const doc = state.document;

  const updatePersonal = (field: string, value: string) => {
    dispatch({ type: 'UPDATE_PERSONAL', payload: { [field]: value } });
  };

  return (
    <div className='lg:hidden' data-app-ui='true'>
      <Tabs defaultValue='form' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='form'>Form</TabsTrigger>
          <TabsTrigger value='preview'>Preview</TabsTrigger>
        </TabsList>
        <TabsContent value='form' className='space-y-4'>
          <ResumeSettings />

          <Card>
            <CardHeader><CardTitle>Informasi Pribadi</CardTitle></CardHeader>
            <CardContent className='space-y-3'>
              <div><Label>Nama Lengkap</Label><Input aria-label='Nama Lengkap' value={doc.personalInfo.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} /></div>
              <div><Label>Headline</Label><Input aria-label='Headline' value={doc.personalInfo.headline} onChange={(e) => updatePersonal('headline', e.target.value)} /></div>
              <div><Label>Email</Label><Input aria-label='Email' value={doc.personalInfo.email} onChange={(e) => updatePersonal('email', e.target.value)} /></div>
              <div><Label>Telepon</Label><Input aria-label='Telepon' value={doc.personalInfo.phone} onChange={(e) => updatePersonal('phone', e.target.value)} /></div>
              <div><Label>Lokasi</Label><Input aria-label='Lokasi' value={doc.personalInfo.location} onChange={(e) => updatePersonal('location', e.target.value)} /></div>
              <div><Label>LinkedIn</Label><Input aria-label='LinkedIn' value={doc.personalInfo.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} /></div>
              <div><Label>GitHub</Label><Input aria-label='GitHub' value={doc.personalInfo.github} onChange={(e) => updatePersonal('github', e.target.value)} /></div>
              <div><Label>Website</Label><Input aria-label='Website' value={doc.personalInfo.website} onChange={(e) => updatePersonal('website', e.target.value)} /></div>
            </CardContent>
          </Card>

          <PhotoUpload />

          <Card>
            <CardHeader><CardTitle>Ringkasan Profesional</CardTitle></CardHeader>
            <CardContent>
              <TiptapWrapper content={doc.summary.html} onChange={(html, text) => dispatch({ type: 'UPDATE_SUMMARY', payload: { html, text } })} label='Ringkasan Profesional' />
            </CardContent>
          </Card>

          <FormSections />
        </TabsContent>
        <TabsContent value='preview'>
          <div className='overflow-x-auto'>
            <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
              <ResumePreview id='resume-preview-mobile' />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
