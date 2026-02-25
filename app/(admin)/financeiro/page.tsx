'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Filter, Download, TrendingUp, TrendingDown, DollarSign,
  CheckCircle, Clock, Loader2, FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { getLancamentos, upsertLancamento, marcarComoPago, getFluxoMensal } from '@/lib/supabase/queries/financeiro';
import { getPacientes } from '@/lib/supabase/queries/pacientes';
import { formatCurrency, STATUS_FINANCEIRO, FORMA_PAGAMENTO, cn } from '@/lib/utils';
import type { Lancamento, Paciente, TipoLancamento } from '@/types';

function ModalLancamento({
  onClose, onSave, pacientes,
}: { onClose: () => void; onSave: (l: Partial<Lancamento>) => void; pacientes: Paciente[] }) {
  const [form, setForm] = useState<Partial<Lancamento>>({
    tipo: 'entrada',
    status: 'pago',
    data_vencimento: format(new Date(), 'yyyy-MM-dd'),
  });
  const [saving, setSaving] = useState(false);

  function update(field: keyof Lancamento, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (payload.status === 'pago' && !payload.data_pagamento) {
        payload.data_pagamento = format(new Date(), 'yyyy-MM-dd');
      }
      await onSave(payload);
      onClose();
    } catch { alert('Erro ao salvar.'); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Novo Lançamento</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Tipo */}
          <div className="grid grid-cols-2 gap-2">
            {(['entrada', 'saida'] as TipoLancamento[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update('tipo', t)}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-semibold border-2 transition-all',
                  form.tipo === t
                    ? t === 'entrada' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-600'
                    : 'border-border text-muted-foreground hover:border-brand-300',
                )}
              >
                {t === 'entrada' ? '↑ Entrada' : '↓ Saída'}
              </button>
            ))}
          </div>
          <div>
            <label className="label">Descrição *</label>
            <input className="input" required value={form.descricao ?? ''} onChange={(e) => update('descricao', e.target.value)} placeholder="Ex: Consulta ortodontia" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor (R$) *</label>
              <input className="input" type="number" step="0.01" min="0" required value={form.valor ?? ''} onChange={(e) => update('valor', e.target.value)} placeholder="0,00" />
            </div>
            <div>
              <label className="label">Data</label>
              <input className="input" type="date" value={form.data_vencimento ?? ''} onChange={(e) => update('data_vencimento', e.target.value)} />
            </div>
          </div>
          {form.tipo === 'entrada' && (
            <div>
              <label className="label">Paciente</label>
              <select className="input" value={form.paciente_id ?? ''} onChange={(e) => update('paciente_id', e.target.value)}>
                <option value="">Nenhum (entrada avulsa)</option>
                {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Forma de Pagamento</label>
            <select className="input" value={form.forma_pagamento ?? ''} onChange={(e) => update('forma_pagamento', e.target.value)}>
              <option value="">Selecionar...</option>
              {Object.entries(FORMA_PAGAMENTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status ?? 'pago'} onChange={(e) => update('status', e.target.value)}>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
            </select>
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

export default function FinanceiroPage() {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [fluxo, setFluxo] = useState<{ mes: string; entradas: number; saidas: number }[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'entrada' | 'saida' | 'pendente'>('todos');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const fim    = `${ano}-${String(mes).padStart(2, '0')}-31`;
      const [l, f] = await Promise.all([
        getLancamentos({ dataInicio: inicio, dataFim: fim }),
        getFluxoMensal(ano),
      ]);
      setLancamentos(l);
      setFluxo(f);
    } finally { setLoading(false); }
  }, [mes, ano]);

  useEffect(() => { load(); getPacientes().then(setPacientes); }, [load]);

  const filtrados = lancamentos.filter((l) => {
    if (filtro === 'entrada') return l.tipo === 'entrada';
    if (filtro === 'saida')   return l.tipo === 'saida';
    if (filtro === 'pendente') return l.status === 'pendente';
    return true;
  });

  const totalEntradas  = lancamentos.filter((l) => l.tipo === 'entrada' && l.status === 'pago').reduce((a, l) => a + l.valor, 0);
  const totalSaidas    = lancamentos.filter((l) => l.tipo === 'saida').reduce((a, l) => a + l.valor, 0);
  const totalPendentes = lancamentos.filter((l) => l.status === 'pendente').reduce((a, l) => a + l.valor, 0);
  const saldo          = totalEntradas - totalSaidas;

  async function handleSave(l: Partial<Lancamento>) {
    await upsertLancamento(l);
    await load();
  }

  async function handlePagar(id: string) {
    await marcarComoPago(id);
    await load();
  }

  async function exportarPDF() {
    const { jsPDF } = await import('jspdf');
    const autoTable  = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Relatório Financeiro – Clínica Saúde Certa', 14, 18);
    doc.setFontSize(11);
    doc.text(`Período: ${String(mes).padStart(2, '0')}/${ano}`, 14, 26);
    doc.text(`Receita: ${formatCurrency(totalEntradas)}   Despesas: ${formatCurrency(totalSaidas)}   Saldo: ${formatCurrency(saldo)}`, 14, 33);

    autoTable(doc, {
      startY: 40,
      head: [['Data', 'Descrição', 'Paciente', 'Forma Pag.', 'Tipo', 'Valor', 'Status']],
      body: filtrados.map((l) => [
        l.data_vencimento ? format(new Date(l.data_vencimento), 'dd/MM/yyyy') : '—',
        l.descricao,
        (l as any).pacientes?.nome ?? '—',
        l.forma_pagamento ? FORMA_PAGAMENTO[l.forma_pagamento] : '—',
        l.tipo === 'entrada' ? 'Entrada' : 'Saída',
        formatCurrency(l.valor),
        l.status === 'pago' ? 'Pago' : 'Pendente',
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [42, 157, 100] },
    });

    doc.save(`financeiro-${ano}-${String(mes).padStart(2, '0')}.pdf`);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-header">Financeiro</h1>
          <p className="page-subtitle">Fluxo de caixa e controle de pagamentos</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportarPDF} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Lançamento
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Entradas',   valor: totalEntradas,  icon: TrendingUp,    cor: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Saídas',     valor: totalSaidas,    icon: TrendingDown,  cor: 'text-red-500',   bg: 'bg-red-50' },
          { label: 'Saldo',      valor: saldo,          icon: DollarSign,    cor: saldo >= 0 ? 'text-brand-600' : 'text-red-600', bg: 'bg-brand-50' },
          { label: 'Pendentes',  valor: totalPendentes, icon: Clock,         cor: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map((k) => (
          <div key={k.label} className="section-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${k.bg}`}>
              <k.icon className={`w-5 h-5 ${k.cor}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={`text-lg font-bold ${k.cor}`}>{formatCurrency(k.valor)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico anual */}
      <div className="section-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Fluxo Anual – {ano}</h2>
          <select
            className="input w-auto text-sm"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
          >
            {[ano - 1, ano, ano + 1].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={fluxo} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Legend iconType="circle" iconSize={8} />
            <Bar dataKey="entradas" name="Entradas" fill="#2a9d64" radius={[4, 4, 0, 0]} />
            <Bar dataKey="saidas"   name="Saídas"   fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filtros + Tabela */}
      <div className="section-card">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {/* Seletor mês */}
          <select className="input w-auto text-sm" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {format(new Date(ano, i), 'MMMM', { locale: ptBR })}
              </option>
            ))}
          </select>
          <div className="flex gap-1 flex-wrap">
            {(['todos', 'entrada', 'saida', 'pendente'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  filtro === f ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground hover:bg-brand-50',
                )}
              >
                {{ todos: 'Todos', entrada: 'Entradas', saida: 'Saídas', pendente: 'Pendentes' }[f]}
              </button>
            ))}
          </div>
          <span className="ml-auto text-xs text-muted-foreground">{filtrados.length} registro(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="table-header text-left px-3 py-2.5">Data</th>
                <th className="table-header text-left px-3 py-2.5">Descrição</th>
                <th className="table-header text-left px-3 py-2.5 hidden md:table-cell">Paciente</th>
                <th className="table-header text-left px-3 py-2.5 hidden lg:table-cell">Forma</th>
                <th className="table-header text-right px-3 py-2.5">Valor</th>
                <th className="table-header text-center px-3 py-2.5">Status</th>
                <th className="table-header px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-brand-500" /></td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Nenhum lançamento encontrado</td></tr>
              ) : (
                filtrados.map((l) => {
                  const st = STATUS_FINANCEIRO[l.status];
                  return (
                    <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {l.data_vencimento ? format(new Date(l.data_vencimento), 'dd/MM/yy') : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full shrink-0 ${l.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-sm font-medium text-foreground">{l.descricao}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 hidden md:table-cell text-sm text-muted-foreground">
                        {(l as any).pacientes?.nome ?? '—'}
                      </td>
                      <td className="px-3 py-2.5 hidden lg:table-cell text-xs text-muted-foreground">
                        {l.forma_pagamento ? FORMA_PAGAMENTO[l.forma_pagamento] : '—'}
                      </td>
                      <td className={`px-3 py-2.5 text-right text-sm font-semibold ${l.tipo === 'entrada' ? 'text-green-600' : 'text-red-500'}`}>
                        {l.tipo === 'entrada' ? '+' : '-'}{formatCurrency(l.valor)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`badge ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {l.status === 'pendente' && (
                          <button
                            onClick={() => handlePagar(l.id)}
                            className="p-1 rounded hover:bg-green-50 text-green-600 transition-colors"
                            title="Marcar como pago"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <ModalLancamento
          pacientes={pacientes}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
