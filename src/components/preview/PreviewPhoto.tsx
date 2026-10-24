'use client';

import { useResume } from '@/store/resume-context';
import { useState, useEffect } from 'react';
import { loadPhoto } from '@/lib/storage/db';

export default function PreviewPhoto() {
  const { state } = useResume();
  const doc = state.document;
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    (async () => {
      if (doc.personalInfo.photoId && doc.personalInfo.showPhoto) {
        const blob = await loadPhoto(doc.personalInfo.photoId);
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
        } else {
          setSrc(null);
        }
      } else {
        setSrc(null);
      }
    })();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.personalInfo.photoId, doc.personalInfo.showPhoto]);

  if (!src) return null;
  return <img src={src} alt='foto' className='w-24 h-24 object-cover rounded' />;
}
