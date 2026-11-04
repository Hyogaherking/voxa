'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, type JSAnimation } from 'animejs';
import { podeAnimar } from '@/lib/movimento';
import { Pictograma } from '../ui/Pictograma';

const FASES = [
  { texto: 'Puxa o ar', segundos: 4, escala: 1 },
  { texto: 'Segura', segundos: 2, escala: 1 },
  { texto: 'Solta o ar', segundos: 5, escala: 0.55 },
];

/**
 * Respiração guiada: o círculo cresce enquanto a criança puxa o ar e diminui
 * quando solta. Um recurso de apoio — não substitui acompanhamento profissional.
 * Sem animações, as fases continuam marcadas por texto e contagem.
 */
export function Respirar({ aoTerminar }: { aoTerminar: () => void }) {
  const [{ fase, segundo, voltas }, setEstado] = useState({ fase: 0, segundo: 1, voltas: 0 });
  const circulo = useRef<HTMLDivElement>(null);
  const anim = useRef<JSAnimation | null>(null);
  const terminar = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    terminar.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && aoTerminar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [aoTerminar]);

  // Relógio das fases: avança um segundo por vez
  useEffect(() => {
    const t = window.setInterval(() => {
      setEstado((e) => {
        if (e.segundo < FASES[e.fase].segundos) return { ...e, segundo: e.segundo + 1 };
        const prox = (e.fase + 1) % FASES.length;
        return { fase: prox, segundo: 1, voltas: e.voltas + (prox === 0 ? 1 : 0) };
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  // Animação do círculo no início de cada fase
  useEffect(() => {
    if (!circulo.current || !podeAnimar()) return;
    anim.current?.pause();
    anim.current = animate(circulo.current, {
      scale: FASES[fase].escala,
      duration: FASES[fase].segundos * 1000,
      ease: 'inOutSine',
    });
  }, [fase]);

  useEffect(() => () => void anim.current?.pause(), []);

  const atual = FASES[fase];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Respirar juntos"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-calma px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <p className="text-center text-lg text-tinta-suave">
        {voltas === 0 ? 'Vamos respirar devagar, juntos.' : `Muito bem! ${voltas} ${voltas === 1 ? 'vez' : 'vezes'}.`}
      </p>

      <div className="relative grid aspect-square w-[min(78vw,22rem)] place-items-center">
        <div
          ref={circulo}
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-4 border-[#b9a8ec] bg-[#d9cff6]"
          style={{ transform: `scale(${podeAnimar() ? 0.55 : 0.85})` }}
        />
        <div className="relative flex flex-col items-center gap-2 text-center">
          <Pictograma imagem={{ tipo: 'picto', id: 'person-in-lotus-position' }} className="size-16" />
          <p aria-live="polite" className="rotulo text-[2rem] leading-none font-extrabold">
            {atual.texto}
          </p>
          <p aria-hidden="true" className="text-2xl font-bold text-tinta-suave tabular-nums">
            {segundo}
          </p>
        </div>
      </div>

      <button
        ref={terminar}
        type="button"
        onClick={aoTerminar}
        className="min-h-16 w-full max-w-sm rounded-cartao bg-superficie text-xl font-extrabold text-tinta shadow-sm"
      >
        <span className="rotulo">Terminar</span>
      </button>
    </div>
  );
}
