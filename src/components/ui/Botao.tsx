import { forwardRef } from 'react';

type Variante = 'primario' | 'secundario' | 'perigo' | 'fantasma';

const estilos: Record<Variante, string> = {
  primario: 'bg-azul text-white hover:bg-azul-escuro active:bg-azul-escuro disabled:bg-linha disabled:text-tinta-suave',
  secundario: 'bg-superficie text-tinta border-2 border-linha hover:border-azul active:bg-azul-claro',
  perigo: 'bg-perigo-claro text-perigo border-2 border-transparent hover:border-perigo',
  fantasma: 'bg-transparent text-azul hover:bg-azul-claro',
};

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: Variante; icone?: React.ReactNode };

export const Botao = forwardRef<HTMLButtonElement, Props>(function Botao(
  { variante = 'primario', icone, className = '', children, type = 'button', ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-campo px-5 text-[1.0625rem] font-bold transition-colors disabled:cursor-not-allowed ${estilos[variante]} ${className}`}
      {...resto}
    >
      {icone}
      {children}
    </button>
  );
});
