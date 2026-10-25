'use client';

import { useResume } from '@/store/resume-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ResumeSection } from '@/lib/models/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TiptapWrapper from '@/components/editor/TiptapWrapper';

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

  const addItem = (sectionId: string, item: any) => {
    const sections = doc.sections.map(s => {
      if (s.id !== sectionId) return s;
      return { ...s, items: [...(s.items || []), { id: uuidv4(), ...item }] };
    });
    dispatch({ type: 'REORDER_SECTIONS', payload: sections });
  };

  const updateItem = (sectionId: string, itemId: string, field: string, value: unknown) => {
    const sections = doc.sections.map(s => {
      if (s.id !== sectionId) return s;
      const items = (s.items || []).map((it: any) => it.id === itemId ? { ...it, [field]: value } : it);
      return { ...s, items };
    });
    dispatch({ type: 'REORDER_SECTIONS', payload: sections });
  };

  const removeItem = (sectionId: string, itemId: string) => {
    const sections = doc.sections.map(s => {
      if (s.id !== sectionId) return s;
      const items = (s.items || []).filter((it: any) => it.id !== itemId);
      return { ...s, items };
    });
    dispatch({ type: 'REORDER_SECTIONS', payload: sections });
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
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>{s.title}</CardTitle>
            <Button size='sm' onClick={() => addItem(s.id, { position: '', company: '', location: '', startDate: '', endDate: '', current: false, description: { html: '', text: '' } })}><Plus className='w-4 h-4 mr-1' />Tambah Pengalaman</Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {(s.items || []).map((item: any) => (
              <div key={item.id} className='border rounded p-3 space-y-2'>
                <div className='grid grid-cols-2 gap-2'>
                  <div><Label>Posisi</Label><Input value={item.position || ''} onChange={(e) => updateItem(s.id, item.id, 'position', e.target.value)} /></div>
                  <div><Label>Perusahaan</Label><Input value={item.company || ''} onChange={(e) => updateItem(s.id, item.id, 'company', e.target.value)} /></div>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <div><Label>Mulai</Label><Input value={item.startDate || ''} onChange={(e) => updateItem(s.id, item.id, 'startDate', e.target.value)} /></div>
                  <div><Label>Selesai</Label><Input value={item.endDate || ''} onChange={(e) => updateItem(s.id, item.id, 'endDate', e.target.value)} disabled={item.current} /></div>
                </div>
                <label className='flex items-center gap-2 text-sm'><input type='checkbox' checked={!!item.current} onChange={(e) => updateItem(s.id, item.id, 'current', e.target.checked)} /> Masih bekerja di sini</label>
                <div><Label>Deskripsi & Pencapaian</Label><TiptapWrapper content={item.description?.html || ''} onChange={(html, text) => updateItem(s.id, item.id, 'description', { html, text })} /></div>
                <Button size='sm' variant='destructive' onClick={() => removeItem(s.id, item.id)}><Trash2 className='w-4 h-4 mr-1' />Hapus</Button>
              </div>
            ))}
            {(s.items || []).length === 0 && <p className='text-sm text-gray-500'>Belum ada item</p>}
          </CardContent>
        </Card>
      ))}

      {doc.sections.filter(s=>s.visible && s.type==='education').map((s) => (
        <Card key={s.id}>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>{s.title}</CardTitle>
            <Button size='sm' onClick={() => addItem(s.id, { school: '', degree: '', location: '', startDate: '', endDate: '', current: false, description: { html: '', text: '' } })}><Plus className='w-4 h-4 mr-1' />Tambah Pendidikan</Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {(s.items || []).map((item: any) => (
              <div key={item.id} className='border rounded p-3 space-y-2'>
                <div className='grid grid-cols-2 gap-2'>
                  <div><Label>Institusi</Label><Input value={item.school || ''} onChange={(e) => updateItem(s.id, item.id, 'school', e.target.value)} /></div>
                  <div><Label>Gelar/Jurusan</Label><Input value={item.degree || ''} onChange={(e) => updateItem(s.id, item.id, 'degree', e.target.value)} /></div>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <div><Label>Mulai</Label><Input value={item.startDate || ''} onChange={(e) => updateItem(s.id, item.id, 'startDate', e.target.value)} /></div>
                  <div><Label>Selesai</Label><Input value={item.endDate || ''} onChange={(e) => updateItem(s.id, item.id, 'endDate', e.target.value)} disabled={item.current} /></div>
                </div>
                <label className='flex items-center gap-2 text-sm'><input type='checkbox' checked={!!item.current} onChange={(e) => updateItem(s.id, item.id, 'current', e.target.checked)} /> Masih berlangsung</label>
                <div><Label>Deskripsi</Label><TiptapWrapper content={item.description?.html || ''} onChange={(html, text) => updateItem(s.id, item.id, 'description', { html, text })} /></div>
                <Button size='sm' variant='destructive' onClick={() => removeItem(s.id, item.id)}><Trash2 className='w-4 h-4 mr-1' />Hapus</Button>
              </div>
            ))}
            {(s.items || []).length === 0 && <p className='text-sm text-gray-500'>Belum ada item</p>}
          </CardContent>
        </Card>
      ))}

      {doc.sections.filter(s=>s.visible && s.type==='projects').map((s) => (
        <Card key={s.id}>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>{s.title}</CardTitle>
            <Button size='sm' onClick={() => addItem(s.id, { name: '', url: '', description: { html: '', text: '' } })}><Plus className='w-4 h-4 mr-1' />Tambah Proyek</Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {(s.items || []).map((item: any) => (
              <div key={item.id} className='border rounded p-3 space-y-2'>
                <div className='grid grid-cols-2 gap-2'>
                  <div><Label>Nama Proyek</Label><Input value={item.name || ''} onChange={(e) => updateItem(s.id, item.id, 'name', e.target.value)} /></div>
                  <div><Label>Link</Label><Input value={item.url || ''} onChange={(e) => updateItem(s.id, item.id, 'url', e.target.value)} /></div>
                </div>
                <div><Label>Deskripsi</Label><TiptapWrapper content={item.description?.html || ''} onChange={(html, text) => updateItem(s.id, item.id, 'description', { html, text })} /></div>
                <Button size='sm' variant='destructive' onClick={() => removeItem(s.id, item.id)}><Trash2 className='w-4 h-4 mr-1' />Hapus</Button>
              </div>
            ))}
            {(s.items || []).length === 0 && <p className='text-sm text-gray-500'>Belum ada item</p>}
          </CardContent>
        </Card>
      ))}

      {doc.sections.filter(s=>s.visible && s.type==='certifications').map((s) => (
        <Card key={s.id}>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>{s.title}</CardTitle>
            <Button size='sm' onClick={() => addItem(s.id, { name: '', issuer: '', date: '', description: { html: '', text: '' } })}><Plus className='w-4 h-4 mr-1' />Tambah Sertifikasi</Button>
          </CardHeader>
          <CardContent className='space-y-4'>
            {(s.items || []).map((item: any) => (
              <div key={item.id} className='border rounded p-3 space-y-2'>
                <div className='grid grid-cols-2 gap-2'>
                  <div><Label>Nama Sertifikasi</Label><Input value={item.name || ''} onChange={(e) => updateItem(s.id, item.id, 'name', e.target.value)} /></div>
                  <div><Label>Penerbit</Label><Input value={item.issuer || ''} onChange={(e) => updateItem(s.id, item.id, 'issuer', e.target.value)} /></div>
                </div>
                <div><Label>Tanggal</Label><Input value={item.date || ''} onChange={(e) => updateItem(s.id, item.id, 'date', e.target.value)} /></div>
                <Button size='sm' variant='destructive' onClick={() => removeItem(s.id, item.id)}><Trash2 className='w-4 h-4 mr-1' />Hapus</Button>
              </div>
            ))}
            {(s.items || []).length === 0 && <p className='text-sm text-gray-500'>Belum ada item</p>}
          </CardContent>
        </Card>
      ))}

      {doc.sections.filter(s=>s.visible && s.type==='languages').map((s) => (
        <Card key={s.id}>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>{s.title}</CardTitle>
            <Button size='sm' onClick={() => addItem(s.id, { name: '', level: '' })}><Plus className='w-4 h-4 mr-1' />Tambah Bahasa</Button>
          </CardHeader>
          <CardContent className='space-y-2'>
            {(s.items || []).map((item: any) => (
              <div key={item.id} className='flex gap-2 items-center'>
                <Input placeholder='Bahasa' value={item.name || ''} onChange={(e) => updateItem(s.id, item.id, 'name', e.target.value)} />
                <Input placeholder='Tingkat (ex: Native/Intermediate)' value={item.level || ''} onChange={(e) => updateItem(s.id, item.id, 'level', e.target.value)} />
                <Button size='sm' variant='ghost' onClick={() => removeItem(s.id, item.id)}><Trash2 className='w-4 h-4' /></Button>
              </div>
            ))}
            {(s.items || []).length === 0 && <p className='text-sm text-gray-500'>Belum ada item</p>}
          </CardContent>
        </Card>
      ))}

      {doc.sections.filter(s=>s.visible && s.type==='skills').map((s) => (
        <Card key={s.id}>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>{s.title}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <TiptapWrapper content={(s.items?.[0] as any)?.description?.html || ''} onChange={(html, text) => {
              if (!s.items || s.items.length === 0) {
                addItem(s.id, { description: { html, text } });
              } else {
                updateItem(s.id, (s.items[0] as any).id, 'description', { html, text });
              }
            }} />
            <p className='text-xs text-gray-500'>Isi keahlian kamu (bisa pakai bullet list)</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
