import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AntiGravity — Prospección Automática',
  description: 'Plataforma de prospección inteligente para agencias de diseño web. Encuentra negocios, analiza oportunidades y gestiona tu pipeline de ventas.',
  keywords: ['prospección', 'agencia web', 'clientes', 'negocios', 'ventas'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-bg text-text">
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('ag-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
