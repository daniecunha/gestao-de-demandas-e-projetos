// ============================================================
// Tipos TypeScript — Sistema de Gestão de Demandas e Projetos
// ============================================================

// ─── Tecnologia (plataforma/sistema) ─────────────────────────
export interface Technology {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  criado_em: string;
}

export type TechnologyFormData = Omit<Technology, 'id' | 'criado_em'>;

// ─── Projeto ─────────────────────────────────────────────────
export type ProjectStatus =
  | 'planejamento'
  | 'em_execucao'
  | 'aguardando'
  | 'concluido'
  | 'pausado';

export interface Project {
  id: string;
  nome: string;
  descricao: string;
  status: ProjectStatus;
  tecnologia_id: string | null;
  reuniao_origem_id: string | null;
  tecnologias: string[];
  parceiro: string;
  cor: string;
  data_inicio: string | null;
  data_previsao: string | null;
  contexto: string;
  valor_negocio: string;
  okrs: string[];
  criado_em: string;
  atualizado_em: string;
}

export type ProjectFormData = Omit<Project, 'id' | 'criado_em' | 'atualizado_em'>;

// ─── Tarefa ───────────────────────────────────────────────────
export type TaskPriority = 'critica' | 'alta' | 'media' | 'baixa';

export type TaskStatus =
  | 'a_fazer'
  | 'em_andamento'
  | 'homologacao'
  | 'bloqueado'
  | 'concluido'
  | 'cancelado';

export interface Subtask {
  id: string;
  titulo: string;
  concluida: boolean;
}

export interface Task {
  id: string;
  titulo: string;
  projeto_id: string;
  prioridade: TaskPriority;
  status: TaskStatus;
  prazo: string | null;
  notas: string;
  subtarefas: Subtask[];
  reuniao_id: string | null;
  valor_negocio: string;
  okrs: string[];
  criado_em: string;
  concluido_em: string | null;
  arquivado_em: string | null;
}

export type TaskFormData = Omit<Task, 'id' | 'criado_em' | 'concluido_em' | 'arquivado_em'>;

// ─── Reunião ──────────────────────────────────────────────────
export type MeetingType =
  | 'alinhamento_gestor'
  | 'fornecedor'
  | 'interna'
  | 'tecnica'
  | 'outro';

export interface PautaItem {
  ordem: number;
  titulo: string;
  tempo_min: number;
}

export interface Decisao {
  texto: string;
  data: string;
}

export interface Encaminhamento {
  texto: string;
  responsavel: string;
  prazo: string | null;
  tarefa_gerada_id: string | null;
}

export interface Meeting {
  id: string;
  titulo: string;
  data_hora: string;
  duracao_min: number;
  tipo: MeetingType;
  projeto_ids: string[];
  participantes: string[];
  pauta: PautaItem[];
  decisoes: Decisao[];
  encaminhamentos: Encaminhamento[];
  notas_gerais: string;
  criado_em: string;
}

export type MeetingFormData = Omit<Meeting, 'id' | 'criado_em'>;

// ─── Relatório ────────────────────────────────────────────────
export type ReportStatusColor = 'verde' | 'amarelo' | 'vermelho';

export interface ProjectSnapshot {
  projeto_id: string;
  nome: string;
  status: ProjectStatus;
  cor_semaforo: ReportStatusColor;
  tarefas_concluidas: number;
  tarefas_abertas: number;
  observacao: string;
  valor_negocio: string;
  okrs: string[];
}

export interface Report {
  id: string;
  periodo_ref: string;
  data_inicio: string;
  data_fim: string;
  projetos_snapshot: ProjectSnapshot[];
  destaques: string[];
  riscos: string[];
  proximos_passos: string[];
  gerado_em: string;
  exportado_em: string | null;
}

export type ReportFormData = Omit<Report, 'id' | 'gerado_em' | 'exportado_em'>;

// ─── Utilitários ─────────────────────────────────────────────
export type ViewMode = 'kanban' | 'lista';

export interface FilterState {
  projeto_id: string | null;
  prioridade: TaskPriority | null;
  status: TaskStatus | null;
  tecnologia: string | null;
  busca: string;
}

// Tags de tecnologia disponíveis
export const TECNOLOGIAS = [
  'OutSystems',
  'SAP',
  'RPA',
  'VBScript',
  'Arquitetura',
  'CI/CD',
  'Gestão',
  'Governança',
  'OutSystems BrMania',
  'OutSystems Vibra',
  'Sysmanger',
  'Smart Coding',
  'Sonda',
] as const;

export type Tecnologia = (typeof TECNOLOGIAS)[number];

// OKRs predefinidos (sugestões)
export const OKR_OPCOES = [
  'Redução de custo',
  'Aumento de produtividade',
  'Melhoria de qualidade',
  'Automação de processos',
  'Receita / ROI',
  'Experiência do usuário',
  'Conformidade / Compliance',
  'Governança e controle',
  'Escalabilidade',
  'Segurança da informação',
] as const;
