'use client';

import { useEffect, useRef, useState } from 'react';
import { Delete } from 'lucide-react';
import { chacoalhar } from '@/lib/movimento';

const TAMANHO = 4;

/**
 * Teclado numérico grande para digitar o PIN de 4 números.
 * Também aceita o teclado físico. `erros` muda a cada tentativa errada.
 */
export function EntradaPin({ aoCompletar, erros = 0 }: { aoCompletar: (pin: string) => void; erros?: number }) {
  const [digitos, setDigitos] = useState('');
  const pontos = useRef<HTMLDivElement>(null);
  const completar = useRef(aoCompletar);
  completar.current = aoCompletar;

  const errosAntes = useRef(erros);
  useEffect(() => {
    if (erros !== errosAntes.current) {
      errosAntes.current = erros;
      chacoalhar(pontos.current);
      setDigitos('');
    }
  }, [erros]);

  useEffect(() => {
    if (digitos.length === TAMANHO) {
      const t = window.setTimeout(() => {
        completar.current(digitos);
        setDigitos('');
      }, 120);
      return () => window.clearTimeout(t);
    }
  }, [digitos]);

  const digitar = (n: string) => setDigitos((d) => (d.length < TAMANHO ? d + n : d));
  const apagar = () => setDigitos((d) => d.slice(0, -1));

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) digitar(e.key);
      else if (e.key === 'Backspace') apagar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div ref={pontos} className="flex gap-4" role="status" aria-label={`${digitos.length} de ${TAMANHO} números digitados`}>
        {Array.from({ length: TAMANHO }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`size-5 rounded-full border-2 transition-colors ${i < digitos.length ? 'border-azul bg-azul' : 'border-tinta-suave'}`}
          />
        ))}
      </div>
      <div className="grid w-full max-w-xs grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
          <Tecla key={n} onClick={() => digitar(n)}>
            {n}
          </Tecla>
        ))}
        <span />
        <Tecla onClick={() => digitar('0')}>0</Tecla>
        <Tecla onClick={apagar} rotulo="Apagar">
          <Delete aria-hidden="true" className="size-7" />
        </Tecla>
      </div>
    </div>
  );
}

function Tecla({ children, onClick, rotulo }: { children: React.ReactNode; onClick: () => void; rotulo?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rotulo}
      className="sem-selecao grid h-[4.25rem] place-items-center rounded-cartao border-2 border-linha bg-superficie text-[1.75rem] font-bold tabular-nums active:bg-azul-claro"
    >
      {children}
    </button>
  );
}
