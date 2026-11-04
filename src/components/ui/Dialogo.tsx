'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { subirPainel } from '@/lib/movimento';

/**
 * Janela sobreposta usando <dialog> nativo: prende o foco, fecha com Esc e
 * é anunciada como diálogo por leitores de tela.
 */
export function Dialogo({
  aberto,
  aoFechar,
  titulo,
  children,
  rodape,
  largo = false,
}: {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
  largo?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (aberto && !d.open) {
      d.showModal();
      subirPainel(d);
    } else if (!aberto && d.open) d.close();
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        aoFechar();
      }}
      onClick={(e) => {
        if (e.target === ref.current) aoFechar();
      }}
      className={`m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] overflow-hidden rounded-[1.5rem] bg-superficie p-0 text-tinta shadow-2xl ${
        largo ? 'max-w-2xl' : 'max-w-md'
      }`}
    >
      {aberto && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-center gap-3 border-b border-linha px-5 py-3">
            <h2 id={id} className="flex-1 text-xl font-extrabold">
              {titulo}
            </h2>
            <button
              type="button"
              onClick={aoFechar}
              aria-label="Fechar"
              className="grid size-12 place-items-center rounded-full text-tinta-suave hover:bg-nevoa"
            >
              <X aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {rodape && <div className="flex flex-wrap justify-end gap-2 border-t border-linha px-5 py-3">{rodape}</div>}
        </div>
      )}
    </dialog>
  );
}
