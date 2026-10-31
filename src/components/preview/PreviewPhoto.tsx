'use client';

import { useResume } from '@/store/resume-context';
import { useState, useEffect } from 'react';
import { loadPhoto } from '@/lib/storage/db';

interface Props {
  photoId?: string | null;
  showPhoto?: boolean;
}

export default function PreviewPhoto({ photoId, showPhoto }: Props) {
  const { state } = useResume();
  const activePhotoId = photoId === undefined ? state.document.personalInfo.photoId : photoId;
  const activeShowPhoto = showPhoto === undefined ? state.document.personalInfo.showPhoto : showPhoto;
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    (async () => {
      if (activePhotoId && activeShowPhoto) {
        try {
          const blob = await loadPhoto(activePhotoId);
          if (blob) {
            objectUrl = URL.createObjectURL(blob);
            setSrc(objectUrl);
            return;
          }
        } catch {
          // Photo is unavailable; render without it.
        }
      }
      setSrc(null);
    })();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activePhotoId, activeShowPhoto]);

  if (!src) return null;
  return <img src={src} alt='foto' className='w-24 h-24 object-cover rounded' />;
}
