import { animate, spring, stagger, utils } from 'animejs';

/*
  Animações com anime.js. Regras do Voxa:
  - só respondem a uma ação da criança ou do responsável (nada se move sozinho);
  - são curtas e calmas, mostrando o que mudou (a figura vai para a frase,
    o cartão confirma o toque);
  - são desligadas quando o aparelho pede "reduzir movimento" ou quando o
    responsável escolhe "Sem animações".
*/

let semMovimento = false;

export function definirMovimento(desligado: boolean): void {
  semMovimento = desligado;
}

export function podeAnimar(): boolean {
  return !semMovimento;
}

/** Confirmação do toque: o cartão afunda e volta com uma mola suave. */
export function pulsoToque(el: Element | null): void {
  if (!el || semMovimento) return;
  animate(el, {
    scale: [
      { to: 0.93, duration: 90, ease: 'outQuad' },
      { to: 1, ease: spring({ bounce: 0.4, duration: 380 }) },
    ],
  });
}

/** Leva uma cópia da figura do cartão até o fim da faixa de frase. */
export function voarParaFaixa(origem: HTMLElement | null, destino: HTMLElement | null): void {
  if (!origem || !destino || semMovimento) return;
  const a = origem.getBoundingClientRect();
  const b = destino.getBoundingClientRect();
  if (!a.width || !b.width) return;
  const copia = origem.cloneNode(true) as HTMLElement;
  Object.assign(copia.style, {
    position: 'fixed',
    left: `${a.left}px`,
    top: `${a.top}px`,
    width: `${a.width}px`,
    height: `${a.height}px`,
    margin: '0',
    zIndex: '60',
    pointerEvents: 'none',
  });
  copia.setAttribute('aria-hidden', 'true');
  document.body.appendChild(copia);
  const escala = Math.min(b.height / a.height, 1);
  animate(copia, {
    x: b.left + b.width / 2 - (a.left + a.width / 2),
    y: b.top + b.height / 2 - (a.top + a.height / 2),
    scale: [1, escala],
    opacity: [{ to: 1, duration: 300 }, { to: 0, duration: 160 }],
    duration: 460,
    ease: 'inOutCubic',
    onComplete: () => copia.remove(),
  });
}

/** Entrada dos cartões ao trocar de prancha. */
export function entradaGrade(container: Element | null): void {
  if (!container || semMovimento) return;
  const itens = container.querySelectorAll('[data-cartao]');
  if (!itens.length) return;
  animate(itens, {
    opacity: [0, 1],
    y: [10, 0],
    duration: 260,
    delay: stagger(22, { start: 0 }),
    ease: 'outQuad',
  });
}

/** Chacoalha de leve (PIN errado). */
export function chacoalhar(el: Element | null): void {
  if (!el || semMovimento) return;
  animate(el, { x: [0, -12, 10, -6, 4, 0], duration: 420, ease: 'outQuad' });
}

/** Painel que sobe de baixo (folha de emoção, editores). */
export function subirPainel(el: Element | null): void {
  if (!el || semMovimento) return;
  animate(el, { y: [40, 0], opacity: [0, 1], duration: 300, ease: 'outCubic' });
}

/** Destaque breve de um elemento que acabou de mudar. */
export function destacar(el: Element | null): void {
  if (!el || semMovimento) return;
  animate(el, { scale: [{ to: 1.06, duration: 140 }, { to: 1, duration: 220 }], ease: 'outQuad' });
}

export function limparAnimacoes(el: Element | null): void {
  if (el) utils.remove(el);
}
