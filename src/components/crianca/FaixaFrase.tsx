'use client';

import { useEffect, useRef } from 'react';
import { Delete, X } from 'lucide-react';
import { useVoxa } from '../contexto';
import { Pictograma } from '../ui/Pictograma';
import { destacar } from '@/lib/movimento';

/**
 * Faixa de frase (RF04): as figuras tocadas se juntam aqui, da esquerda para a
 * direita. Ao falar, a figura da palavra que está sendo dita fica em destaque.
 */
export function FaixaFrase({ alvo }: { alvo: React.RefObject<HTMLSpanElement | null> }) {
  const { frase, apagarUltimo, limparFrase, itemFalado } = useVoxa();
  const lista = useRef<HTMLOListElement>(null);
  const itens = useRef<(HTMLLIElement | null)[]>([]);

  // Mantém a última figura visível
  useEffect(() => {
    lista.current?.scrollTo({ left: lista.current.scrollWidth, behavior: 'smooth' });
  }, [frase.length]);

  useEffect(() => {
    if (itemFalado >= 0) {
      const el = itens.current[itemFalado];
      el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      destacar(el ?? null);
    }
  }, [itemFalado]);

  const texto = frase.map((f) => f.rotulo).join(' ');

  return (
    <section aria-label="Frase" className="px-4 pt-2">
      <div className="flex min-h-[5.25rem] items-center gap-2 rounded-cartao border-2 border-linha bg-superficie p-2">
        <ol
          ref={lista}
          aria-label={frase.length ? `Frase: ${texto}` : 'Frase vazia'}
          className="sem-barra flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto"
        >
          {frase.length === 0 && (
            <li className="px-2 text-[1.02rem] leading-snug text-tinta-suave">Toque nas figuras para montar uma frase</li>
          )}
          {frase.map((f, i) => (
            <li
              key={f.chave}
              ref={(el) => {
                itens.current[i] = el;
              }}
              className={`cor-${f.cor} flex h-[4.25rem] w-[4.25rem] shrink-0 flex-col items-center justify-center rounded-2xl border-2 bg-(--fundo) transition-[border-color,box-shadow] ${
                i === itemFalado ? 'border-azul shadow-[0_0_0_3px_var(--color-azul-claro)]' : 'border-(--borda)'
              }`}
            >
              <Pictograma imagem={f.imagem} className="size-9" />
              <span className="rotulo w-full truncate px-1 text-center text-[0.8rem] leading-tight font-extrabold">{f.rotulo}</span>
            </li>
          ))}
          <li aria-hidden="true" className="shrink-0">
            <span ref={alvo} className="block h-12 w-1" />
          </li>
        </ol>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={apagarUltimo}
            disabled={!frase.length}
            aria-label="Apagar a última figura"
            className="grid size-14 place-items-center rounded-2xl bg-nevoa text-tinta disabled:opacity-40"
          >
            <Delete aria-hidden="true" className="size-7" />
          </button>
          <button
            type="button"
            onClick={limparFrase}
            disabled={!frase.length}
            aria-label="Limpar a frase"
            className="grid size-14 place-items-center rounded-2xl bg-nevoa text-tinta disabled:opacity-40"
          >
            <X aria-hidden="true" className="size-7" />
          </button>
        </div>
      </div>
    </section>
  );
}
