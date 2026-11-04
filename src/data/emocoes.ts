import type { Cor, Genero } from '@/lib/db';

/*
  Tela de expressão de emoções (RF03). Cada emoção tem a forma masculina e a
  feminina, para a voz concordar com a criança ("Estou cansado" ou "Estou
  cansada"). Emoções descritas por substantivo ("com raiva") usam a mesma
  forma para todos.
*/

export type Emocao = {
  id: string;
  picto: string;
  cor: Cor;
  /** Emoção difícil: mostra opções de apoio ("O que pode ajudar?") */
  dificil: boolean;
} & (
  | { tipo: 'adjetivo'; m: string; f: string }
  | { tipo: 'substantivo'; nome: string; rotulo: string; generoNome: Genero }
);

export const EMOCOES: Emocao[] = [
  { id: 'feliz', picto: 'grinning-face-with-big-eyes', cor: 'sol', dificil: false, tipo: 'adjetivo', m: 'feliz', f: 'feliz' },
  { id: 'calmo', picto: 'relieved-face', cor: 'folha', dificil: false, tipo: 'adjetivo', m: 'calmo', f: 'calma' },
  { id: 'animado', picto: 'star-struck', cor: 'pessego', dificil: false, tipo: 'adjetivo', m: 'animado', f: 'animada' },
  { id: 'triste', picto: 'frowning-face', cor: 'ceu', dificil: true, tipo: 'adjetivo', m: 'triste', f: 'triste' },
  { id: 'raiva', picto: 'pouting-face', cor: 'rosa', dificil: true, tipo: 'substantivo', nome: 'raiva', rotulo: 'Com raiva', generoNome: 'f' },
  { id: 'medo', picto: 'fearful-face', cor: 'lavanda', dificil: true, tipo: 'substantivo', nome: 'medo', rotulo: 'Com medo', generoNome: 'm' },
  { id: 'preocupado', picto: 'anxious-face-with-sweat', cor: 'menta', dificil: true, tipo: 'adjetivo', m: 'preocupado', f: 'preocupada' },
  { id: 'cansado', picto: 'tired-face', cor: 'nuvem', dificil: true, tipo: 'adjetivo', m: 'cansado', f: 'cansada' },
  { id: 'dor', picto: 'face-with-head-bandage', cor: 'rosa', dificil: true, tipo: 'substantivo', nome: 'dor', rotulo: 'Com dor', generoNome: 'f' },
  { id: 'confuso', picto: 'confused-face', cor: 'lavanda', dificil: true, tipo: 'adjetivo', m: 'confuso', f: 'confusa' },
  { id: 'agitado', picto: 'face-with-spiral-eyes', cor: 'pessego', dificil: true, tipo: 'adjetivo', m: 'agitado', f: 'agitada' },
  { id: 'envergonhado', picto: 'flushed-face', cor: 'rosa', dificil: true, tipo: 'adjetivo', m: 'envergonhado', f: 'envergonhada' },
];

const maiuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function rotuloEmocao(e: Emocao, g: Genero): string {
  return e.tipo === 'adjetivo' ? maiuscula(e[g]) : e.rotulo;
}

export const INTENSIDADES = [
  { valor: 1 as const, rotulo: 'Um pouco' },
  { valor: 2 as const, rotulo: 'Bastante' },
  { valor: 3 as const, rotulo: 'Muito' },
];

/** Frase completa falada pela voz, ex.: "Estou muito triste", "Estou com um pouco de medo". */
export function falaEmocao(e: Emocao, g: Genero, intensidade?: 1 | 2 | 3): string {
  if (e.tipo === 'adjetivo') {
    const adj = e[g];
    const prefixo = intensidade === 1 ? 'um pouco ' : intensidade === 2 ? 'bastante ' : intensidade === 3 ? 'muito ' : '';
    return `Eu estou ${prefixo}${adj}`;
  }
  const muito = e.generoNome === 'f' ? 'muita' : 'muito';
  const q = intensidade === 1 ? 'um pouco de ' : intensidade === 2 ? 'bastante ' : intensidade === 3 ? `${muito} ` : '';
  return `Eu estou com ${q}${e.nome}`;
}

export type Apoio = { id: string; picto: string; rotulo: string; fala: (g: Genero) => string; cor: Cor; respirar?: boolean };

/** "O que pode ajudar?" — mostrado depois de uma emoção difícil. */
export const APOIOS_DIFICEIS: Apoio[] = [
  { id: 'respirar', picto: 'person-in-lotus-position', rotulo: 'Respirar', fala: () => 'Eu quero respirar com calma', cor: 'lavanda', respirar: true },
  { id: 'abraco', picto: 'people-hugging', rotulo: 'Abraço', fala: () => 'Eu quero um abraço', cor: 'sol' },
  { id: 'silencio', picto: 'shushing-face', rotulo: 'Silêncio', fala: () => 'Eu preciso de silêncio', cor: 'ceu' },
  { id: 'fone', picto: 'headphone', rotulo: 'Meu fone', fala: () => 'Eu quero o meu fone', cor: 'menta' },
  { id: 'sozinho', picto: 'bust-in-silhouette', rotulo: 'Ficar só', fala: (g) => `Eu quero ficar um pouco ${g === 'f' ? 'sozinha' : 'sozinho'}`, cor: 'nuvem' },
  { id: 'agua', picto: 'droplet', rotulo: 'Água', fala: () => 'Eu quero água', cor: 'ceu' },
  { id: 'descansar', picto: 'zzz', rotulo: 'Descansar', fala: () => 'Eu quero descansar', cor: 'rosa' },
  { id: 'ajuda', picto: 'raised-hand', rotulo: 'Ajuda', fala: () => 'Eu preciso de ajuda', cor: 'pessego' },
];

export const APOIOS_POSITIVOS: Apoio[] = [
  { id: 'mostrar', picto: 'backhand-index-pointing-right', rotulo: 'Mostrar', fala: () => 'Olha! Quero te mostrar uma coisa', cor: 'sol' },
  { id: 'brincar-mais', picto: 'plus', rotulo: 'Brincar mais', fala: () => 'Eu quero brincar mais', cor: 'lavanda' },
  { id: 'abraco', picto: 'people-hugging', rotulo: 'Abraço', fala: () => 'Eu quero um abraço', cor: 'rosa' },
  { id: 'musica', picto: 'musical-notes', rotulo: 'Música', fala: () => 'Eu quero ouvir música', cor: 'menta' },
];
