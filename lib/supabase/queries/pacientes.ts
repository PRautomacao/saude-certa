import { createClient } from '../client';
import type { Paciente } from '@/types';

const supabase = createClient();

export async function getPacientes(search?: string) {
  let query = supabase
    .from('pacientes')
    .select('*')
    .eq('status', 'ativo')
    .order('nome');

  if (search) {
    query = query.or(`nome.ilike.%${search}%,cpf.ilike.%${search}%,telefone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Paciente[];
}

export async function getPacienteById(id: string) {
  const { data, error } = await supabase
    .from('pacientes')
    .select(`*, agendamentos(*, servicos(*), funcionarios(*))`)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function upsertPaciente(paciente: Partial<Paciente>) {
  const { data, error } = await supabase
    .from('pacientes')
    .upsert(paciente)
    .select()
    .single();
  if (error) throw error;
  return data as Paciente;
}

export async function inativarPaciente(id: string) {
  const { error } = await supabase
    .from('pacientes')
    .update({ status: 'inativo' })
    .eq('id', id);
  if (error) throw error;
}
