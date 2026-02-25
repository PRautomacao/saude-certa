import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

export const STATUS_AGENDAMENTO = {
  pendente:   { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-800' },
  confirmado: { label: 'Confirmado',  color: 'bg-blue-100 text-blue-800' },
  realizado:  { label: 'Realizado',   color: 'bg-green-100 text-green-800' },
  cancelado:  { label: 'Cancelado',   color: 'bg-red-100 text-red-800' },
} as const;

export const STATUS_FINANCEIRO = {
  pago:      { label: 'Pago',      color: 'bg-green-100 text-green-800' },
  pendente:  { label: 'Pendente',  color: 'bg-yellow-100 text-yellow-800' },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
} as const;

export const FORMA_PAGAMENTO = {
  dinheiro:       'Dinheiro',
  pix:            'PIX',
  cartao_credito: 'Cartão de Crédito',
  cartao_debito:  'Cartão de Débito',
  boleto:         'Boleto',
} as const;

export const SERVICOS_CLINICA = [
  'Periodontia',
  'Cirurgia',
  'Clareamento',
  'Canal',
  'Ortodontia',
  'Consulta',
  'Outros',
];

export const HORARIOS_FUNCIONAMENTO = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00',
];
