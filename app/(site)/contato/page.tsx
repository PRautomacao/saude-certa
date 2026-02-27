import Link from 'next/link';
import { MapPin, Phone, Clock } from 'lucide-react';

export default function ContatoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="font-display text-4xl text-brand-900 mb-4">Contato</h1>
      <p className="text-gray-600 mb-6">Entre em contato conosco para agendar sua consulta ou tirar dúvidas.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-brand-500" />
            <div>
              <div className="font-semibold">Endereço</div>
              <div className="text-sm text-gray-600">Rua Dr Neto, nº 321, Centro – Iporá, GO</div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <Phone className="w-5 h-5 text-brand-500" />
            <div>
              <div className="font-semibold">Telefone</div>
              <a href="https://wa.me/556499999999" className="text-sm text-brand-500">(64) 9999-9999 (WhatsApp)</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand-500" />
            <div>
              <div className="font-semibold">Horário</div>
              <div className="text-sm text-gray-600">Seg–Sex: 08h–17h30 | Sáb: 08h–12h</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-3">Formulário</h3>
          <p className="text-sm text-gray-600 mb-4">Em projetos reais aqui viria um formulário de contato — por enquanto, use o WhatsApp.</p>
          <a href="https://wa.me/556499999999" target="_blank" rel="noreferrer" className="btn-primary">Falar no WhatsApp</a>
        </div>
      </div>

      <Link href="/" className="btn-secondary">Voltar ao início</Link>
    </div>
  );
}
