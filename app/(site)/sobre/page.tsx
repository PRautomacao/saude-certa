import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function SobrePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <h1 className="font-display text-4xl text-brand-900 mb-4">Sobre a Clínica Saúde Certa</h1>
      <p className="text-gray-600 mb-6">
        A Clínica Saúde Certa é referência em odontologia na região, com profissionais qualificados e
        infraestrutura moderna. Nosso compromisso é oferecer tratamentos personalizados, seguros e com
        atenção humanizada.
      </p>

      <h2 className="text-2xl font-semibold text-brand-800 mb-3">Nossa missão</h2>
      <p className="text-gray-600 mb-4">Promover saúde, bem-estar e autoestima por meio de serviços odontológicos de excelência.</p>

      <h2 className="text-2xl font-semibold text-brand-800 mb-3">Equipe</h2>
      <p className="text-gray-600 mb-6">Nossa equipe é formada por especialistas em diversas áreas odontológicas, com atualização constante e foco no atendimento humanizado.</p>

      <Link href="/" className="btn-secondary inline-flex items-center gap-2">
        Voltar para o início <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
