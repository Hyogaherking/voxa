'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Camera, Images, Trash2, Volume2 } from 'lucide-react';
import { db, type Cartao, type Prancha } from '@/lib/db';
import { novoId } from '@/lib/dados';
import { prepararFoto } from '@/lib/imagem';
import { useVoxa } from '../contexto';
import { Botao } from '../ui/Botao';
import { Dialogo } from '../ui/Dialogo';
import { Interruptor } from '../ui/Interruptor';
import { Pictograma } from '../ui/Pictograma';
import { SeletorCor } from './SeletorCor';
import { SeletorPicto } from './SeletorPicto';

/** Criar ou editar uma figura (cartão) da prancha. */
export function EditorCartao({
  cartao,
  prancha,
  proximaOrdem,
  aoFechar,
}: {
  cartao: Cartao | null;
  prancha: Prancha;
  proximaOrdem: number;
  aoFechar: () => void;
}) {
  const { avisar, falar } = useVoxa();
  const pranchas = useLiveQuery(() => db.pranchas.orderBy('ordem').toArray(), []);
  const [r, setR] = useState<Cartao>(
    cartao ?? {
      id: novoId(),
      pranchaId: prancha.id,
      rotulo: '',
      fala: '',
      imagem: { tipo: 'picto', id: 'sparkles' },
      cor: prancha.cor,
      ordem: proximaOrdem,
      visivel: true,
    },
  );
  const [escolhendo, setEscolhendo] = useState(false);
  // Figura nova: abre a galeria logo depois que a janela do editor aparece
  useEffect(() => {
    if (cartao === null) setEscolhendo(true);
  }, [cartao]);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [erroFoto, setErroFoto] = useState('');
  const [tentouSalvar, setTentouSalvar] = useState(false);
  const arquivo = useRef<HTMLInputElement>(null);
  const rotuloValido = r.rotulo.trim().length > 0;
  const textoFalado = r.fala?.trim() || r.rotulo.trim();

  const salvar = async () => {
    setTentouSalvar(true);
    if (!rotuloValido) return;
    let ordem = r.ordem;
    // Ao mudar de prancha, a figura vai para o fim da nova prancha
    if (cartao && cartao.pranchaId !== r.pranchaId) ordem = await db.cartoes.where('pranchaId').equals(r.pranchaId).count();
    await db.cartoes.put({ ...r, rotulo: r.rotulo.trim(), fala: r.fala?.trim() || undefined, ordem });
    avisar(cartao ? 'Figura salva' : 'Figura adicionada');
    aoFechar();
  };

  const excluir = async () => {
    if (!cartao) return;
    await db.cartoes.delete(cartao.id);
    avisar('Figura excluída');
    aoFechar();
  };

  return (
    <Dialogo
      aberto
      largo
      aoFechar={aoFechar}
      titulo={cartao ? 'Editar figura' : 'Nova figura'}
      rodape={
        confirmarExclusao ? (
          <>
            <p className="mr-auto self-center font-bold text-perigo">Excluir esta figura?</p>
            <Botao variante="secundario" onClick={() => setConfirmarExclusao(false)}>
              Não
            </Botao>
            <Botao variante="perigo" onClick={excluir}>
              Sim, excluir
            </Botao>
          </>
        ) : (
          <>
            {cartao && (
              <Botao
                variante="perigo"
                className="mr-auto"
                icone={<Trash2 aria-hidden="true" className="size-5" />}
                onClick={() => setConfirmarExclusao(true)}
              >
                Excluir
              </Botao>
            )}
            <Botao onClick={salvar} className={cartao ? '' : 'w-full'}>
              {cartao ? 'Salvar figura' : 'Adicionar figura'}
            </Botao>
          </>
        )
      }
    >
      <div className="grid gap-5 sm:grid-cols-[11rem_1fr]">
        {/* Prévia: como a criança vai ver */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`cor-${r.cor} flex aspect-[1/0.9] w-40 flex-col items-center justify-center gap-2 rounded-cartao border-(length:--largura-borda) border-(--borda) bg-(--fundo) p-3 ${
              r.visivel ? '' : 'opacity-50'
            }`}
            aria-hidden="true"
          >
            <Pictograma imagem={r.imagem} className="aspect-square w-[60%]" />
            <span className="rotulo w-full truncate text-center text-xl leading-tight font-extrabold">{r.rotulo || 'Nome'}</span>
          </div>
          <Botao
            variante="fantasma"
            disabled={!textoFalado}
            onClick={() => falar(textoFalado)}
            icone={<Volume2 aria-hidden="true" className="size-5" />}
          >
            Ouvir
          </Botao>
        </div>

        <div className="space-y-5">
          <div>
            <p className="font-bold">Imagem</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Botao variante="secundario" onClick={() => setEscolhendo(true)} icone={<Images aria-hidden="true" className="size-5" />}>
                Escolher figura
              </Botao>
              <Botao variante="secundario" onClick={() => arquivo.current?.click()} icone={<Camera aria-hidden="true" className="size-5" />}>
                Usar foto
              </Botao>
            </div>
            <p className="mt-1 text-[0.95rem] leading-snug text-tinta-suave">
              Fotos de objetos e pessoas da rotina ajudam muitas crianças a reconhecer a figura.
            </p>
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
                  const dados = await prepararFoto(f);
                  setR((atual) => ({ ...atual, imagem: { tipo: 'foto', dados } }));
                } catch (err) {
                  setErroFoto((err as Error).message);
                }
              }}
            />
            {erroFoto && <p className="mt-1 font-bold text-perigo">{erroFoto}</p>}
          </div>

          <div>
            <label htmlFor="rotulo" className="font-bold">
              Nome da figura
            </label>
            <input
              id="rotulo"
              value={r.rotulo}
              onChange={(e) => setR({ ...r, rotulo: e.target.value })}
              maxLength={24}
              autoComplete="off"
              aria-invalid={tentouSalvar && !rotuloValido}
              aria-describedby="rotulo-erro"
              className="mt-2 h-14 w-full rounded-campo border-2 border-linha bg-superficie px-4 text-lg"
            />
            {tentouSalvar && !rotuloValido && (
              <p id="rotulo-erro" className="mt-1 font-bold text-perigo">
                Escreva o nome que aparece embaixo da figura.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="fala" className="font-bold">
              O que a voz fala
            </label>
            <p id="fala-ajuda" className="text-[0.95rem] leading-snug text-tinta-suave">
              Opcional. Se ficar vazio, a voz fala o nome. Exemplo: Água → &ldquo;Eu quero água&rdquo;.
            </p>
            <input
              id="fala"
              value={r.fala ?? ''}
              onChange={(e) => setR({ ...r, fala: e.target.value })}
              placeholder={r.rotulo}
              maxLength={80}
              autoComplete="off"
              aria-describedby="fala-ajuda"
              className="mt-2 h-14 w-full rounded-campo border-2 border-linha bg-superficie px-4 text-lg"
            />
          </div>

          <SeletorCor id="cor-cartao" valor={r.cor} aoMudar={(cor) => setR({ ...r, cor })} />

          {pranchas && pranchas.length > 1 && (
            <div>
              <label htmlFor="prancha-cartao" className="font-bold">
                Prancha
              </label>
              <select
                id="prancha-cartao"
                value={r.pranchaId}
                onChange={(e) => setR({ ...r, pranchaId: e.target.value })}
                className="mt-2 h-14 w-full rounded-campo border-2 border-linha bg-superficie px-4 text-lg"
              >
                {pranchas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Interruptor
            rotulo="Mostrar para a criança"
            descricao="Esconda figuras que ainda não fazem parte da rotina, sem apagar."
            ligado={r.visivel}
            aoMudar={(visivel) => setR({ ...r, visivel })}
          />
        </div>
      </div>

      <SeletorPicto
        aberto={escolhendo}
        aoFechar={() => setEscolhendo(false)}
        aoEscolher={(id, rotulo) => {
          setR((atual) => ({ ...atual, imagem: { tipo: 'picto', id }, rotulo: atual.rotulo || rotulo }));
          setEscolhendo(false);
        }}
      />
    </Dialogo>
  );
}
