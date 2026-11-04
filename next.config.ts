import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

// Export estático: o build gera arquivos HTML/JS/CSS em `out/`, que o service
// worker guarda no aparelho. Assim o Voxa não depende de servidor (RNF01).
// No build, os caminhos dos arquivos são relativos ("./_next/..."), então a
// pasta `out/` funciona em qualquer endereço — inclusive numa subpasta, como
// no GitHub Pages (usuario.github.io/voxa/).
export default function config(fase: string): NextConfig {
  return {
    output: 'export',
    images: { unoptimized: true },
    reactStrictMode: true,
    assetPrefix: fase === PHASE_PRODUCTION_BUILD ? '.' : undefined,
  };
}
