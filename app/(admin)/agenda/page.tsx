'use client';

import { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Clock, User,
  CheckCircle, XCircle, Loader2, Calendar,
} from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAgendamentosByData, upsertAgendamento, updateStatusAgendamento, getHorariosDisponiveis } from '@/lib/supabase/queries/agendamentos';
import { getPacientes } from '@/lib/supabase/queries/pacientes';
import { STATUS_AGENDAMENTO, SERVICOS_CLINICA, cn } from '@/lib/utils';
import type { Agendamento, Paciente, StatusAgendamento } from '@/types';

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function ModalAgendamento({
  data, horarioInicial, onClose, onSave, pacientes,
}: {
  data: Date;
  horarioInicial?: string;
  onClose: () => void;
  onSave: (ag: Partial<Agendamento>) => void;
  pacientes: Paciente[];
}) {
  const [form, setForm] = useState<Partial<Agendamento>>({
    data: format(data, 'yyyy-MM-dd'),
    horario: horarioInicial ?? '',
    status: 'confirmado',
  });
  const [horarios, setHorarios] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getHorariosDisponiveis(data).then(setHorarios);
  }, [data]);

  function update(field: keyof Agendamento, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); onClose(); }
    catch { alert('Erro ao salvar.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Novo Agendamento</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(data, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="label">Paciente *</label>
            <select className="input" required value={form.paciente_id ?? ''} onChange={(e) => update('paciente_id', e.target.value)}>
              <option value="">Selecionar paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Serviço</label>
            <select className="input" value={(form as any).servico_nome ?? ''} onChange={(e) => update('observacoes', e.target.value)}>
              <option value="">Selecionar serviço...</option>
              {SERVICOS_CLINICA.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Horário *</label>
            <select className="input" required value={form.horario ?? ''} onChange={(e) => update('horario', e.target.value)}>
              <option value="">Selecionar horário...</option>
              {horarios.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status ?? 'confirmado'} onChange={(e) => update('status', e.target.value)}>
              <option value="confirmado">Confirmado</option>
              <option value="pendente">Pendente</option>
            </select>
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea className="input resize-none min-h-16" value={form.observacoes ?? ''} onChange={(e) => update('observacoes', e.target.value)} placeholder="Anotações..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AgendaPage() {
  const [semanaAtual, setSemanaAtual] = useState(new Date());
  const [diaSelecionado, setDiaSelecionado] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<'semana' | 'dia'>('semana');

  const inicio = startOfWeek(semanaAtual, { locale: ptBR });
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(inicio, i));

  async function loadAgendamentos(data: Date) {
    setLoading(true);
    try { setAgendamentos(await getAgendamentosByData(data)); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadAgendamentos(diaSelecionado); }, [diaSelecionado]);
  useEffect(() => { getPacientes().then(setPacientes); }, []);

  async function handleSave(ag: Partial<Agendamento>) {
    await upsertAgendamento(ag);
    await loadAgendamentos(diaSelecionado);
  }

  async function handleStatus(id: string, status: StatusAgendamento) {
    await updateStatusAgendamento(id, status);
    await loadAgendamentos(diaSelecionado);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-header">Agenda</h1>
          <p className="page-subtitle">
            {format(inicio, "dd 'de' MMM", { locale: ptBR })} – {format(addDays(inicio, 6), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Novo Agendamento
        </button>
      </div>

      {/* Semana */}
      <div className="card mb-5">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <button onClick={() => setSemanaAtual((d) => subWeeks(d, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">
            {format(inicio, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button onClick={() => setSemanaAtual((d) => addWeeks(d, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 px-2 pb-3">
          {diasSemana.map((dia, i) => {
            const selected = isSameDay(dia, diaSelecionado);
            const today    = isToday(dia);
            return (
              <button
                key={i}
                onClick={() => setDiaSelecionado(dia)}
                className={cn(
                  'flex flex-col items-center py-2 px-1 rounded-xl transition-all',
                  selected ? 'bg-brand-500 text-white' : today ? 'border border-brand-300 text-brand-700' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <span className="text-xs font-medium">{DIAS_SEMANA[i]}</span>
                <span className={cn('text-base font-bold mt-0.5', selected && 'text-white', !selected && today && 'text-brand-600')}>
                  {format(dia, 'd')}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agendamentos do dia */}
      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold">
            {format(diaSelecionado, "EEEE, dd 'de' MMMM", { locale: ptBR })}
          </h2>
          <span className="ml-auto text-xs text-muted-foreground">{agendamentos.length} agendamento(s)</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum agendamento neste dia</p>
            <button onClick={() => setModalOpen(true)} className="text-xs text-brand-500 hover:underline mt-1">
              + Adicionar agendamento
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {agendamentos.map((ag) => {
              const status = STATUS_AGENDAMENTO[ag.status];
              const paciente = (ag as any).pacientes;
              const servico  = (ag as any).servicos;
              return (
                <div key={ag.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-border hover:border-brand-200 group transition-all">
                  <div className="w-14 text-center shrink-0">
                    <div className="text-lg font-bold text-brand-600">{ag.horario?.substring(0, 5)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
                        {paciente?.nome?.charAt(0) ?? 'P'}
                      </div>
                      <span className="font-medium text-sm text-foreground truncate">{paciente?.nome ?? '—'}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {servico?.nome ?? ag.observacoes ?? 'Consulta'}
                    </div>
                    {paciente?.telefone && (
                      <a href={`tel:${paciente.telefone}`} className="text-xs text-brand-500 hover:underline">
                        {paciente.telefone}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`badge ${status.color}`}>{status.label}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {ag.status !== 'realizado' && (
                        <button onClick={() => handleStatus(ag.id, 'realizado')} className="p-1 rounded hover:bg-green-50 text-green-600" title="Marcar como realizado">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {ag.status !== 'cancelado' && (
                        <button onClick={() => handleStatus(ag.id, 'cancelado')} className="p-1 rounded hover:bg-red-50 text-red-500" title="Cancelar">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <ModalAgendamento
          data={diaSelecionado}
          pacientes={pacientes}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
