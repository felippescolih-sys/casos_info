import { useMemo, useState } from 'react';
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
import { boolLabel, formatDateTime } from '@/lib/format';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CasoStatusBadge } from '@/components/ui/Badge';
import {
  Band,
  BlockCell,
  Cell,
  CheckRow,
  PageMark,
  Row,
  Sheet,
  SheetTitle,
  V,
  ValoresReferencia,
} from './hlc7-ui';
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
    <div className="mx-auto max-w-4xl space-y-4 pb-10">
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
        <>
          <TopBar caso={completo.data} />
          <PendingTransferCard
            casoId={id}
            pendentePara={completo.data.transferencia_pendente_para}
            onChanged={onChanged}
          />
          <CaseActions caso={completo.data} onChanged={onChanged} />
          <HLC7View caso={completo.data} />
        </>
      ) : resumo.isLoading ? (
        <Loading />
      ) : resumo.data ? (
        <div className="space-y-4">
          <TopBar
            caso={{
              id_caso: resumo.data.id_caso,
              numero: resumo.data.numero,
              status: resumo.data.status,
              paciente_nome: resumo.data.paciente_nome,
            }}
          />
          <PendingTransferCard
            casoId={id}
            pendentePara={resumo.data.transferencia_pendente_para}
            onChanged={onChanged}
          />
          <Alert tone="info">
            O prontuário completo é visível apenas ao responsável, ao ajudante e à administração
            geral.
          </Alert>
          <Sheet>
            <Band tone="green">Resumo</Band>
            <Row cols={2}>
              <Cell label="Responsável">
                <V>{resumo.data.responsavel_nome}</V>
              </Cell>
              <Cell label="Ajudante">
                <V>{resumo.data.ajudante_nome}</V>
              </Cell>
              <Cell label="Hospital">
                <V>{resumo.data.hospital_nome}</V>
              </Cell>
              <Cell label="Congregação">
                <V>{resumo.data.congregacao}</V>
              </Cell>
              <Cell label="Cidade / UF">
                <V>{[resumo.data.cidade, resumo.data.uf].filter(Boolean).join(' / ') || null}</V>
              </Cell>
              <Cell label="Aberto em">
                <V>{formatDateTime(resumo.data.aberto_em)}</V>
              </Cell>
            </Row>
          </Sheet>
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

function TopBar({
  caso,
}: {
  caso: Pick<CasoRow, 'id_caso' | 'numero' | 'status' | 'paciente_nome'>;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-xl font-semibold text-gray-900">
        {caso.paciente_nome ?? '(sem nome)'}
      </h1>
      {caso.id_caso && <span className="font-mono text-sm text-gray-400">{caso.id_caso}</span>}
      {caso.numero != null && <span className="text-sm text-gray-400">#{caso.numero}</span>}
      <CasoStatusBadge status={caso.status} />
    </div>
  );
}

// ── HLC-7 (só leitura) ───────────────────────────────────────

function HLC7View({ caso: c }: { caso: CasoRow }) {
  const sim = (v: boolean | null | undefined) => boolLabel(v);
  return (
    <Sheet>
      <SheetTitle>Planilha de Emergência Médica</SheetTitle>

      <Band tone="green">Notificação</Band>
      <Row cols={3}>
        <Cell label="Data/hora do contato">
          <V>{c.data_hora_contato}</V>
        </Cell>
        <Cell label="Quem telefonou">
          <V>{c.nome_telefonou}</V>
        </Cell>
        <Cell label="Contato de quem telefonou">
          <V>{c.contato_telefonou}</V>
        </Cell>
      </Row>
      <Row cols={2}>
        <Cell label="Paciente solicitou ajuda da Colih">
          <V>{sim(c.paciente_solicitou_ajuda)}</V>
        </Cell>
        <Cell label="Parentesco com o paciente">
          <V>{c.parentesco_telefonou}</V>
        </Cell>
      </Row>

      <Band tone="green">Informações sobre o paciente e o hospital</Band>
      <Row cols={2}>
        <Cell label="Nome do paciente">
          <V>{c.paciente_nome}</V>
        </Cell>
        <Cell label="Sexo">
          <V>{c.sexo}</V>
        </Cell>
        <Cell label="Comentários (plano de saúde)">
          <V>{c.comentario_plano}</V>
        </Cell>
        <Cell label="Idade">
          <V>{c.idade}</V>
        </Cell>
        <Cell label="Nome do pai">
          <V>{c.nome_pai}</V> · Batizado? <V>{sim(c.pai_batizado)}</V>
        </Cell>
        <Cell label="Nome da mãe">
          <V>{c.nome_mae}</V> · Batizada? <V>{sim(c.mae_batizada)}</V>
        </Cell>
      </Row>
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-300 px-3 py-2 text-sm text-gray-700">
        <span>Paciente batizado? <V>{sim(c.batizado)}</V></span>
        <span>Boa condição espiritual? <V>{sim(c.boa_condicao_espiritual)}</V></span>
        <span>Cartão Diretivas completo? <V>{sim(c.cartao_diretivas_ok)}</V></span>
      </div>
      <BlockCell label="Comentários (condição espiritual da família)">
        <V>{c.comentario_familia}</V>
      </BlockCell>
      <Row cols={1}>
        <Cell label="Nome do hospital">
          <V>{c.hospital_nome}</V>
        </Cell>
      </Row>
      <Row cols={4}>
        <Cell label="N.° do quarto">
          <V>{c.num_quarto}</V>
        </Cell>
        <Cell label="Telefone do hospital">
          <V>{c.tele_hospital}</V>
        </Cell>
        <Cell label="Tipo de atendimento">
          <V>{c.tipo_atendimento}</V>
        </Cell>
        <Cell label="Plano / convênio">
          <V>{c.plano_nome}</V>
        </Cell>
      </Row>
      <Row cols={2}>
        <Cell label="Congregação">
          <V>{c.congregacao}</V>
        </Cell>
        <Cell label="Cidade / UF">
          <V>{[c.cidade, c.uf].filter(Boolean).join(' / ') || null}</V>
        </Cell>
      </Row>
      <Row cols={2}>
        <Cell label="Nomes dos anciãos contatados">
          <V>{c.anciaos_contatados}</V>
        </Cell>
        <Cell label="Telefones de contato dos anciãos">
          <V>{c.anciaos_cont_tel}</V>
        </Cell>
      </Row>

      {(c.rn_peso ||
        c.rn_idade_gestacional ||
        c.rn_data_nascimento ||
        c.rn_apgar_nascimento ||
        c.rn_apgar_5min) && (
        <>
          <Band tone="green">Recém-nascidos</Band>
          <Row cols={3}>
            <Cell label="Peso ao nascer">
              <V>{c.rn_peso}</V>
            </Cell>
            <Cell label="Idade gestacional (semanas)">
              <V>{c.rn_idade_gestacional}</V>
            </Cell>
            <Cell label="Data de nascimento">
              <V>{c.rn_data_nascimento}</V>
            </Cell>
            <Cell label="APGAR — nascimento">
              <V>{c.rn_apgar_nascimento}</V>
            </Cell>
            <Cell label="APGAR — 5 min">
              <V>{c.rn_apgar_5min}</V>
            </Cell>
          </Row>
        </>
      )}

      <Band tone="green">Informações médicas sobre o caso</Band>
      <BlockCell label="Problema específico">
        <V>{c.morbidade}</V>
      </BlockCell>
      <BlockCell label="Histórico de saúde ligado ao problema">
        <V>{c.info_medica}</V>
      </BlockCell>

      <Band tone="orange">Valores laboratoriais</Band>
      {c.exames.length === 0 ? (
        <div className="border-b border-gray-300 px-3 py-2 text-sm text-gray-300">—</div>
      ) : (
        <div className="overflow-x-auto border-b border-gray-300 px-3 py-2">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="py-1 pr-4">Data/hora</th>
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
      )}
      <ValoresReferencia />

      <Band tone="green">Informações sobre o(s) médico(s)</Band>
      <Row cols={2}>
        <Cell label="Médico responsável">
          <V>{c.medico_responsavel}</V>
        </Cell>
        <Cell label="Especialidade">
          <V>{c.especialidade}</V>
        </Cell>
        <Cell label="Outro médico">
          <V>{c.outro_medico}</V>
        </Cell>
        <Cell label="Especialidade">
          <V>{c.outro_medico_especialidade}</V>
        </Cell>
      </Row>

      <Band tone="green" hint="Exames, procedimentos ou tratamentos oferecidos">
        Plano de tratamento médico
      </Band>
      <CheckRow>
        Equipe médica informada de que o paciente pediu ajuda da Colih?{' '}
        <V>{sim(c.equipe_informada)}</V>
      </CheckRow>
      <BlockCell>
        <V>{c.plano_tratamento}</V>
      </BlockCell>

      <PageMark>Página 2</PageMark>

      <Band tone="blue">Estratégias / opções de tratamento</Band>
      <BlockCell>
        <V>{c.estrategia}</V>
      </BlockCell>

      <Band tone="blue">Artigos médicos</Band>
      <BlockCell>
        <V>{c.artigos_medicos}</V>
      </BlockCell>
      <CheckRow>
        Médico disposto a cooperar após analisar os artigos? <V>{sim(c.medico_disposto_cooperar)}</V>
      </CheckRow>

      <Band tone="blue">Contato de um médico consultor</Band>
      <Row cols={2}>
        <Cell label="Nome do médico consultor">
          <V>{c.medico_consultor_nome}</V>
        </Cell>
        <Cell label="Preferências de contato">
          <V>{c.medico_consultor_contato}</V>
        </Cell>
        <Cell label="Especialidade">
          <V>{c.medico_consultor_especialidade}</V>
        </Cell>
        <Cell label="Outras informações">
          <V>{c.medico_consultor_outras}</V>
        </Cell>
      </Row>

      <Band tone="blue">Necessidade de transferência (mudança de hospital)</Band>
      <div className="flex flex-wrap gap-x-6 gap-y-1 border-b border-gray-300 px-3 py-2 text-sm text-gray-700">
        <span>Procedimentos confirmados? <V>{sim(c.transf_procedimentos_confirmados)}</V></span>
        <span>HID informado? <V>{sim(c.transf_hid_informado)}</V></span>
      </div>
      <Row cols={1}>
        <Cell label="Hospital de destino">
          <V>{c.transf_hospital_destino}</V>
        </Cell>
      </Row>
      <Row cols={2}>
        <Cell label="Médico responsável no destino">
          <V>{c.transf_medico_destino}</V>
        </Cell>
        <Cell label="Telefone no destino">
          <V>{c.transf_telefone_destino}</V>
        </Cell>
      </Row>
      <BlockCell label="Outras informações">
        <V>{c.outras_infos}</V>
      </BlockCell>

      <Band tone="orange">Resultado / acompanhamento</Band>
      <CheckRow>
        Anciãos locais contatados para acompanhamento? <V>{sim(c.anciaos_acompanhamento)}</V>
      </CheckRow>
      <BlockCell>
        <V>{c.resumo}</V>
      </BlockCell>

      <Band tone="green">Controle interno (Casos Info)</Band>
      <Row cols={2}>
        <Cell label="Responsável">
          <V>{c.responsavel_nome}</V>
        </Cell>
        <Cell label="Ajudante">
          <V>{c.ajudante_nome}</V>
        </Cell>
        <Cell label="Tags">
          <V>{c.tags.join(', ') || null}</V>
        </Cell>
        <Cell label="Marcadores">
          <V>
            {[c.transpac && 'Transpac', c.transfundido && 'Transfundido', c.gvp && 'GVP']
              .filter(Boolean)
              .join(' · ') || null}
          </V>
        </Cell>
      </Row>
      {c.transferencia_historico && (
        <BlockCell label="Histórico de transferências (responsável)">
          <V>{c.transferencia_historico}</V>
        </BlockCell>
      )}
      {c.anexos_urls.length > 0 && (
        <BlockCell label="Anexos">
          <ul className="space-y-1">
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
        </BlockCell>
      )}
      <CamposAdicionais raw={c.bubble_raw} />
      <div className="px-3 py-2 text-[11px] text-gray-400">
        Aberto em {formatDateTime(c.aberto_em)} · Encerrado em {formatDateTime(c.encerrado_em)} ·
        Atualização no Bubble {formatDateTime(c.atualizado_em_bubble)}
      </div>
    </Sheet>
  );
}

function CamposAdicionais({ raw }: { raw: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(raw).filter(
    ([, v]) => v !== null && v !== '' && !(Array.isArray(v) && v.length === 0),
  );
  if (entries.length === 0) return null;
  return (
    <div className="border-b border-gray-300">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-700"
      >
        Campos adicionais (registro do Bubble)
        <span className="text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <dl className="space-y-1 px-3 pb-3">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-3 text-sm">
              <dt className="w-56 shrink-0 font-mono text-xs text-gray-500">{k}</dt>
              <dd className="whitespace-pre-wrap break-words text-gray-800">
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </dd>
            </div>
          ))}
        </dl>
      )}
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
        O caso volta a ficar aberto. Os dados já anonimizados <strong>não voltam</strong>.
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
