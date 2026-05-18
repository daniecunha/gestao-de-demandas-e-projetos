# Sistema de Gestão de Demandas e Projetos Pessoais

Ferramenta pessoal para centralizar projetos, tarefas, reuniões e relatórios executivos.

---

## Pré-requisitos

- [Node.js LTS](https://nodejs.org) (v20 ou superior)
- Conta no [Supabase](https://supabase.com) (gratuita)

---

## Setup rápido

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Copie a **URL** e a **anon key** do projeto (Settings → API)

### 3. Configurar variáveis de ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 4. Rodar a aplicação

```bash
npm run dev
```

Acesse: http://localhost:5173

---

## Build para produção

```bash
npm run build
```

Deploy no Vercel: importe o repositório e configure as variáveis de ambiente.

---

## Módulos

| Módulo | Descrição |
|---|---|
| **Dashboard** | Visão geral do dia: tarefas críticas, status por projeto, próximas reuniões |
| **Projetos** | CRUD completo com tags de tecnologia, parceiro, cor e histórico |
| **Tarefas** | Kanban com drag-and-drop, lista, filtros e subtarefas |
| **Reuniões** | Pauta estruturada, registro de decisões e geração automática de tarefas |
| **Relatórios** | Relatório executivo mensal com semáforo e exportação em PDF |

---

## Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Estado global**: Zustand
- **Formulários**: React Hook Form + Zod
- **Kanban**: @dnd-kit/core + @dnd-kit/sortable
- **PDF**: jsPDF + html2canvas
- **Ícones**: Lucide React
- **Backend/DB**: Supabase (PostgreSQL)
- **Roteamento**: React Router v6
- **Build**: Vite 5

---

## Estrutura

```
src/
├── components/
│   ├── ui/          # Button, Badge, Card, Modal, Input, Select
│   ├── layout/      # Sidebar, Header, PageContainer
│   ├── projects/    # ProjectCard, ProjectForm
│   ├── tasks/       # TaskCard, TaskForm, KanbanBoard, TaskList
│   └── meetings/    # MeetingCard, MeetingForm
├── pages/           # Dashboard, Projects, Tasks, Meetings, Reports
├── hooks/           # useProjects, useTasks, useMeetings, useReports
├── services/        # Supabase CRUD por entidade
├── store/           # Zustand stores
├── types/           # TypeScript interfaces
└── utils/           # dateUtils, statusUtils, filters, pdfExport
```

---

*Versão 1.0 — Maio 2026 — Daniel*
