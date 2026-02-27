"use client";

import { useEffect, useState } from 'react';
import { Users, Calendar, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { formatCurrency, STATUS_AGENDAMENTO } from '@/lib/utils';
import { getKPIsMes, getFluxoMensal } from '@/lib/supabase/queries/financeiro';
import { getAgendamentosByData } from '@/lib/supabase/queries/agendamentos';
import type { Agendamento } from '@/types';

const COLORS_PIE = ['#2a9d64', '#4db882', '#7dcfa6', '#b3e5c8', '#d9f2e3'];

const fluxoMock = [
  { mes: 'jan', entradas: 8500, saidas: 3200 },
  { mes: 'fev', entradas: 9200, saidas: 2800 },
  { mes: 'mar', entradas: 11000, saidas: 4100 },
  { mes: 'abr', entradas: 9800, saidas: 3500 },
  { mes: 'mai', entradas: 12300, saidas: 3900 },
  { mes: 'jun', entradas: 10500, saidas: 4200 },
];

const servicosMock = [
  { name: 'Ortodontia', value: 32 },
  { name: 'Canal', value: 20 },
  { name: 'Clareamento', value: 18 },
  { name: 'Periodontia', value: 16 },
  { name: 'Cirurgia', value: 14 },
];

interface KPIs {
  total_pacientes: number;
  consultas_mes: number;
  receita_mes: number;
  despesas_mes: number;
  saldo_mes: number;
}

function KpiCard({
  titulo, valor, icone: Icon, cor, variacao, formato = 'numero',
}: {
  titulo: string;
  valor: number;
  icone: React.ElementType;
  cor: string;
  variacao?: number;
  formato?: 'numero' | 'moeda';
}) {
  return (
    <div className="section-card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cor}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{titulo}</p>
        <p className="text-2xl font-bold text-foreground">
          {formato === 'moeda' ? formatCurrency(valor) : valor.toLocaleString('pt-BR')}
        </p>
        {variacao !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-0.5 ${variacao >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {variacao >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(variacao)}% vs mês anterior
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const hoje = new Date();
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [agendamentosHoje, setAgendamentosHoje] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [k, ag] = await Promise.all([
          getKPIsMes(hoje.getFullYear(), hoje.getMonth() + 1),
          getAgendamentosByData(hoje),
        ]);
        setKpis(k);
        setAgendamentosHoje(ag);
      } catch (e) {
        console.error('Erro ao carregar dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-header">Dashboard</h1>
        <p className="page-subtitle">
          {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 animate-stagger">
        <KpiCard
          titulo="Total de Pacientes"
          valor={kpis?.total_pacientes ?? 0}
          icone={Users}
          cor="bg-blue-500"
          variacao={5}
        />
        <KpiCard
          titulo="Consultas no Mês"
          valor={kpis?.consultas_mes ?? 0}
          icone={Calendar}
          cor="bg-brand-500"
          variacao={12}
        />
        <KpiCard
          titulo="Receita do Mês"
          valor={kpis?.receita_mes ?? 0}
          icone={TrendingUp}
          cor="bg-emerald-500"
          variacao={8}
          formato="moeda"
        />
        <KpiCard
          titulo="Saldo do Mês"
          valor={kpis?.saldo_mes ?? 0}
          icone={DollarSign}
          cor="bg-violet-500"
          formato="moeda"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="section-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Fluxo de Caixa – {hoje.getFullYear()}</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={fluxoMock} margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2a9d64" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2a9d64" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="entradas" stroke="#2a9d64" strokeWidth={2} fill="url(#colorEntradas)" name="Entradas" />
              <Area type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} fill="url(#colorSaidas)" name="Saídas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="section-card">
          <h2 className="font-semibold text-foreground mb-4">Consultas por Serviço</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={servicosMock} cx="50%" cy="45%" innerRadius={50} outerRadius={80}
                dataKey="value" nameKey="name" paddingAngle={3}>
                {servicosMock.map((_, i) => (
                  <Cell key={i} fill={COLORS_PIE[i % COLORS_PIE.length]} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`${v} consultas`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="section-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-brand-500" />
          <h2 className="font-semibold text-foreground">Agenda de Hoje</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {agendamentosHoje.length} agendamento{agendamentosHoje.length !== 1 ? 's' : ''}
          </span>
        </div>

        {agendamentosHoje.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum agendamento para hoje</p>
          </div>
        ) : (
          <div className="space-y-2">
            {agendamentosHoje.map((ag) => {
              const statusInfo = STATUS_AGENDAMENTO[ag.status];
              return (
                <div key={ag.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-brand-200 transition-colors">
                  <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {(ag as any).pacientes?.nome ?? 'Paciente'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {ag.horario?.substring(0, 5)} · {(ag as any).servicos?.nome ?? 'Serviço'}
                    </div>
                  </div>
                  <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
