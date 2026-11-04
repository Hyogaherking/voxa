'use client';

import { useEffect, useState } from 'react';
import { CircleCheck } from 'lucide-react';
import { useVoxa } from '../contexto';

/** Confirmação curta ("Cartão salvo"), anunciada também por leitores de tela. */
export function Aviso() {
  const { aviso } = useVoxa();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!aviso) return;
    setVisivel(true);
    const t = window.setTimeout(() => setVisivel(false), 2600);
    return () => window.clearTimeout(t);
  }, [aviso]);

  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
      {visivel && aviso && (
        <p
          key={aviso.id}
          className="flex items-center gap-2 rounded-full bg-tinta px-5 py-3 font-bold text-white shadow-lg"
        >
          <CircleCheck aria-hidden="true" className="size-5 text-[#9fe0b8]" />
          {aviso.texto}
        </p>
      )}
    </div>
  );
}
