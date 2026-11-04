import { useId, useRef } from 'react';

type Opcao<T extends string> = { valor: T; rotulo: string; detalhe?: React.ReactNode };

/** Grupo de opções exclusivas (radiogroup) navegável pelas setas do teclado. */
export function Escolha<T extends string>({
  rotulo,
  descricao,
  opcoes,
  valor,
  aoMudar,
}: {
  rotulo: string;
  descricao?: string;
  opcoes: Opcao<T>[];
  valor: T;
  aoMudar: (v: T) => void;
}) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const indice = opcoes.findIndex((o) => o.valor === valor);

  const aoTeclar = (e: React.KeyboardEvent) => {
    const passo = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!passo) return;
    e.preventDefault();
    const prox = (indice + passo + opcoes.length) % opcoes.length;
    aoMudar(opcoes[prox].valor);
    refs.current[prox]?.focus();
  };

  return (
    <div className="py-3">
      <p id={`${id}-r`} className="font-bold">
        {rotulo}
      </p>
      {descricao && <p className="mb-2 text-[0.95rem] leading-snug text-tinta-suave">{descricao}</p>}
      <div role="radiogroup" aria-labelledby={`${id}-r`} className="mt-2 flex flex-wrap gap-2" onKeyDown={aoTeclar}>
        {opcoes.map((o, i) => {
          const marcado = o.valor === valor;
          return (
            <button
              key={o.valor}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={marcado}
              tabIndex={marcado ? 0 : -1}
              onClick={() => aoMudar(o.valor)}
              className={`flex min-h-12 flex-1 basis-28 flex-col items-center justify-center gap-1 rounded-campo border-2 px-3 py-2 font-bold transition-colors ${
                marcado ? 'border-azul bg-azul-claro text-azul-escuro' : 'border-linha bg-superficie text-tinta'
              }`}
            >
              {o.detalhe}
              {o.rotulo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
