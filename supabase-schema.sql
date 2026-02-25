-- =====================================================
-- SCHEMA COMPLETO – Clínica Odontológica Saúde Certa
-- Rodar no Supabase SQL Editor (em ordem)
-- =====================================================

-- EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PACIENTES ──────────────────────────────────────
CREATE TABLE public.pacientes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                    VARCHAR(255) NOT NULL,
  cpf                     VARCHAR(14) UNIQUE,
  telefone                VARCHAR(20),
  email                   VARCHAR(255),
  endereco                TEXT,
  data_nascimento         DATE,
  historico_odontologico  TEXT,
  observacoes             TEXT,
  status                  VARCHAR(10) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ── SERVIÇOS ──────────────────────────────────────
CREATE TABLE public.servicos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome              VARCHAR(100) NOT NULL,
  descricao         TEXT,
  valor             DECIMAL(10,2) NOT NULL DEFAULT 0,
  duracao_minutos   INT DEFAULT 60,
  ativo             BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Seed inicial
INSERT INTO public.servicos (nome, descricao, valor, duracao_minutos) VALUES
  ('Periodontia',     'Tratamento especializado das gengivas',           350.00,  60),
  ('Cirurgia',        'Extrações e procedimentos cirúrgicos',             800.00,  90),
  ('Clareamento',     'Clareamento dental profissional',                  600.00, 120),
  ('Canal',           'Endodontia – tratamento de canal',                 900.00,  90),
  ('Ortodontia',      'Aparelhos e alinhadores dentais',                  250.00,  45),
  ('Consulta',        'Consulta de avaliação',                            150.00,  30);

-- ── FUNCIONÁRIOS ─────────────────────────────────
CREATE TABLE public.funcionarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          VARCHAR(255) NOT NULL,
  cargo         VARCHAR(100),
  telefone      VARCHAR(20),
  email         VARCHAR(255) UNIQUE NOT NULL,
  permissao     VARCHAR(20) DEFAULT 'secretaria' CHECK (permissao IN ('admin', 'dentista', 'secretaria')),
  auth_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ativo         BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Seed funcionários (criar usuários via Supabase Auth antes)
-- INSERT INTO public.funcionarios (nome, cargo, email, permissao) VALUES
--   ('Draª Ana Luz', 'Dentista',    'ana@saudecerta.com.br', 'admin'),
--   ('Marcia',       'Secretária',  'marcia@saudecerta.com.br', 'secretaria');

-- ── AGENDAMENTOS ─────────────────────────────────
CREATE TABLE public.agendamentos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id     UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  funcionario_id  UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  servico_id      UUID REFERENCES public.servicos(id) ON DELETE SET NULL,
  data            DATE NOT NULL,
  horario         TIME NOT NULL,
  status          VARCHAR(20) DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'confirmado', 'realizado', 'cancelado')),
  observacoes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_agendamentos_data        ON public.agendamentos(data);
CREATE INDEX idx_agendamentos_paciente    ON public.agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_status      ON public.agendamentos(status);

-- ── FINANCEIRO ───────────────────────────────────
CREATE TABLE public.financeiro (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id      UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  agendamento_id   UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
  descricao        VARCHAR(255) NOT NULL,
  valor            DECIMAL(10,2) NOT NULL,
  tipo             VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  forma_pagamento  VARCHAR(30) CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto')),
  status           VARCHAR(10) DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente', 'cancelado')),
  data_vencimento  DATE,
  data_pagamento   DATE,
  observacoes      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financeiro_tipo            ON public.financeiro(tipo);
CREATE INDEX idx_financeiro_status          ON public.financeiro(status);
CREATE INDEX idx_financeiro_data_vencimento ON public.financeiro(data_vencimento);
CREATE INDEX idx_financeiro_paciente        ON public.financeiro(paciente_id);

-- ── CAIXA DIÁRIO ─────────────────────────────────
CREATE TABLE public.caixa_diario (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data            DATE UNIQUE NOT NULL,
  total_entradas  DECIMAL(10,2) DEFAULT 0,
  total_saidas    DECIMAL(10,2) DEFAULT 0,
  fechado         BOOLEAN DEFAULT FALSE,
  observacoes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- View calculada do saldo
CREATE OR REPLACE VIEW public.caixa_diario_view AS
SELECT
  data,
  total_entradas,
  total_saidas,
  total_entradas - total_saidas AS saldo_final,
  fechado
FROM public.caixa_diario
ORDER BY data DESC;

-- ── SESSÕES DO CHATBOT (Agente IA) ───────────────
CREATE TABLE public.sessoes_chatbot (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone       VARCHAR(20) NOT NULL,
  estado         VARCHAR(50) DEFAULT 'inicio',  -- inicio | aguarda_nome | aguarda_servico | aguarda_data | aguarda_horario | confirmado
  dados          JSONB DEFAULT '{}',             -- dados coletados na conversa
  ultima_msg     TIMESTAMPTZ DEFAULT NOW(),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_sessoes_telefone ON public.sessoes_chatbot(telefone);

-- ── ROW LEVEL SECURITY ────────────────────────────
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.pacientes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcionarios      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixa_diario      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes_chatbot   ENABLE ROW LEVEL SECURITY;

-- Políticas: usuários autenticados podem tudo (ajustar por cargo depois)
CREATE POLICY "auth_users_all" ON public.pacientes       FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_users_all" ON public.servicos        FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_users_all" ON public.funcionarios    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_users_all" ON public.agendamentos    FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_users_all" ON public.financeiro      FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "auth_users_all" ON public.caixa_diario    FOR ALL USING (auth.role() = 'authenticated');

-- Chatbot: service_role apenas (webhook)
CREATE POLICY "service_role_only" ON public.sessoes_chatbot
  FOR ALL USING (auth.role() = 'service_role');

-- ── TRIGGERS: updated_at ─────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pacientes_updated_at    BEFORE UPDATE ON public.pacientes    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_agendamentos_updated_at BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_financeiro_updated_at   BEFORE UPDATE ON public.financeiro   FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── FUNÇÃO: consolidar caixa diário ──────────────
CREATE OR REPLACE FUNCTION public.consolidar_caixa(p_data DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
  v_entradas DECIMAL;
  v_saidas   DECIMAL;
BEGIN
  SELECT COALESCE(SUM(valor), 0) INTO v_entradas
  FROM public.financeiro
  WHERE data_vencimento = p_data AND tipo = 'entrada' AND status = 'pago';

  SELECT COALESCE(SUM(valor), 0) INTO v_saidas
  FROM public.financeiro
  WHERE data_vencimento = p_data AND tipo = 'saida';

  INSERT INTO public.caixa_diario (data, total_entradas, total_saidas)
  VALUES (p_data, v_entradas, v_saidas)
  ON CONFLICT (data) DO UPDATE SET
    total_entradas = EXCLUDED.total_entradas,
    total_saidas   = EXCLUDED.total_saidas;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
