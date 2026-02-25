import type { Metadata } from 'next';
import { Outfit, Playfair_Display } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Saúde Certa – Clínica Odontológica', template: '%s | Saúde Certa' },
  description: 'Clínica Odontológica Saúde Certa – Cuidando do seu sorriso com excelência. Rua Dr Neto, 321, Centro, Iporá-GO.',
  keywords: ['dentista', 'clínica odontológica', 'Iporá', 'Goiás', 'ortodontia', 'clareamento'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${playfair.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
