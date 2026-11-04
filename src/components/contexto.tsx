'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Ajustes, Cor, Imagem, Perfil } from '@/lib/db';
import { falarTexto, pararFala } from '@/lib/voz';
import { novoId } from '@/lib/dados';

export type NomeTela =
  | 'portao'
  | 'painel'
  | 'perfil'
  | 'pranchas'
  | 'prancha'
  | 'historico'
  | 'voz'
  | 'preferencias'
  | 'pin'
  | 'copia'
  | 'sobre';

export type Tela = { nome: NomeTela; id?: string };
export type Aba = 'falar' | 'sentir';

export type ItemFrase = { chave: string; cartaoId: string; rotulo: string; imagem: Imagem; cor: Cor };

type Ctx = {
  ajustes: Ajustes;
  perfil: Perfil;
  aba: Aba;
  setAba: (a: Aba) => void;
  /** Telas do responsável abertas, da mais antiga para a atual. Vazia = tela da criança. */
  pilha: Tela[];
  ir: (t: Tela) => void;
  substituir: (t: Tela) => void;
  voltar: () => void;
  sairDoPainel: () => void;
  avisar: (msg: string) => void;
  aviso: { id: number; texto: string } | null;
  falar: (texto: string) => void;
  falarFrase: () => void;
  parar: () => void;
  falando: boolean;
  /** Item da frase falado neste momento (−1 quando nenhum). */
  itemFalado: number;
  frase: ItemFrase[];
  adicionarNaFrase: (item: Omit<ItemFrase, 'chave'>) => void;
  apagarUltimo: () => void;
  limparFrase: () => void;
};

const Contexto = createContext<Ctx | null>(null);

export function useVoxa(): Ctx {
  const c = useContext(Contexto);
  if (!c) throw new Error('useVoxa fora do VoxaProvider');
  return c;
}

const LIMITE_FRASE = 12;

export function VoxaProvider({ ajustes, perfil, children }: { ajustes: Ajustes; perfil: Perfil; children: React.ReactNode }) {
  const [aba, setAba] = useState<Aba>('falar');
  const [pilha, setPilha] = useState<Tela[]>([]);
  const [aviso, setAviso] = useState<{ id: number; texto: string } | null>(null);
  const [falando, setFalando] = useState(false);
  const [itemFalado, setItemFalado] = useState(-1);
  const [frase, setFrase] = useState<ItemFrase[]>([]);
  const ajustesRef = useRef(ajustes);
  ajustesRef.current = ajustes;

  // Navegação integrada ao botão "voltar" do Android e do navegador.
  useEffect(() => {
    const aoVoltar = (e: PopStateEvent) => {
      const nivel = typeof e.state?.voxa === 'number' ? e.state.voxa : 0;
      setPilha((p) => p.slice(0, nivel));
    };
    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
  }, []);

  const pilhaRef = useRef(pilha);
  pilhaRef.current = pilha;

  const ir = useCallback((t: Tela) => {
    const nova = [...pilhaRef.current, t];
    pilhaRef.current = nova;
    window.history.pushState({ voxa: nova.length }, '');
    setPilha(nova);
  }, []);

  const substituir = useCallback((t: Tela) => {
    setPilha((p) => [...p.slice(0, -1), t]);
  }, []);

  const voltar = useCallback(() => {
    if (window.history.state?.voxa) window.history.back();
    else setPilha((p) => p.slice(0, -1));
  }, []);

  const sairDoPainel = useCallback(() => {
    const nivel = window.history.state?.voxa;
    if (typeof nivel === 'number' && nivel > 0) window.history.go(-nivel);
    setPilha([]);
  }, []);

  const avisar = useCallback((texto: string) => setAviso({ id: Date.now(), texto }), []);

  const falar = useCallback((texto: string) => {
    falarTexto(texto, ajustesRef.current.voz, {
      onInicio: () => setFalando(true),
      onFim: () => {
        setFalando(false);
        setItemFalado(-1);
      },
    });
  }, []);

  const fraseRef = useRef(frase);
  fraseRef.current = frase;

  const falarFrase = useCallback(() => {
    const itens = fraseRef.current;
    if (!itens.length) return;
    // Posição de cada palavra no texto, para acompanhar a fala item a item
    const inicios: number[] = [];
    let texto = '';
    for (const it of itens) {
      if (texto) texto += ' ';
      inicios.push(texto.length);
      texto += it.rotulo;
    }
    setItemFalado(0);
    falarTexto(texto, ajustesRef.current.voz, {
      onInicio: () => setFalando(true),
      onPalavra: (indice) => {
        let atual = 0;
        inicios.forEach((ini, i) => {
          if (indice >= ini) atual = i;
        });
        setItemFalado(atual);
      },
      onFim: () => {
        setFalando(false);
        setItemFalado(-1);
      },
    });
  }, []);

  const parar = useCallback(() => {
    pararFala();
    setFalando(false);
    setItemFalado(-1);
  }, []);

  const adicionarNaFrase = useCallback((item: Omit<ItemFrase, 'chave'>) => {
    setFrase((f) => (f.length >= LIMITE_FRASE ? f : [...f, { ...item, chave: novoId() }]));
  }, []);
  const apagarUltimo = useCallback(() => setFrase((f) => f.slice(0, -1)), []);
  const limparFrase = useCallback(() => setFrase([]), []);

  const valor = useMemo<Ctx>(
    () => ({
      ajustes,
      perfil,
      aba,
      setAba,
      pilha,
      ir,
      substituir,
      voltar,
      sairDoPainel,
      avisar,
      aviso,
      falar,
      falarFrase,
      parar,
      falando,
      itemFalado,
      frase,
      adicionarNaFrase,
      apagarUltimo,
      limparFrase,
    }),
    [ajustes, perfil, aba, pilha, ir, substituir, voltar, sairDoPainel, avisar, aviso, falar, falarFrase, parar, falando, itemFalado, frase, adicionarNaFrase, apagarUltimo, limparFrase],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
