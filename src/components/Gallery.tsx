'use client';
import { useState } from 'react';
import Image from 'next/image';
import Placeholder from './Placeholder';

export default function Gallery({ images, name, brand }: { images: string[]; name: string; brand: string | null }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-line">
        {images.length
          ? <Image src={images[i]} alt={name} fill priority sizes="(max-width:768px) 100vw, 50vw" className="object-contain bg-white" />
          : <Placeholder label={brand} />}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, n) => (
            <button key={src} type="button" onClick={() => setI(n)} aria-label={`Show image ${n + 1}`}
              className={`relative size-16 shrink-0 overflow-hidden rounded border-2 ${n === i ? 'border-gold' : 'border-line'}`}>
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
