import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { anexoUrl, deleteAnexo, listAnexos, uploadAnexo } from '@/lib/queries/casos';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import type { CasoAnexoRow, CasoRow } from '@/types/database';

const MAX_BYTES = 25 * 1024 * 1024;

function tamanho(b: number | null) {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function AnexosUploader({ caso }: { caso: CasoRow }) {
  const qc = useQueryClient();
  const { membro, isAdminGeral } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [erro, setErro] = useState<string | null>(null);

  const podeEditar =
    caso.status === 'aberto' &&
    (isAdminGeral ||
      caso.responsavel_id === membro?.id ||
      caso.ajudante_id === membro?.id);

  const anexosQ = useQuery({
    queryKey: ['anexos', caso.id],
    queryFn: () => listAnexos(caso.id),
  });

  const upload = useMutation({
    mutationFn: (files: File[]) =>
      Promise.all(files.map((f) => uploadAnexo(caso.id, f, membro!.id))),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anexos', caso.id] }),
    onError: (e) => setErro((e as Error).message),
  });

  const remove = useMutation({
    mutationFn: (a: CasoAnexoRow) => deleteAnexo(a),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['anexos', caso.id] }),
    onError: (e) => setErro((e as Error).message),
  });

  async function abrir(a: CasoAnexoRow) {
    const url = await anexoUrl(a.storage_path);
    if (url) window.open(url, '_blank', 'noopener');
    else setErro('Não foi possível gerar o link do arquivo.');
  }

  function escolher(list: FileList | null) {
    setErro(null);
    if (!list?.length) return;
    const files = [...list];
    const grande = files.find((f) => f.size > MAX_BYTES);
    if (grande) {
      setErro(`"${grande.name}" passa de 25 MB.`);
      return;
    }
    upload.mutate(files);
  }

  return (
    <div className="space-y-2">
      {erro && <Alert tone="error">{erro}</Alert>}

      {anexosQ.isLoading ? (
        <Spinner className="size-5 text-gray-400" />
      ) : anexosQ.data?.length ? (
        <ul className="divide-y divide-gray-100 rounded-md ring-1 ring-gray-200">
          {anexosQ.data.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <button
                type="button"
                onClick={() => abrir(a)}
                className="min-w-0 truncate text-left text-brand-700 hover:underline"
              >
                {a.nome}
              </button>
              <div className="flex shrink-0 items-center gap-3 text-xs text-gray-400">
                {tamanho(a.tamanho)}
                {podeEditar && (
                  <button
                    type="button"
                    onClick={() => remove.mutate(a)}
                    disabled={remove.isPending}
                    className="text-red-600 hover:underline"
                  >
                    remover
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">Nenhum arquivo.</p>
      )}

      {podeEditar && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={upload.isPending}
            onClick={() => inputRef.current?.click()}
          >
            Enviar arquivo
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              escolher(e.target.files);
              e.target.value = '';
            }}
          />
        </>
      )}
    </div>
  );
}
