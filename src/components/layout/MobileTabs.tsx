'use client';

import { useResume } from '@/store/resume-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
          <Card>
            <CardHeader><CardTitle>Informasi Pribadi</CardTitle></CardHeader>
            <CardContent className='space-y-3'>
              <div><Label>Nama Lengkap</Label><Input value={doc.personalInfo.fullName} onChange={(e) => updatePersonal('fullName', e.target.value)} /></div>
              <div><Label>Headline</Label><Input value={doc.personalInfo.headline} onChange={(e) => updatePersonal('headline', e.target.value)} /></div>
              <div><Label>Email</Label><Input value={doc.personalInfo.email} onChange={(e) => updatePersonal('email', e.target.value)} /></div>
              <div><Label>Telepon</Label><Input value={doc.personalInfo.phone} onChange={(e) => updatePersonal('phone', e.target.value)} /></div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value='preview'>
          <div className='overflow-x-auto'>
            <div id='resume-preview' className='bg-white shadow' style={{ width: '210mm', minHeight: '297mm', transform: 'scale(0.5)', transformOrigin: 'top left' }}>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
