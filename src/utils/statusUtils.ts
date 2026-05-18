import type { ProjectStatus, TaskStatus, TaskPriority, MeetingType } from '../types';

// ─── Status de Projeto ────────────────────────────────────────

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planejamento: 'Planejamento',
  em_execucao: 'Em Execução',
  aguardando: 'Aguardando',
  concluido: 'Concluído',
  pausado: 'Pausado',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planejamento: 'bg-blue-100 text-blue-800',
  em_execucao: 'bg-green-100 text-green-800',
  aguardando: 'bg-yellow-100 text-yellow-800',
  concluido: 'bg-gray-100 text-gray-700',
  pausado: 'bg-orange-100 text-orange-800',
};

export const PROJECT_STATUS_DOT: Record<ProjectStatus, string> = {
  planejamento: 'bg-blue-500',
  em_execucao: 'bg-green-500',
  aguardando: 'bg-yellow-500',
  concluido: 'bg-gray-400',
  pausado: 'bg-orange-500',
};

// ─── Status de Tarefa ─────────────────────────────────────────

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  a_fazer: 'A Fazer',
  em_andamento: 'Em Andamento',
  bloqueado: 'Bloqueado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  a_fazer: 'bg-slate-100 text-slate-700',
  em_andamento: 'bg-blue-100 text-blue-800',
  bloqueado: 'bg-red-100 text-red-800',
  concluido: 'bg-green-100 text-green-800',
  cancelado: 'bg-gray-100 text-gray-500',
};

export const KANBAN_COLUMNS: TaskStatus[] = [
  'a_fazer',
  'em_andamento',
  'bloqueado',
  'concluido',
];

// ─── Prioridade de Tarefa ─────────────────────────────────────

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  critica: 'bg-red-100 text-red-800 border border-red-200',
  alta: 'bg-orange-100 text-orange-800 border border-orange-200',
  media: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  baixa: 'bg-green-100 text-green-800 border border-green-200',
};

export const TASK_PRIORITY_DOT: Record<TaskPriority, string> = {
  critica: 'bg-red-500',
  alta: 'bg-orange-500',
  media: 'bg-yellow-500',
  baixa: 'bg-green-500',
};

/** Ordem numérica de prioridade (menor = mais urgente) */
export const TASK_PRIORITY_ORDER: Record<TaskPriority, number> = {
  critica: 0,
  alta: 1,
  media: 2,
  baixa: 3,
};

// ─── Tipo de Reunião ──────────────────────────────────────────

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  alinhamento_gestor: 'Alinhamento com Gestor',
  fornecedor: 'Fornecedor',
  interna: 'Interna',
  tecnica: 'Técnica',
  outro: 'Outro',
};

export const MEETING_TYPE_COLORS: Record<MeetingType, string> = {
  alinhamento_gestor: 'bg-purple-100 text-purple-800',
  fornecedor: 'bg-blue-100 text-blue-800',
  interna: 'bg-gray-100 text-gray-700',
  tecnica: 'bg-cyan-100 text-cyan-800',
  outro: 'bg-slate-100 text-slate-700',
};

// ─── Semáforo do Relatório ────────────────────────────────────

export const SEMAFORO_LABELS = {
  verde: 'Em Dia',
  amarelo: 'Atenção',
  vermelho: 'Risco',
} as const;

export const SEMAFORO_COLORS = {
  verde: 'bg-green-500',
  amarelo: 'bg-yellow-500',
  vermelho: 'bg-red-500',
} as const;

export const SEMAFORO_TEXT_COLORS = {
  verde: 'text-green-700',
  amarelo: 'text-yellow-700',
  vermelho: 'text-red-700',
} as const;
