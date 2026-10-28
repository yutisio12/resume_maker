'use client';

import { AlertTriangle, Check, HardDrive, Loader2 } from 'lucide-react';
import { useResume } from '@/store/resume-context';

export default function SaveStatus() {
  const { state } = useResume();
  const { saveStatus, saveError, isLoading } = state;

  if (isLoading) {
    return (
      <div className='flex items-center gap-1 text-xs text-[#a6e22e]' role='status' aria-live='polite'>
        <Loader2 className='w-3.5 h-3.5 animate-spin' />
        <span className='hidden md:inline'>Memuat draft...</span>
        <span className='md:hidden'>Memuat</span>
      </div>
    );
  }

  if (saveStatus === 'saving') {
    return (
      <div className='flex items-center gap-1 text-xs text-[#fd971f]' role='status' aria-live='polite'>
        <Loader2 className='w-3.5 h-3.5 animate-spin' />
        <span className='hidden md:inline'>Menyimpan...</span>
        <span className='md:hidden'>Menyimpan</span>
      </div>
    );
  }

  if (saveStatus === 'error') {
    return (
      <div
        className='flex items-center gap-1 text-xs text-[#f92672]'
        role='alert'
        title={saveError || 'Gagal menyimpan'}
      >
        <AlertTriangle className='w-3.5 h-3.5' />
        <span className='hidden md:inline'>Gagal menyimpan</span>
        <span className='md:hidden'>Gagal</span>
        <span className='sr-only'>{saveError}</span>
      </div>
    );
  }

  if (saveStatus === 'saved') {
    return (
      <div className='flex items-center gap-1 text-xs text-[#a6e22e]' role='status' aria-live='polite'>
        <Check className='w-3.5 h-3.5' />
        <span className='hidden md:inline'>Tersimpan di perangkat ini</span>
        <span className='md:hidden'>Tersimpan</span>
      </div>
    );
  }

  return (
    <div className='flex items-center gap-1 text-xs text-[#a6e22e]' title='Data disimpan di browser'>
      <HardDrive className='w-3.5 h-3.5' />
      <span className='hidden md:inline'>Penyimpanan lokal</span>
    </div>
  );
}
