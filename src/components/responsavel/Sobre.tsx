'use client';

import { CabecalhoTela } from '../ui/CabecalhoTela';
import { Marca } from '../ui/Marca';

/** Informações sobre o app: propósito, privacidade, limites e créditos. */
export function Sobre() {
  return (
    <main className="min-h-dvh bg-nevoa pb-10">
      <CabecalhoTela titulo="Sobre o Voxa" />
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <section className="rounded-cartao bg-superficie p-5">
          <Marca tamanho={34} />
          <p className="mt-3 max-w-prose">
            O Voxa é um aplicativo gratuito de comunicação alternativa e de expressão de emoções para crianças com Transtorno do
            Espectro Autista. Funciona sem internet e guarda tudo no próprio aparelho.
          </p>
          <p className="mt-3 max-w-prose text-tinta-suave">
            Desenvolvido como Trabalho de Conclusão de Curso em Análise e Desenvolvimento de Sistemas, no Centro Universitário
            UnEduvale (Avaré/SP), por Gabriel Eduardo Filadelfo Serafim, com orientação do Prof. Nicolas Antonio Messias dos Santos
            Collo.
          </p>
          <p className="mt-3 text-[0.95rem] text-tinta-suave">Versão 1.0</p>
        </section>

        <section className="rounded-cartao bg-superficie p-5">
          <h2 className="text-lg font-extrabold">Privacidade</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5">
            <li>Nenhum dado da criança é enviado para a internet.</li>
            <li>Não há cadastro, conta, propaganda nem rastreamento.</li>
            <li>Perfil, fotos, pranchas e histórico ficam só neste aparelho, até que o responsável salve uma cópia.</li>
          </ul>
        </section>

        <section className="rounded-cartao bg-superficie p-5">
          <h2 className="text-lg font-extrabold">Importante</h2>
          <p className="mt-2 max-w-prose">
            O Voxa é uma ferramenta de apoio. Ele não substitui o acompanhamento de fonoaudiólogos, terapeutas ocupacionais,
            psicólogos e educadores, que podem ajudar a escolher o vocabulário e o melhor jeito de usar o app com cada criança.
          </p>
        </section>

        <section className="rounded-cartao bg-superficie p-5">
          <h2 className="text-lg font-extrabold">Créditos e licenças</h2>
          <ul className="mt-2 space-y-1.5 text-[0.98rem]">
            <li>Código do Voxa: licença MIT.</li>
            <li>Figuras: Fluent Emoji, da Microsoft (licença MIT).</li>
            <li>Fonte: Atkinson Hyperlegible Next, do Braille Institute (licença SIL Open Font).</li>
            <li>Animações: anime.js (licença MIT). Interface: React, Next.js e Tailwind CSS.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
