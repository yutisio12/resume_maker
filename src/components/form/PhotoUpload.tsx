'use client';

import { useResume } from '@/store/resume-context';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { savePhoto, deletePhoto } from '@/lib/storage/db';
import { v4 as uuidv4 } from 'uuid';
import { Upload, X } from 'lucide-react';

export default function PhotoUpload() {
  const { state, dispatch } = useResume();
  const doc = state.document;
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      alert('Format harus JPG, PNG, atau WebP');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran maksimal 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxSize = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) { height *= maxSize/width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize/height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const photoId = uuidv4();
          await savePhoto(photoId, blob);
          dispatch({ type: 'UPDATE_PERSONAL', payload: { photoId, showPhoto: true } });
          const url = URL.createObjectURL(blob);
          setPreview(url);
        }, 'image/jpeg', 0.8);
      };
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const removePhoto = async () => {
    if (doc.personalInfo.photoId) {
      await deletePhoto(doc.personalInfo.photoId);
    }
    dispatch({ type: 'UPDATE_PERSONAL', payload: { photoId: null, showPhoto: false } });
    setPreview(null);
  };

  const toggleShow = () => {
    dispatch({ type: 'UPDATE_PERSONAL', payload: { showPhoto: !doc.personalInfo.showPhoto } });
  };

  return (
    <Card>
      <CardHeader><CardTitle>Foto Profil (Opsional)</CardTitle></CardHeader>
      <CardContent className='space-y-3'>
        <input ref={fileRef} type='file' accept='image/jpeg,image/png,image/webp' className='hidden' onChange={handleFile} />
        <div className='flex items-center gap-3'>
          <div className='w-20 h-20 rounded border bg-gray-100 flex items-center justify-center overflow-hidden'>
            {preview ? <img src={preview} alt='foto' className='w-full h-full object-cover' /> : <span className='text-xs text-gray-400'>No Photo</span>}
          </div>
          <div className='flex flex-col gap-2'>
            <Button size='sm' variant='outline' onClick={() => fileRef.current?.click()}><Upload className='w-4 h-4 mr-1' />Upload Foto</Button>
            {doc.personalInfo.photoId && (
              <>
                <Button size='sm' variant='outline' onClick={toggleShow}>{doc.personalInfo.showPhoto ? 'Sembunyikan' : 'Tampilkan'}</Button>
                <Button size='sm' variant='ghost' onClick={removePhoto}><X className='w-4 h-4 mr-1' />Hapus</Button>
              </>
            )}
          </div>
        </div>
        <p className='text-xs text-gray-500'>Format JPG/PNG/WebP, maks 2MB. Disimpan lokal di IndexedDB.</p>
      </CardContent>
    </Card>
  );
}
