import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import {
  aceitarTransferencia,
  encerrarCaso,
  getCasoCompleto,
  getCasoResumo,
  listMembrosParaSelecao,
  reabrirCaso,
  recusarTransferencia,
  transferirCaso,
} from '@/lib/queries/casos';
import { formatDate, formatDateTime } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CasoStatusBadge } from '@/components/ui/Badge';
import type { CasoRow } from '@/types/database';

export function CasoDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const completo = useQuery({
    queryKey: ['caso', id, 'completo'],
    queryFn: () => getCasoCompleto(id),
  });
  const resumo = useQuery({
    queryKey: ['caso', id, 'resumo'],
    queryFn: () => getCasoResumo(id),
    enabled: completo.isSuccess && completo.data === null,
  });

  const err = completo.error ?? resumo.error;
  const onChanged = () => {
    void qc.invalidateQueries({ queryKey: ['caso', id] });
    void qc.invalidateQueries({ queryKey: ['casos'] });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button
        onClick={() => navigate('/casos')}
        className="text-sm text-gray-500 hover:text-gray-800"
      >
        ← Voltar para casos
      </button>

      {err && <Alert tone="error">{(err as Error).message}</Alert>}

      {completo.isLoading ? (
        <Loading />
      ) : completo.data ? (
        <CasoCompleto caso={completo.data} onChanged={onChanged} />
      ) : resumo.isLoading ? (
        <Loading />
      ) : resumo.data ? (
        <div className="space-y-4">
          <Header
            nome={resumo.data.paciente_nome}
            idCaso={resumo.data.id_caso}
            status={resumo.data.status}
          />
          <PendingTransferCard casoId={id} pendentePara={resumo.data.transferencia_pendente_para} onChanged={onChanged} />
          <Alert tone="info">
            Acesso completo ao caso (prontuário) é restrito ao responsável, ao ajudante e à
            administração geral.
          </Alert>
          <Section title="Resumo">
            <Detail label="Responsável" value={resumo.data.responsavel_nome} />
            <Detail label="Ajudante" value={resumo.data.ajudante_nome} />
            <Detail label="Hospital" value={resumo.data.hospital_nome} />
            <Detail label="Congregação" value={resumo.data.congregacao} />
            <Detail
              label="Cidade / UF"
              value={[resumo.data.cidade, resumo.data.uf].filter(Boolean).join(' / ') || null}
            />
            <Detail label="Aberto em" value={formatDate(resumo.data.aberto_em)} />
            {resumo.data.status === 'encerrado' && (
              <Detail label="Encerrado em" value={formatDate(resumo.data.encerrado_em)} />
            )}
          </Section>
        </div>
      ) : (
        <Alert tone="warning">Caso não encontrado.</Alert>
      )}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center p-8 text-gray-400">
      <Spinner className="size-6" />
    </div>
  );
}

function CasoCompleto({ caso: c, onChanged }: { caso: CasoRow; onChanged: () => void }) {
  return (
    <div className="space-y-4">
      <Header nome={c.paciente_nome} idCaso={c.id_caso} status={c.status} />
      <PendingTransferCard
        casoId={c.id}
        pendentePara={c.transferencia_pendente_para}
        onChanged={onChanged}
      />
      <CaseActions caso={c} onChanged={onChanged} />

      <Section title="Paciente">
        <Detail label="Idade" value={c.idade} />
        <Detail label="Sexo" value={c.sexo} />
        <Detail
          label="Cidade / UF"
          value={[c.cidade, c.uf].filter(Boolean).join(' / ') || null}
        />
        <Detail label="Congregação" value={c.congregacao} />
        <Detail label="Batizado" value={simNao(c.batizado)} />
        <Detail label="Nome da mãe" value={c.nome_mae} />
        <Detail label="Mãe batizada" value={simNao(c.mae_batizada)} />
        <Detail label="Nome do pai" value={c.nome_pai} />
        <Detail label="Pai batizado" value={simNao(c.pai_batizado)} />
      </Section>

      <Section title="Responsáveis">
        <Detail label="Responsável" value={c.responsavel_nome} />
        <Detail label="Ajudante" value={c.ajudante_nome} />
        <Detail label="Em grupo (GVP)" value={simNao(c.gvp)} />
      </Section>

      <Section title="Contato">
        <Detail label="Quem telefonou" value={c.nome_telefonou} />
        <Detail label="Parentesco" value={c.parentesco_telefonou} />
        <Detail label="Paciente solicitou ajuda" value={simNao(c.paciente_solicitou_ajuda)} />
        <Detail label="Acompanhante" value={c.acompanhante_nome} />
        <Detail label="Telefone do paciente" value={c.telefone_paciente} />
        <Detail label="Telefone do acompanhante" value={c.telefone_acompanhante} />
        <Detail label="Anciãos contatados" value={c.anciaos_contatados} />
        <Detail label="Telefone dos anciãos" value={c.anciaos_cont_tel} />
      </Section>

      <Section title="Atendimento">
        <Detail label="Hospital" value={c.hospital_nome} />
        <Detail label="Quarto" value={c.num_quarto} />
        <Detail label="Telefone do hospital" value={c.tele_hospital} />
        <Detail label="Tipo" value={c.tipo_atendimento} />
        <Detail label="Plano" value={c.plano_nome} />
      </Section>

      <Section title="Médico / clínico">
        <Detail label="Médico responsável" value={c.medico_responsavel} />
        <Detail label="Especialidade" value={c.especialidade} />
        <Detail label="Morbidade" value={c.morbidade} />
        <Detail label="Estratégia / opções" value={c.estrategia} block />
        <Detail label="Plano de tratamento" value={c.plano_tratamento} block />
        <Detail label="Artigos médicos" value={c.artigos_medicos} block />
        <Detail label="Resumo" value={c.resumo} block />
        <Detail label="Outras informações" value={c.outras_infos} block />
        <Detail label="Histórico do caso" value={c.info_medica} block />
      </Section>

      {c.exames.length > 0 && (
        <Section title="Exames">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-1 pr-4">Data</th>
                  <th className="py-1 pr-4">Hb</th>
                  <th className="py-1 pr-4">Ht</th>
                  <th className="py-1 pr-4">Plaquetas</th>
                  <th className="py-1">Outro</th>
                </tr>
              </thead>
              <tbody>
                {c.exames.map((e, i) => (
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-1 pr-4">{e.data ?? '—'}</td>
                    <td className="py-1 pr-4">{e.hb ?? '—'}</td>
                    <td className="py-1 pr-4">{e.ht ?? '—'}</td>
                    <td className="py-1 pr-4">{e.plq ?? '—'}</td>
                    <td className="py-1">{e.outro ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section title="Transferência">
        <Detail label="Em transferência" value={simNao(c.em_transferencia)} />
        <Detail label="Última transferência" value={formatDateTime(c.transferencia_data)} />
        <Detail label="Transpac" value={simNao(c.transpac)} />
        <Detail label="Transfundido" value={simNao(c.transfundido)} />
        <Detail label="Histórico" value={c.transferencia_historico} block />
      </Section>

      {c.anexos_urls.length > 0 && (
        <Section title="Anexos">
          <ul className="space-y-1 text-sm">
            {c.anexos_urls.map((u, i) => (
              <li key={i}>
                <a
                  href={u}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-700 hover:underline"
                >
                  {decodeURIComponent(u.split('/').pop() || `anexo ${i + 1}`)}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <CamposAdicionais raw={c.bubble_raw} />

      <Card>
        <CardBody className="text-xs text-gray-500">
          Aberto em {formatDateTime(c.aberto_em)} · Encerrado em{' '}
          {formatDateTime(c.encerrado_em)} · Última atualização no Bubble{' '}
          {formatDateTime(c.atualizado_em_bubble)}
        </CardBody>
      </Card>
    </div>
  );
}

// ── ações ────────────────────────────────────────────────────

function CaseActions({ caso: c, onChanged }: { caso: CasoRow; onChanged: () => void }) {
  const { membro, isAdminGeral } = useAuth();
  const podeOperar =
    isAdminGeral || c.responsavel_id === membro?.id || c.ajudante_id === membro?.id;

  const [dialog, setDialog] = useState<'transferir' | 'encerrar' | 'reabrir' | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const encerrar = useMutation({
    mutationFn: () => encerrarCaso(c.id),
    onSuccess: () => {
      setDialog(null);
      onChanged();
    },
    onError: (e) => setErro((e as Error).message),
  });
  const reabrir = useMutation({
    mutationFn: () => reabrirCaso(c.id),
    onSuccess: () => {
      setDialog(null);
      onChanged();
    },
    onError: (e) => setErro((e as Error).message),
  });

  if (!podeOperar && !(c.status === 'encerrado' && isAdminGeral)) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {erro && (
        <div className="w-full">
          <Alert tone="error">{erro}</Alert>
        </div>
      )}

      {c.status === 'aberto' && podeOperar && (
        <>
          <Link
            to={`/casos/${c.id}/editar`}
            className="inline-flex h-8 items-center rounded-md bg-brand-700 px-3 text-sm font-medium text-white hover:bg-brand-800"
          >
            Editar
          </Link>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDialog('transferir')}
            disabled={!!c.transferencia_pendente_para}
          >
            Transferir
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDialog('encerrar')}>
            Encerrar
          </Button>
        </>
      )}

      {c.status === 'encerrado' && isAdminGeral && (
        <Button variant="secondary" size="sm" onClick={() => setDialog('reabrir')}>
          Reabrir
        </Button>
      )}

      {dialog === 'transferir' && (
        <TransferDialog
          casoId={c.id}
          excluir={[c.responsavel_id, membro?.id].filter(Boolean) as string[]}
          onClose={() => setDialog(null)}
          onDone={onChanged}
        />
      )}

      <ConfirmDialog
        open={dialog === 'encerrar'}
        title="Encerrar caso"
        danger
        confirmLabel="Encerrar"
        loading={encerrar.isPending}
        onConfirm={() => encerrar.mutate()}
        onCancel={() => setDialog(null)}
      >
        Ao encerrar, os dados do paciente e da família são <strong>anonimizados</strong> (nome vira
        iniciais, telefones viram “x”). Isso não pode ser desfeito.
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'reabrir'}
        title="Reabrir caso"
        confirmLabel="Reabrir"
        loading={reabrir.isPending}
        onConfirm={() => reabrir.mutate()}
        onCancel={() => setDialog(null)}
      >
        O caso volta a ficar aberto. Os dados que já foram anonimizados no encerramento{' '}
        <strong>não voltam</strong>.
      </ConfirmDialog>
    </div>
  );
}

function TransferDialog({
  casoId,
  excluir,
  onClose,
  onDone,
}: {
  casoId: string;
  excluir: string[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [alvo, setAlvo] = useState('');
  const { data: membros } = useQuery({
    queryKey: ['membros-selecao'],
    queryFn: listMembrosParaSelecao,
  });
  const opcoes = useMemo(
    () => (membros ?? []).filter((m) => !excluir.includes(m.id)),
    [membros, excluir],
  );
  const mut = useMutation({
    mutationFn: () => transferirCaso(casoId, alvo),
    onSuccess: () => {
      onDone();
      onClose();
    },
  });

  return (
    <ConfirmDialog
      open
      title="Transferir caso"
      confirmLabel="Transferir"
      loading={mut.isPending}
      onConfirm={() => alvo && mut.mutate()}
      onCancel={onClose}
    >
      <div className="space-y-2">
        <p>O novo responsável precisa aceitar a transferência para assumir o caso.</p>
        <Select value={alvo} onChange={(e) => setAlvo(e.target.value)}>
          <option value="">Escolha o membro…</option>
          {opcoes.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </Select>
        {mut.error && <Alert tone="error">{(mut.error as Error).message}</Alert>}
      </div>
    </ConfirmDialog>
  );
}

function PendingTransferCard({
  casoId,
  pendentePara,
  onChanged,
}: {
  casoId: string;
  pendentePara: string | null;
  onChanged: () => void;
}) {
  const { membro } = useAuth();
  const aceitar = useMutation({
    mutationFn: () => aceitarTransferencia(casoId),
    onSuccess: onChanged,
  });
  const recusar = useMutation({
    mutationFn: () => recusarTransferencia(casoId),
    onSuccess: onChanged,
  });

  if (!pendentePara || pendentePara !== membro?.id) return null;
  const err = aceitar.error ?? recusar.error;

  return (
    <Card className="ring-amber-300">
      <CardBody className="space-y-3">
        <p className="text-sm font-medium text-amber-900">
          Este caso foi transferido para você. Aceite para assumir a responsabilidade.
        </p>
        {err && <Alert tone="error">{(err as Error).message}</Alert>}
        <div className="flex gap-2">
          <Button size="sm" loading={aceitar.isPending} onClick={() => aceitar.mutate()}>
            Aceitar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            loading={recusar.isPending}
            onClick={() => recusar.mutate()}
          >
            Recusar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ── helpers de layout ────────────────────────────────────────

function Header({
  nome,
  idCaso,
  status,
}: {
  nome: string | null;
  idCaso: string | null;
  status: CasoRow['status'];
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-xl font-semibold text-gray-900">{nome ?? '(sem nome)'}</h1>
      {idCaso && <span className="font-mono text-sm text-gray-400">{idCaso}</span>}
      <CasoStatusBadge status={status} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-medium text-gray-900">{title}</h2>
      </CardHeader>
      <CardBody>
        <dl className="space-y-2.5">{children}</dl>
      </CardBody>
    </Card>
  );
}

function Detail({
  label,
  value,
  block,
}: {
  label: string;
  value: string | null | undefined;
  block?: boolean;
}) {
  if (!value || value === '—') return null;
  return (
    <div className={block ? 'space-y-1' : 'flex gap-3'}>
      <dt
        className={
          block
            ? 'text-xs font-medium uppercase text-gray-500'
            : 'w-44 shrink-0 text-gray-500'
        }
      >
        {label}
      </dt>
      <dd
        className={block ? 'whitespace-pre-wrap text-sm text-gray-800' : 'text-gray-800'}
      >
        {value}
      </dd>
    </div>
  );
}

function CamposAdicionais({ raw }: { raw: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(raw).filter(
    ([, v]) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0),
  );
  if (entries.length === 0) return null;
  return (
    <Card>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left sm:px-6"
      >
        <span className="font-medium text-gray-900">
          Campos adicionais (registro do Bubble)
        </span>
        <span className="text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <CardBody className="border-t border-gray-100">
          <dl className="space-y-2">
            {entries.map(([k, v]) => (
              <div key={k} className="flex gap-3 text-sm">
                <dt className="w-56 shrink-0 font-mono text-xs text-gray-500">{k}</dt>
                <dd className="whitespace-pre-wrap break-words text-gray-800">
                  {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      )}
    </Card>
  );
}

const simNao = (v: boolean | null | undefined) =>
  v === true ? 'Sim' : v === false ? 'Não' : null;
