import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { updateMembro } from '@/lib/queries/membros';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

const BUCKET = 'avatars';
const MAX_BYTES = 3 * 1024 * 1024;

export function AvatarUploader({
  membroId,
  currentUrl,
  nome,
  onDone,
}: {
  membroId: string;
  currentUrl: string | null;
  nome: string;
  onDone: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const initials = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  async function handleFile(file: File) {
    setErro(null);
    if (!file.type.startsWith('image/')) return setErro('Selecione uma imagem.');
    if (file.size > MAX_BYTES) return setErro('Imagem acima de 3 MB.');

    setLoading(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${membroId}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) throw upErr;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      await updateMembro(membroId, { avatar_url: data.publicUrl });
      await onDone();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha no upload.');
    } finally {
      setLoading(false);
    }
  }

  async function remover() {
    setLoading(true);
    setErro(null);
    try {
      await updateMembro(membroId, { avatar_url: null });
      await onDone();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao remover.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {erro && <Alert tone="error">{erro}</Alert>}
      <div className="flex items-center gap-4">
        {currentUrl ? (
          <img src={currentUrl} alt="" className="size-16 rounded-full object-cover" />
        ) : (
          <span className="grid size-16 place-items-center rounded-full bg-brand-700 text-lg font-semibold text-white">
            {initials}
          </span>
        )}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            loading={loading}
            onClick={() => inputRef.current?.click()}
          >
            Trocar
          </Button>
          {currentUrl && (
            <Button variant="ghost" size="sm" onClick={remover} disabled={loading}>
              Remover
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
