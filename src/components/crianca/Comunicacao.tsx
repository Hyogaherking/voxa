'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Volume2 } from 'lucide-react';
import { db, type Cartao, type Prancha } from '@/lib/db';
import { registrar } from '@/lib/dados';
import { entradaGrade, pulsoToque, voarParaFaixa } from '@/lib/movimento';
import { useVoxa } from '../contexto';
import { Pictograma } from '../ui/Pictograma';
import { RotuloCartao } from '../ui/RotuloCartao';
import { FaixaFrase } from './FaixaFrase';

/*
  Tela de comunicação alternativa (Figura 2 do artigo).
  RF01 seleção de imagens · RF02 voz em pt-BR · RF04 composição de frases.
*/
export function Comunicacao() {
  const { ajustes, falar, falarFrase, frase, adicionarNaFrase, falando } = useVoxa();
  const pranchas = useLiveQuery(() => db.pranchas.orderBy('ordem').filter((p) => p.visivel).toArray(), []);
  const [ativaId, setAtivaId] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('voxa:prancha');
    } catch {
      return null;
    }
  });
  const ativa = pranchas?.find((p) => p.id === ativaId) ?? pranchas?.[0];

  const cartoes = useLiveQuery(
    async () =>
      ativa ? (await db.cartoes.where('pranchaId').equals(ativa.id).sortBy('ordem')).filter((c) => c.visivel) : [],
    [ativa?.id],
  );

  const grade = useRef<HTMLDivElement>(null);
  const alvoFaixa = useRef<HTMLSpanElement>(null);

  const escolherPrancha = (p: Prancha) => {
    setAtivaId(p.id);
    try {
      sessionStorage.setItem('voxa:prancha', p.id);
    } catch {}
  };

  // Anima a entrada dos cartões só quando a criança troca de prancha
  const ultimaPrancha = useRef<string | undefined>(undefined);
  useLayoutEffect(() => {
    if (!cartoes || !ativa) return;
    if (ultimaPrancha.current && ultimaPrancha.current !== ativa.id) entradaGrade(grade.current);
    ultimaPrancha.current = ativa.id;
    grade.current?.scrollTo({ top: 0 });
  }, [cartoes, ativa]);

  const tocar = (c: Cartao, botao: HTMLElement) => {
    pulsoToque(botao);
    if (ajustes.vibrar) navigator.vibrate?.(12);
    const texto = c.fala?.trim() || c.rotulo;
    if (ajustes.falarAoTocar || !ajustes.montarFrases) {
      falar(texto);
      registrar({ tipo: 'cartao', texto, refId: c.id, picto: c.imagem.tipo === 'picto' ? c.imagem.id : undefined });
    }
    if (ajustes.montarFrases) {
      voarParaFaixa(botao.querySelector('img'), alvoFaixa.current);
      adicionarNaFrase({ cartaoId: c.id, rotulo: c.rotulo, imagem: c.imagem, cor: c.cor });
    }
  };

  const falarAFrase = () => {
    if (!frase.length) return;
    falarFrase();
    registrar({
      tipo: 'frase',
      texto: frase.map((f) => f.rotulo).join(' '),
      picto: frase[0].imagem.tipo === 'picto' ? frase[0].imagem.id : undefined,
    });
  };

  if (!pranchas) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h1 className="sr-only">Falar</h1>
      {ajustes.montarFrases && <FaixaFrase alvo={alvoFaixa} />}

      <AbasPranchas pranchas={pranchas} ativa={ativa} aoEscolher={escolherPrancha} />

      <div
        ref={grade}
        id="painel-prancha"
        role="tabpanel"
        aria-label={ativa ? `Figuras de ${ativa.nome}` : 'Figuras'}
        className="rolagem-fina min-h-0 flex-1 overflow-y-auto px-4 pt-1 pb-4"
      >
        {pranchas.length === 0 ? (
          <Vazio texto="Nenhuma prancha está visível. O responsável pode criar ou mostrar pranchas no painel." />
        ) : cartoes && cartoes.length === 0 ? (
          <Vazio texto="Esta prancha ainda não tem figuras. O responsável pode adicionar no painel." />
        ) : (
          <ul className="grade-cartoes" role="list">
            {cartoes?.map((c) => (
              <li key={c.id} data-cartao>
                <CartaoCrianca cartao={c} aoTocar={tocar} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {ajustes.montarFrases && (
        <div className="px-4 pb-3">
          <button
            type="button"
            onClick={falarAFrase}
            disabled={!frase.length}
            className="sem-selecao flex min-h-16 w-full items-center justify-center gap-3 rounded-cartao bg-azul text-xl font-extrabold text-white shadow-[0_2px_0_var(--color-azul-escuro)] transition-colors active:translate-y-px active:bg-azul-escuro disabled:bg-linha disabled:text-tinta-suave disabled:shadow-none"
          >
            <Volume2 aria-hidden="true" className={`size-7 ${falando ? 'animate-pulse' : ''}`} />
            <span className="rotulo">Falar frase</span>
          </button>
        </div>
      )}
    </div>
  );
}

function CartaoCrianca({ cartao, aoTocar }: { cartao: Cartao; aoTocar: (c: Cartao, el: HTMLElement) => void }) {
  const fala = cartao.fala?.trim();
  return (
    <button
      type="button"
      onClick={(e) => aoTocar(cartao, e.currentTarget)}
      aria-label={fala && fala !== cartao.rotulo ? `${cartao.rotulo}: ${fala}` : cartao.rotulo}
      className={`cor-${cartao.cor} sem-selecao @container flex aspect-[1/0.9] w-full flex-col items-center justify-center gap-[6%] rounded-cartao border-(length:--largura-borda) border-(--borda) bg-(--fundo) p-[8%] text-tinta`}
    >
      <Pictograma imagem={cartao.imagem} className="aspect-square w-[52%] max-w-28" />
      <RotuloCartao texto={cartao.rotulo} />
    </button>
  );
}

function AbasPranchas({
  pranchas,
  ativa,
  aoEscolher,
}: {
  pranchas: Prancha[];
  ativa?: Prancha;
  aoEscolher: (p: Prancha) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const indiceAtivo = useMemo(() => pranchas.findIndex((p) => p.id === ativa?.id), [pranchas, ativa]);

  useEffect(() => {
    refs.current[indiceAtivo]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [indiceAtivo]);

  if (pranchas.length < 2) return null;

  const aoTeclar = (e: React.KeyboardEvent) => {
    const passo = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!passo) return;
    e.preventDefault();
    const prox = (indiceAtivo + passo + pranchas.length) % pranchas.length;
    aoEscolher(pranchas[prox]);
    refs.current[prox]?.focus();
  };

  return (
    <div role="tablist" aria-label="Pranchas" onKeyDown={aoTeclar} className="sem-barra flex gap-2 overflow-x-auto px-4 py-2">
      {pranchas.map((p, i) => {
        const sel = p.id === ativa?.id;
        return (
          <button
            key={p.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            aria-selected={sel}
            aria-controls="painel-prancha"
            tabIndex={sel ? 0 : -1}
            onClick={() => aoEscolher(p)}
            className={`cor-${p.cor} sem-selecao flex min-h-14 shrink-0 items-center gap-2 rounded-full border-(length:--largura-borda) py-1.5 pr-4 pl-1.5 font-extrabold transition-colors ${
              sel ? 'border-(--borda) bg-(--fundo) text-tinta' : 'border-transparent bg-superficie text-tinta-suave'
            }`}
          >
            <span className={`grid size-10 place-items-center rounded-full ${sel ? 'bg-superficie/70' : 'bg-(--fundo)'}`}>
              <Pictograma imagem={p.imagem} className="size-7" />
            </span>
            <span className="rotulo whitespace-nowrap">{p.nome}</span>
          </button>
        );
      })}
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return <p className="mx-auto mt-10 max-w-sm text-center text-lg text-tinta-suave">{texto}</p>;
}
