/** Marca do Voxa: balão de fala com ondas de voz + nome. */
export function Marca({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <span role="img" className="inline-flex items-center gap-2 text-azul" aria-label="Voxa">
      <svg width={tamanho} height={tamanho} viewBox="0 0 512 512" aria-hidden="true">
        <rect width="512" height="512" rx="128" fill="currentColor" />
        <path
          d="M150 140h212a54 54 0 0 1 54 54v104a54 54 0 0 1-54 54H262l-74 58a8 8 0 0 1-13-6v-52h-25a54 54 0 0 1-54-54V194a54 54 0 0 1 54-54z"
          fill="#fff"
        />
        <circle cx="196" cy="246" r="22" fill="currentColor" />
        <path d="M252 214c18 18 18 46 0 64" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
        <path d="M292 186c34 34 34 86 0 120" fill="none" stroke="#7fb0f0" strokeWidth="20" strokeLinecap="round" />
      </svg>
      <span className="font-extrabold tracking-tight" style={{ fontSize: tamanho * 0.86 }} aria-hidden="true">
        Voxa
      </span>
    </span>
  );
}
