'use client';

import { useRef, useState } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { exportarCopia, importarCopia } from '@/lib/backup';
import { semearVocabulario } from '@/lib/dados';
import { db } from '@/lib/db';
import { useVoxa } from '../contexto';
import { CabecalhoTela } from '../ui/CabecalhoTela';
import { Botao } from '../ui/Botao';
import { Dialogo } from '../ui/Dialogo';

/**
 * Cópia de segurança e restauração. Os dados ficam só neste aparelho (RNF02);
 * a cópia em arquivo permite levar tudo para outro aparelho, já que não há
 * sincronização pela internet.
 */
export function Copia() {
  const { avisar } = useVoxa();
  const arquivo = useRef<HTMLInputElement>(null);
  const [pendente, setPendente] = useState<File | null>(null);
  const [erro, setErro] = useState('');
  const [reiniciar, setReiniciar] = useState(false);

  return (
    <main className="min-h-dvh bg-nevoa pb-10">
      <CabecalhoTela titulo="Cópia de segurança" />
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <section className="rounded-cartao bg-superficie p-4">
          <h2 className="text-lg font-extrabold">Salvar uma cópia</h2>
          <p className="mt-1 text-tinta-suave">
            Gera um arquivo com o perfil, as pranchas, as fotos e o histórico. Guarde-o no celular, no computador ou no seu
            e-mail. O PIN não vai junto.
          </p>
          <Botao
            className="mt-3"
            icone={<Download aria-hidden="true" className="size-5" />}
            onClick={async () => {
              await exportarCopia();
              avisar('Cópia salva');
            }}
          >
            Salvar cópia
          </Botao>
        </section>

        <section className="rounded-cartao bg-superficie p-4">
          <h2 className="text-lg font-extrabold">Restaurar uma cópia</h2>
          <p className="mt-1 text-tinta-suave">Substitui os dados deste aparelho pelos dados do arquivo escolhido.</p>
          <input
            ref={arquivo}
            type="file"
            aria-label="Escolher arquivo de cópia"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) {
                setErro('');
                setPendente(f);
              }
            }}
          />
          <Botao
            variante="secundario"
            className="mt-3"
            icone={<Upload aria-hidden="true" className="size-5" />}
            onClick={() => arquivo.current?.click()}
          >
            Escolher arquivo
          </Botao>
          {erro && (
            <p role="alert" className="mt-2 font-bold text-perigo">
              {erro}
            </p>
          )}
        </section>

        <section className="rounded-cartao bg-superficie p-4">
          <h2 className="text-lg font-extrabold">Voltar ao vocabulário inicial</h2>
          <p className="mt-1 text-tinta-suave">
            Apaga as pranchas e figuras atuais e coloca de volta as pranchas que vêm com o Voxa. O perfil e o histórico não mudam.
          </p>
          <Botao
            variante="perigo"
            className="mt-3"
            icone={<RotateCcw aria-hidden="true" className="size-5" />}
            onClick={() => setReiniciar(true)}
          >
            Voltar ao inicial
          </Botao>
        </section>
      </div>

      <Dialogo
        aberto={pendente !== null}
        aoFechar={() => setPendente(null)}
        titulo="Restaurar esta cópia?"
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setPendente(null)}>
              Cancelar
            </Botao>
            <Botao
              onClick={async () => {
                if (!pendente) return;
                try {
                  await importarCopia(pendente);
                  avisar('Cópia restaurada');
                } catch (e) {
                  setErro((e as Error).message);
                }
                setPendente(null);
              }}
            >
              Restaurar
            </Botao>
          </>
        }
      >
        <p>
          Os dados atuais deste aparelho serão trocados pelos do arquivo <strong className="break-all">{pendente?.name}</strong>.
        </p>
      </Dialogo>

      <Dialogo
        aberto={reiniciar}
        aoFechar={() => setReiniciar(false)}
        titulo="Voltar ao vocabulário inicial?"
        rodape={
          <>
            <Botao variante="secundario" onClick={() => setReiniciar(false)}>
              Cancelar
            </Botao>
            <Botao
              variante="perigo"
              onClick={async () => {
                await db.transaction('rw', db.pranchas, db.cartoes, semearVocabulario);
                setReiniciar(false);
                avisar('Vocabulário inicial restaurado');
              }}
            >
              Voltar ao inicial
            </Botao>
          </>
        }
      >
        <p>As figuras criadas e as fotos adicionadas serão apagadas. Se quiser guardá-las, salve uma cópia antes.</p>
      </Dialogo>
    </main>
  );
}
