'use client';

import { useResume } from '@/store/resume-context';
import { createDefaultResume } from '@/lib/constants/defaults';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Upload, Trash2, FileJson } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { clearAllData, deletePhoto } from '@/lib/storage/db';
import { parseResumeFile } from '@/lib/utils/import';
import { sanitizeResumeDocument } from '@/lib/utils/sanitize';
import type { ResumeDocument } from '@/lib/models/types';
import ResumePreview from '@/components/preview/ResumePreview';

export default function HeaderActions() {
  const { state, dispatch } = useResume();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [pendingDocument, setPendingDocument] = useState<ResumeDocument | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importName, setImportName] = useState('');
  const [reading, setReading] = useState(false);
  const disabled = process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === 'true';
  const [verified, setVerified] = useState(disabled);

  useEffect(() => {
    if (disabled) {
      setVerified(true);
      return;
    }
    const v = sessionStorage.getItem('turnstile_verified');
    setVerified(v === 'true');
  }, [disabled]);

  const resetImport = () => {
    setPendingDocument(null);
    setImportError(null);
    setImportName('');
    setReading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openImport = () => {
    if (!verified) {
      alert('Silakan verifikasi terlebih dahulu di halaman utama');
      return;
    }
    resetImport();
    setImportOpen(true);
  };

  const exportJson = () => {
    if (!verified) {
      alert('Silakan verifikasi terlebih dahulu di halaman utama');
      return;
    }

    const safeDocument = sanitizeResumeDocument({
      ...state.document,
      personalInfo: {
        ...state.document.personalInfo,
        photoId: null,
        showPhoto: false,
      },
    });

    const data = JSON.stringify(safeDocument, null, 2);
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

    setReading(true);
    setImportError(null);
    setPendingDocument(null);
    setImportName(file.name);

    const result = await parseResumeFile(file);
    if (result.ok) {
      setPendingDocument(result.document);
    } else {
      setImportError(result.error);
    }

    setReading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const confirmImport = () => {
    if (!pendingDocument) return;
    const oldPhotoId = state.document.personalInfo.photoId;
    dispatch({ type: 'SET_DOCUMENT', payload: pendingDocument });
    if (oldPhotoId) {
      deletePhoto(oldPhotoId).catch(() => {
        console.warn('Foto lama gagal dihapus dari perangkat ini.');
      });
    }
    setImportOpen(false);
    resetImport();
  };

  const reset = async () => {
    if (confirm('Hapus semua data dan mulai baru?')) {
      const fresh = createDefaultResume();
      dispatch({ type: 'RESET', payload: fresh });
      try {
        await clearAllData();
      } catch {
        alert('Data di perangkat tidak dapat dihapus sepenuhnya.');
      }
      setOpen(false);
    }
  };

  return (
    <div className='flex items-center gap-1 sm:gap-2'>
      <input
        ref={fileInputRef}
        type='file'
        accept='.json,application/json'
        className='hidden'
        onChange={importJson}
      />

      <Button
        size='sm'
        variant='outline'
        aria-label='Import JSON'
        title='Import JSON'
        className='px-2 sm:px-3'
        onClick={openImport}
      >
        <Upload className='w-4 h-4 sm:mr-1' />
        <span className='hidden sm:inline'>{verified ? 'Import' : 'Verifikasi dulu'}</span>
      </Button>

      <Button
        size='sm'
        variant='outline'
        aria-label='Export JSON'
        title='Export JSON'
        className='px-2 sm:px-3'
        onClick={exportJson}
      >
        <Download className='w-4 h-4 sm:mr-1' />
        <span className='hidden sm:inline'>{verified ? 'Export JSON' : 'Verifikasi dulu'}</span>
      </Button>

      <Dialog
        open={importOpen}
        onOpenChange={(nextOpen) => {
          setImportOpen(nextOpen);
          if (!nextOpen) resetImport();
        }}
      >
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Import Resume</DialogTitle>
            <DialogDescription>
              Pilih file JSON hasil Export Resume Maker. Draft saat ini tidak akan diganti
              sebelum kamu menekan tombol Ganti draft.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='rounded-md border border-input bg-muted/40 p-3 text-sm text-muted-foreground'>
              <p className='font-medium text-foreground'>Belum punya file?</p>
              <p className='mt-1'>
                Unduh contoh JSON untuk melihat struktur data yang didukung. File contoh
                berisi data dummy dan tidak otomatis dimasukkan ke draft.
              </p>
              <Button asChild size='sm' variant='outline' className='mt-2'>
                <a href='/sample-resume.json' download='sample-resume.json'>
                  <FileJson className='w-4 h-4 mr-1' />
                  Unduh contoh JSON
                </a>
              </Button>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Button size='sm' onClick={() => fileInputRef.current?.click()} disabled={reading}>
                <Upload className='w-4 h-4 mr-1' />
                {reading ? 'Membaca file...' : 'Pilih file JSON'}
              </Button>
              {importName && <span className='text-sm text-muted-foreground'>{importName}</span>}
            </div>

            {importError && (
              <p role='alert' className='rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive'>
                {importError}
              </p>
            )}

            {pendingDocument && (
              <div className='space-y-3'>
                <div className='rounded-md border border-input p-3 text-sm'>
                  <p className='font-medium text-foreground'>Preview dokumen yang akan diimport</p>
                  <p className='text-muted-foreground'>
                    {pendingDocument.personalInfo.fullName || 'Tanpa nama'} ·{' '}
                    {pendingDocument.sections.length} section ·{' '}
                    {pendingDocument.settings.fontFamily || 'Arial'} ·{' '}
                    {pendingDocument.settings.template === 'minimal' ? 'Minimal' : 'ATS Classic'}
                  </p>
                  <p className='mt-1 text-xs text-amber-600 dark:text-amber-400'>
                    Foto tidak ikut dalam file JSON. Semua HTML akan disanitasi sebelum dipakai.
                  </p>
                </div>
                <div className='max-h-[50vh] overflow-auto rounded-md border border-input bg-white p-2'>
                  <ResumePreview id='import-preview' document={pendingDocument} />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setImportOpen(false)}>Batal</Button>
            <Button onClick={confirmImport} disabled={!pendingDocument}>Ganti draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size='sm' variant='destructive' aria-label='Reset' title='Reset' className='px-2 sm:px-3'>
            <Trash2 className='w-4 h-4 sm:mr-1' />
            <span className='hidden sm:inline'>Reset</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Resume</DialogTitle>
            <DialogDescription>
              Semua draft dan foto akan dihapus dari perangkat ini. Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
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
