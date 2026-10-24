'use client';

import { useState, useEffect } from 'react';
import TurnstileWidget from './TurnstileWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: React.ReactNode;
}

export default function HomeTurnstileWrapper({ children }: Props) {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
  const disabled = process.env.NEXT_PUBLIC_TURNSTILE_DISABLED === 'true';

  useEffect(() => {
    if (disabled) {
      setVerified(true);
      return;
    }
    const v = sessionStorage.getItem('turnstile_verified');
    if (v === 'true') setVerified(true);
  }, [disabled]);

  const onVerify = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch('/verify-turnstile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('turnstile_verified', 'true');
        setVerified(true);
      } else {
        alert('Verifikasi gagal, coba lagi');
      }
    } catch {
      alert('Verifikasi gagal');
    } finally {
      setLoading(false);
    }
  };

  if (verified) return <>{children}</>;

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Verifikasi Keamanan</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <p className='text-sm text-gray-600'>Untuk melindungi aplikasi dari spam, silakan selesaikan verifikasi Cloudflare Turnstile.</p>
          {siteKey && !disabled ? (
            <TurnstileWidget siteKey={siteKey} onVerify={onVerify} />
          ) : (
            <div className='text-sm text-amber-600'>Turnstile belum dikonfigurasi. Set NEXT_PUBLIC_TURNSTILE_SITE_KEY atau aktifkan NEXT_PUBLIC_TURNSTILE_DISABLED=true untuk dev.</div>
          )}
          {loading && <p className='text-sm text-center'>Memverifikasi...</p>}
        </CardContent>
      </Card>
    </div>
  );
}
