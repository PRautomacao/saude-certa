import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const servicos = [
  { nome: 'Periodontia', desc: 'Tratamento das gengivas e estruturas de suporte.' },
  { nome: 'Cirurgia Oral', desc: 'Extrações, implantes e procedimentos cirúrgicos.' },
  { nome: 'Clareamento', desc: 'Clareamento dental profissional.' },
  { nome: 'Tratamento de Canal', desc: 'Endodontia moderna e segura.' },
  { nome: 'Ortodontia', desc: 'Aparelhos e alinhadores para correção do sorriso.' },
];

export default function ServicosPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <h1 className="font-display text-4xl text-brand-900 mb-4">Nossos Serviços</h1>
      <p className="text-gray-600 mb-8">Oferecemos uma gama completa de tratamentos para cuidar do seu sorriso.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {servicos.map((s) => (
          <div key={s.nome} className="card p-6">
            <h3 className="font-semibold text-lg mb-1">{s.nome}</h3>
            <p className="text-sm text-gray-600">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/" className="btn-secondary inline-flex items-center gap-2">
          Voltar <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
