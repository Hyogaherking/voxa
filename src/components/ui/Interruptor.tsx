import { useId } from 'react';

/** Liga/desliga acessível (role="switch"), com rótulo e explicação. */
export function Interruptor({
  rotulo,
  descricao,
  ligado,
  aoMudar,
}: {
  rotulo: string;
  descricao?: string;
  ligado: boolean;
  aoMudar: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p id={`${id}-r`} className="font-bold">
          {rotulo}
        </p>
        {descricao && (
          <p id={`${id}-d`} className="text-[0.95rem] leading-snug text-tinta-suave">
            {descricao}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={ligado}
        aria-labelledby={`${id}-r`}
        aria-describedby={descricao ? `${id}-d` : undefined}
        onClick={() => aoMudar(!ligado)}
        className={`relative h-9 w-16 shrink-0 rounded-full border-2 transition-colors ${
          ligado ? 'border-azul bg-azul' : 'border-linha bg-nevoa'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-1/2 size-7 -translate-y-1/2 rounded-full bg-white shadow-sm transition-[left] ${
            ligado ? 'left-[1.9rem]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  );
}
