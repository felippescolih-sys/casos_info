import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  codigoWhatsapp,
  desconectarWhatsapp,
  iniciarWhatsapp,
  qrWhatsapp,
  statusWhatsapp,
} from '@/lib/queries/whatsapp';
import { formatDateTime } from '@/lib/format';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/cn';

// 5541999998888 → +55 (41) 99999-8888
function formatarNumero(n: string | null): string {
  const m = (n ?? '').match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return m ? `+55 (${m[1]}) ${m[2]}-${m[3]}` : (n ?? '');
}

/**
 * Conexão do celular da COLIH com o WhatsApp do sistema (WAHA). Só superadmin: quem está
 * com o celular conecta e reconecta por aqui, sem depender de quem mantém o sistema.
 */
export function WhatsappPage() {
  const qc = useQueryClient();
  const [modo, setModo] = useState<'qr' | 'codigo'>('qr');
  const [telefone, setTelefone] = useState('');
  const [confirmarSaida, setConfirmarSaida] = useState(false);

  const sessao = useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: statusWhatsapp,
    // Durante o pareamento o status muda em segundos; conectado, basta conferir de vez em quando.
    refetchInterval: (q) => (q.state.data?.status === 'WORKING' ? 30_000 : 5_000),
  });
  const status = sessao.data?.status;

  const qr = useQuery({
    queryKey: ['whatsapp', 'qr'],
    queryFn: qrWhatsapp,
    enabled: status === 'SCAN_QR_CODE' && modo === 'qr',
    // O WhatsApp troca o QR a cada ~20 s.
    refetchInterval: 15_000,
  });

  const atualizar = (dados: unknown) => {
    qc.setQueryData(['whatsapp', 'status'], dados);
    void qc.invalidateQueries({ queryKey: ['whatsapp', 'sessao'] });
  };

  const iniciar = useMutation({ mutationFn: iniciarWhatsapp, onSuccess: atualizar });
  const codigo = useMutation({ mutationFn: () => codigoWhatsapp(telefone) });
  const desconectar = useMutation({
    mutationFn: desconectarWhatsapp,
    onSuccess: (d) => {
      setConfirmarSaida(false);
      codigo.reset();
      atualizar(d);
    },
    onError: () => setConfirmarSaida(false),
  });

  const erro = (sessao.error ?? iniciar.error ?? desconectar.error) as Error | null;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">WhatsApp</h1>
        <p className="mt-1 text-sm text-gray-600">
          Conexão do celular da COLIH com o sistema. Por esse número saem os avisos de plantão e
          responde o agente.
        </p>
      </div>

      {erro && <Alert tone="error">{erro.message}</Alert>}

      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <h2 className="font-medium text-gray-900">Situação</h2>
          {sessao.isFetching && <Spinner className="size-4 text-gray-400" />}
        </CardHeader>
        <CardBody className="space-y-4">
          {sessao.isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Spinner className="size-4" /> Consultando…
            </div>
          )}

          {status === 'WORKING' && sessao.data && (
            <>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-green-500" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    Conectado{sessao.data.numero && ` — ${formatarNumero(sessao.data.numero)}`}
                  </p>
                  {sessao.data.conectado_em && (
                    <p className="text-gray-600">Desde {formatDateTime(sessao.data.conectado_em)}</p>
                  )}
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setConfirmarSaida(true)}>
                Desconectar
              </Button>
            </>
          )}

          {status === 'STARTING' && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Spinner className="size-4" /> Iniciando a conexão…
            </div>
          )}

          {status === 'INACESSIVEL' && (
            <Alert tone="error">
              O servidor do WhatsApp não respondeu. Isso não se resolve pelo celular: avise quem
              mantém o sistema.
            </Alert>
          )}

          {(status === 'INEXISTENTE' || status === 'STOPPED' || status === 'FAILED') && (
            <>
              <div className="flex items-start gap-3">
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-red-500" />
                <div className="text-sm">
                  <p className="font-medium text-gray-900">Desconectado</p>
                  {sessao.data?.desconectado_em ? (
                    <p className="text-gray-600">
                      Desconectado por aqui em {formatDateTime(sessao.data.desconectado_em)}.
                    </p>
                  ) : sessao.data?.caiu_em ? (
                    <p className="text-gray-600">
                      Caiu em {formatDateTime(sessao.data.caiu_em)}.
                    </p>
                  ) : null}
                </div>
              </div>
              <Button onClick={() => iniciar.mutate()} loading={iniciar.isPending}>
                Conectar celular
              </Button>
            </>
          )}

          {status === 'SCAN_QR_CODE' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-amber-500" />
                <p className="text-sm font-medium text-gray-900">Aguardando o celular da COLIH</p>
              </div>

              <div className="inline-flex rounded-md bg-gray-100 p-1 text-sm">
                {(
                  [
                    ['qr', 'Ler QR code'],
                    ['codigo', 'Usar código'],
                  ] as const
                ).map(([m, rotulo]) => (
                  <button
                    key={m}
                    onClick={() => setModo(m)}
                    className={cn(
                      'rounded px-3 py-1.5 font-medium',
                      modo === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600',
                    )}
                  >
                    {rotulo}
                  </button>
                ))}
              </div>

              {modo === 'qr' ? (
                <div className="space-y-3">
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
                    <li>No celular da COLIH, abra o WhatsApp.</li>
                    <li>
                      Toque em <strong>⋮</strong> (Android) ou <strong>Configurações</strong>{' '}
                      (iPhone) → <strong>Dispositivos conectados</strong> →{' '}
                      <strong>Conectar dispositivo</strong>.
                    </li>
                    <li>Aponte a câmera para o código abaixo.</li>
                  </ol>
                  <div className="flex size-64 items-center justify-center rounded-lg bg-white ring-1 ring-gray-200">
                    {qr.data?.imagem ? (
                      <img src={qr.data.imagem} alt="QR code para conectar o WhatsApp" className="size-60" />
                    ) : (
                      <Spinner className="size-6 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    O código se renova sozinho. Se você está com esta tela aberta no próprio celular
                    da COLIH, use a opção “Usar código”.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <form
                    className="flex items-end gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      codigo.mutate();
                    }}
                  >
                    <div className="flex-1">
                      <Field label="Número do celular da COLIH" htmlFor="tel">
                        <Input
                          id="tel"
                          inputMode="tel"
                          placeholder="(41) 99999-8888"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                        />
                      </Field>
                    </div>
                    <Button type="submit" loading={codigo.isPending} disabled={!telefone.trim()}>
                      Gerar código
                    </Button>
                  </form>
                  {codigo.error && <Alert tone="error">{(codigo.error as Error).message}</Alert>}
                  {codigo.data && (
                    <>
                      <p className="rounded-lg bg-gray-50 py-4 text-center font-mono text-3xl font-semibold tracking-widest text-gray-900">
                        {codigo.data.codigo}
                      </p>
                      <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
                        <li>
                          No WhatsApp do celular: <strong>Dispositivos conectados</strong> →{' '}
                          <strong>Conectar dispositivo</strong>.
                        </li>
                        <li>
                          Toque em <strong>Conectar com número de telefone</strong> e digite o
                          código acima.
                        </li>
                      </ol>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmarSaida}
        title="Desconectar o WhatsApp?"
        confirmLabel="Desconectar"
        danger
        loading={desconectar.isPending}
        onConfirm={() => desconectar.mutate()}
        onCancel={() => setConfirmarSaida(false)}
      >
        O sistema para de enviar e receber mensagens por esse número até alguém conectar o celular
        de novo por esta tela.
      </ConfirmDialog>
    </div>
  );
}
