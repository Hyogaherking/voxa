'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { garantirDadosIniciais } from '@/lib/dados';
import { definirMovimento } from '@/lib/movimento';
import { iniciarPwa } from '@/lib/pwa';
import { VoxaProvider, useVoxa } from './contexto';
import { Abertura } from './ui/Abertura';
import { Aviso } from './ui/Aviso';
import { TelaCrianca } from './crianca/TelaCrianca';
import { Portao } from './responsavel/Portao';
import { Painel } from './responsavel/Painel';
import { PerfilCrianca } from './responsavel/PerfilCrianca';
import { Pranchas } from './responsavel/Pranchas';
import { EditorPrancha } from './responsavel/EditorPrancha';
import { Historico } from './responsavel/Historico';
import { ConfigVoz } from './responsavel/ConfigVoz';
import { Preferencias } from './responsavel/Preferencias';
import { PinAcesso } from './responsavel/PinAcesso';
import { Copia } from './responsavel/Copia';
import { Sobre } from './responsavel/Sobre';

export default function VoxaApp() {
  const [pronto, setPronto] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    iniciarPwa();
    garantirDadosIniciais()
      .then(() => setPronto(true))
      .catch(() =>
        setErro('Não foi possível abrir o armazenamento do aparelho. Verifique se o navegador não está em modo anônimo.'),
      );
  }, []);

  const ajustes = useLiveQuery(() => (pronto ? db.ajustes.get('app') : undefined), [pronto]);
  const perfil = useLiveQuery(() => (pronto ? db.perfil.get('crianca') : undefined), [pronto]);
  const reduzirSistema = usePrefereMenosMovimento();

  // Preferências visuais aplicadas na raiz do documento
  useEffect(() => {
    if (!ajustes) return;
    const r = document.documentElement;
    r.dataset.tamanho = ajustes.tamanho;
    r.dataset.contraste = ajustes.contrasteAlto ? 'alto' : 'normal';
    r.dataset.bastao = ajustes.letraBastao ? 'sim' : 'nao';
    definirMovimento(ajustes.movimento === 'nenhum' || reduzirSistema);
  }, [ajustes, reduzirSistema]);

  if (erro) {
    return (
      <main className="grid min-h-dvh place-items-center p-6 text-center">
        <p className="max-w-sm text-lg">{erro}</p>
      </main>
    );
  }
  if (!ajustes || !perfil) return <Abertura />;

  return (
    <VoxaProvider ajustes={ajustes} perfil={perfil}>
      <Telas />
      <Aviso />
    </VoxaProvider>
  );
}

function Telas() {
  const { pilha } = useVoxa();
  const atual = pilha[pilha.length - 1];
  if (!atual) return <TelaCrianca />;
  switch (atual.nome) {
    case 'portao':
      return <Portao />;
    case 'painel':
      return <Painel />;
    case 'perfil':
      return <PerfilCrianca />;
    case 'pranchas':
      return <Pranchas />;
    case 'prancha':
      return <EditorPrancha pranchaId={atual.id ?? ''} />;
    case 'historico':
      return <Historico />;
    case 'voz':
      return <ConfigVoz />;
    case 'preferencias':
      return <Preferencias />;
    case 'pin':
      return <PinAcesso />;
    case 'copia':
      return <Copia />;
    case 'sobre':
      return <Sobre />;
  }
}

function usePrefereMenosMovimento(): boolean {
  const [reduzir, setReduzir] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduzir(mq.matches);
    const aoMudar = () => setReduzir(mq.matches);
    mq.addEventListener('change', aoMudar);
    return () => mq.removeEventListener('change', aoMudar);
  }, []);
  return reduzir;
}
