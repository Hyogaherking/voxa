import type { AjustesVoz } from './db';

/*
  Síntese de voz (RF02, RF09) pela Web Speech API do próprio navegador.
  Substitui o pacote flutter_tts da proposta original. As vozes vêm do
  sistema do aparelho; as marcadas como "localService" funcionam sem internet.
*/

export function temVoz(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

const ehPortugues = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase().startsWith('pt');
const ehBrasil = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase() === 'pt-br';

/** Lista as vozes em português, com pt-BR e vozes offline primeiro. */
export function vozesPortugues(): SpeechSynthesisVoice[] {
  if (!temVoz()) return [];
  return window.speechSynthesis
    .getVoices()
    .filter(ehPortugues)
    .sort((a, b) => Number(ehBrasil(b)) - Number(ehBrasil(a)) || Number(b.localService) - Number(a.localService));
}

/** As vozes carregam de forma assíncrona em alguns navegadores. */
export function aoMudarVozes(cb: () => void): () => void {
  if (!temVoz()) return () => {};
  const s = window.speechSynthesis;
  s.addEventListener('voiceschanged', cb);
  return () => s.removeEventListener('voiceschanged', cb);
}

function escolherVoz(uri: string | null): SpeechSynthesisVoice | undefined {
  const lista = vozesPortugues();
  if (uri) {
    const salva = lista.find((v) => v.voiceURI === uri);
    if (salva) return salva;
  }
  return lista.find((v) => ehBrasil(v) && v.localService) ?? lista.find(ehBrasil) ?? lista[0];
}

export type EventosFala = {
  onInicio?: () => void;
  /** Índice do caractere onde começa a palavra falada agora (quando o navegador informa). */
  onPalavra?: (indice: number) => void;
  onFim?: () => void;
};

// Cada fala recebe um número; eventos de falas antigas (canceladas) são ignorados.
let falaAtual = 0;

export function falarTexto(texto: string, cfg: AjustesVoz, eventos: EventosFala = {}): void {
  const minha = ++falaAtual;
  if (!temVoz() || !texto.trim()) {
    eventos.onFim?.();
    return;
  }
  const s = window.speechSynthesis;
  s.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  const voz = escolherVoz(cfg.uri);
  if (voz) fala.voice = voz;
  fala.rate = cfg.velocidade;
  fala.pitch = cfg.tom;
  fala.volume = cfg.volume;
  const vale = () => minha === falaAtual;
  fala.onstart = () => vale() && eventos.onInicio?.();
  fala.onboundary = (e) => {
    if (vale() && (e.name === 'word' || e.name === undefined)) eventos.onPalavra?.(e.charIndex);
  };
  fala.onend = () => vale() && eventos.onFim?.();
  fala.onerror = () => vale() && eventos.onFim?.();
  // Pequeno atraso evita que o Chrome descarte a fala logo após cancel()
  window.setTimeout(() => {
    if (!vale()) return;
    s.resume();
    s.speak(fala);
  }, 30);
}

export function pararFala(): void {
  falaAtual++;
  if (temVoz()) window.speechSynthesis.cancel();
}
