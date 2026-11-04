/**
 * Nome embaixo da figura. Palavras longas diminuem um pouco para caber
 * inteiras no cartão, em vez de serem cortadas ("Preocupa…").
 * O cartão precisa da classe `@container`.
 */
export function RotuloCartao({ texto }: { texto: string }) {
  const letras = Math.max(texto.length, 7);
  return (
    <span
      className="rotulo w-full truncate text-center leading-tight font-extrabold"
      style={{ fontSize: `min(var(--tam-rotulo), calc(110cqi / ${letras}))` }}
    >
      {texto}
    </span>
  );
}
