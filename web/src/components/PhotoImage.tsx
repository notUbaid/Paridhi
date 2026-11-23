import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { InspectionPhoto } from '@shared/types';
import { api } from '../api';

interface PhotoImageProps {
  propertyId: string;
  photo: InspectionPhoto;
  alt: string;
  className?: string;
}

/**
 * Uploaded inspection photos need the signed-in session, which an <img> tag cannot send,
 * so they are fetched with the token and shown from a local object URL.
 */
export function PhotoImage({ propertyId, photo, alt, className }: PhotoImageProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const photoId = photo.url ? null : (photo.photoId ?? null);

  useEffect(() => {
    if (!photoId) return;
    let cancelled = false;
    let created: string | null = null;
    setFailed(false);
    api
      .photoBlob(propertyId, photoId)
      .then((blob) => {
        if (cancelled) return;
        created = URL.createObjectURL(blob);
        setObjectUrl(created);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (created) URL.revokeObjectURL(created);
    };
  }, [propertyId, photoId]);

  if (photo.url) return <img src={photo.url} alt={alt} className={className} />;
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-sunken text-faint ${className ?? ''}`} role="img" aria-label={alt}>
        <ImageOff className="w-5 h-5" />
      </div>
    );
  }
  if (!objectUrl) return <div className={`bg-sunken animate-pulse ${className ?? ''}`} role="img" aria-label={alt} />;
  return <img src={objectUrl} alt={alt} className={className} />;
}
