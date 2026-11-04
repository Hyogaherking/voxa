/*
  Funcionamento offline (RNF01). O Voxa é um PWA: depois da primeira
  abertura, o service worker (public/sw.js, gerado no build) guarda todos os
  arquivos do app no aparelho. A partir daí ele abre e funciona sem internet,
  e pode ser instalado na tela inicial como um aplicativo.
*/

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let eventoInstalar: EventoInstalar | null = null;
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((f) => f());

export function iniciarPwa(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventoInstalar = e as EventoInstalar;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    eventoInstalar = null;
    avisar();
  });
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

export function aoMudarInstalacao(cb: () => void): () => void {
  ouvintes.add(cb);
  return () => ouvintes.delete(cb);
}

export function podeInstalar(): boolean {
  return eventoInstalar !== null;
}

export function estaInstalado(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
}

export async function instalar(): Promise<boolean> {
  if (!eventoInstalar) return false;
  await eventoInstalar.prompt();
  const { outcome } = await eventoInstalar.userChoice;
  eventoInstalar = null;
  avisar();
  return outcome === 'accepted';
}

/** Resolve quando todos os arquivos já estão guardados no aparelho. */
export async function prontoOffline(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false;
  if (process.env.NODE_ENV !== 'production') return false;
  const reg = await navigator.serviceWorker.ready;
  return Boolean(reg.active);
}
