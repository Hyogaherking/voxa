'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowDown, ArrowUp, ChevronRight, EyeOff, Plus } from 'lucide-react';
import { db, type Prancha } from '@/lib/db';
import { novoId } from '@/lib/dados';
import { useVoxa } from '../contexto';
import { CabecalhoTela } from '../ui/CabecalhoTela';
import { Pictograma } from '../ui/Pictograma';
import { Botao } from '../ui/Botao';

/** Lista das pranchas de comunicação (RF07). */
export function Pranchas() {
  const { ir, avisar } = useVoxa();
  const pranchas = useLiveQuery(() => db.pranchas.orderBy('ordem').toArray(), []);
  const contagem = useLiveQuery(async () => {
    const mapa: Record<string, number> = {};
    await db.cartoes.each((c) => {
      mapa[c.pranchaId] = (mapa[c.pranchaId] ?? 0) + 1;
    });
    return mapa;
  }, []);

  const mover = async (indice: number, passo: -1 | 1) => {
    if (!pranchas) return;
    const lista = [...pranchas];
    const alvo = indice + passo;
    if (alvo < 0 || alvo >= lista.length) return;
    [lista[indice], lista[alvo]] = [lista[alvo], lista[indice]];
    await db.transaction('rw', db.pranchas, () =>
      Promise.all(lista.map((p, i) => db.pranchas.update(p.id, { ordem: i }))),
    );
    avisar(`${lista[alvo].nome} ${passo < 0 ? 'subiu' : 'desceu'}`);
  };

  const criar = async () => {
    const id = novoId();
    const nova: Prancha = {
      id,
      nome: 'Nova prancha',
      imagem: { tipo: 'picto', id: 'sparkles' },
      cor: 'nuvem',
      ordem: pranchas?.length ?? 0,
      visivel: true,
    };
    await db.pranchas.add(nova);
    ir({ nome: 'prancha', id });
  };

  return (
    <main className="min-h-dvh bg-nevoa pb-10">
      <CabecalhoTela titulo="Editar pranchas" />
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <p className="text-tinta-suave">A criança vê as pranchas nesta ordem. Toque em uma prancha para editar as figuras.</p>

        <ul role="list" className="mt-4 overflow-hidden rounded-cartao bg-superficie">
          {pranchas?.map((p, i) => (
            <li key={p.id} className={`flex items-center gap-1 pr-2 ${i ? 'border-t border-linha' : ''}`}>
              <button
                type="button"
                onClick={() => ir({ nome: 'prancha', id: p.id })}
                className="flex min-h-[4.5rem] min-w-0 flex-1 items-center gap-3 py-3 pl-4 text-left hover:bg-nevoa"
              >
                <span className={`cor-${p.cor} grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-(--borda) bg-(--fundo)`}>
                  <Pictograma imagem={p.imagem} className="size-8" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">{p.nome}</span>
                  <span className="flex items-center gap-1.5 text-[0.95rem] text-tinta-suave">
                    {contagem?.[p.id] ?? 0} {(contagem?.[p.id] ?? 0) === 1 ? 'figura' : 'figuras'}
                    {!p.visivel && (
                      <>
                        <EyeOff aria-hidden="true" className="ml-1 size-4" /> escondida
                      </>
                    )}
                  </span>
                </span>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-tinta-suave" />
              </button>
              <BotaoMover rotulo={`Mover ${p.nome} para cima`} desativado={i === 0} aoClicar={() => mover(i, -1)}>
                <ArrowUp aria-hidden="true" className="size-5" />
              </BotaoMover>
              <BotaoMover rotulo={`Mover ${p.nome} para baixo`} desativado={i === pranchas.length - 1} aoClicar={() => mover(i, 1)}>
                <ArrowDown aria-hidden="true" className="size-5" />
              </BotaoMover>
            </li>
          ))}
        </ul>

        <Botao className="mt-4 w-full" icone={<Plus aria-hidden="true" className="size-5" />} onClick={criar}>
          Nova prancha
        </Botao>
      </div>
    </main>
  );
}

export function BotaoMover({
  rotulo,
  desativado,
  aoClicar,
  children,
}: {
  rotulo: string;
  desativado: boolean;
  aoClicar: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={rotulo}
      disabled={desativado}
      onClick={aoClicar}
      className="grid size-12 shrink-0 place-items-center rounded-xl text-tinta-suave hover:bg-nevoa disabled:opacity-30"
    >
      {children}
    </button>
  );
}
