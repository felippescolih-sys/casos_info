import { useState } from 'react';
import { useInstalacao } from '@/lib/pwa';
import { Modal } from '@/components/ui/Modal';

/**
 * Oferece instalar o Casos Info na tela inicial do celular.
 *
 * No Android o Chrome entrega um evento e a instalação é um clique. No iOS não
 * existe API equivalente — o Safari só instala pelo menu Compartilhar — então lá
 * o botão abre instruções. Onde não dá para instalar (já instalado, ou navegador
 * sem suporte) o componente não renderiza nada, em vez de oferecer algo que falha.
 */
export function InstalarApp({ className }: { className?: string }) {
  const { modo, instalar } = useInstalacao();
  const [ajudaIOS, setAjudaIOS] = useState(false);

  if (modo === 'indisponivel') return null;

  return (
    <>
      <button
        type="button"
        onClick={() => (modo === 'ios' ? setAjudaIOS(true) : void instalar())}
        className={
          className ??
          'inline-flex items-center gap-2 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-800 hover:bg-brand-100'
        }
      >
        <svg
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0 4-4m-4 4-4-4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 18h16" />
        </svg>
        Instalar o aplicativo
      </button>

      <Modal
        open={ajudaIOS}
        onClose={() => setAjudaIOS(false)}
        title="Instalar no iPhone ou iPad"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            No iPhone e no iPad a instalação é feita pelo próprio Safari, em três passos:
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Toque no botão <span className="font-medium">Compartilhar</span> — o quadrado com
              uma seta para cima, na barra do Safari.
            </li>
            <li>
              Role a lista e escolha{' '}
              <span className="font-medium">Adicionar à Tela de Início</span>.
            </li>
            <li>
              Confirme em <span className="font-medium">Adicionar</span>. O ícone do Casos Info
              aparece junto com os outros aplicativos.
            </li>
          </ol>
          <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-900">
            Precisa ser pelo <span className="font-medium">Safari</span>. Se você abriu este
            site pelo Chrome ou por dentro do WhatsApp, o menu Compartilhar não traz essa opção —
            abra o endereço no Safari primeiro.
          </p>
        </div>
      </Modal>
    </>
  );
}
