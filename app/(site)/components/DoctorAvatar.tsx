'use client';

import { useState } from 'react';

interface DoctorAvatarProps {
  src: string;
  alt: string;
  className?: string;
}

export default function DoctorAvatar({ src, alt, className }: DoctorAvatarProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => setImgSrc('https://via.placeholder.com/200.png?text=Foto')}
    />
  );
}
