import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCasoCompleto, getCasoResumo } from '@/lib/queries/casos';
import { formatDate, formatDateTime } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { CasoStatusBadge } from '@/components/ui/Badge';
import type { CasoRow } from '@/types/database';

export function CasoDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();

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
        <div className="flex justify-center p-8 text-gray-400">
          <Spinner className="size-6" />
        </div>
      ) : completo.data ? (
        <CasoCompleto caso={completo.data} />
      ) : resumo.isLoading ? (
        <div className="flex justify-center p-8 text-gray-400">
          <Spinner className="size-6" />
        </div>
      ) : resumo.data ? (
        <div className="space-y-4">
          <Header
            nome={resumo.data.paciente_nome}
            idCaso={resumo.data.id_caso}
            status={resumo.data.status}
          />
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

function CasoCompleto({ caso: c }: { caso: CasoRow }) {
  return (
    <div className="space-y-4">
      <Header nome={c.paciente_nome} idCaso={c.id_caso} status={c.status} />

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
        <Detail label="Data" value={formatDateTime(c.transferencia_data)} />
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
      <dt className={block ? 'text-xs font-medium uppercase text-gray-500' : 'w-44 shrink-0 text-gray-500'}>
        {label}
      </dt>
      <dd className={block ? 'whitespace-pre-wrap text-sm text-gray-800' : 'text-gray-800'}>
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
