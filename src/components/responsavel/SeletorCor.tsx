'use client';

import { useRef } from 'react';
import { Check } from 'lucide-react';
import { CORES, type Cor } from '@/lib/db';

/* Nomes das cores e o tipo de palavra que costumam marcar (Chave de Fitzgerald modificada). */
export const NOMES_COR: Record<Cor, { nome: string; uso: string }> = {
  sol: { nome: 'Amarelo', uso: 'pessoas' },
  folha: { nome: 'Verde', uso: 'ações' },
  ceu: { nome: 'Azul', uso: 'descrições' },
  pessego: { nome: 'Laranja', uso: 'coisas' },
  rosa: { nome: 'Rosa', uso: 'social' },
  lavanda: { nome: 'Lilás', uso: 'perguntas' },
  menta: { nome: 'Verde-água', uso: 'lugares' },
  nuvem: { nome: 'Cinza', uso: 'outros' },
};

export function SeletorCor({ valor, aoMudar, id }: { valor: Cor; aoMudar: (c: Cor) => void; id: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const indice = CORES.indexOf(valor);
  return (
    <div>
      <p id={`${id}-rotulo`} className="font-bold">
        Cor
      </p>
      <p className="text-[0.95rem] leading-snug text-tinta-suave">
        Dica: muitas fonoaudiólogas usam uma cor para cada tipo de palavra. A sugestão aparece embaixo de cada cor.
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-rotulo`}
        className="mt-2 grid grid-cols-4 gap-2"
        onKeyDown={(e) => {
          const passo = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
          if (!passo) return;
          e.preventDefault();
          const prox = (indice + passo + CORES.length) % CORES.length;
          aoMudar(CORES[prox]);
          refs.current[prox]?.focus();
        }}
      >
        {CORES.map((c, i) => {
          const marcada = c === valor;
          return (
            <button
              key={c}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={marcada}
              tabIndex={marcada ? 0 : -1}
              aria-label={`${NOMES_COR[c].nome}, para ${NOMES_COR[c].uso}`}
              onClick={() => aoMudar(c)}
              className={`cor-${c} flex flex-col items-center gap-1 rounded-2xl border-2 p-1.5 ${marcada ? 'border-azul' : 'border-transparent'}`}
            >
              <span className="grid h-10 w-full place-items-center rounded-xl border-2 border-(--borda) bg-(--fundo)">
                {marcada && <Check aria-hidden="true" className="size-5 text-tinta" />}
              </span>
              <span aria-hidden="true" className="text-[0.8rem] leading-tight text-tinta-suave">
                {NOMES_COR[c].uso}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
