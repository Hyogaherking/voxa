import Dexie, { type EntityTable } from 'dexie';

/*
  Armazenamento local (RNF02): todos os dados ficam no IndexedDB do próprio
  aparelho, por meio da biblioteca Dexie. Nada é enviado para servidores.
  Substitui o pacote sqflite previsto na proposta em Flutter.
*/

export const CORES = ['ceu', 'sol', 'folha', 'lavanda', 'rosa', 'pessego', 'menta', 'nuvem'] as const;
export type Cor = (typeof CORES)[number];

export type Imagem = { tipo: 'picto'; id: string } | { tipo: 'foto'; dados: string };

export interface Prancha {
  id: string;
  nome: string;
  imagem: Imagem;
  cor: Cor;
  ordem: number;
  visivel: boolean;
}

export interface Cartao {
  id: string;
  pranchaId: string;
  rotulo: string;
  /** Texto falado ao tocar. Se vazio, a voz fala o rótulo. */
  fala?: string;
  imagem: Imagem;
  cor: Cor;
  ordem: number;
  visivel: boolean;
}

export type Genero = 'm' | 'f';

export interface Perfil {
  id: 'crianca';
  nome: string;
  avatar: Imagem;
  /** Concordância das falas sobre a criança: "cansado" ou "cansada". */
  genero: Genero;
  observacoes: string;
  atualizadoEm: number;
}

export type TipoRegistro = 'cartao' | 'frase' | 'emocao' | 'apoio';

export interface Registro {
  id?: number;
  tipo: TipoRegistro;
  texto: string;
  /** Id do cartão ou da emoção que gerou o registro */
  refId?: string;
  /** Pictograma usado, para mostrar no histórico */
  picto?: string;
  intensidade?: 1 | 2 | 3;
  em: number;
}

export type Tamanho = 'grande' | 'medio' | 'pequeno';

export interface AjustesVoz {
  uri: string | null;
  velocidade: number;
  tom: number;
  volume: number;
}

export interface Ajustes {
  id: 'app';
  voz: AjustesVoz;
  falarAoTocar: boolean;
  montarFrases: boolean;
  tamanho: Tamanho;
  letraBastao: boolean;
  movimento: 'calmo' | 'nenhum';
  contrasteAlto: boolean;
  registrarHistorico: boolean;
  vibrar: boolean;
  pin: { hash: string; sal: string } | null;
  dicaCadeadoVista: boolean;
  versaoDados: number;
}

class VoxaDB extends Dexie {
  pranchas!: EntityTable<Prancha, 'id'>;
  cartoes!: EntityTable<Cartao, 'id'>;
  perfil!: EntityTable<Perfil, 'id'>;
  historico!: EntityTable<Registro, 'id'>;
  ajustes!: EntityTable<Ajustes, 'id'>;

  constructor() {
    super('voxa');
    this.version(1).stores({
      pranchas: 'id, ordem',
      cartoes: 'id, pranchaId, ordem',
      perfil: 'id',
      historico: '++id, em, tipo',
      ajustes: 'id',
    });
  }
}

export const db = new VoxaDB();

export const AJUSTES_PADRAO: Ajustes = {
  id: 'app',
  voz: { uri: null, velocidade: 0.9, tom: 1.05, volume: 1 },
  falarAoTocar: true,
  montarFrases: true,
  tamanho: 'grande',
  letraBastao: false,
  movimento: 'calmo',
  contrasteAlto: false,
  registrarHistorico: true,
  vibrar: false,
  pin: null,
  dicaCadeadoVista: false,
  versaoDados: 1,
};

export const PERFIL_PADRAO: Perfil = {
  id: 'crianca',
  nome: '',
  avatar: { tipo: 'picto', id: 'child' },
  genero: 'm',
  observacoes: '',
  atualizadoEm: 0,
};
