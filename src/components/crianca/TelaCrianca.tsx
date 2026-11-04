'use client';

import { useVoxa, type Aba } from '../contexto';
import { Marca } from '../ui/Marca';
import { Pictograma } from '../ui/Pictograma';
import { BotaoCadeado } from './BotaoCadeado';
import { Comunicacao } from './Comunicacao';
import { Emocoes } from './Emocoes';
import { atualizarAjustes } from '@/lib/dados';

/*
  Interface da criança: só comunicação e sentimentos, sem nenhum elemento de
  configuração (separação de perfis do diagrama de casos de uso). Dois níveis
  de navegação no máximo: a aba e a prancha.
*/
export function TelaCrianca() {
  const { aba, setAba, perfil, ajustes } = useVoxa();

  return (
    <div className="flex h-dvh flex-col bg-nevoa pt-[env(safe-area-inset-top)]">
      <header className="flex items-center gap-3 px-4 pt-2 pb-1">
        <Marca tamanho={30} />
        <div className="flex-1" />
        {perfil.nome && (
          <span className="flex min-w-0 items-center gap-2 rounded-full bg-superficie py-1 pr-4 pl-1 font-bold">
            <Pictograma imagem={perfil.avatar} className="size-9 rounded-full" />
            <span className="truncate">{perfil.nome}</span>
          </span>
        )}
        <BotaoCadeado />
      </header>

      {!ajustes.dicaCadeadoVista && (
        <div role="note" className="mx-4 mt-1 flex items-center gap-3 rounded-campo bg-superficie px-4 py-2 text-[0.95rem] shadow-sm">
          <p className="flex-1 leading-snug">
            <strong>Responsável:</strong> para abrir os ajustes, segure o cadeado no canto da tela por 2 segundos.
          </p>
          <button
            type="button"
            className="min-h-11 rounded-campo px-3 font-bold text-azul hover:bg-azul-claro"
            onClick={() => atualizarAjustes({ dicaCadeadoVista: true })}
          >
            Entendi
          </button>
        </div>
      )}

      <main className="flex min-h-0 flex-1 flex-col">{aba === 'falar' ? <Comunicacao /> : <Emocoes />}</main>

      <nav aria-label="Telas" className="border-t border-linha bg-superficie pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-xl">
          <AbaNav aba="falar" atual={aba} aoEscolher={setAba} picto="speaking-head" rotulo="Falar" />
          <AbaNav aba="sentir" atual={aba} aoEscolher={setAba} picto="grinning-face-with-big-eyes" rotulo="Sentimentos" />
        </div>
      </nav>
    </div>
  );
}

function AbaNav({
  aba,
  atual,
  aoEscolher,
  picto,
  rotulo,
}: {
  aba: Aba;
  atual: Aba;
  aoEscolher: (a: Aba) => void;
  picto: string;
  rotulo: string;
}) {
  const ativo = aba === atual;
  return (
    <button
      type="button"
      aria-current={ativo ? 'page' : undefined}
      onClick={() => aoEscolher(aba)}
      className={`sem-selecao relative flex min-h-[4.5rem] flex-1 items-center justify-center gap-3 text-lg font-extrabold transition-colors ${
        ativo ? 'text-azul-escuro' : 'text-tinta-suave'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-x-6 top-0 h-1 rounded-b-full transition-colors ${ativo ? 'bg-azul' : 'bg-transparent'}`}
      />
      <Pictograma imagem={{ tipo: 'picto', id: picto }} className={`size-9 transition-opacity ${ativo ? '' : 'opacity-60'}`} />
      <span className="rotulo">{rotulo}</span>
    </button>
  );
}
