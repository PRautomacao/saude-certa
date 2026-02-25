import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente admin (service role) para operações do webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Autenticação por token estático (configurado no n8n)
function autenticarRequisicao(req: NextRequest): boolean {
  const token = req.headers.get('x-webhook-token');
  return token === process.env.WEBHOOK_SECRET_TOKEN;
}

export async function POST(request: NextRequest) {
  if (!autenticarRequisicao(request)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const body = await request.json();
  const { action, data } = body;

  try {
    switch (action) {
      // ───── AGENDAR ─────
      case 'criar_agendamento': {
        const { paciente_nome, paciente_telefone, servico, data: dataAg, horario } = data;

        // 1. Encontrar ou criar paciente
        let pacienteId: string;
        const { data: pacienteExistente } = await supabase
          .from('pacientes')
          .select('id')
          .eq('telefone', paciente_telefone)
          .single();

        if (pacienteExistente) {
          pacienteId = pacienteExistente.id;
        } else {
          const { data: novoPaciente, error } = await supabase
            .from('pacientes')
            .insert({ nome: paciente_nome, telefone: paciente_telefone, status: 'ativo' })
            .select('id')
            .single();
          if (error) throw error;
          pacienteId = novoPaciente.id;
        }

        // 2. Verificar disponibilidade
        const { data: conflito } = await supabase
          .from('agendamentos')
          .select('id')
          .eq('data', dataAg)
          .eq('horario', horario)
          .neq('status', 'cancelado')
          .single();

        if (conflito) {
          return NextResponse.json({
            success: false,
            message: `Horário ${horario} já está ocupado em ${dataAg}. Por favor, escolha outro horário.`,
          });
        }

        // 3. Criar agendamento
        const { data: agendamento, error } = await supabase
          .from('agendamentos')
          .insert({
            paciente_id: pacienteId,
            data: dataAg,
            horario,
            observacoes: servico,
            status: 'confirmado',
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: `✅ Consulta agendada com sucesso!\n📅 Data: ${dataAg}\n⏰ Horário: ${horario}\n🦷 Serviço: ${servico}\n\nEndereço: Rua Dr Neto, 321, Centro, Iporá-GO`,
          agendamento_id: agendamento.id,
        });
      }

      // ───── CONSULTAR HORÁRIOS ─────
      case 'consultar_horarios': {
        const { data: dataConsulta } = data;
        const todosHorarios = [
          '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
          '11:00', '11:30', '13:30', '14:00', '14:30', '15:00',
          '15:30', '16:00', '16:30', '17:00',
        ];

        const { data: ocupados } = await supabase
          .from('agendamentos')
          .select('horario')
          .eq('data', dataConsulta)
          .neq('status', 'cancelado');

        const horariosOcupados = (ocupados || []).map((a: any) => a.horario.substring(0, 5));
        const disponiveis = todosHorarios.filter((h) => !horariosOcupados.includes(h));

        return NextResponse.json({
          success: true,
          disponíveis: disponiveis,
          message: disponiveis.length > 0
            ? `Horários disponíveis em ${dataConsulta}:\n${disponiveis.join(' | ')}`
            : `Infelizmente não há horários disponíveis em ${dataConsulta}. Gostaria de ver outra data?`,
        });
      }

      // ───── CANCELAR ─────
      case 'cancelar_agendamento': {
        const { agendamento_id, telefone } = data;

        // Verificar se o agendamento pertence ao paciente
        const { data: ag } = await supabase
          .from('agendamentos')
          .select('*, pacientes(telefone)')
          .eq('id', agendamento_id)
          .single();

        if (!ag || (ag as any).pacientes?.telefone !== telefone) {
          return NextResponse.json({ success: false, message: 'Agendamento não encontrado.' });
        }

        await supabase.from('agendamentos').update({ status: 'cancelado' }).eq('id', agendamento_id);

        return NextResponse.json({
          success: true,
          message: '✅ Sua consulta foi cancelada. Se desejar reagendar, é só me chamar!',
        });
      }

      // ───── CONSULTAR PRÓXIMA CONSULTA ─────
      case 'proxima_consulta': {
        const { telefone } = data;
        const hoje = new Date().toISOString().split('T')[0];

        const { data: ag } = await supabase
          .from('agendamentos')
          .select('*, pacientes!inner(telefone)')
          .eq('pacientes.telefone', telefone)
          .gte('data', hoje)
          .neq('status', 'cancelado')
          .order('data')
          .order('horario')
          .limit(1)
          .single();

        if (!ag) {
          return NextResponse.json({
            success: true,
            message: 'Não encontrei nenhuma consulta agendada. Quer agendar uma?',
          });
        }

        return NextResponse.json({
          success: true,
          message: `📅 Sua próxima consulta:\nData: ${ag.data}\nHorário: ${(ag.horario as string).substring(0, 5)}\nStatus: ${ag.status}\n\nRua Dr Neto, 321, Centro, Iporá-GO`,
        });
      }

      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[Webhook Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook ativo ✅', versao: '1.0.0' });
}
