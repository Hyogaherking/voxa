'use client';

import { useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { db } from '@/lib/db';
import { registrar } from '@/lib/dados';
import { pulsoToque } from '@/lib/movimento';
import {
  APOIOS_DIFICEIS,
  APOIOS_POSITIVOS,
  EMOCOES,
  INTENSIDADES,
  falaEmocao,
  rotuloEmocao,
  type Apoio,
  type Emocao,
} from '@/data/emocoes';
import { useVoxa } from '../contexto';
import { Pictograma } from '../ui/Pictograma';
import { RotuloCartao } from '../ui/RotuloCartao';
import { Dialogo } from '../ui/Dialogo';
import { Respirar } from './Respirar';

/*
  Tela de expressão de emoções (RF03) — prevista no artigo e ainda não
  prototipada na etapa documentada. A criança escolhe como está; a voz fala
  "Eu estou ..." e aparecem opções de intensidade e de apoio.
*/
export function Emocoes() {
  const { perfil, falar, ajustes } = useVoxa();
  const [escolhida, setEscolhida] = useState<Emocao | null>(null);
  const [respirando, setRespirando] = useState(false);
  const registro = useRef<number | undefined>(undefined);

  const escolher = async (e: Emocao, el: HTMLElement) => {
    pulsoToque(el);
    if (ajustes.vibrar) navigator.vibrate?.(12);
    const texto = falaEmocao(e, perfil.genero);
    falar(texto);
    setEscolhida(e);
    registro.current = await registrar({ tipo: 'emocao', texto, refId: e.id, picto: e.picto });
  };

  return (
    <div className="rolagem-fina min-h-0 flex-1 overflow-y-auto px-4 pt-2 pb-4">
      <h1 className="mb-3 text-[1.6rem] leading-tight font-extrabold">Como você está?</h1>
      <ul className="grade-cartoes" role="list">
        {EMOCOES.map((e) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={(ev) => escolher(e, ev.currentTarget)}
              className={`cor-${e.cor} sem-selecao @container flex aspect-[1/0.9] w-full flex-col items-center justify-center gap-[6%] rounded-cartao border-(length:--largura-borda) border-(--borda) bg-(--fundo) p-[8%]`}
            >
              <Pictograma imagem={{ tipo: 'picto', id: e.picto }} className="aspect-square w-[52%] max-w-28" />
              <RotuloCartao texto={rotuloEmocao(e, perfil.genero)} />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setRespirando(true)}
        className="sem-selecao mt-4 flex min-h-16 w-full items-center gap-4 rounded-cartao border-2 border-[#c9bdf0] bg-calma px-4 py-2 text-left"
      >
        <Pictograma imagem={{ tipo: 'picto', id: 'person-in-lotus-position' }} className="size-12" />
        <span>
          <span className="rotulo block text-xl font-extrabold">Respirar juntos</span>
          <span className="block text-tinta-suave">Um círculo que cresce e diminui devagar</span>
        </span>
      </button>

      {escolhida && (
        <PainelEmocao
          emocao={escolhida}
          aoFechar={() => setEscolhida(null)}
          aoIntensidade={(i) => {
            const texto = falaEmocao(escolhida, perfil.genero, i);
            falar(texto);
            if (registro.current) db.historico.update(registro.current, { intensidade: i, texto });
          }}
          aoApoio={(a) => {
            const texto = a.fala(perfil.genero);
            falar(texto);
            registrar({ tipo: 'apoio', texto, refId: a.id, picto: a.picto });
            if (a.respirar) {
              setEscolhida(null);
              setRespirando(true);
            }
          }}
        />
      )}
      {respirando && <Respirar aoTerminar={() => setRespirando(false)} />}
    </div>
  );
}

function PainelEmocao({
  emocao,
  aoFechar,
  aoIntensidade,
  aoApoio,
}: {
  emocao: Emocao;
  aoFechar: () => void;
  aoIntensidade: (i: 1 | 2 | 3) => void;
  aoApoio: (a: Apoio) => void;
}) {
  const { perfil, falar } = useVoxa();
  const [intensidade, setIntensidade] = useState<1 | 2 | 3 | null>(null);
  const rotulo = rotuloEmocao(emocao, perfil.genero);
  const apoios = emocao.dificil ? APOIOS_DIFICEIS : APOIOS_POSITIVOS;
  const textoAtual = falaEmocao(emocao, perfil.genero, intensidade ?? undefined);

  return (
    <Dialogo aberto aoFechar={aoFechar} titulo={rotulo} largo>
      <div className="flex items-center gap-4">
        <div className={`cor-${emocao.cor} grid size-28 shrink-0 place-items-center rounded-cartao bg-(--fundo)`}>
          <Pictograma imagem={{ tipo: 'picto', id: emocao.picto }} className="size-20" />
        </div>
        <div className="min-w-0">
          <p className="text-[1.45rem] leading-tight font-extrabold">{textoAtual}</p>
          <button
            type="button"
            onClick={() => falar(textoAtual)}
            className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-campo bg-azul-claro px-4 font-bold text-azul-escuro"
          >
            <Volume2 aria-hidden="true" className="size-5" />
            Falar de novo
          </button>
        </div>
      </div>

      <h3 className="mt-5 mb-2 text-lg font-extrabold">Quanto?</h3>
      <div role="radiogroup" aria-label="Quanto?" className="grid grid-cols-3 gap-2">
        {INTENSIDADES.map((i) => {
          const marcado = intensidade === i.valor;
          return (
            <button
              key={i.valor}
              type="button"
              role="radio"
              aria-checked={marcado}
              onClick={() => {
                setIntensidade(i.valor);
                aoIntensidade(i.valor);
              }}
              className={`sem-selecao flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-cartao border-2 font-extrabold ${
                marcado ? 'border-azul bg-azul-claro text-azul-escuro' : 'border-linha bg-superficie'
              }`}
            >
              <Barras nivel={i.valor} ativo={marcado} />
              <span className="rotulo">{i.rotulo}</span>
            </button>
          );
        })}
      </div>

      <h3 className="mt-5 mb-2 text-lg font-extrabold">{emocao.dificil ? 'O que pode ajudar?' : 'O que você quer?'}</h3>
      <ul role="list" className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
        {apoios.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => aoApoio(a)}
              className={`cor-${a.cor} sem-selecao flex min-h-28 w-full flex-col items-center justify-center gap-1.5 rounded-cartao border-(length:--largura-borda) border-(--borda) bg-(--fundo) p-2`}
            >
              <Pictograma imagem={{ tipo: 'picto', id: a.picto }} className="size-12" />
              <span className="rotulo text-center leading-tight font-extrabold">{a.rotulo}</span>
            </button>
          </li>
        ))}
      </ul>
    </Dialogo>
  );
}

/** Indicador visual de intensidade (1 a 3 barras), para quem ainda não lê. */
function Barras({ nivel, ativo }: { nivel: 1 | 2 | 3; ativo: boolean }) {
  return (
    <span aria-hidden="true" className="flex h-7 items-end gap-1">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`w-2.5 rounded-full ${n <= nivel ? (ativo ? 'bg-azul' : 'bg-tinta-suave') : 'bg-linha'}`}
          style={{ height: `${[40, 70, 100][n - 1]}%` }}
        />
      ))}
    </span>
  );
}
