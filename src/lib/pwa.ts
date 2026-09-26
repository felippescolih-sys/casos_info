import { useEffect, useState } from 'react';

// Evento não-padrão do Chromium. Só existe em Android/Chrome e derivados —
// Safari nunca dispara, daí o caminho manual no iOS.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Já está rodando como app instalado (não faz sentido oferecer instalação). */
export function appInstalado(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS usa esta propriedade própria em vez do display-mode.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ se apresenta como Mac; o touch é o que o denuncia.
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  );
}

type Modo = 'indisponivel' | 'prompt' | 'ios';

/**
 * Como oferecer a instalação neste aparelho:
 * - 'prompt': o Chrome guardou o evento e dá pra instalar com um clique.
 * - 'ios': não existe API no Safari, só instruir o "Adicionar à Tela de Início".
 * - 'indisponivel': já instalado, ou navegador que não suporta — não mostrar nada.
 */
export function useInstalacao() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(() => appInstalado());

  useEffect(() => {
    function onBefore(e: Event) {
      // Sem isto o Chrome mostra o próprio banner e consome o evento.
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setInstalado(true);
      setEvento(null);
    }
    window.addEventListener('beforeinstallprompt', onBefore);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const modo: Modo = instalado
    ? 'indisponivel'
    : evento
      ? 'prompt'
      : isIOS()
        ? 'ios'
        : 'indisponivel';

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    await evento.userChoice;
    // O evento só pode ser usado uma vez.
    setEvento(null);
  }

  return { modo, instalar };
}
