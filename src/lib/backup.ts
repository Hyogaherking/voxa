import { db, type Ajustes, type Cartao, type Perfil, type Prancha, type Registro } from './db';

/*
  Cópia de segurança. Como os dados ficam só no aparelho (RNF02), o
  responsável pode salvar um arquivo com tudo (perfil, pranchas, fotos,
  histórico) e restaurar em outro aparelho. O arquivo só sai do aparelho se o
  próprio responsável o enviar.
*/

type Copia = {
  app: 'voxa';
  versao: 1;
  criadaEm: string;
  perfil: Perfil[];
  pranchas: Prancha[];
  cartoes: Cartao[];
  historico: Registro[];
  ajustes: Omit<Ajustes, 'pin'>[];
};

export async function exportarCopia(): Promise<void> {
  const ajustes = (await db.ajustes.toArray()).map(({ pin: _pin, ...resto }) => resto);
  const copia: Copia = {
    app: 'voxa',
    versao: 1,
    criadaEm: new Date().toISOString(),
    perfil: await db.perfil.toArray(),
    pranchas: await db.pranchas.toArray(),
    cartoes: await db.cartoes.toArray(),
    historico: await db.historico.toArray(),
    ajustes,
  };
  const blob = new Blob([JSON.stringify(copia)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `voxa-copia-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function importarCopia(arquivo: File): Promise<void> {
  let copia: Copia;
  try {
    copia = JSON.parse(await arquivo.text());
  } catch {
    throw new Error('Esse arquivo não é uma cópia do Voxa.');
  }
  if (copia?.app !== 'voxa' || !Array.isArray(copia.pranchas) || !Array.isArray(copia.cartoes)) {
    throw new Error('Esse arquivo não é uma cópia do Voxa.');
  }
  await db.transaction('rw', [db.perfil, db.pranchas, db.cartoes, db.historico, db.ajustes], async () => {
    const pinAtual = (await db.ajustes.get('app'))?.pin ?? null;
    await Promise.all([db.perfil.clear(), db.pranchas.clear(), db.cartoes.clear(), db.historico.clear()]);
    await db.perfil.bulkPut(copia.perfil ?? []);
    await db.pranchas.bulkPut(copia.pranchas);
    await db.cartoes.bulkPut(copia.cartoes);
    await db.historico.bulkPut((copia.historico ?? []).map(({ id: _id, ...r }) => r));
    const ajustes = copia.ajustes?.[0];
    if (ajustes) {
      const atual = await db.ajustes.get('app');
      if (atual) await db.ajustes.put({ ...atual, ...ajustes, id: 'app', pin: pinAtual });
    }
  });
}
