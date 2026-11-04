'use client';

import { useRef, useState } from 'react';
import { Lock } from 'lucide-react';
import { animate, type JSAnimation } from 'animejs';
import { useVoxa } from '../contexto';

const TEMPO = 1600;
const RAIO = 22;
const VOLTA = 2 * Math.PI * RAIO;

/**
 * Entrada da área do responsável (RF05, primeira barreira): é preciso
 * SEGURAR o cadeado. Um toque rápido da criança não abre nada; o anel mostra
 * o progresso enquanto o adulto segura.
 */
export function BotaoCadeado() {
  const { ir } = useVoxa();
  const anel = useRef<SVGCircleElement>(null);
  const anim = useRef<JSAnimation | null>(null);
  const inicio = useRef(0);
  const [dica, setDica] = useState(false);
  const timerDica = useRef<number | undefined>(undefined);

  const comecar = () => {
    if (!anel.current || anim.current) return;
    inicio.current = Date.now();
    setDica(false);
    anim.current = animate(anel.current, {
      strokeDashoffset: [VOLTA, 0],
      duration: TEMPO,
      ease: 'linear',
      onComplete: () => {
        anim.current = null;
        if (anel.current) anel.current.style.strokeDashoffset = String(VOLTA);
        ir({ nome: 'portao' });
      },
    });
  };

  const soltar = () => {
    if (!anim.current) return;
    anim.current.pause();
    anim.current = null;
    if (anel.current) {
      animate(anel.current, { strokeDashoffset: VOLTA, duration: 200, ease: 'outQuad' });
    }
    if (Date.now() - inicio.current < TEMPO) {
      setDica(true);
      window.clearTimeout(timerDica.current);
      timerDica.current = window.setTimeout(() => setDica(false), 2800);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Área do responsável. Segure para abrir."
        aria-describedby={dica ? 'dica-cadeado' : undefined}
        className="sem-selecao relative grid size-14 touch-none place-items-center rounded-full text-tinta-suave"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          comecar();
        }}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
            e.preventDefault();
            comecar();
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') soltar();
        }}
      >
        <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="28" cy="28" r={RAIO} fill="var(--color-superficie)" stroke="var(--color-linha)" strokeWidth="3" />
          <circle
            ref={anel}
            cx="28"
            cy="28"
            r={RAIO}
            fill="none"
            stroke="var(--color-azul)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={VOLTA}
            strokeDashoffset={VOLTA}
          />
        </svg>
        <Lock aria-hidden="true" className="relative size-6" />
      </button>
      {dica && (
        <p
          id="dica-cadeado"
          role="status"
          className="absolute top-full right-0 z-30 mt-2 w-52 rounded-campo bg-tinta px-3 py-2 text-[0.95rem] leading-snug text-white shadow-lg"
        >
          Para o responsável: segure o cadeado até o círculo fechar.
        </p>
      )}
    </div>
  );
}
