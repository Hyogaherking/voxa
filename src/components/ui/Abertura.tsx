import { Marca } from './Marca';

/** Tela de abertura enquanto os dados do aparelho são carregados. */
export function Abertura() {
  return (
    <main className="grid min-h-dvh place-items-center bg-nevoa" aria-busy="true">
      <div className="flex flex-col items-center gap-3">
        <Marca tamanho={56} />
        <p className="text-tinta-suave">Preparando as pranchas…</p>
      </div>
    </main>
  );
}
