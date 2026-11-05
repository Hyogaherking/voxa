'use client';

import { useRef, useState } from 'react';
import { Camera, Check } from 'lucide-react';
import { db, type Genero, type Imagem, type Perfil } from '@/lib/db';
import { prepararFoto } from '@/lib/imagem';
import { useVoxa } from '../contexto';
import { CabecalhoTela } from '../ui/CabecalhoTela';
import { Pictograma } from '../ui/Pictograma';
import { Escolha } from '../ui/Escolha';
import { Botao } from '../ui/Botao';

const AVATARES = [
  ['child', 'Criança'],
  ['girl', 'Menina'],
  ['boy', 'Menino'],
  ['baby', 'Bebê'],
  ['dog', 'Cachorro'],
  ['cat', 'Gato'],
  ['rabbit-face', 'Coelho'],
  ['turtle', 'Tartaruga'],
  ['sauropod', 'Dinossauro'],
  ['unicorn', 'Unicórnio'],
  ['robot', 'Robô'],
  ['lion', 'Leão'],
];

/** Cadastro e edição do perfil da criança (RF06). */
export function PerfilCrianca() {
  const { perfil, avisar } = useVoxa();
  const [rascunho, setRascunho] = useState<Perfil>(perfil);
  const [erroFoto, setErroFoto] = useState('');
  const arquivo = useRef<HTMLInputElement>(null);
  const mudou = JSON.stringify(rascunho) !== JSON.stringify(perfil);

  const mudar = (p: Partial<Perfil>) => setRascunho((r) => ({ ...r, ...p }));
  const ehAvatar = (img: Imagem) => JSON.stringify(img) === JSON.stringify(rascunho.avatar);

  const salvar = async () => {
    const salvo = { ...rascunho, nome: rascunho.nome.trim(), atualizadoEm: Date.now() };
    await db.perfil.put(salvo);
    setRascunho(salvo);
    avisar('Perfil salvo');
  };

  return (
    <main className="min-h-dvh bg-nevoa pb-28">
      <CabecalhoTela titulo="Perfil da criança" />
      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <section className="rounded-cartao bg-superficie p-4">
          <label htmlFor="nome" className="font-bold">
            Nome
          </label>
          <p id="nome-ajuda" className="text-[0.95rem] text-tinta-suave">
            Aparece no topo da tela da criança.
          </p>
          <input
            id="nome"
            value={rascunho.nome}
            onChange={(e) => mudar({ nome: e.target.value })}
            aria-describedby="nome-ajuda"
            autoComplete="off"
            maxLength={40}
            className="mt-2 h-14 w-full rounded-campo border-2 border-linha bg-superficie px-4 text-lg"
          />
        </section>

        <section className="rounded-cartao bg-superficie p-4" aria-labelledby="titulo-avatar">
          <h2 id="titulo-avatar" className="font-bold">
            Figura ou foto
          </h2>
          <div role="radiogroup" aria-labelledby="titulo-avatar" className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(4.5rem,1fr))] gap-2">
            {rascunho.avatar.tipo === 'foto' && (
              <Opcao marcada rotulo="Foto escolhida" aoEscolher={() => {}}>
                <Pictograma imagem={rascunho.avatar} className="size-14 rounded-full" />
              </Opcao>
            )}
            {AVATARES.map(([id, nome]) => {
              const img: Imagem = { tipo: 'picto', id };
              return (
                <Opcao key={id} marcada={ehAvatar(img)} rotulo={nome} aoEscolher={() => mudar({ avatar: img })}>
                  <Pictograma imagem={img} className="size-11" />
                </Opcao>
              );
            })}
          </div>
          <input
            ref={arquivo}
            type="file"
            aria-label="Escolher foto"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f) return;
              try {
                setErroFoto('');
                mudar({ avatar: { tipo: 'foto', dados: await prepararFoto(f, 320) } });
              } catch (err) {
                setErroFoto((err as Error).message);
              }
            }}
          />
          <Botao variante="secundario" className="mt-3" icone={<Camera aria-hidden="true" className="size-5" />} onClick={() => arquivo.current?.click()}>
            Usar uma foto
          </Botao>
          {erroFoto && <p className="mt-2 font-bold text-perigo">{erroFoto}</p>}
        </section>

        <section className="rounded-cartao bg-superficie px-4 py-1">
          <Escolha<Genero>
            rotulo="Como a voz fala sobre a criança"
            descricao="Usado nas frases de sentimentos."
            valor={rascunho.genero}
            aoMudar={(g) => mudar({ genero: g })}
            opcoes={[
              { valor: 'm', rotulo: '“Estou cansado”' },
              { valor: 'f', rotulo: '“Estou cansada”' },
            ]}
          />
        </section>

        <section className="rounded-cartao bg-superficie p-4">
          <label htmlFor="obs" className="font-bold">
            Anotações para quem cuida
          </label>
          <p id="obs-ajuda" className="text-[0.95rem] text-tinta-suave">
            Por exemplo: do que gosta, o que acalma, sons que incomodam. Fica só neste aparelho.
          </p>
          <textarea
            id="obs"
            rows={4}
            value={rascunho.observacoes}
            onChange={(e) => mudar({ observacoes: e.target.value })}
            aria-describedby="obs-ajuda"
            className="mt-2 w-full rounded-campo border-2 border-linha bg-superficie px-4 py-3 text-lg"
          />
        </section>
      </div>

      <BarraSalvar mudou={mudou} aoSalvar={salvar} rotulo="Salvar perfil" />
    </main>
  );
}

function Opcao({
  marcada,
  rotulo,
  aoEscolher,
  children,
}: {
  marcada: boolean;
  rotulo: string;
  aoEscolher: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={marcada}
      aria-label={rotulo}
      onClick={aoEscolher}
      className={`relative grid aspect-square place-items-center rounded-2xl border-2 ${marcada ? 'border-azul bg-azul-claro' : 'border-linha bg-superficie'}`}
    >
      {children}
      {marcada && (
        <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 grid size-6 place-items-center rounded-full bg-azul text-white">
          <Check className="size-4" />
        </span>
      )}
    </button>
  );
}

export function BarraSalvar({ mudou, aoSalvar, rotulo }: { mudou: boolean; aoSalvar: () => void; rotulo: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-linha bg-nevoa/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
        <p className="flex-1 text-[0.95rem] text-tinta-suave" aria-live="polite">
          {mudou ? 'Há mudanças não salvas.' : 'Tudo salvo.'}
        </p>
        <Botao onClick={aoSalvar} disabled={!mudou}>
          {rotulo}
        </Botao>
      </div>
    </div>
  );
}
