import Link from 'next/link';
import Image from 'next/image';
import {
  Phone, MapPin, Star, Shield, Clock, Heart,
  ChevronRight, CheckCircle2, Calendar,
  Stethoscope, Sparkles,
} from 'lucide-react';
import ChatWidget from './components/ChatWidget';


const servicos = [
  { icon: '🦷', nome: 'Periodontia', desc: 'Tratamento especializado das gengivas e estruturas de suporte dos dentes.', valor: 'A partir de R$ 350' },
  { icon: '🔬', nome: 'Cirurgia Oral', desc: 'Extrações simples e complexas, implantes e procedimentos cirúrgicos com segurança.', valor: 'A partir de R$ 800' },
  { icon: '✨', nome: 'Clareamento', desc: 'Clareamento dental profissional para um sorriso mais branco e radiante.', valor: 'A partir de R$ 600' },
  { icon: '💊', nome: 'Tratamento de Canal', desc: 'Endodontia moderna com tecnologia de última geração, sem dor e com segurança.', valor: 'A partir de R$ 900' },
  { icon: '😁', nome: 'Ortodontia', desc: 'Aparelhos fixos, removíveis e alinhadores para o sorriso perfeito.', valor: 'A partir de R$ 250/mês' },
];

const diferenciais = [
  { icon: Shield, titulo: 'Biossegurança Total', desc: 'Equipamentos esterilizados e protocolos rigorosos de higiene.' },
  { icon: Heart, titulo: 'Atendimento Humanizado', desc: 'Ambiente acolhedor para que você se sinta seguro e confortável.' },
  { icon: Stethoscope, titulo: 'Draª Ana Luz – CRO/GO', desc: 'Especialista com anos de experiência e atualização constante.' },
  { icon: Sparkles, titulo: 'Tecnologia Moderna', desc: 'Equipamentos de última geração para diagnóstico e tratamento.' },
];

const depoimentos = [
  { nome: 'Maria S.', nota: 5, texto: 'Atendimento impecável! A Draª Ana é muito atenciosa. Indico para toda a família.' },
  { nome: 'João P.', nota: 5, texto: 'Fiz o clareamento e o resultado superou minhas expectativas. Ambiente muito agradável.' },
  { nome: 'Carla M.', nota: 5, texto: 'Finalmente encontrei uma clínica onde me sinto acolhida. Excelente profissionalismo!' },
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-brand-200/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-96 h-64 bg-brand-100/60 rounded-full blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-stagger">
              <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <Star className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
                Clínica Referência em Iporá-GO
              </div>
              <h1 className="font-display text-5xl md:text-6xl leading-tight text-brand-900 mb-5">
                Seu sorriso merece o<br />
                <span className="text-gradient italic">melhor cuidado</span>
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
                Tratamentos odontológicos modernos em um ambiente acolhedor. 
                Venha descobrir o cuidado que você merece.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/556499999999?text=Olá! Gostaria de agendar uma consulta."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2 text-base"
                >
                  <Calendar className="w-5 h-5" />
                  Agende sua Consulta
                </a>
                <Link href="/servicos" className="btn-secondary flex items-center gap-2 text-base">
                  Ver Serviços <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="flex items-center gap-2 mt-6 text-sm text-gray-500">
                <MapPin className="w-4 h-4 text-brand-500" />
                Rua Dr Neto, nº 321, Centro – Iporá, GO
              </div>
            </div>

            {/* Stats card */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              {[
                { label: 'Pacientes Atendidos', value: '+2.000', icon: '👨‍👩‍👧' },
                { label: 'Anos de Experiência', value: '15+', icon: '🏆' },
                { label: 'Procedimentos/Mês', value: '+150', icon: '🦷' },
                { label: 'Satisfação dos Pacientes', value: '98%', icon: '❤️' },
              ].map((s) => (
                <div key={s.label} className="card p-6 text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-3xl font-bold text-brand-600 mb-1">{s.value}</div>
                  <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl text-brand-900 mb-2">Por que escolher a Saúde Certa?</h2>
            <p className="text-gray-500">Comprometidos com sua saúde e bem-estar</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {diferenciais.map((d) => (
              <div key={d.titulo} className="group card p-6 hover:shadow-md hover:border-brand-200 transition-all">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                  <d.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{d.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-16 bg-brand-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl text-brand-900 mb-2">Nossos Serviços</h2>
            <p className="text-gray-500">Tratamentos completos para toda a família</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {servicos.map((s) => (
              <div key={s.nome} className="card p-6 hover:shadow-md hover:border-brand-300 transition-all group">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{s.nome}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{s.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-brand-600">{s.valor}</span>
                  <a
                    href="https://wa.me/556499999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-500 hover:text-brand-700 font-medium flex items-center gap-1"
                  >
                    Agendar <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DRª ANA LUZ */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative rounded-2xl overflow-hidden min-h-64 h-80 md:h-96 shadow-lg">
                <Image
                  src="/logo-png.png"
                  alt="Draª Ana Luz — Clínica Saúde Certa"
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            <div>
              <div className="text-brand-600 text-sm font-semibold uppercase tracking-wide mb-2">Nossa Especialista</div>
              <h2 className="font-display text-3xl text-brand-900 mb-4">Draª Ana Luz</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Com mais de 15 anos dedicados à odontologia, a Draª Ana Luz é referência em 
                Iporá e região. Especialista em periodontia e cirurgia oral, ela combina 
                técnica avançada com um atendimento humanizado que coloca o paciente sempre 
                em primeiro lugar.
              </p>
              <ul className="space-y-2.5 mb-6">
                {[
                  'Especialização em Periodontia – UFG',
                  'Certificação em Implantodontia',
                  'Atualização constante em técnicas modernas',
                  'Atendimento adulto e infantil',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/sobre" className="btn-secondary inline-flex items-center gap-2">
                Saiba mais <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-16 bg-brand-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl mb-2">O que nossos pacientes dizem</h2>
            <p className="text-brand-200 text-sm">Mais de 2.000 sorrisos transformados</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {depoimentos.map((d) => (
              <div key={d.nome} className="bg-brand-600/50 backdrop-blur rounded-xl p-6 border border-brand-500">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: d.nota }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-brand-100 text-sm leading-relaxed mb-4">"{d.texto}"</p>
                <div className="font-semibold text-white text-sm">{d.nome}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + LOCALIZAÇÃO */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display text-3xl text-brand-900 mb-4">
              Pronto para transformar<br />seu sorriso?
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Entre em contato agora pelo WhatsApp e agende sua consulta. 
              Estamos localizados no centro de Iporá, prontos para atendê-lo!
            </p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-brand-500" />
                </div>
                Rua Dr Neto, nº 321, Centro – Iporá, GO
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-brand-500" />
                </div>
                (64) 9999-9999
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-brand-500" />
                </div>
                Seg–Sex: 08h–17h30 | Sáb: 08h–12h
              </div>
            </div>
            <a
              href="https://wa.me/556499999999?text=Olá! Gostaria de agendar uma consulta na Clínica Saúde Certa."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 text-base"
            >
              <Phone className="w-5 h-5" />
              Falar no WhatsApp
            </a>
          </div>
          <div className="bg-brand-50 rounded-2xl overflow-hidden h-72 md:h-80 flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3785.7!2d-51.12!3d-16.44!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDI2JzM2LjAiUyA1McKwMDcnMTIuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Clínica Saúde Certa"
            />
          </div>
        </div>
      </section>

      <ChatWidget />
    </>
  );
}
