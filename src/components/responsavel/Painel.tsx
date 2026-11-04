'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  AudioLines,
  ChartColumn,
  ChevronRight,
  CircleCheck,
  CloudOff,
  HardDriveDownload,
  Info,
  KeyRound,
  LayoutGrid,
  LogOut,
  SlidersHorizontal,
  Smartphone,
  UserRound,
} from 'lucide-react';
import { db } from '@/lib/db';
import { aoMudarInstalacao, estaInstalado, instalar, podeInstalar, prontoOffline } from '@/lib/pwa';
import { useVoxa, type NomeTela } from '../contexto';
import { Pictograma } from '../ui/Pictograma';
import { Marca } from '../ui/Marca';

type Item = { tela: NomeTela; titulo: string; descricao: string; icone: React.ReactNode; tom: string };

const ITENS: Item[] = [
  { tela: 'perfil', titulo: 'Perfil da criança', descricao: 'Nome, foto e como a voz fala sobre ela', icone: <UserRound />, tom: 'bg-[#dcebfc] text-[#214ea6]' },
  { tela: 'pranchas', titulo: 'Editar pranchas', descricao: 'Figuras, palavras, cores e ordem', icone: <LayoutGrid />, tom: 'bg-[#dbf1e1] text-[#1d6b41]' },
  { tela: 'historico', titulo: 'Histórico de uso', descricao: 'O que foi falado e sentido', icone: <ChartColumn />, tom: 'bg-[#e8e2f9] text-[#4a3596]' },
  { tela: 'voz', titulo: 'Configurar voz', descricao: 'Voz, velocidade, tom e volume', icone: <AudioLines />, tom: 'bg-[#fcefc4] text-[#7a5c00]' },
  { tela: 'preferencias', titulo: 'Tela da criança', descricao: 'Tamanho das figuras, letras e animações', icone: <SlidersHorizontal />, tom: 'bg-[#d4efea] text-[#13665c]' },
  { tela: 'pin', titulo: 'PIN de acesso', descricao: 'Trocar o PIN desta área', icone: <KeyRound />, tom: 'bg-[#fadee4] text-[#93243f]' },
  { tela: 'copia', titulo: 'Cópia de segurança', descricao: 'Salvar ou restaurar os dados em arquivo', icone: <HardDriveDownload />, tom: 'bg-[#fde4ce] text-[#8a4512]' },
  { tela: 'sobre', titulo: 'Sobre o Voxa', descricao: 'Privacidade, licenças e créditos', icone: <Info />, tom: 'bg-[#e7ecf1] text-[#3d4b59]' },
];

/** Painel do responsável (Figura 3 do artigo), com as funções de administração. */
export function Painel() {
  const { perfil, ir, sairDoPainel } = useVoxa();
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const usosHoje = useLiveQuery(() => db.historico.where('em').aboveOrEqual(hoje.getTime()).count(), []);

  return (
    <main className="min-h-dvh bg-nevoa pt-[env(safe-area-inset-top)] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-2xl px-4">
        <header className="flex items-center gap-3 py-3">
          <Marca tamanho={26} />
          <div className="flex-1" />
          <button
            type="button"
            onClick={sairDoPainel}
            className="inline-flex min-h-12 items-center gap-2 rounded-campo border-2 border-linha bg-superficie px-4 font-bold hover:border-azul"
          >
            <LogOut aria-hidden="true" className="size-5" />
            Voltar para a criança
          </button>
        </header>

        <h1 className="mt-2 text-[1.75rem] leading-tight font-extrabold">Painel do responsável</h1>

        <button
          type="button"
          onClick={() => ir({ nome: 'perfil' })}
          className="mt-4 flex w-full items-center gap-4 rounded-cartao bg-superficie p-4 text-left shadow-[0_1px_0_var(--color-linha)]"
        >
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-(--sol)">
            <Pictograma imagem={perfil.avatar} className={perfil.avatar.tipo === 'foto' ? 'size-16 rounded-full' : 'size-11'} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xl font-extrabold">{perfil.nome || 'Criança sem nome'}</span>
            <span className="block text-tinta-suave">
              {usosHoje === undefined ? '' : usosHoje === 0 ? 'Nenhum uso registrado hoje' : `${usosHoje} ${usosHoje === 1 ? 'uso registrado' : 'usos registrados'} hoje`}
            </span>
          </span>
          <ChevronRight aria-hidden="true" className="size-6 text-tinta-suave" />
        </button>

        <ul role="list" className="mt-4 overflow-hidden rounded-cartao bg-superficie">
          {ITENS.map((it, i) => (
            <li key={it.tela} className={i ? 'border-t border-linha' : ''}>
              <button
                type="button"
                onClick={() => ir({ nome: it.tela })}
                className="flex min-h-[4.5rem] w-full items-center gap-4 px-4 py-3 text-left hover:bg-nevoa"
              >
                <span aria-hidden="true" className={`grid size-11 shrink-0 place-items-center rounded-full [&>svg]:size-6 ${it.tom}`}>
                  {it.icone}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold">{it.titulo}</span>
                  <span className="block text-[0.95rem] leading-snug text-tinta-suave">{it.descricao}</span>
                </span>
                <ChevronRight aria-hidden="true" className="size-6 shrink-0 text-tinta-suave" />
              </button>
            </li>
          ))}
        </ul>

        <StatusOffline />
      </div>
    </main>
  );
}

/**
 * Situação do funcionamento sem internet. No artigo, "Modo offline" aparecia
 * como item do menu; aqui ele é tratado como o que é — uma característica
 * permanente do app (RNF01) — e o painel apenas mostra se está pronto.
 */
function StatusOffline() {
  const [pronto, setPronto] = useState<boolean | null>(null);
  const [instalavel, setInstalavel] = useState(false);
  const [instalado, setInstalado] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    let vivo = true;
    prontoOffline().then((p) => vivo && setPronto(p));
    const t = window.setTimeout(() => vivo && setPronto((p) => p ?? false), 4000);
    setInstalavel(podeInstalar());
    setInstalado(estaInstalado());
    setOnline(navigator.onLine);
    const atualizar = () => {
      setInstalavel(podeInstalar());
      setInstalado(estaInstalado());
    };
    const rede = () => setOnline(navigator.onLine);
    const sair = aoMudarInstalacao(atualizar);
    window.addEventListener('online', rede);
    window.addEventListener('offline', rede);
    return () => {
      vivo = false;
      window.clearTimeout(t);
      sair();
      window.removeEventListener('online', rede);
      window.removeEventListener('offline', rede);
    };
  }, []);

  return (
    <section aria-labelledby="titulo-offline" className="mt-4 rounded-cartao border-2 border-linha bg-superficie p-4">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`grid size-11 shrink-0 place-items-center rounded-full ${pronto ? 'bg-verde-claro text-verde' : 'bg-nevoa text-tinta-suave'}`}
        >
          {pronto ? <CircleCheck className="size-6" /> : <CloudOff className="size-6" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="titulo-offline" className="font-extrabold">
            {pronto === null ? 'Verificando o funcionamento sem internet…' : pronto ? 'Pronto para usar sem internet' : 'Ainda não está guardado no aparelho'}
          </h2>
          <p className="text-[0.95rem] leading-snug text-tinta-suave">
            {pronto
              ? 'Todas as telas e figuras estão guardadas neste aparelho. Os dados da criança nunca saem dele.'
              : 'Abra o Voxa uma vez com internet para que ele seja guardado no aparelho.'}
            {!online && ' Você está sem internet agora.'}
          </p>
        </div>
      </div>
      {!instalado && (
        <div className="mt-3 border-t border-linha pt-3">
          {instalavel ? (
            <button
              type="button"
              onClick={() => instalar()}
              className="inline-flex min-h-12 items-center gap-2 rounded-campo bg-azul px-4 font-bold text-white"
            >
              <Smartphone aria-hidden="true" className="size-5" />
              Instalar na tela inicial
            </button>
          ) : (
            <p className="text-[0.95rem] leading-snug text-tinta-suave">
              <strong className="text-tinta">Para instalar:</strong> no Android, abra o menu do Chrome e toque em
              &ldquo;Instalar app&rdquo;. No iPhone, toque em Compartilhar e depois em &ldquo;Adicionar à Tela de Início&rdquo;.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
