// Service worker mínimo, de propósito.
//
// Existe para satisfazer o critério de instalação do Chrome no Android (manifest
// + um handler de `fetch`), NÃO para cache offline. O Casos Info mostra prontuário,
// escala de plantão e transferência de caso: dado velho aqui é pior que tela de
// erro, e um cache mal ajustado ainda serviria bundle antigo depois de um deploy —
// este app publica várias vezes ao dia.
//
// Por isso o handler de fetch não intercepta nada: ele apenas existe. Toda
// requisição segue para a rede como se o service worker não estivesse aqui.
// Se um dia fizer sentido ter offline, o lugar é aqui — com versionamento de
// cache e `skipWaiting` pensados junto.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Assume o controle das abas abertas sem exigir recarregar.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Intencionalmente vazio — sem respondWith, o navegador trata normalmente.
});
