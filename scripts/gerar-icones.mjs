// Gera os ícones PNG do app (tela inicial, Android e iOS) a partir de public/icons/voxa.svg.
// Uso: npm run icones
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync('public/icons/voxa.svg');
// Versão "maskable": o desenho fica dentro da área segura de 80%.
const mascaravel = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#2c62c9"/>` +
    `<g transform="translate(51 51) scale(0.8)">${svg.toString().replace(/<svg[^>]*>|<\/svg>/g, '').replace('rx="112"', 'rx="0"')}</g></svg>`,
);

await sharp(svg).resize(192, 192).png().toFile('public/icons/icone-192.png');
await sharp(svg).resize(512, 512).png().toFile('public/icons/icone-512.png');
await sharp(mascaravel).resize(512, 512).png().toFile('public/icons/icone-mascaravel-512.png');
await sharp(mascaravel).resize(180, 180).png().toFile('public/icons/apple-touch-icon.png');
await sharp(svg).resize(48, 48).png().toFile('public/icons/favicon-48.png');
console.log('ícones gerados');
