import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import {
  excluirGvpGrupo,
  listGvpGrupos,
  salvarGvpGrupo,
  type GvpGrupo,
} from '@/lib/queries/gvp';
import { listMembrosAtivos } from '@/lib/queries/membros';
import { listHospitais } from '@/lib/queries/hospitais';
import { normalize } from '@/lib/text';
import { Card, CardBody } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const tituloGrupo = (g: { numero: number; nome: string | null }) =>
  `Grupo ${g.numero}${g.nome ? ` · ${g.nome}` : ''}`;

export function GvpPage() {
  // Todo membro consulta (pra saber qual grupo cuida de qual hospital); só quem gerencia
  // vê os botões. A função do banco recusa a escrita de quem não pode.
  const { gerenciaGvp } = useAuth();
  const qc = useQueryClient();
  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState<GvpGrupo | null | undefined>(undefined); // undefined = fechado
  const [excluir, setExcluir] = useState<GvpGrupo | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const { data: grupos, isLoading, error } = useQuery({
    queryKey: ['gvp-grupos'],
    queryFn: listGvpGrupos,
  });
  const { data: hospitais } = useQuery({
    queryKey: ['hospitais', ''],
    queryFn: () => listHospitais(),
  });

  const deletar = useMutation({
    mutationFn: (g: GvpGrupo) => excluirGvpGrupo(g.id),
    onSuccess: (_r, g) => {
      setMsg(`${tituloGrupo(g)} excluído. Os hospitais e membros dele ficaram sem grupo.`);
      setExcluir(null);
      void qc.invalidateQueries({ queryKey: ['gvp-grupos'] });
    },
  });

  const termo = normalize(busca);
  const visiveis = (grupos ?? []).filter(
    (g) =>
      !termo ||
      normalize(tituloGrupo(g)).includes(termo) ||
      [g.responsavel, ...g.ajudantes, ...g.hospitais].some(
        (x) => x && normalize(x.nome).includes(termo),
      ),
  );

  const semGrupo = useMemo(() => {
    const comGrupo = new Set((grupos ?? []).flatMap((g) => g.hospitais.map((h) => h.id)));
    return (hospitais ?? []).filter((h) => h.ativo && !comGrupo.has(h.id));
  }, [grupos, hospitais]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900">GVP</h1>
        {gerenciaGvp && (
          <Button size="sm" onClick={() => setEditando(null)}>
            Novo grupo
          </Button>
        )}
      </div>

      {msg && <Alert tone="success">{msg}</Alert>}
      {deletar.error && <Alert tone="error">{(deletar.error as Error).message}</Alert>}

      <Input
        placeholder="Buscar por hospital, membro ou grupo"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="sm:max-w-sm"
      />

      {error && <Alert tone="error">{(error as Error).message}</Alert>}

      {isLoading ? (
        <div className="flex justify-center p-8 text-gray-400">
          <Spinner className="size-6" />
        </div>
      ) : !grupos?.length ? (
        <Card>
          <p className="p-8 text-center text-sm text-gray-500">
            Nenhum grupo cadastrado.
            {gerenciaGvp && ' Use “Novo grupo” para criar o primeiro.'}
          </p>
        </Card>
      ) : !visiveis.length ? (
        <p className="text-sm text-gray-500">Nenhum grupo encontrado para “{busca}”.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visiveis.map((g) => (
            <Card key={g.id}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-gray-900">{tituloGrupo(g)}</h2>
                  {gerenciaGvp && (
                    <div className="flex shrink-0 gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditando(g)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setExcluir(g)}>
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Responsável: </span>
                  {g.responsavel ? (
                    <span className="font-medium text-gray-900">{g.responsavel.nome}</span>
                  ) : (
                    <span className="text-amber-700">sem responsável</span>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Ajudantes ({g.ajudantes.length}): </span>
                  <span className="text-gray-800">
                    {g.ajudantes.map((a) => a.nome).join(', ') || '—'}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="mb-1 text-gray-500">Hospitais ({g.hospitais.length}):</p>
                  {g.hospitais.length ? (
                    <ul className="list-disc space-y-0.5 pl-5 text-gray-800">
                      {g.hospitais.map((h) => (
                        <li key={h.id}>{h.nome}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400">nenhum</p>
                  )}
                </div>
                {g.observacoes && (
                  <p className="whitespace-pre-line text-sm text-gray-600">{g.observacoes}</p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {grupos && hospitais && semGrupo.length > 0 && (
        <details className="rounded-lg bg-white p-4 text-sm shadow-sm ring-1 ring-gray-200">
          <summary className="cursor-pointer font-medium text-gray-800">
            Hospitais ativos sem grupo ({semGrupo.length})
          </summary>
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-gray-700">
            {semGrupo.map((h) => (
              <li key={h.id}>{h.nome}</li>
            ))}
          </ul>
        </details>
      )}

      {editando !== undefined && (
        <GrupoForm
          grupo={editando}
          grupos={grupos ?? []}
          onClose={() => setEditando(undefined)}
          onSaved={(texto) => {
            setMsg(texto);
            setEditando(undefined);
            void qc.invalidateQueries({ queryKey: ['gvp-grupos'] });
          }}
        />
      )}

      <ConfirmDialog
        open={!!excluir}
        title={excluir ? `Excluir ${tituloGrupo(excluir)}?` : ''}
        danger
        loading={deletar.isPending}
        confirmLabel="Excluir"
        onConfirm={() => excluir && deletar.mutate(excluir)}
        onCancel={() => setExcluir(null)}
      >
        Os hospitais e os membros deste grupo ficam sem grupo. Os membros continuam com a função
        de Membro GVP.
      </ConfirmDialog>
    </div>
  );
}

// ── formulário ───────────────────────────────────────────────

function GrupoForm({
  grupo,
  grupos,
  onClose,
  onSaved,
}: {
  grupo: GvpGrupo | null;
  grupos: GvpGrupo[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const proximoNumero = Math.max(0, ...grupos.map((g) => g.numero)) + 1;
  const [numero, setNumero] = useState(String(grupo?.numero ?? proximoNumero));
  const [nome, setNome] = useState(grupo?.nome ?? '');
  const [observacoes, setObservacoes] = useState(grupo?.observacoes ?? '');
  const [responsavel, setResponsavel] = useState<string[]>(
    grupo?.responsavel ? [grupo.responsavel.id] : [],
  );
  const [ajudantes, setAjudantes] = useState<string[]>(grupo?.ajudantes.map((a) => a.id) ?? []);
  const [hospitaisSel, setHospitaisSel] = useState<string[]>(
    grupo?.hospitais.map((h) => h.id) ?? [],
  );

  const { data: membros } = useQuery({ queryKey: ['membros-ativos'], queryFn: listMembrosAtivos });
  const { data: hospitais } = useQuery({
    queryKey: ['hospitais', ''],
    queryFn: () => listHospitais(),
  });

  // Quem/qual já está em OUTRO grupo aparece desabilitado com o número do grupo.
  const { membroEmOutro, hospitalEmOutro } = useMemo(() => {
    const m = new Map<string, number>();
    const h = new Map<string, number>();
    for (const g of grupos) {
      if (g.id === grupo?.id) continue;
      for (const x of [g.responsavel, ...g.ajudantes]) if (x) m.set(x.id, g.numero);
      for (const x of g.hospitais) h.set(x.id, g.numero);
    }
    return { membroEmOutro: m, hospitalEmOutro: h };
  }, [grupos, grupo?.id]);

  const salvar = useMutation({
    mutationFn: () =>
      salvarGvpGrupo({
        id: grupo?.id ?? null,
        numero: Number(numero),
        nome: nome.trim(),
        observacoes: observacoes.trim(),
        responsavelId: responsavel[0] ?? null,
        ajudanteIds: ajudantes,
        hospitalIds: hospitaisSel,
      }),
    onSuccess: () =>
      onSaved(grupo ? `Grupo ${numero} atualizado.` : `Grupo ${numero} criado.`),
  });

  const numeroValido = /^\d+$/.test(numero) && Number(numero) > 0;
  const membroOpcoes = (membros ?? []).map((m) => ({
    id: m.id,
    nome: m.nome,
    ocupado: membroEmOutro.has(m.id) ? `grupo ${membroEmOutro.get(m.id)}` : undefined,
  }));

  return (
    <Modal
      open
      title={grupo ? `Editar grupo ${grupo.numero}` : 'Novo grupo'}
      onClose={onClose}
      maxWidthClassName="max-w-2xl"
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (numeroValido) salvar.mutate();
        }}
      >
        {salvar.error && <Alert tone="error">{(salvar.error as Error).message}</Alert>}

        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
          <Field
            label="Número"
            htmlFor="gvp-numero"
            error={numeroValido ? undefined : 'Use um número a partir de 1'}
          >
            <Input
              id="gvp-numero"
              inputMode="numeric"
              value={numero}
              onChange={(e) => setNumero(e.target.value.trim())}
            />
          </Field>
          <Field label="Nome (opcional)" htmlFor="gvp-nome" hint="Ex.: região que o grupo atende">
            <Input id="gvp-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </Field>
        </div>

        <Picker
          label="Responsável"
          single
          opcoes={membroOpcoes.filter((o) => !ajudantes.includes(o.id))}
          selecionados={responsavel}
          onChange={setResponsavel}
          placeholder="Buscar membro pelo nome…"
        />

        <Picker
          label="Ajudantes"
          opcoes={membroOpcoes.filter((o) => !responsavel.includes(o.id))}
          selecionados={ajudantes}
          onChange={setAjudantes}
          placeholder="Buscar membro pelo nome…"
        />

        <Picker
          label="Hospitais"
          opcoes={(hospitais ?? [])
            .filter((h) => h.ativo || hospitaisSel.includes(h.id))
            .map((h) => ({
              id: h.id,
              nome: h.nome,
              ocupado: hospitalEmOutro.has(h.id) ? `grupo ${hospitalEmOutro.get(h.id)}` : undefined,
            }))}
          selecionados={hospitaisSel}
          onChange={setHospitaisSel}
          placeholder="Buscar hospital pelo nome…"
        />

        <Field label="Observações" htmlFor="gvp-obs">
          <Textarea
            id="gvp-obs"
            rows={3}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </Field>

        <div className="flex gap-2">
          <Button type="submit" loading={salvar.isPending} disabled={!numeroValido}>
            Salvar
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

interface Opcao {
  id: string;
  nome: string;
  /** Já está em outro grupo (ex.: "grupo 2"): aparece, mas não dá para escolher. */
  ocupado?: string;
}

/** Busca com lista de sugestões + os escolhidos como etiquetas removíveis. */
function Picker({
  label,
  opcoes,
  selecionados,
  onChange,
  placeholder,
  single = false,
}: {
  label: string;
  opcoes: Opcao[];
  selecionados: string[];
  onChange: (ids: string[]) => void;
  placeholder: string;
  single?: boolean;
}) {
  const [busca, setBusca] = useState('');
  const porId = useMemo(() => new Map(opcoes.map((o) => [o.id, o])), [opcoes]);
  const termo = normalize(busca);
  const sugestoes = termo
    ? opcoes
        .filter((o) => !selecionados.includes(o.id) && normalize(o.nome).includes(termo))
        .slice(0, 8)
    : [];

  function escolher(id: string) {
    onChange(single ? [id] : [...selecionados, id]);
    setBusca('');
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">
        {label}
        {!single && selecionados.length > 0 && (
          <span className="font-normal text-gray-500"> ({selecionados.length})</span>
        )}
      </p>
      {selecionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selecionados.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-sm text-brand-800"
            >
              {porId.get(id)?.nome ?? '…'}
              <button
                type="button"
                aria-label={`Remover ${porId.get(id)?.nome ?? ''}`}
                onClick={() => onChange(selecionados.filter((s) => s !== id))}
                className="rounded-full px-1.5 text-brand-700 hover:bg-brand-100"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
      {(!single || !selecionados.length) && (
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
        />
      )}
      {termo && (
        <div className="divide-y divide-gray-100 rounded-md ring-1 ring-gray-200">
          {sugestoes.length ? (
            sugestoes.map((o) => (
              <button
                key={o.id}
                type="button"
                disabled={!!o.ocupado}
                onClick={() => escolher(o.id)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
              >
                <span>{o.nome}</span>
                {o.ocupado && <span className="text-xs">já no {o.ocupado}</span>}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-gray-500">Nada encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
