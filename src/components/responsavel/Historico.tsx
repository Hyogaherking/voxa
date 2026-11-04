'use client';

import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Download, Trash2 } from 'lucide-react';
import { db, type Registro, type TipoRegistro } from '@/lib/db';
import { INTENSIDADES } from '@/data/emocoes';
import { useVoxa } from '../contexto';
import { CabecalhoTela } from '../ui/CabecalhoTela';
import { Escolha } from '../ui/Escolha';
import { Pictograma } from '../ui/Pictograma';
import { Botao } from '../ui/Botao';
import { Dialogo } from '../ui/Dialogo';

type Periodo = 'hoje' | '7' | '30' | 'tudo';

const NOME_TIPO: Record<TipoRegistro, string> = {
  cartao: 'Figura',
  frase: 'Frase',
  emocao: 'Sentimento',
  apoio: 'Pedido de apoio',
};

function inicioDoPeriodo(p: Periodo): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (p === 'hoje') return d.getTime();
  if (p === '7') return d.getTime() - 6 * 864e5;
  if (p === '30') return d.getTime() - 29 * 864e5;
  return 0;
}

/** Registro local do histórico de uso e consulta pelo responsável (RF08). */
export function Historico() {
  const { ajustes, ir, avisar } = useVoxa();
  const [periodo, setPeriodo] = useState<Periodo>('7');
  const [limite, setLimite] = useState(60);
  const [confirmarApagar, setConfirmarApagar] = useState(false);
  const registros = useLiveQuery(
    () => db.historico.where('em').aboveOrEqual(inicioDoPeriodo(periodo)).reverse().sortBy('em'),
    [periodo],
  );

  const resumo = useMemo(() => {
    const r = { cartao: 0, frase: 0, emocao: 0, apoio: 0 };
    registros?.forEach((x) => r[x.tipo]++);
    return r;
  }, [registros]);

  const maisUsadas = useMemo(() => agrupar(registros?.filter((x) => x.tipo === 'cartao' || x.tipo === 'apoio') ?? []), [registros]);
  const sentimentos = useMemo(() => agrupar(registros?.filter((x) => x.tipo === 'emocao') ?? []), [registros]);
  const porDia = useMemo(() => agruparPorDia((registros ?? []).slice(0, limite)), [registros, limite]);

  const exportarCsv = () => {
    if (!registros?.length) return;
    const linhas = [['Data', 'Hora', 'Tipo', 'Texto', 'Intensidade']];
    for (const r of [...registros].reverse()) {
      const d = new Date(r.em);
      linhas.push([
        d.toLocaleDateString('pt-BR'),
        d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        NOME_TIPO[r.tipo],
        r.texto,
        r.intensidade ? INTENSIDADES[r.intensidade - 1].rotulo : '',
      ]);
    }
    const csv = '﻿' + linhas.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxa-historico-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <main className="min-h-dvh bg-nevoa pb-10">
      <CabecalhoTela titulo="Histórico de uso" />
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        {!ajustes.registrarHistorico && (
          <div className="flex flex-wrap items-center gap-3 rounded-cartao border-2 border-(--sol-borda) bg-(--sol) p-4">
            <p className="flex-1">O registro de uso está desligado. Novos usos não aparecem aqui.</p>
            <Botao variante="secundario" onClick={() => ir({ nome: 'preferencias' })}>
              Ligar registro
            </Botao>
          </div>
        )}

        <div className="rounded-cartao bg-superficie px-4 py-1">
          <Escolha<Periodo>
            rotulo="Período"
            valor={periodo}
            aoMudar={(p) => {
              setPeriodo(p);
              setLimite(60);
            }}
            opcoes={[
              { valor: 'hoje', rotulo: 'Hoje' },
              { valor: '7', rotulo: '7 dias' },
              { valor: '30', rotulo: '30 dias' },
              { valor: 'tudo', rotulo: 'Tudo' },
            ]}
          />
        </div>

        <dl className="grid grid-cols-3 gap-2">
          <Numero rotulo="Figuras tocadas" valor={resumo.cartao} />
          <Numero rotulo="Frases faladas" valor={resumo.frase} />
          <Numero rotulo="Sentimentos" valor={resumo.emocao} />
        </dl>

        {registros && registros.length === 0 ? (
          <p className="rounded-cartao bg-superficie p-6 text-center text-tinta-suave">
            Nenhum uso registrado neste período. Quando a criança tocar nas figuras ou nos sentimentos, eles aparecem aqui.
          </p>
        ) : (
          <>
            {maisUsadas.length > 0 && <Barras titulo="Mais usadas" itens={maisUsadas} />}
            {sentimentos.length > 0 && <Barras titulo="Sentimentos expressos" itens={sentimentos} />}

            <section aria-labelledby="titulo-linha" className="rounded-cartao bg-superficie p-4">
              <h2 id="titulo-linha" className="text-lg font-extrabold">
                Linha do tempo
              </h2>
              {porDia.map(([dia, itens]) => (
                <div key={dia} className="mt-3">
                  <h3 className="sticky top-16 bg-superficie py-1 font-bold text-tinta-suave">{dia}</h3>
                  <ol className="divide-y divide-linha">
                    {itens.map((r) => (
                      <li key={r.id} className="flex items-center gap-3 py-2">
                        <time className="w-12 shrink-0 text-[0.95rem] text-tinta-suave tabular-nums" dateTime={new Date(r.em).toISOString()}>
                          {new Date(r.em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </time>
                        <span className="grid size-9 shrink-0 place-items-center">
                          {r.picto && <Pictograma imagem={{ tipo: 'picto', id: r.picto }} className="size-8" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block">{r.texto}</span>
                          <span className="block text-[0.85rem] text-tinta-suave">{NOME_TIPO[r.tipo]}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              {registros && registros.length > limite && (
                <Botao variante="secundario" className="mt-3 w-full" onClick={() => setLimite((l) => l + 100)}>
                  Mostrar mais
                </Botao>
              )}
            </section>

            <div className="flex flex-wrap gap-2">
              <Botao variante="secundario" icone={<Download aria-hidden="true" className="size-5" />} onClick={exportarCsv}>
                Baixar planilha
              </Botao>
              <Botao variante="perigo" icone={<Trash2 aria-hidden="true" className="size-5" />} onClick={() => setConfirmarApagar(true)}>
                Apagar histórico
              </Botao>
            </div>
            <p className="text-[0.95rem] text-tinta-suave">
              A planilha abre no Excel ou no Google Planilhas e pode ser compartilhada com a equipe que acompanha a criança.
            </p>
          </>
        )}
      </div>

      <Dialogo
        aberto={confirmarApagar}
        aoFechar={() => setConfirmarApagar(false)}
        titulo="Apagar todo o histórico?"
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setConfirmarApagar(false)}>
              Cancelar
            </Botao>
            <Botao
              variante="perigo"
              onClick={async () => {
                await db.historico.clear();
                setConfirmarApagar(false);
                avisar('Histórico apagado');
              }}
            >
              Apagar histórico
            </Botao>
          </>
        }
      >
        <p>Todos os registros de uso deste aparelho serão apagados. As pranchas e o perfil não mudam.</p>
      </Dialogo>
    </main>
  );
}

type Grupo = { chave: string; texto: string; picto?: string; total: number };

function agrupar(lista: Registro[]): Grupo[] {
  const mapa = new Map<string, Grupo>();
  for (const r of lista) {
    const chave = r.refId ?? r.texto;
    const g = mapa.get(chave);
    if (g) g.total++;
    else mapa.set(chave, { chave, texto: r.tipo === 'emocao' ? r.texto.replace(/^Eu estou (com )?(um pouco (de )?|bastante |muit[oa] )?/i, '') : r.texto, picto: r.picto, total: 1 });
  }
  return [...mapa.values()].sort((a, b) => b.total - a.total).slice(0, 6);
}

function agruparPorDia(lista: Registro[]): [string, Registro[]][] {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const grupos = new Map<string, Registro[]>();
  for (const r of lista) {
    const d = new Date(r.em);
    d.setHours(0, 0, 0, 0);
    const dif = Math.round((hoje.getTime() - d.getTime()) / 864e5);
    const nome =
      dif === 0 ? 'Hoje' : dif === 1 ? 'Ontem' : d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    grupos.set(nome, [...(grupos.get(nome) ?? []), r]);
  }
  return [...grupos.entries()];
}

function Numero({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex flex-col-reverse rounded-cartao bg-superficie p-3">
      <dt className="text-[0.9rem] leading-tight text-tinta-suave">{rotulo}</dt>
      <dd className="text-[1.75rem] leading-none font-extrabold tabular-nums">{valor}</dd>
    </div>
  );
}

function Barras({ titulo, itens }: { titulo: string; itens: Grupo[] }) {
  const max = Math.max(...itens.map((i) => i.total));
  return (
    <section aria-label={titulo} className="rounded-cartao bg-superficie p-4">
      <h2 className="text-lg font-extrabold">{titulo}</h2>
      <ol className="mt-3 space-y-2.5">
        {itens.map((i) => (
          <li key={i.chave} className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center">
              {i.picto && <Pictograma imagem={{ tipo: 'picto', id: i.picto }} className="size-8" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex justify-between gap-2">
                <span className="truncate first-letter:uppercase">{i.texto}</span>
                <span className="font-bold tabular-nums">
                  {i.total}
                  <span className="sr-only"> {i.total === 1 ? 'vez' : 'vezes'}</span>
                </span>
              </span>
              <span aria-hidden="true" className="mt-1 block h-2.5 overflow-hidden rounded-full bg-nevoa">
                <span className="block h-full rounded-full bg-azul" style={{ width: `${(i.total / max) * 100}%` }} />
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
