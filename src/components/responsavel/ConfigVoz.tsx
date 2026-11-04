'use client';

import { useEffect, useId, useState } from 'react';
import { Check, RotateCcw, Volume2, WifiOff } from 'lucide-react';
import { AJUSTES_PADRAO, type AjustesVoz } from '@/lib/db';
import { atualizarAjustes } from '@/lib/dados';
import { aoMudarVozes, temVoz, vozesPortugues } from '@/lib/voz';
import { useVoxa } from '../contexto';
import { CabecalhoTela } from '../ui/CabecalhoTela';
import { Botao } from '../ui/Botao';

/** Configuração dos parâmetros da síntese de voz (RF09). Salva automaticamente. */
export function ConfigVoz() {
  const { ajustes, falar } = useVoxa();
  const voz = ajustes.voz;
  const [vozes, setVozes] = useState<SpeechSynthesisVoice[]>([]);
  const [teste, setTeste] = useState('Oi! Eu quero brincar.');

  useEffect(() => {
    const carregar = () => setVozes(vozesPortugues());
    carregar();
    return aoMudarVozes(carregar);
  }, []);

  const mudar = (p: Partial<AjustesVoz>) => atualizarAjustes({ voz: { ...voz, ...p } });
  const uriAtual = voz.uri && vozes.some((v) => v.voiceURI === voz.uri) ? voz.uri : vozes[0]?.voiceURI;

  return (
    <main className="min-h-dvh bg-nevoa pb-10">
      <CabecalhoTela titulo="Configurar voz" />
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <section className="rounded-cartao bg-superficie p-4">
          <label htmlFor="teste" className="font-bold">
            Frase de teste
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="teste"
              value={teste}
              onChange={(e) => setTeste(e.target.value)}
              className="h-14 min-w-0 flex-1 rounded-campo border-2 border-linha bg-superficie px-4 text-lg"
            />
            <Botao onClick={() => falar(teste)} icone={<Volume2 aria-hidden="true" className="size-5" />}>
              Ouvir
            </Botao>
          </div>
          <p className="mt-2 text-[0.95rem] text-tinta-suave">As mudanças são salvas na hora.</p>
        </section>

        <section aria-labelledby="titulo-vozes" className="rounded-cartao bg-superficie p-4">
          <h2 id="titulo-vozes" className="font-bold">
            Voz
          </h2>
          {!temVoz() ? (
            <p className="mt-2">Este navegador não tem síntese de voz. As figuras continuam funcionando, mas sem som.</p>
          ) : vozes.length === 0 ? (
            <div className="mt-2 space-y-2 text-[0.98rem]">
              <p>Nenhuma voz em português foi encontrada neste aparelho. A voz padrão do sistema será usada.</p>
              <p className="text-tinta-suave">
                No Android: Configurações → Sistema → Idiomas → Saída de conversão de texto em voz → instale &ldquo;Português (Brasil)&rdquo;.
              </p>
            </div>
          ) : (
            <ul role="radiogroup" aria-labelledby="titulo-vozes" className="mt-2 divide-y divide-linha">
              {vozes.map((v) => {
                const marcada = v.voiceURI === uriAtual;
                return (
                  <li key={v.voiceURI}>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={marcada}
                      onClick={() => {
                        mudar({ uri: v.voiceURI });
                      }}
                      className="flex min-h-14 w-full items-center gap-3 py-2 text-left"
                    >
                      <span
                        aria-hidden="true"
                        className={`grid size-7 shrink-0 place-items-center rounded-full border-2 ${marcada ? 'border-azul bg-azul text-white' : 'border-linha'}`}
                      >
                        {marcada && <Check className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{v.name}</span>
                        <span className="flex items-center gap-1.5 text-[0.9rem] text-tinta-suave">
                          {v.lang}
                          {v.localService && (
                            <>
                              <WifiOff aria-hidden="true" className="ml-1 size-4" /> funciona sem internet
                            </>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-[0.95rem] leading-snug text-tinta-suave">
            As vozes vêm do próprio aparelho. Prefira uma marcada como &ldquo;funciona sem internet&rdquo;.
          </p>
        </section>

        <section className="rounded-cartao bg-superficie p-4">
          <Controle
            rotulo="Velocidade"
            valor={voz.velocidade}
            min={0.5}
            max={1.5}
            passo={0.05}
            descrever={(v) => (v < 0.85 ? 'Devagar' : v > 1.15 ? 'Rápida' : 'Normal')}
            aoMudar={(velocidade) => mudar({ velocidade })}
          />
          <Controle
            rotulo="Tom"
            valor={voz.tom}
            min={0.5}
            max={1.6}
            passo={0.05}
            descrever={(v) => (v < 0.85 ? 'Grave' : v > 1.2 ? 'Agudo' : 'Médio')}
            aoMudar={(tom) => mudar({ tom })}
          />
          <Controle
            rotulo="Volume"
            valor={voz.volume}
            min={0.1}
            max={1}
            passo={0.05}
            descrever={(v) => `${Math.round(v * 100)}%`}
            aoMudar={(volume) => mudar({ volume })}
          />
          <Botao
            variante="fantasma"
            className="mt-2"
            icone={<RotateCcw aria-hidden="true" className="size-5" />}
            onClick={() => mudar({ ...AJUSTES_PADRAO.voz, uri: voz.uri })}
          >
            Voltar ao padrão
          </Botao>
        </section>
      </div>
    </main>
  );
}

function Controle({
  rotulo,
  valor,
  min,
  max,
  passo,
  descrever,
  aoMudar,
}: {
  rotulo: string;
  valor: number;
  min: number;
  max: number;
  passo: number;
  descrever: (v: number) => string;
  aoMudar: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="font-bold">
          {rotulo}
        </label>
        <span className="text-tinta-suave">{descrever(valor)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={passo}
        value={valor}
        aria-valuetext={descrever(valor)}
        onChange={(e) => aoMudar(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
