/*
  Acesso restrito à área do responsável (RF05).
  O PIN nunca é guardado em texto: guarda-se apenas o resumo SHA-256 do PIN
  com um "sal" aleatório. O objetivo é impedir que a criança entre nos
  ajustes por acidente — não é uma proteção contra outros adultos que tenham
  o aparelho em mãos.
*/

function paraHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Usado só se o navegador não tiver crypto.subtle (página fora de HTTPS).
function resumoSimples(texto: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `fnv-${h.toString(16)}`;
}

async function resumo(texto: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const dados = new TextEncoder().encode(texto);
    return paraHex(await crypto.subtle.digest('SHA-256', dados));
  }
  return resumoSimples(texto);
}

export async function criarPin(pin: string): Promise<{ hash: string; sal: string }> {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const sal = paraHex(bytes.buffer);
  return { sal, hash: await resumo(`${sal}:${pin}`) };
}

export async function conferirPin(pin: string, salvo: { hash: string; sal: string }): Promise<boolean> {
  return (await resumo(`${salvo.sal}:${pin}`)) === salvo.hash;
}

/** Pergunta de multiplicação para "Esqueci o PIN" — fácil para um adulto, difícil para uma criança pequena. */
export function desafioAdulto(): { pergunta: string; resposta: number } {
  const a = 6 + Math.floor(Math.random() * 7); // 6..12
  const b = 6 + Math.floor(Math.random() * 7);
  return { pergunta: `Quanto é ${a} × ${b}?`, resposta: a * b };
}
