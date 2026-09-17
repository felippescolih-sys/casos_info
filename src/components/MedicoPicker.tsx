import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthProvider';
import { listMedicosNomes } from '@/lib/queries/medicos';
import { criarMedicoGeral, listMedicosGeralNomes } from '@/lib/queries/medicosGeral';
import { listEspecialidadesMedicas } from '@/lib/queries/especialidadesMedicas';
import { normalize } from '@/lib/text';
import { cn } from '@/lib/cn';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Field } from '@/components/ui/Field';
import { Input, Select } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

interface MedicoPickerProps {
  value: string;
  onChange: (nome: string) => void;
  placeholder?: string;
  id?: string;
  maxVisible?: number;
}

/**
 * Busca de nome de médico (Combobox) alimentada pelo catálogo de colaboradores +
 * prospectivos, com opção de cadastrar um médico novo na hora (vira medicos_geral).
 */
export function MedicoPicker({
  value,
  onChange,
  placeholder,
  id,
  maxVisible = 8,
}: MedicoPickerProps) {
  const qc = useQueryClient();
  const { membro } = useAuth();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [showNovo, setShowNovo] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const colaboradoresQ = useQuery({
    queryKey: ['medicos', 'nomes'],
    queryFn: listMedicosNomes,
    staleTime: 3_600_000,
  });
  const prospectivosQ = useQuery({
    queryKey: ['medicos-geral', 'nomes'],
    queryFn: listMedicosGeralNomes,
    staleTime: 3_600_000,
  });
  const options = useMemo(
    () => [...new Set([...(colaboradoresQ.data ?? []), ...(prospectivosQ.data ?? [])])].sort(),
    [colaboradoresQ.data, prospectivosQ.data],
  );

  const matches = useMemo(() => {
    const q = normalize(value);
    const list = q ? options.filter((o) => normalize(o).includes(q)) : options;
    return list.slice(0, maxVisible);
  }, [value, options, maxVisible]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => setHighlight(0), [value]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  const showList = open && (matches.length > 0 || value.trim());

  return (
    <div className="relative" ref={wrapRef}>
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList || !matches.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, matches.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === 'Enter') {
            e.preventDefault();
            pick(matches[highlight]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        className={cn(
          'block w-full rounded-md border-0 bg-white px-3 py-2 text-sm text-gray-900 ring-1 ring-inset ring-gray-300',
          'placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brand-600',
        )}
      />
      {showList && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-gray-200">
          {matches.map((o, i) => (
            <li key={o}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  'block w-full px-3 py-1.5 text-left',
                  i === highlight ? 'bg-brand-50 text-brand-800' : 'text-gray-700',
                )}
              >
                {o}
              </button>
            </li>
          ))}
          <li className={matches.length ? 'border-t border-gray-100' : undefined}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setShowNovo(true);
                setOpen(false);
              }}
              className="block w-full px-3 py-1.5 text-left font-medium text-brand-700 hover:bg-brand-50"
            >
              + Cadastrar novo médico…
            </button>
          </li>
        </ul>
      )}

      {showNovo && (
        <NovoMedicoDialog
          nomeInicial={value}
          criadoPor={membro?.id ?? null}
          onCancel={() => setShowNovo(false)}
          onCriado={(nome) => {
            onChange(nome);
            setShowNovo(false);
            void qc.invalidateQueries({ queryKey: ['medicos-geral', 'nomes'] });
          }}
        />
      )}
    </div>
  );
}

function NovoMedicoDialog({
  nomeInicial,
  criadoPor,
  onCancel,
  onCriado,
}: {
  nomeInicial: string;
  criadoPor: string | null;
  onCancel: () => void;
  onCriado: (nome: string) => void;
}) {
  const [nome, setNome] = useState(nomeInicial.trim());
  const [crmUf, setCrmUf] = useState('');
  const [especialidadeId, setEspecialidadeId] = useState('');

  const especialidadesQ = useQuery({
    queryKey: ['especialidades-medicas'],
    queryFn: listEspecialidadesMedicas,
    staleTime: 3_600_000,
  });

  const criar = useMutation({
    mutationFn: () =>
      criarMedicoGeral({
        nome: nome.trim(),
        crm_uf: crmUf.trim() || undefined,
        especialidade_id: especialidadeId || undefined,
        criado_por: criadoPor ?? undefined,
      }),
    onSuccess: (row) => onCriado(row.nome),
  });

  return (
    <ConfirmDialog
      open
      title="Cadastrar novo médico"
      confirmLabel="Cadastrar"
      loading={criar.isPending}
      onConfirm={() => nome.trim() && criar.mutate()}
      onCancel={onCancel}
    >
      <div className="space-y-3 text-left">
        <p className="text-xs text-gray-500">
          Entra na lista de médicos prospectivos (ainda não confirmados como colaboradores).
        </p>
        {criar.error && <Alert tone="error">{(criar.error as Error).message}</Alert>}
        <Field label="Nome do médico" htmlFor="novo-medico-nome">
          <Input
            id="novo-medico-nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="CRM/UF" htmlFor="novo-medico-crm">
          <Input id="novo-medico-crm" value={crmUf} onChange={(e) => setCrmUf(e.target.value)} />
        </Field>
        <Field label="Especialidade" htmlFor="novo-medico-esp">
          <Select
            id="novo-medico-esp"
            value={especialidadeId}
            onChange={(e) => setEspecialidadeId(e.target.value)}
          >
            <option value="">—</option>
            {especialidadesQ.data?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </Select>
        </Field>
      </div>
    </ConfirmDialog>
  );
}
