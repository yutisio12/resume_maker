'use client';

import { useResume } from '@/store/resume-context';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { savePhoto, deletePhoto, loadPhoto } from '@/lib/storage/db';
import { v4 as uuidv4 } from 'uuid';
import { Upload, X } from 'lucide-react';

export default function PhotoUpload() {
  const { state, dispatch } = useResume();
  const doc = state.document;
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      if (!doc.personalInfo.photoId) {
        setPreview(null);
        return;
      }
      try {
        const blob = await loadPhoto(doc.personalInfo.photoId);
        if (blob && !cancelled) {
          objectUrl = URL.createObjectURL(blob);
          setPreview(objectUrl);
        } else if (!cancelled) {
          setPreview(null);
        }
      } catch {
        if (!cancelled) setPreview(null);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.personalInfo.photoId]);

  useEffect(() => {
    const url = pendingPreview;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [pendingPreview]);

  const cancelPending = () => {
    setPendingBlob(null);
    setPendingPreview(null);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Format harus JPG, PNG, atau WebP');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran maksimal 2MB');
      return;
    }

    cancelPending();
    const reader = new FileReader();
    reader.onerror = () => alert('File foto tidak dapat dibaca');
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => alert('Gagal membaca gambar');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        const side = Math.min(img.width, img.height);
        const sourceX = (img.width - side) / 2;
        const sourceY = (img.height - side) / 2;
        canvas.width = maxSize;
        canvas.height = maxSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, sourceX, sourceY, side, side, 0, 0, maxSize, maxSize);
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Gagal memproses foto');
            return;
          }
          setPendingBlob(blob);
          setPendingPreview(URL.createObjectURL(blob));
        }, 'image/jpeg', 0.85);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const savePendingPhoto = async () => {
    if (!pendingBlob) return;
    setSaving(true);
    const oldPhotoId = doc.personalInfo.photoId;
    try {
      const photoId = uuidv4();
      await savePhoto(photoId, pendingBlob);
      dispatch({ type: 'UPDATE_PERSONAL', payload: { photoId, showPhoto: true } });
      cancelPending();
      if (oldPhotoId) {
        try {
          await deletePhoto(oldPhotoId);
        } catch {
          console.warn('Foto lama gagal dihapus dari perangkat ini.');
        }
      }
    } catch {
      alert('Foto gagal disimpan di perangkat ini. Periksa ruang penyimpanan browser.');
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = async () => {
    try {
      if (doc.personalInfo.photoId) {
        await deletePhoto(doc.personalInfo.photoId);
      }
      dispatch({ type: 'UPDATE_PERSONAL', payload: { photoId: null, showPhoto: false } });
      setPreview(null);
    } catch {
      alert('Foto gagal dihapus dari perangkat ini.');
    }
  };

  const toggleShow = () => {
    dispatch({ type: 'UPDATE_PERSONAL', payload: { showPhoto: !doc.personalInfo.showPhoto } });
  };

  const shownPreview = pendingPreview || preview;

  return (
    <Card>
      <CardHeader><CardTitle>Foto Profil (Opsional)</CardTitle></CardHeader>
      <CardContent className='space-y-3'>
        <input ref={fileRef} type='file' accept='image/jpeg,image/png,image/webp' className='hidden' onChange={handleFile} />
        <div className='flex items-center gap-3'>
          <div className='w-20 h-20 rounded border border-input bg-muted flex items-center justify-center overflow-hidden'>
            {shownPreview ? <img src={shownPreview} alt='Pratinjau foto profil' className='w-full h-full object-cover' /> : <span className='text-xs text-muted-foreground'>No Photo</span>}
          </div>
          <div className='flex flex-col gap-2'>
            <Button size='sm' variant='outline' onClick={() => fileRef.current?.click()}>
              <Upload className='w-4 h-4 mr-1' />{shownPreview ? 'Ganti Foto' : 'Upload Foto'}
            </Button>
            {pendingBlob ? (
              <div className='flex gap-1'>
                <Button size='sm' onClick={savePendingPhoto} disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Gunakan Foto'}
                </Button>
                <Button size='sm' variant='ghost' onClick={cancelPending} disabled={saving}>Batal</Button>
              </div>
            ) : doc.personalInfo.photoId ? (
              <>
                <Button size='sm' variant='outline' onClick={toggleShow}>{doc.personalInfo.showPhoto ? 'Sembunyikan' : 'Tampilkan'}</Button>
                <Button size='sm' variant='ghost' onClick={removePhoto}><X className='w-4 h-4 mr-1' />Hapus</Button>
              </>
            ) : null}
          </div>
        </div>
        <p className='text-xs text-muted-foreground'>
          Format JPG/PNG/WebP, maks 2MB. Foto dipotong persegi di tengah dan disimpan lokal di IndexedDB.
        </p>
        <p className='text-xs text-muted-foreground'>
          Kebutuhan foto berbeda tergantung negara dan industri. Cek panduan lamaran sebelum memakai foto.
        </p>
      </CardContent>
    </Card>
  );
}
