'use client';

import dynamic from 'next/dynamic';
import { Abertura } from '@/components/ui/Abertura';

// O app inteiro roda no aparelho (IndexedDB, voz do sistema), por isso é
// carregado só no navegador. O HTML estático mostra apenas a abertura.
const VoxaApp = dynamic(() => import('@/components/VoxaApp'), {
  ssr: false,
  loading: () => <Abertura />,
});

export default function Pagina() {
  return <VoxaApp />;
}
