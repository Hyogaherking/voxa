'use client';

import { atualizarAjustes } from '@/lib/dados';
import type { Tamanho } from '@/lib/db';
import { useVoxa } from '../contexto';
import { CabecalhoTela } from '../ui/CabecalhoTela';
import { Escolha } from '../ui/Escolha';
import { Interruptor } from '../ui/Interruptor';
import { Pictograma } from '../ui/Pictograma';
import { RotuloCartao } from '../ui/RotuloCartao';

const PREVIA = [
  { rotulo: 'Água', picto: 'droplet', cor: 'ceu' },
  { rotulo: 'Comida', picto: 'fork-and-knife-with-plate', cor: 'sol' },
  { rotulo: 'Brincar', picto: 'teddy-bear', cor: 'lavanda' },
  { rotulo: 'Ajuda', picto: 'raised-hand', cor: 'pessego' },
];

/** Preferências da interface da criança (RNF03). Salvas na hora. */
export function Preferencias() {
  const { ajustes } = useVoxa();
  const sistemaReduz = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <main className="min-h-dvh bg-nevoa pb-10">
      <CabecalhoTela titulo="Tela da criança" />
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <section aria-label="Prévia" className="rounded-cartao bg-superficie p-4">
          <p className="mb-3 font-bold">Prévia</p>
          <ul className="grade-cartoes" aria-hidden="true">
            {PREVIA.map((c) => (
              <li key={c.rotulo}>
                <div
                  className={`cor-${c.cor} @container flex aspect-[1/0.9] w-full flex-col items-center justify-center gap-[6%] rounded-cartao border-(length:--largura-borda) border-(--borda) bg-(--fundo) p-[8%]`}
                >
                  <Pictograma imagem={{ tipo: 'picto', id: c.picto }} className="aspect-square w-[52%] max-w-28" />
                  <RotuloCartao texto={c.rotulo} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.95rem] text-tinta-suave">As mudanças são salvas na hora.</p>
        </section>

        <section className="divide-y divide-linha rounded-cartao bg-superficie px-4">
          <Escolha<Tamanho>
            rotulo="Tamanho das figuras"
            descricao="Figuras maiores são mais fáceis de tocar. Figuras menores mostram mais opções de uma vez."
            valor={ajustes.tamanho}
            aoMudar={(tamanho) => atualizarAjustes({ tamanho })}
            opcoes={[
              { valor: 'grande', rotulo: 'Grandes' },
              { valor: 'medio', rotulo: 'Médias' },
              { valor: 'pequeno', rotulo: 'Pequenas' },
            ]}
          />
          <Escolha<'nao' | 'sim'>
            rotulo="Letras dos nomes"
            descricao="A letra bastão (maiúscula) costuma ser a primeira que as crianças aprendem."
            valor={ajustes.letraBastao ? 'sim' : 'nao'}
            aoMudar={(v) => atualizarAjustes({ letraBastao: v === 'sim' })}
            opcoes={[
              { valor: 'nao', rotulo: 'Normal', detalhe: <span className="text-xl">Água</span> },
              { valor: 'sim', rotulo: 'Bastão', detalhe: <span className="text-xl">ÁGUA</span> },
            ]}
          />
          <Interruptor
            rotulo="Contraste reforçado"
            descricao="Bordas mais escuras e grossas, para quem enxerga pouco."
            ligado={ajustes.contrasteAlto}
            aoMudar={(contrasteAlto) => atualizarAjustes({ contrasteAlto })}
          />
        </section>

        <section className="divide-y divide-linha rounded-cartao bg-superficie px-4">
          <Interruptor
            rotulo="Montar frases"
            descricao="Mostra a faixa de frase e o botão “Falar frase”. Desligue para uma tela mais simples."
            ligado={ajustes.montarFrases}
            aoMudar={(montarFrases) => atualizarAjustes({ montarFrases })}
          />
          {ajustes.montarFrases ? (
            <Interruptor
              rotulo="Falar ao tocar na figura"
              descricao="A voz fala cada figura assim que ela é tocada, além de colocá-la na frase."
              ligado={ajustes.falarAoTocar}
              aoMudar={(falarAoTocar) => atualizarAjustes({ falarAoTocar })}
            />
          ) : (
            <p className="py-3 text-[0.95rem] text-tinta-suave">Sem a faixa de frase, cada figura fala assim que é tocada.</p>
          )}
          <Interruptor
            rotulo="Vibrar ao tocar"
            descricao="Uma vibração curta confirma o toque. Funciona na maioria dos celulares Android."
            ligado={ajustes.vibrar}
            aoMudar={(vibrar) => atualizarAjustes({ vibrar })}
          />
        </section>

        <section className="rounded-cartao bg-superficie px-4">
          <Escolha<'calmo' | 'nenhum'>
            rotulo="Animações"
            descricao={
              sistemaReduz
                ? 'O aparelho está configurado para reduzir movimento, então as animações já estão desligadas.'
                : 'As animações são curtas e só acontecem quando algo é tocado.'
            }
            valor={ajustes.movimento}
            aoMudar={(movimento) => atualizarAjustes({ movimento })}
            opcoes={[
              { valor: 'calmo', rotulo: 'Calmas' },
              { valor: 'nenhum', rotulo: 'Sem animações' },
            ]}
          />
        </section>

        <section className="rounded-cartao bg-superficie px-4">
          <Interruptor
            rotulo="Registrar histórico de uso"
            descricao="Guarda, só neste aparelho, o que foi falado e sentido, para consulta no histórico."
            ligado={ajustes.registrarHistorico}
            aoMudar={(registrarHistorico) => atualizarAjustes({ registrarHistorico })}
          />
        </section>
      </div>
    </main>
  );
}
