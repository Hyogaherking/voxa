// Gera out/sw.js depois do build (RNF01 — funcionamento offline).
// Lista todos os arquivos do export estático e cria um service worker que
// guarda tudo no aparelho na primeira visita. A versão do cache é o resumo do
// conteúdo: quando o app muda, o cache antigo é trocado pelo novo.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const pastaOut = join(process.cwd(), 'out');

function listar(pasta) {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    return statSync(caminho).isDirectory() ? listar(caminho) : [caminho];
  });
}

const arquivos = listar(pastaOut)
  .map((c) => relative(pastaOut, c).split(sep).join('/'))
  .filter((c) => c !== 'sw.js' && !c.endsWith('.map'))
  .sort();

const hash = createHash('sha256');
for (const a of arquivos) hash.update(a).update(readFileSync(join(pastaOut, a)));
const versao = hash.digest('hex').slice(0, 12);

const sw = `// Gerado por scripts/gerar-sw.mjs — não edite à mão.
const CACHE = 'voxa-${versao}';
const ARQUIVOS = ${JSON.stringify(['./', ...arquivos])};

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ARQUIVOS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n.startsWith('voxa-') && n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;

  evento.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const salvo = await cache.match(pedido, { ignoreSearch: true });
      if (salvo) return salvo;
      if (pedido.mode === 'navigate') {
        const inicio = (await cache.match('./')) || (await cache.match('index.html'));
        if (inicio) return inicio;
      }
      return fetch(pedido);
    }),
  );
});
`;

writeFileSync(join(pastaOut, 'sw.js'), sw);
console.log(`sw.js gerado: ${arquivos.length} arquivos, versão ${versao}`);
