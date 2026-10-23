'use client';

import { useResume } from '@/store/resume-context';
import { createDefaultResume } from '@/lib/constants/defaults';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Upload, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { saveDraft, clearDraft } from '@/lib/storage/db';

export default function HeaderActions() {
  const { state, dispatch } = useResume();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const exportJson = () => {
    const data = JSON.stringify(state.document, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.personalInfo || !parsed.sections) throw new Error('Invalid');
      dispatch({ type: 'SET_DOCUMENT', payload: parsed });
      saveDraft(parsed);
    } catch {
      alert('File JSON tidak valid');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const reset = async () => {
    if (confirm('Hapus semua data dan mulai baru?')) {
      const fresh = createDefaultResume();
      dispatch({ type: 'RESET', payload: fresh });
      await clearDraft();
      setOpen(false);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <input ref={fileInputRef} type='file' accept='application/json' className='hidden' onChange={importJson} />
      <Button size='sm' variant='outline' onClick={() => fileInputRef.current?.click()}><Upload className='w-4 h-4 mr-1' />Import</Button>
      <Button size='sm' variant='outline' onClick={exportJson}><Download className='w-4 h-4 mr-1' />Export JSON</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size='sm' variant='destructive'><Trash2 className='w-4 h-4 mr-1' />Reset</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Resume</DialogTitle>
            <DialogDescription>Semua data akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={() => setOpen(false)}>Batal</Button>
            <Button variant='destructive' onClick={reset}>Hapus Semua</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
