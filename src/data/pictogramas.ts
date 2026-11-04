import catalogo from './catalogo-pictogramas.json';

/*
  Pictogramas: Fluent Emoji Flat (Microsoft, licença MIT). Os arquivos SVG
  ficam em /public/pictos e são guardados no aparelho pelo service worker.
  Cada item tem rótulo e palavras de busca em português.
*/

export type ItemPicto = { id: string; r: string; g: string; t: string[] };

export const PICTOGRAMAS = catalogo as ItemPicto[];

export const GRUPOS_PICTO: { id: string; nome: string }[] = [
  { id: 'comida', nome: 'Comida' },
  { id: 'acoes', nome: 'Ações' },
  { id: 'emocoes', nome: 'Sentimentos' },
  { id: 'pessoas', nome: 'Pessoas' },
  { id: 'brincar', nome: 'Brincar' },
  { id: 'casa', nome: 'Casa' },
  { id: 'corpo', nome: 'Corpo' },
  { id: 'lugares', nome: 'Lugares' },
  { id: 'transporte', nome: 'Transporte' },
  { id: 'animais', nome: 'Animais' },
  { id: 'natureza', nome: 'Natureza' },
  { id: 'simbolos', nome: 'Símbolos' },
];

// Caminho relativo: funciona tanto na raiz do site quanto em uma subpasta.
export function urlPicto(id: string): string {
  return `pictos/${id}.svg`;
}

const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function buscarPictos(termo: string, grupo?: string): ItemPicto[] {
  const t = semAcento(termo);
  return PICTOGRAMAS.filter((p) => {
    if (grupo && !t && p.g !== grupo) return false;
    if (!t) return true;
    return semAcento(p.r).includes(t) || p.t.some((tag) => semAcento(tag).includes(t));
  });
}

export function rotuloPicto(id: string): string | undefined {
  return PICTOGRAMAS.find((p) => p.id === id)?.r;
}
