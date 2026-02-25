import { createClient } from '../client';
import type { Lancamento, TipoLancamento, StatusFinanceiro } from '@/types';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const supabase = createClient();

export async function getLancamentosByMes(ano: number, mes: number) {
  const inicio = format(startOfMonth(new Date(ano, mes - 1)), 'yyyy-MM-dd');
  const fim    = format(endOfMonth(new Date(ano, mes - 1)),   'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('financeiro')
    .select(`*, pacientes(id, nome)`)
    .gte('data_vencimento', inicio)
    .lte('data_vencimento', fim)
    .order('data_vencimento');
  if (error) throw error;
  return data as Lancamento[];
}

export async function getLancamentos(filtros?: {
  tipo?: TipoLancamento;
  status?: StatusFinanceiro;
  paciente_id?: string;
  dataInicio?: string;
  dataFim?: string;
}) {
  let query = supabase
    .from('financeiro')
    .select(`*, pacientes(id, nome)`)
    .order('data_vencimento', { ascending: false });

  if (filtros?.tipo)        query = query.eq('tipo', filtros.tipo);
  if (filtros?.status)      query = query.eq('status', filtros.status);
  if (filtros?.paciente_id) query = query.eq('paciente_id', filtros.paciente_id);
  if (filtros?.dataInicio)  query = query.gte('data_vencimento', filtros.dataInicio);
  if (filtros?.dataFim)     query = query.lte('data_vencimento', filtros.dataFim);

  const { data, error } = await query;
  if (error) throw error;
  return data as Lancamento[];
}

export async function upsertLancamento(lancamento: Partial<Lancamento>) {
  const { data, error } = await supabase
    .from('financeiro')
    .upsert(lancamento)
    .select()
    .single();
  if (error) throw error;
  return data as Lancamento;
}

export async function marcarComoPago(id: string) {
  const { error } = await supabase
    .from('financeiro')
    .update({ status: 'pago', data_pagamento: format(new Date(), 'yyyy-MM-dd') })
    .eq('id', id);
  if (error) throw error;
}

export async function getKPIsMes(ano: number, mes: number) {
  const inicio = format(startOfMonth(new Date(ano, mes - 1)), 'yyyy-MM-dd');
  const fim    = format(endOfMonth(new Date(ano, mes - 1)),   'yyyy-MM-dd');

  const [{ data: financeiro }, { count: totalPacientes }, { count: consultasMes }] =
    await Promise.all([
      supabase.from('financeiro').select('tipo,valor,status').gte('data_vencimento', inicio).lte('data_vencimento', fim),
      supabase.from('pacientes').select('id', { count: 'exact', head: true }).eq('status', 'ativo'),
      supabase.from('agendamentos').select('id', { count: 'exact', head: true }).gte('data', inicio).lte('data', fim).neq('status', 'cancelado'),
    ]);

  const receitaMes  = (financeiro || []).filter((f) => f.tipo === 'entrada' && f.status === 'pago').reduce((acc, f) => acc + f.valor, 0);
  const despesasMes = (financeiro || []).filter((f) => f.tipo === 'saida').reduce((acc, f) => acc + f.valor, 0);

  return {
    total_pacientes: totalPacientes ?? 0,
    consultas_mes:   consultasMes ?? 0,
    receita_mes:     receitaMes,
    despesas_mes:    despesasMes,
    saldo_mes:       receitaMes - despesasMes,
  };
}

export async function getFluxoMensal(ano: number) {
  const { data, error } = await supabase
    .from('financeiro')
    .select('tipo,valor,status,data_vencimento')
    .gte('data_vencimento', `${ano}-01-01`)
    .lte('data_vencimento', `${ano}-12-31`);
  if (error) throw error;

  const meses = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    const registros = (data || []).filter((f) => f.data_vencimento?.startsWith(`${ano}-${m}`));
    return {
      mes: new Date(ano, i).toLocaleDateString('pt-BR', { month: 'short' }),
      entradas: registros.filter((f) => f.tipo === 'entrada' && f.status === 'pago').reduce((a, f) => a + f.valor, 0),
      saidas:   registros.filter((f) => f.tipo === 'saida').reduce((a, f) => a + f.valor, 0),
    };
  });
  return meses;
}
