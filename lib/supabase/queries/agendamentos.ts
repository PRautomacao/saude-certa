import { createClient } from '../client';
import type { Agendamento, StatusAgendamento } from '@/types';
import { format } from 'date-fns';

const supabase = createClient();

export async function getAgendamentosByData(data: Date) {
  const { data: agendamentos, error } = await supabase
    .from('agendamentos')
    .select(`*, pacientes(id, nome, telefone), servicos(id, nome, valor, duracao_minutos), funcionarios(id, nome)`)
    .eq('data', format(data, 'yyyy-MM-dd'))
    .order('horario');
  if (error) throw error;
  return agendamentos as Agendamento[];
}

export async function getAgendamentosByMes(ano: number, mes: number) {
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
  const fim    = `${ano}-${String(mes).padStart(2, '0')}-31`;

  const { data, error } = await supabase
    .from('agendamentos')
    .select(`*, pacientes(id, nome, telefone), servicos(id, nome, valor), funcionarios(id, nome)`)
    .gte('data', inicio)
    .lte('data', fim)
    .order('data')
    .order('horario');
  if (error) throw error;
  return data as Agendamento[];
}

export async function getHorariosDisponiveis(data: Date, funcionarioId?: string) {
  const todos = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:30', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00',
  ];

  let query = supabase
    .from('agendamentos')
    .select('horario')
    .eq('data', format(data, 'yyyy-MM-dd'))
    .neq('status', 'cancelado');

  if (funcionarioId) query = query.eq('funcionario_id', funcionarioId);

  const { data: ocupados } = await query;
  const horariosOcupados = (ocupados || []).map((a: any) => a.horario.substring(0, 5));
  return todos.filter((h) => !horariosOcupados.includes(h));
}

export async function upsertAgendamento(agendamento: Partial<Agendamento>) {
  const { data, error } = await supabase
    .from('agendamentos')
    .upsert(agendamento)
    .select()
    .single();
  if (error) throw error;
  return data as Agendamento;
}

export async function updateStatusAgendamento(id: string, status: StatusAgendamento) {
  const { error } = await supabase
    .from('agendamentos')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}
