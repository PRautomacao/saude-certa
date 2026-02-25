'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, MapPin, Clock, Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/',          label: 'Início' },
  { href: '/sobre',     label: 'Sobre' },
  { href: '/servicos',  label: 'Serviços' },
  { href: '/contato',   label: 'Contato' },
];

function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-brand-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-display text-xl text-brand-700 font-semibold">Saúde Certa</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                pathname === l.href
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:text-brand-700 hover:bg-brand-50',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/556499999999?text=Olá! Gostaria de agendar uma consulta."
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex btn-primary text-sm items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Agendar Consulta
          </a>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-brand-50"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-brand-100 bg-white px-4 py-4 space-y-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                'block px-3 py-2.5 rounded-lg text-sm font-medium',
                pathname === l.href ? 'bg-brand-50 text-brand-700' : 'text-gray-600',
              )}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://wa.me/556499999999"
            target="_blank"
            className="flex items-center gap-2 btn-primary text-sm mt-3"
          >
            <Phone className="w-4 h-4" /> Agendar Consulta
          </a>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-100 pt-12 pb-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 bg-brand-400 rounded-lg flex items-center justify-center">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-display text-lg text-white">Saúde Certa</span>
          </div>
          <p className="text-sm text-brand-300 leading-relaxed">
            Cuidando do seu sorriso com excelência, dedicação e toda a tecnologia odontológica moderna.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Serviços</h3>
          <ul className="space-y-1.5 text-sm text-brand-300">
            {['Periodontia', 'Cirurgia Oral', 'Clareamento', 'Tratamento de Canal', 'Ortodontia'].map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Contato</h3>
          <div className="space-y-2.5 text-sm text-brand-300">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-brand-400 shrink-0" />
              <span>Rua Dr Neto, nº 321, Centro<br />Iporá – GO, CEP 76200-000</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-400" />
              <a href="https://wa.me/556499999999" className="hover:text-white transition-colors">(64) 9999-9999</a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Seg–Sex: 08h–17h30 | Sáb: 08h–12h</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-brand-800 pt-5 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-500">
        <span>© 2025 Clínica Odontológica Saúde Certa. Todos os direitos reservados.</span>
        <Link href="/admin/login" className="hover:text-brand-300 transition-colors mt-2 sm:mt-0">Acesso Restrito</Link>
      </div>
    </footer>
  );
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
