import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/atkinson-hyperlegible-next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voxa — comunicação alternativa',
  description:
    'Aplicativo gratuito e offline de comunicação alternativa e expressão de emoções para crianças com Transtorno do Espectro Autista.',
  applicationName: 'Voxa',
  manifest: 'manifest.webmanifest',
  icons: {
    icon: [{ url: 'icons/favicon-48.png', sizes: '48x48' }, { url: 'icons/voxa.svg', type: 'image/svg+xml' }],
    apple: 'icons/apple-touch-icon.png',
  },
  appleWebApp: { capable: true, title: 'Voxa', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f2f5f8',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
