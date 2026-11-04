'use client';

import { useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { atualizarAjustes } from '@/lib/dados';
import { conferirPin, criarPin, desafioAdulto } from '@/lib/pin';
import { useVoxa } from '../contexto';
import { Botao } from '../ui/Botao';
import { EntradaPin } from './EntradaPin';

type Modo = 'entrar' | 'criar' | 'confirmar' | 'esqueci';

/**
 * Acesso restrito à área do responsável (RF05). Na primeira vez, o
 * responsável cria um PIN de 4 números; depois, digita o PIN para entrar.
 */
export function Portao() {
  const { ajustes, substituir, voltar, avisar } = useVoxa();
  const [modo, setModo] = useState<Modo>(ajustes.pin ? 'entrar' : 'criar');
  const [primeiro, setPrimeiro] = useState('');
  const [erros, setErros] = useState(0);
  const [mensagem, setMensagem] = useState('');

  const titulos: Record<Modo, { titulo: string; texto: string }> = {
    entrar: { titulo: 'Área do responsável', texto: 'Digite o PIN de 4 números.' },
    criar: {
      titulo: 'Crie um PIN',
      texto: 'Escolha 4 números. O PIN impede que a criança abra os ajustes sem querer.',
    },
    confirmar: { titulo: 'Confirme o PIN', texto: 'Digite os mesmos 4 números de novo.' },
    esqueci: { titulo: 'Esqueci o PIN', texto: 'Responda à conta para criar um PIN novo. Os dados da criança não são apagados.' },
  };

  const aoCompletar = async (pin: string) => {
    if (modo === 'entrar' && ajustes.pin) {
      if (await conferirPin(pin, ajustes.pin)) substituir({ nome: 'painel' });
      else {
        setErros((e) => e + 1);
        setMensagem('PIN incorreto. Tente de novo.');
      }
    } else if (modo === 'criar') {
      setPrimeiro(pin);
      setModo('confirmar');
      setMensagem('');
    } else if (modo === 'confirmar') {
      if (pin === primeiro) {
        await atualizarAjustes({ pin: await criarPin(pin) });
        avisar('PIN criado');
        substituir({ nome: 'painel' });
      } else {
        setErros((e) => e + 1);
        setModo('criar');
        setMensagem('Os números não eram iguais. Comece de novo.');
      }
    }
  };

  const { titulo, texto } = titulos[modo];

  return (
    <main className="flex min-h-dvh flex-col bg-nevoa px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-6">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex justify-start">
          <Botao variante="fantasma" onClick={voltar}>
            Cancelar
          </Botao>
        </div>
        <div className="mt-4 mb-8 flex flex-col items-center gap-2 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-azul-claro text-azul">
            <ShieldCheck aria-hidden="true" className="size-8" />
          </span>
          <h1 className="text-2xl font-extrabold">{titulo}</h1>
          <p className="max-w-xs text-tinta-suave">{texto}</p>
          <p role="alert" className="min-h-6 font-bold text-perigo">
            {mensagem}
          </p>
        </div>

        {modo === 'esqueci' ? (
          <Desafio
            aoAcertar={() => {
              setModo('criar');
              setMensagem('');
            }}
          />
        ) : (
          <EntradaPin aoCompletar={aoCompletar} erros={erros} />
        )}

        {modo === 'entrar' && (
          <div className="mt-6 flex justify-center">
            <Botao variante="fantasma" onClick={() => setModo('esqueci')}>
              Esqueci o PIN
            </Botao>
          </div>
        )}
      </div>
    </main>
  );
}

function Desafio({ aoAcertar }: { aoAcertar: () => void }) {
  const desafio = useMemo(() => desafioAdulto(), []);
  const [resposta, setResposta] = useState('');
  const [errou, setErrou] = useState(false);

  return (
    <form
      className="flex flex-col items-center gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (Number(resposta) === desafio.resposta) aoAcertar();
        else setErrou(true);
      }}
    >
      <label htmlFor="desafio" className="text-2xl font-extrabold">
        {desafio.pergunta}
      </label>
      <input
        id="desafio"
        inputMode="numeric"
        autoComplete="off"
        value={resposta}
        onChange={(e) => {
          setResposta(e.target.value.replace(/\D/g, ''));
          setErrou(false);
        }}
        aria-invalid={errou}
        aria-describedby={errou ? 'desafio-erro' : undefined}
        className="h-16 w-40 rounded-campo border-2 border-linha bg-superficie text-center text-3xl font-bold"
      />
      {errou && (
        <p id="desafio-erro" className="font-bold text-perigo">
          Resposta errada. Confira a conta.
        </p>
      )}
      <Botao type="submit" className="w-40">
        Confirmar
      </Botao>
    </form>
  );
}
