'use client';

import { useResume } from '@/store/resume-context';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ExportPdfButton() {
  const { state } = useResume();
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

  const printResume = () => {
    if (!verified) {
      alert('Silakan verifikasi terlebih dahulu di halaman utama');
      return;
    }

    const originalTitle = document.title;
    const name = state.document.personalInfo.fullName || 'Resume';
    document.title = `Resume-${name.replace(/[^a-zA-Z0-9]/g, '-')}`;

    window.print();

    window.setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <Button
      size='sm'
      onClick={printResume}
      aria-label='Cetak atau simpan PDF'
      title='Cetak atau simpan PDF'
      className='px-2 sm:px-3'
    >
      <Printer className='w-4 h-4 sm:mr-1' />
      <span className='hidden sm:inline'>{verified ? 'Cetak / PDF' : 'Verifikasi dulu'}</span>
    </Button>
  );
}
