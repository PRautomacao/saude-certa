// ============================================================
// TIPOS PRINCIPAIS – Clínica Saúde Certa
// ============================================================

export type StatusAgendamento = 'pendente' | 'confirmado' | 'cancelado' | 'realizado';
export type StatusFinanceiro  = 'pago' | 'pendente' | 'cancelado';
export type TipoLancamento    = 'entrada' | 'saida';
export type FormaPagamento    = 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto';
export type PermissaoFuncionario = 'admin' | 'dentista' | 'secretaria';

export interface Paciente {
  id: string;
  nome: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  data_nascimento?: string;
  historico_odontologico?: string;
  observacoes?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
}

export interface Servico {
  id: string;
  nome: string;
  descricao?: string;
  valor: number;
  duracao_minutos: number;
}

export interface Funcionario {
  id: string;
  nome: string;
  cargo?: string;
  telefone?: string;
  email: string;
  permissao: PermissaoFuncionario;
  auth_user_id?: string;
}

export interface Agendamento {
  id: string;
  paciente_id: string;
  funcionario_id?: string;
  servico_id?: string;
  data: string;
  horario: string;
  status: StatusAgendamento;
  observacoes?: string;
  created_at: string;
  // joins
  paciente?: Paciente;
  servico?: Servico;
  funcionario?: Funcionario;
}

export interface Lancamento {
  id: string;
  paciente_id?: string;
  agendamento_id?: string;
  descricao: string;
  valor: number;
  tipo: TipoLancamento;
  forma_pagamento?: FormaPagamento;
  status: StatusFinanceiro;
  data_vencimento?: string;
  data_pagamento?: string;
  created_at: string;
  // joins
  paciente?: Paciente;
}

export interface CaixaDiario {
  id: string;
  data: string;
  total_entradas: number;
  total_saidas: number;
  saldo_final: number;
}

export interface DashboardKPIs {
  total_pacientes: number;
  consultas_mes: number;
  receita_mes: number;
  despesas_mes: number;
  saldo_mes: number;
  agendamentos_hoje: Agendamento[];
  receita_por_dia: { dia: string; entradas: number; saidas: number }[];
  consultas_por_servico: { servico: string; total: number }[];
}
