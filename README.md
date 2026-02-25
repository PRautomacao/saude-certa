# 🦷 Clínica Saúde Certa – Sistema Web Completo

Sistema de gestão odontológica com site institucional, painel administrativo, fluxo de caixa e agente IA via WhatsApp.

---

## 📁 Estrutura do Projeto

```
saude-certa/
├── app/
│   ├── (site)/          # Site público (home, sobre, serviços, contato)
│   ├── (admin)/         # Painel admin (dashboard, pacientes, agenda, financeiro)
│   ├── admin/login/     # Página de login
│   └── api/webhook/     # Endpoint para n8n + Evolution API
├── lib/supabase/queries/ # Queries organizadas por domínio
├── types/               # TypeScript types
├── middleware.ts         # Proteção de rotas por autenticação
├── supabase-schema.sql  # Schema completo do banco de dados
└── n8n-workflows.json   # Fluxos n8n documentados
```

---

## 🚀 Setup – Passo a Passo

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o arquivo `supabase-schema.sql` completo
3. Em **Authentication > Users**, crie os usuários:
   - `ana@saudecerta.com.br` (senha forte) → permissão `admin`
   - `marcia@saudecerta.com.br` (senha forte) → permissão `secretaria`
4. Copie as chaves em **Project Settings > API**

### 2. Next.js – Variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase
```

### 3. Deploy na Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Adicionar env vars na Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add WEBHOOK_SECRET_TOKEN
```

### 4. n8n – Configurar workflows

1. No seu n8n (self-hosted na VPS), importe os fluxos descritos em `n8n-workflows.json`
2. Configure as variáveis de ambiente no n8n:
   - `APP_URL` = URL da sua Vercel
   - `WEBHOOK_SECRET_TOKEN` = mesmo token do `.env.local`
   - `EVOLUTION_URL`, `EVOLUTION_INSTANCE`, `EVOLUTION_API_KEY`

### 5. Evolution API – Configurar instância

```bash
# Na sua VPS, configure a instância WhatsApp
curl -X POST https://evolution.seudominio.com/instance/create \
  -H "apikey: SUA_API_KEY" \
  -d '{"instanceName": "saude-certa", "webhookUrl": "https://n8n.seudominio.com/webhook/whatsapp-saude-certa"}'
```

---

## 🔐 Acessos

| Usuário  | URL                            | Permissão  |
|----------|-------------------------------|-----------|
| Draª Ana | /admin/login                  | Admin      |
| Marcia   | /admin/login                  | Secretaria |
| Público  | / (site institucional)        | —          |

---

## 📊 Módulos

| Módulo          | Funcionalidade                                |
|-----------------|-----------------------------------------------|
| **Dashboard**   | KPIs, gráfico fluxo de caixa, agenda do dia   |
| **Pacientes**   | CRUD completo + histórico odontológico        |
| **Agenda**      | Calendário semanal + modal de agendamento     |
| **Financeiro**  | Lançamentos, fluxo de caixa, export PDF       |
| **Webhook**     | Endpoint para n8n com 4 ações do chatbot      |

---

## 🤖 Agente IA – Ações disponíveis (webhook)

```
POST /api/webhook
Header: x-webhook-token: SEU_TOKEN

Ações:
- criar_agendamento    → agenda consulta e retorna confirmação
- consultar_horarios   → retorna horários livres em uma data
- cancelar_agendamento → cancela via ID + validação por telefone
- proxima_consulta     → retorna próxima consulta do paciente
```

---

## 📦 Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Banco:**    Supabase (PostgreSQL + Auth + RLS)
- **Gráficos:** Recharts
- **PDF:**      jsPDF + jspdf-autotable
- **Datas:**    date-fns (pt-BR)
- **Deploy:**   Vercel (zero config)
- **Automação:** n8n + Evolution API

---

## 🔧 Desenvolvimento local

```bash
npm install
npm run dev
# Acesse http://localhost:3000
```
