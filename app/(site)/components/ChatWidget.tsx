"use client";

import { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';

type Msg = { id: string; from: 'bot' | 'user'; text: string };

function uid() { return Math.random().toString(36).slice(2, 9); }

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [collect, setCollect] = useState<{ nome?: string; telefone?: string; data?: string; servico?: string }>({});
  const [step, setStep] = useState<'start'|'menu'|'agendar_nome'|'agendar_tel'|'agendar_data'|'done'>('start');
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    if (messages.length === 0) {
      pushBot("Olá! Sou o assistente virtual da Saúde Certa. Posso ajudar com:\n• Agendar consulta\n• Sobre serviços\n• Falar com o atendimento humano\n\nSelecione uma opção ou escreva sua dúvida.");
      setStep('menu');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  function pushBot(text: string) {
    setMessages((m) => [...m, { id: uid(), from: 'bot', text }]);
  }

  function pushUser(text: string) {
    setMessages((m) => [...m, { id: uid(), from: 'user', text }]);
  }

  function handleOption(opt: string) {
    pushUser(opt);
    if (opt.toLowerCase().includes('agendar')) {
      setTimeout(() => { pushBot('Perfeito — vou coletar alguns dados. Qual o seu nome completo?'); setStep('agendar_nome'); }, 700);
    } else if (opt.toLowerCase().includes('serv')) {
      setTimeout(() => { pushBot('Oferecemos Periodontia, Cirurgia Oral, Clareamento, Tratamento de Canal e Ortodontia. Deseja agendar ou falar com o atendimento?'); setStep('menu'); }, 700);
    } else {
      setTimeout(() => { pushBot('Vou transferir sua solicitação para o atendimento humano. Deseja que eu gere uma mensagem para o WhatsApp com seus dados?'); setStep('done'); }, 700);
    }
  }

  function handleSendText() {
    const text = input.trim();
    if (!text) return;
    pushUser(text);
    setInput('');
    // handle steps
    if (step === 'agendar_nome') {
      setCollect((c) => ({ ...c, nome: text }));
      setTimeout(() => { pushBot('Ótimo. Qual telefone para contato (WhatsApp)?'); setStep('agendar_tel'); }, 700);
      return;
    }
    if (step === 'agendar_tel') {
      setCollect((c) => ({ ...c, telefone: text }));
      setTimeout(() => { pushBot('Perfeito. Qual data/horário prefere? (ex: 2025-05-12 14:30)'); setStep('agendar_data'); }, 700);
      return;
    }
    if (step === 'agendar_data') {
      setCollect((c) => ({ ...c, data: text }));
      setTimeout(() => {
        pushBot(`Confirmei seus dados:\nNome: ${collect.nome ?? '—'}\nTelefone: ${collect.telefone ?? '—'}\nData: ${text}\n\nDeseja enviar estes dados para o WhatsApp da clínica?`);
        setStep('done');
      }, 700);
      return;
    }

    // default echo
    setTimeout(() => { pushBot('Obrigado — em breve um atendente humano poderá continuar. Enquanto isso, posso gerar uma mensagem para WhatsApp com sua solicitação.'); setStep('done'); }, 900);
  }

  function scrollToBottom() {
    setTimeout(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, 50);
  }

  function handleSendWhatsApp() {
    // build message
    const msg = `Olá! Gostaria de agendar uma consulta.\nNome: ${collect.nome ?? ''}\nTelefone: ${collect.telefone ?? ''}\nData/Preferência: ${collect.data ?? ''}`;
    const phone = (collect.telefone ?? '').replace(/\D/g, '');
    const url = phone ? `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <button onClick={() => setOpen(true)} title="Assistente IA" className="flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20B857] text-white rounded-full shadow-lg hover:shadow-xl transition-all">
            <MessageCircle className="w-7 h-7" />
          </button>
        )}

        {open && (
          <div className="w-80 h-96 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 font-semibold">AI</div>
                <div>
                  <div className="font-medium text-sm">Assistente Saúde Certa</div>
                  <div className="text-xs text-muted-foreground">Atendimento inicial automatizado</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setOpen(false); }} className="p-1 rounded hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-white to-slate-50">
              {messages.map((m) => (
                <div key={m.id} className={m.from === 'bot' ? 'text-sm bg-gray-100 p-2 rounded-lg max-w-[85%]' : 'text-sm bg-brand-600 text-white p-2 rounded-lg ml-auto max-w-[85%]'}>
                  {m.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
                </div>
              ))}
            </div>

            <div className="p-3 border-t">
              {step === 'menu' && (
                <div className="flex gap-2 mb-2">
                  <button onClick={() => handleOption('Agendar consulta')} className="btn-secondary text-xs">Agendar</button>
                  <button onClick={() => handleOption('Serviços')} className="btn-secondary text-xs">Serviços</button>
                  <button onClick={() => handleOption('Falar com atendente')} className="btn-secondary text-xs">Atendimento</button>
                </div>
              )}

              <div className="flex gap-2">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSendText(); }} placeholder="Escreva sua mensagem..." className="input flex-1" />
                <button onClick={handleSendText} className="p-2 rounded bg-brand-600 text-white flex items-center gap-2"><Send className="w-4 h-4" /></button>
              </div>

              {step === 'done' && (
                <div className="mt-2 flex gap-2">
                  <button onClick={handleSendWhatsApp} className="btn-primary flex-1">Enviar por WhatsApp</button>
                  <button onClick={() => { setMessages([]); setCollect({}); setStep('menu'); }} className="btn-secondary">Reiniciar</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
