'use client';

import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowDown, ArrowUp, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { db, type Cartao, type Prancha } from '@/lib/db';
import { useVoxa } from '../contexto';
import { CabecalhoTela } from '../ui/CabecalhoTela';
import { Pictograma } from '../ui/Pictograma';
import { Botao } from '../ui/Botao';
import { Dialogo } from '../ui/Dialogo';
import { Interruptor } from '../ui/Interruptor';
import { BotaoMover } from './Pranchas';
import { EditorCartao } from './EditorCartao';
import { SeletorCor } from './SeletorCor';
import { SeletorPicto } from './SeletorPicto';

/** Figuras de uma prancha: adicionar, editar, esconder e reordenar (RF07). */
export function EditorPrancha({ pranchaId }: { pranchaId: string }) {
  const { avisar, voltar } = useVoxa();
  const prancha = useLiveQuery(() => db.pranchas.get(pranchaId), [pranchaId]);
  const cartoes = useLiveQuery(() => db.cartoes.where('pranchaId').equals(pranchaId).sortBy('ordem'), [pranchaId]);
  const [editando, setEditando] = useState<Cartao | 'novo' | null>(null);
  const [ajustesAbertos, setAjustesAbertos] = useState(false);

  // Prancha recém-criada: abre os ajustes para dar um nome
  useEffect(() => {
    if (prancha && cartoes && cartoes.length === 0 && prancha.nome === 'Nova prancha') setAjustesAbertos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prancha?.id, cartoes?.length === 0]);

  if (prancha === undefined || !cartoes) return <div className="min-h-dvh bg-nevoa" />;

  const mover = async (indice: number, passo: -1 | 1) => {
    const lista = [...cartoes];
    const alvo = indice + passo;
    if (alvo < 0 || alvo >= lista.length) return;
    [lista[indice], lista[alvo]] = [lista[alvo], lista[indice]];
    await db.transaction('rw', db.cartoes, () => Promise.all(lista.map((c, i) => db.cartoes.update(c.id, { ordem: i }))));
    avisar(`${lista[alvo].rotulo} ${passo < 0 ? 'foi para antes' : 'foi para depois'}`);
  };

  return (
    <main className="min-h-dvh bg-nevoa pb-10">
      <CabecalhoTela
        titulo={prancha.nome}
        acao={
          <Botao variante="secundario" onClick={() => setAjustesAbertos(true)} icone={<Pencil aria-hidden="true" className="size-5" />}>
            Prancha
          </Botao>
        }
      />
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <p className="text-tinta-suave">A criança vê as figuras nesta ordem, da esquerda para a direita. Toque em uma figura para editar.</p>

        {cartoes.length === 0 ? (
          <p className="mt-6 rounded-cartao bg-superficie p-6 text-center text-tinta-suave">
            Esta prancha ainda não tem figuras. Adicione a primeira.
          </p>
        ) : (
          <ul role="list" className="mt-4 overflow-hidden rounded-cartao bg-superficie">
            {cartoes.map((c, i) => (
              <li key={c.id} className={`flex items-center gap-1 pr-2 ${i ? 'border-t border-linha' : ''}`}>
                <button
                  type="button"
                  onClick={() => setEditando(c)}
                  className="flex min-h-[4.5rem] min-w-0 flex-1 items-center gap-3 py-2.5 pl-4 text-left hover:bg-nevoa"
                >
                  <span
                    className={`cor-${c.cor} grid size-14 shrink-0 place-items-center rounded-2xl border-2 border-(--borda) bg-(--fundo) ${
                      c.visivel ? '' : 'opacity-50'
                    }`}
                  >
                    <Pictograma imagem={c.imagem} className={c.imagem.tipo === 'foto' ? 'size-12' : 'size-9'} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-extrabold">{c.rotulo}</span>
                    <span className="flex items-center gap-1.5 truncate text-[0.95rem] text-tinta-suave">
                      {!c.visivel && (
                        <>
                          <EyeOff aria-hidden="true" className="size-4 shrink-0" /> escondida ·
                        </>
                      )}
                      <span className="truncate">Fala: &ldquo;{c.fala?.trim() || c.rotulo}&rdquo;</span>
                    </span>
                  </span>
                </button>
                <BotaoMover rotulo={`Mover ${c.rotulo} para antes`} desativado={i === 0} aoClicar={() => mover(i, -1)}>
                  <ArrowUp aria-hidden="true" className="size-5" />
                </BotaoMover>
                <BotaoMover rotulo={`Mover ${c.rotulo} para depois`} desativado={i === cartoes.length - 1} aoClicar={() => mover(i, 1)}>
                  <ArrowDown aria-hidden="true" className="size-5" />
                </BotaoMover>
              </li>
            ))}
          </ul>
        )}

        <Botao className="mt-4 w-full" icone={<Plus aria-hidden="true" className="size-5" />} onClick={() => setEditando('novo')}>
          Adicionar figura
        </Botao>
      </div>

      {editando && (
        <EditorCartao
          cartao={editando === 'novo' ? null : editando}
          prancha={prancha}
          proximaOrdem={cartoes.length}
          aoFechar={() => setEditando(null)}
        />
      )}
      {ajustesAbertos && (
        <AjustesPrancha
          prancha={prancha}
          quantidade={cartoes.length}
          aoFechar={() => setAjustesAbertos(false)}
          aoExcluir={() => {
            setAjustesAbertos(false);
            voltar();
          }}
        />
      )}
    </main>
  );
}

function AjustesPrancha({
  prancha,
  quantidade,
  aoFechar,
  aoExcluir,
}: {
  prancha: Prancha;
  quantidade: number;
  aoFechar: () => void;
  aoExcluir: () => void;
}) {
  const { avisar } = useVoxa();
  const [r, setR] = useState(prancha);
  const [escolhendo, setEscolhendo] = useState(false);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const nomeValido = r.nome.trim().length > 0;

  const salvar = async () => {
    if (!nomeValido) return;
    await db.pranchas.put({ ...r, nome: r.nome.trim() });
    avisar('Prancha salva');
    aoFechar();
  };

  const excluir = async () => {
    await db.transaction('rw', db.pranchas, db.cartoes, async () => {
      await db.cartoes.where('pranchaId').equals(prancha.id).delete();
      await db.pranchas.delete(prancha.id);
    });
    avisar('Prancha excluída');
    aoExcluir();
  };

  return (
    <Dialogo
      aberto
      aoFechar={aoFechar}
      titulo="Ajustes da prancha"
      rodape={
        confirmarExclusao ? (
          <>
            <p className="mr-auto self-center font-bold text-perigo">
              Excluir a prancha e {quantidade} {quantidade === 1 ? 'figura' : 'figuras'}?
            </p>
            <Botao variante="secundario" onClick={() => setConfirmarExclusao(false)}>
              Não
            </Botao>
            <Botao variante="perigo" onClick={excluir}>
              Sim, excluir
            </Botao>
          </>
        ) : (
          <>
            <Botao
              variante="perigo"
              className="mr-auto"
              icone={<Trash2 aria-hidden="true" className="size-5" />}
              onClick={() => setConfirmarExclusao(true)}
            >
              Excluir
            </Botao>
            <Botao onClick={salvar} disabled={!nomeValido}>
              Salvar prancha
            </Botao>
          </>
        )
      }
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="nome-prancha" className="font-bold">
            Nome da prancha
          </label>
          <input
            id="nome-prancha"
            value={r.nome}
            onChange={(e) => setR({ ...r, nome: e.target.value })}
            onFocus={(e) => r.nome === 'Nova prancha' && e.target.select()}
            maxLength={30}
            aria-invalid={!nomeValido}
            className="mt-2 h-14 w-full rounded-campo border-2 border-linha bg-superficie px-4 text-lg"
          />
          {!nomeValido && <p className="mt-1 font-bold text-perigo">Dê um nome para a prancha.</p>}
        </div>

        <div>
          <p className="font-bold">Figura da prancha</p>
          <div className="mt-2 flex items-center gap-3">
            <span className={`cor-${r.cor} grid size-16 place-items-center rounded-2xl border-2 border-(--borda) bg-(--fundo)`}>
              <Pictograma imagem={r.imagem} className="size-10" />
            </span>
            <Botao variante="secundario" onClick={() => setEscolhendo(true)}>
              Trocar figura
            </Botao>
          </div>
        </div>

        <SeletorCor id="cor-prancha" valor={r.cor} aoMudar={(cor) => setR({ ...r, cor })} />

        <Interruptor
          rotulo="Mostrar para a criança"
          descricao="Desligue para guardar a prancha sem que ela apareça."
          ligado={r.visivel}
          aoMudar={(visivel) => setR({ ...r, visivel })}
        />
      </div>

      <SeletorPicto
        aberto={escolhendo}
        aoFechar={() => setEscolhendo(false)}
        aoEscolher={(id) => {
          setR({ ...r, imagem: { tipo: 'picto', id } });
          setEscolhendo(false);
        }}
      />
    </Dialogo>
  );
}
