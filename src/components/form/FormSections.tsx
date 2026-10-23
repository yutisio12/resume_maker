'use client';

import { useResume } from '@/store/resume-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import TiptapWrapper from '@/components/editor/TiptapWrapper';
import { ResumeSection } from '@/lib/models/types';

const sectionTypes = [
  { type: 'experience', title: 'Pengalaman Kerja' },
  { type: 'education', title: 'Pendidikan' },
  { type: 'projects', title: 'Proyek' },
  { type: 'certifications', title: 'Sertifikasi' },
  { type: 'languages', title: 'Bahasa' },
  { type: 'skills', title: 'Keahlian' },
];

export default function FormSections() {
  const { state, dispatch } = useResume();
  const doc = state.document;

  const addSection = (type: string, title: string) => {
    const newSection: ResumeSection = {
      id: uuidv4(),
      type: type as ResumeSection['type'],
      title,
      visible: true,
      order: doc.sections.length,
      items: [],
    };
    dispatch({ type: 'ADD_SECTION', payload: newSection });
  };

  const removeSection = (id: string) => {
    if (confirm('Hapus section ini?')) {
      dispatch({ type: 'REMOVE_SECTION', payload: id });
    }
  };

  const toggleSection = (id: string, visible: boolean) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { id, data: { visible: !visible } } });
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Kelola Section</CardTitle>
          <div className='flex flex-wrap gap-1'>
            {sectionTypes.map((st) => (
              <Button key={st.type} size='sm' variant='outline' onClick={() => addSection(st.type, st.title)}>
                <Plus className='w-3 h-3 mr-1' />{st.title}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className='space-y-2'>
          {doc.sections.sort((a,b)=>a.order-b.order).map((s) => (
            <div key={s.id} className='flex items-center justify-between border rounded p-2'>
              <div className='flex items-center gap-2'>
                <GripVertical className='w-4 h-4 text-gray-400' />
                <span className={s.visible ? '' : 'text-gray-400'}>{s.title}</span>
              </div>
              <div className='flex gap-1'>
                <Button size='sm' variant='ghost' onClick={() => toggleSection(s.id, s.visible)}>
                  {s.visible ? 'Sembunyikan' : 'Tampilkan'}
                </Button>
                <Button size='sm' variant='ghost' onClick={() => removeSection(s.id)}>
                  <Trash2 className='w-4 h-4' />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {doc.sections.filter(s=>s.visible && s.type==='experience').map((s) => (
        <Card key={s.id}>
          <CardHeader><CardTitle>{s.title}</CardTitle></CardHeader>
          <CardContent className='space-y-3'>
            <Button size='sm' variant='outline'><Plus className='w-4 h-4 mr-1' />Tambah Pengalaman</Button>
            <p className='text-sm text-gray-500'>Klik tambah untuk mengisi pengalaman kerja</p>
          </CardContent>
        </Card>
      ))}

      {doc.sections.filter(s=>s.visible && s.type==='education').map((s) => (
        <Card key={s.id}>
          <CardHeader><CardTitle>{s.title}</CardTitle></CardHeader>
          <CardContent className='space-y-3'>
            <Button size='sm' variant='outline'><Plus className='w-4 h-4 mr-1' />Tambah Pendidikan</Button>
          </CardContent>
        </Card>
      ))}

      {doc.sections.filter(s=>s.visible && s.type==='skills').map((s) => (
        <Card key={s.id}>
          <CardHeader><CardTitle>{s.title}</CardTitle></CardHeader>
          <CardContent>
            <TiptapWrapper content={''} onChange={() => {}} />
            <p className='text-xs text-gray-500 mt-1'>Isi keahlian kamu (bisa pakai bullet list)</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
