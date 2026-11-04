import type { Cor } from '@/lib/db';

/*
  Vocabulário inicial do Voxa. A primeira prancha reproduz o protótipo da
  Figura 2 do artigo (Água, Comida, Banheiro, Brincar, Descansar, Ajuda) e
  acrescenta palavras de uso frequente em CAA (sim, não, mais, chega).
  Tudo pode ser editado pelo responsável (RF07).
*/

type CartaoInicial = { rotulo: string; picto: string; cor: Cor; fala?: string };
type PranchaInicial = { nome: string; picto: string; cor: Cor; cartoes: CartaoInicial[] };

export const VOCABULARIO_INICIAL: PranchaInicial[] = [
  {
    nome: 'Principais',
    picto: 'glowing-star',
    cor: 'ceu',
    cartoes: [
      { rotulo: 'Água', picto: 'droplet', cor: 'ceu', fala: 'Eu quero água' },
      { rotulo: 'Comida', picto: 'fork-and-knife-with-plate', cor: 'sol', fala: 'Eu quero comer' },
      { rotulo: 'Banheiro', picto: 'toilet', cor: 'menta', fala: 'Eu quero ir ao banheiro' },
      { rotulo: 'Brincar', picto: 'teddy-bear', cor: 'lavanda', fala: 'Eu quero brincar' },
      { rotulo: 'Descansar', picto: 'zzz', cor: 'rosa', fala: 'Eu quero descansar' },
      { rotulo: 'Ajuda', picto: 'raised-hand', cor: 'pessego', fala: 'Eu preciso de ajuda' },
      { rotulo: 'Sim', picto: 'thumbs-up', cor: 'folha' },
      { rotulo: 'Não', picto: 'thumbs-down', cor: 'rosa' },
      { rotulo: 'Mais', picto: 'plus', cor: 'ceu', fala: 'Mais, por favor' },
      { rotulo: 'Chega', picto: 'stop-sign', cor: 'pessego', fala: 'Chega, acabou' },
      { rotulo: 'Abraço', picto: 'people-hugging', cor: 'sol', fala: 'Eu quero um abraço' },
      { rotulo: 'Dói', picto: 'face-with-head-bandage', cor: 'rosa', fala: 'Está doendo' },
    ],
  },
  {
    nome: 'Eu quero',
    picto: 'index-pointing-at-the-viewer',
    cor: 'folha',
    cartoes: [
      { rotulo: 'Eu', picto: 'child', cor: 'sol' },
      { rotulo: 'Você', picto: 'bust-in-silhouette', cor: 'sol' },
      { rotulo: 'Quero', picto: 'index-pointing-at-the-viewer', cor: 'folha' },
      { rotulo: 'Não quero', picto: 'person-gesturing-no', cor: 'rosa' },
      { rotulo: 'Gosto', picto: 'red-heart', cor: 'folha' },
      { rotulo: 'Ir', picto: 'person-walking', cor: 'folha' },
      { rotulo: 'Ver', picto: 'eyes', cor: 'folha' },
      { rotulo: 'Ouvir', picto: 'ear', cor: 'folha' },
      { rotulo: 'Comer', picto: 'fork-and-knife', cor: 'folha' },
      { rotulo: 'Beber', picto: 'cup-with-straw', cor: 'folha' },
      { rotulo: 'Dormir', picto: 'person-in-bed', cor: 'folha' },
      { rotulo: 'Por favor', picto: 'folded-hands', cor: 'rosa' },
    ],
  },
  {
    nome: 'Comer e beber',
    picto: 'red-apple',
    cor: 'pessego',
    cartoes: [
      { rotulo: 'Água', picto: 'droplet', cor: 'pessego' },
      { rotulo: 'Suco', picto: 'beverage-box', cor: 'pessego' },
      { rotulo: 'Leite', picto: 'glass-of-milk', cor: 'pessego' },
      { rotulo: 'Pão', picto: 'bread', cor: 'pessego' },
      { rotulo: 'Maçã', picto: 'red-apple', cor: 'pessego' },
      { rotulo: 'Banana', picto: 'banana', cor: 'pessego' },
      { rotulo: 'Biscoito', picto: 'cookie', cor: 'pessego' },
      { rotulo: 'Arroz', picto: 'cooked-rice', cor: 'pessego' },
      { rotulo: 'Lanche', picto: 'sandwich', cor: 'pessego' },
      { rotulo: 'Sorvete', picto: 'soft-ice-cream', cor: 'pessego' },
      { rotulo: 'Bolo', picto: 'birthday-cake', cor: 'pessego' },
      { rotulo: 'Pipoca', picto: 'popcorn', cor: 'pessego' },
    ],
  },
  {
    nome: 'Brincar',
    picto: 'soccer-ball',
    cor: 'lavanda',
    cartoes: [
      { rotulo: 'Bola', picto: 'soccer-ball', cor: 'lavanda' },
      { rotulo: 'Desenhar', picto: 'crayon', cor: 'lavanda' },
      { rotulo: 'Pintar', picto: 'artist-palette', cor: 'lavanda' },
      { rotulo: 'Quebra-cabeça', picto: 'puzzle-piece', cor: 'lavanda' },
      { rotulo: 'Blocos', picto: 'brick', cor: 'lavanda' },
      { rotulo: 'Bolhas', picto: 'bubbles', cor: 'lavanda', fala: 'Bolhas de sabão' },
      { rotulo: 'Música', picto: 'musical-notes', cor: 'lavanda' },
      { rotulo: 'Livro', picto: 'open-book', cor: 'lavanda', fala: 'Ler uma história' },
      { rotulo: 'Desenho', picto: 'television', cor: 'lavanda', fala: 'Assistir desenho' },
      { rotulo: 'Celular', picto: 'mobile-phone', cor: 'lavanda' },
      { rotulo: 'Parquinho', picto: 'playground-slide', cor: 'lavanda' },
      { rotulo: 'Bicicleta', picto: 'bicycle', cor: 'lavanda' },
    ],
  },
  {
    nome: 'Lugares',
    picto: 'house',
    cor: 'menta',
    cartoes: [
      { rotulo: 'Casa', picto: 'house', cor: 'menta' },
      { rotulo: 'Escola', picto: 'school', cor: 'menta' },
      { rotulo: 'Parque', picto: 'national-park', cor: 'menta' },
      { rotulo: 'Banheiro', picto: 'toilet', cor: 'menta' },
      { rotulo: 'Quarto', picto: 'bed', cor: 'menta' },
      { rotulo: 'Carro', picto: 'automobile', cor: 'menta' },
      { rotulo: 'Mercado', picto: 'convenience-store', cor: 'menta' },
      { rotulo: 'Médico', picto: 'hospital', cor: 'menta' },
      { rotulo: 'Praia', picto: 'beach-with-umbrella', cor: 'menta' },
      { rotulo: 'Lá fora', picto: 'deciduous-tree', cor: 'menta' },
    ],
  },
  {
    nome: 'Pessoas',
    picto: 'busts-in-silhouette',
    cor: 'sol',
    cartoes: [
      { rotulo: 'Eu', picto: 'child', cor: 'sol' },
      { rotulo: 'Mamãe', picto: 'woman', cor: 'sol' },
      { rotulo: 'Papai', picto: 'man', cor: 'sol' },
      { rotulo: 'Irmã', picto: 'girl', cor: 'sol' },
      { rotulo: 'Irmão', picto: 'boy', cor: 'sol' },
      { rotulo: 'Vovó', picto: 'old-woman', cor: 'sol' },
      { rotulo: 'Vovô', picto: 'old-man', cor: 'sol' },
      { rotulo: 'Professora', picto: 'woman-teacher', cor: 'sol' },
      { rotulo: 'Terapeuta', picto: 'health-worker', cor: 'sol' },
      { rotulo: 'Amigos', picto: 'busts-in-silhouette', cor: 'sol' },
      { rotulo: 'Bebê', picto: 'baby', cor: 'sol' },
    ],
  },
];
