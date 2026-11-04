'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { GRUPOS_PICTO, buscarPictos } from '@/data/pictogramas';
import { Dialogo } from '../ui/Dialogo';
import { Pictograma } from '../ui/Pictograma';

/** Galeria de pictogramas com busca em português. */
export function SeletorPicto({
  aberto,
  aoFechar,
  aoEscolher,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoEscolher: (id: string, rotulo: string) => void;
}) {
  const [termo, setTermo] = useState('');
  const [grupo, setGrupo] = useState<string | undefined>(undefined);
  const resultados = useMemo(() => buscarPictos(termo, grupo), [termo, grupo]);

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} titulo="Escolher figura" largo>
      <div className="sticky -top-4 z-10 -mx-5 -mt-4 bg-superficie px-5 pt-4 pb-2">
        <label htmlFor="busca-picto" className="sr-only">
          Buscar figura
        </label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-tinta-suave" />
          <input
            id="busca-picto"
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar: água, bola, mamãe…"
            autoComplete="off"
            className="h-14 w-full rounded-campo border-2 border-linha bg-superficie pr-4 pl-12 text-lg"
          />
        </div>
        {!termo && (
          <div className="sem-barra mt-2 flex gap-2 overflow-x-auto" role="group" aria-label="Grupos de figuras">
            <ChipGrupo ativo={!grupo} aoClicar={() => setGrupo(undefined)}>
              Todas
            </ChipGrupo>
            {GRUPOS_PICTO.map((g) => (
              <ChipGrupo key={g.id} ativo={grupo === g.id} aoClicar={() => setGrupo(g.id)}>
                {g.nome}
              </ChipGrupo>
            ))}
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {resultados.length} figuras encontradas
      </p>
      {resultados.length === 0 ? (
        <p className="py-8 text-center text-tinta-suave">
          Nenhuma figura para &ldquo;{termo}&rdquo;. Tente outra palavra ou use uma foto.
        </p>
      ) : (
        <ul role="list" className="grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2 pt-2">
          {resultados.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => aoEscolher(p.id, p.r)}
                className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-transparent p-2 hover:border-linha hover:bg-nevoa"
              >
                <Pictograma imagem={{ tipo: 'picto', id: p.id }} className="size-12" />
                <span className="w-full truncate text-center text-[0.9rem] leading-tight">{p.r}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dialogo>
  );
}

function ChipGrupo({ ativo, aoClicar, children }: { ativo: boolean; aoClicar: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={aoClicar}
      className={`min-h-11 shrink-0 rounded-full border-2 px-4 font-bold ${ativo ? 'border-azul bg-azul-claro text-azul-escuro' : 'border-linha bg-superficie'}`}
    >
      {children}
    </button>
  );
}
