'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ImageManager({ initial }: { initial: string[] }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError('');
    const supabase = createClient();
    const added: string[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) { setError('Only image files can be uploaded.'); continue; }
      if (file.size > 5 * 1024 * 1024) { setError(`${file.name} is larger than 5 MB.`); continue; }
      const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: e } = await supabase.storage.from('product-images').upload(path, file, { cacheControl: '31536000', upsert: false });
      if (e) { setError(`Upload failed: ${e.message}`); continue; }
      added.push(supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl);
    }
    setUrls((u) => [...u, ...added]); setBusy(false);
  }
  const move = (i: number, d: number) => setUrls((u) => { const c = [...u]; const j = i + d; if (j < 0 || j >= c.length) return c; [c[i], c[j]] = [c[j], c[i]]; return c; });

  return (
    <div>
      <input type="hidden" name="images" value={JSON.stringify(urls)} />
      <div className="flex flex-wrap gap-3">
        {urls.map((u, i) => (
          <div key={u} className="w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="size-28 rounded border border-line object-cover" />
            <div className="mt-1 flex justify-between text-xs">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier" className="px-1 disabled:opacity-30">←</button>
              <button type="button" onClick={() => setUrls((x) => x.filter((_, n) => n !== i))} className="text-red-700 underline">Remove</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === urls.length - 1} aria-label="Move later" className="px-1 disabled:opacity-30">→</button>
            </div>
            {i === 0 && <p className="text-center text-xs font-semibold text-gold-deep">Main photo</p>}
          </div>
        ))}
      </div>
      <label className="btn btn-outline mt-3 inline-flex">
        {busy ? 'Uploading…' : 'Upload photos'}
        <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} disabled={busy} />
      </label>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
