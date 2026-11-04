'use client';

import { useState } from 'react';
import { atualizarAjustes } from '@/lib/dados';
import { conferirPin, criarPin } from '@/lib/pin';
import { useVoxa } from '../contexto';
import { CabecalhoTela } from '../ui/CabecalhoTela';
import { EntradaPin } from './EntradaPin';

type Etapa = 'atual' | 'novo' | 'confirmar';

/** Troca do PIN da área do responsável (RF05). */
export function PinAcesso() {
  const { ajustes, avisar, voltar } = useVoxa();
  const [etapa, setEtapa] = useState<Etapa>(ajustes.pin ? 'atual' : 'novo');
  const [novo, setNovo] = useState('');
  const [erros, setErros] = useState(0);
  const [mensagem, setMensagem] = useState('');

  const textos: Record<Etapa, string> = {
    atual: 'Digite o PIN atual.',
    novo: 'Digite o PIN novo, com 4 números.',
    confirmar: 'Digite o PIN novo mais uma vez.',
  };

  const aoCompletar = async (pin: string) => {
    if (etapa === 'atual' && ajustes.pin) {
      if (await conferirPin(pin, ajustes.pin)) {
        setEtapa('novo');
        setMensagem('');
      } else {
        setErros((e) => e + 1);
        setMensagem('PIN incorreto.');
      }
    } else if (etapa === 'novo') {
      setNovo(pin);
      setEtapa('confirmar');
      setMensagem('');
    } else if (pin === novo) {
      await atualizarAjustes({ pin: await criarPin(pin) });
      avisar('PIN trocado');
      voltar();
    } else {
      setErros((e) => e + 1);
      setEtapa('novo');
      setMensagem('Os números não eram iguais. Comece de novo.');
    }
  };

  return (
    <main className="min-h-dvh bg-nevoa pb-10">
      <CabecalhoTela titulo="PIN de acesso" />
      <div className="mx-auto max-w-md px-4 pt-6">
        <p className="text-center text-lg font-bold">{textos[etapa]}</p>
        <p role="alert" className="mt-1 mb-6 min-h-6 text-center font-bold text-perigo">
          {mensagem}
        </p>
        <EntradaPin aoCompletar={aoCompletar} erros={erros} />
        <p className="mt-8 text-center text-[0.95rem] leading-snug text-tinta-suave">
          O PIN evita que a criança abra os ajustes sem querer. Escolha números fáceis para você e difíceis de adivinhar, como evitar 1234.
        </p>
      </div>
    </main>
  );
}
