'use client';

import { ChevronLeft } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useVoxa } from '../contexto';

/** Cabeçalho das telas do responsável, com "Voltar" e título. */
export function CabecalhoTela({ titulo, acao }: { titulo: string; acao?: React.ReactNode }) {
  const { voltar } = useVoxa();
  const tituloRef = useRef<HTMLHeadingElement>(null);

  // Leva o foco ao título ao abrir a tela, para leitores de tela anunciarem onde estão.
  useEffect(() => {
    tituloRef.current?.focus();
  }, [titulo]);

  return (
    <header className="sticky top-0 z-20 border-b border-linha bg-nevoa/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={voltar}
          className="inline-flex min-h-12 items-center gap-1 rounded-campo pr-3 pl-1 font-bold text-azul hover:bg-azul-claro"
        >
          <ChevronLeft aria-hidden="true" className="size-6" />
          Voltar
        </button>
        <h1 ref={tituloRef} tabIndex={-1} className="min-w-0 flex-1 truncate text-xl font-extrabold outline-none">
          {titulo}
        </h1>
        {acao}
      </div>
    </header>
  );
}
