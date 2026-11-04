import { VOCABULARIO_INICIAL } from '@/data/vocabulario-inicial';
import { AJUSTES_PADRAO, PERFIL_PADRAO, db, type Ajustes, type Registro } from './db';

export function novoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Cria ajustes, perfil e o vocabulário inicial na primeira abertura. */
export async function garantirDadosIniciais(): Promise<void> {
  await db.transaction('rw', [db.ajustes, db.perfil, db.pranchas, db.cartoes], async () => {
    const ajustes = await db.ajustes.get('app');
    if (!ajustes) await db.ajustes.put(AJUSTES_PADRAO);
    else await db.ajustes.put({ ...AJUSTES_PADRAO, ...ajustes, voz: { ...AJUSTES_PADRAO.voz, ...ajustes.voz } });

    if (!(await db.perfil.get('crianca'))) await db.perfil.put(PERFIL_PADRAO);

    if (!ajustes && (await db.pranchas.count()) === 0) await semearVocabulario();
  });
}

export async function semearVocabulario(): Promise<void> {
  await db.pranchas.clear();
  await db.cartoes.clear();
  for (const [i, p] of VOCABULARIO_INICIAL.entries()) {
    const pranchaId = novoId();
    await db.pranchas.add({
      id: pranchaId,
      nome: p.nome,
      imagem: { tipo: 'picto', id: p.picto },
      cor: p.cor,
      ordem: i,
      visivel: true,
    });
    await db.cartoes.bulkAdd(
      p.cartoes.map((c, j) => ({
        id: novoId(),
        pranchaId,
        rotulo: c.rotulo,
        fala: c.fala,
        imagem: { tipo: 'picto' as const, id: c.picto },
        cor: c.cor,
        ordem: j,
        visivel: true,
      })),
    );
  }
}

export async function atualizarAjustes(parcial: Partial<Omit<Ajustes, 'id'>>): Promise<void> {
  await db.ajustes.update('app', parcial);
}

/** Registro local do histórico de uso (RF08). Respeita a preferência do responsável. */
export async function registrar(item: Omit<Registro, 'id' | 'em'>): Promise<number | undefined> {
  const ajustes = await db.ajustes.get('app');
  if (ajustes && !ajustes.registrarHistorico) return undefined;
  return (await db.historico.add({ ...item, em: Date.now() })) as number;
}
