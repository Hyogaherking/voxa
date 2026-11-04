// Gera os arquivos SVG dos pictogramas usados pelo Voxa a partir do conjunto
// Fluent Emoji Flat (Microsoft, licença MIT), distribuído pelo pacote
// @iconify-json/fluent-emoji-flat. Os arquivos ficam em public/pictos e são
// guardados pelo service worker, então funcionam sem internet.
//
// Uso: npm run pictos
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const conjunto = require('@iconify-json/fluent-emoji-flat/icons.json');
const catalogo = JSON.parse(readFileSync(join(raiz, 'src/data/catalogo-pictogramas.json'), 'utf8'));

const destino = join(raiz, 'public/pictos');
rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });

function resolver(nome) {
  if (conjunto.icons[nome]) return conjunto.icons[nome];
  const alias = conjunto.aliases?.[nome];
  if (alias) return { ...resolver(alias.parent), ...alias };
  return null;
}

const faltando = [];
const vistos = new Set();
for (const item of catalogo) {
  if (vistos.has(item.id)) throw new Error(`Pictograma repetido no catálogo: ${item.id}`);
  vistos.add(item.id);
  const icone = resolver(item.id);
  if (!icone) {
    faltando.push(item.id);
    continue;
  }
  const largura = icone.width ?? conjunto.width ?? 32;
  const altura = icone.height ?? conjunto.height ?? 32;
  const esquerda = icone.left ?? 0;
  const topo = icone.top ?? 0;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${esquerda} ${topo} ${largura} ${altura}">${icone.body}</svg>\n`;
  writeFileSync(join(destino, `${item.id}.svg`), svg);
}

if (faltando.length) {
  console.error('Pictogramas não encontrados:', faltando.join(', '));
  process.exit(1);
}
console.log(`${catalogo.length} pictogramas gerados em public/pictos`);
