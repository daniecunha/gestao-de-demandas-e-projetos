import type { Task, TaskPriority, TaskStatus } from '../types';
import { TASK_PRIORITY_ORDER } from './statusUtils';

/** Ordena tarefas por prioridade e depois por prazo */
export function ordenarTarefas(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const prioA = TASK_PRIORITY_ORDER[a.prioridade];
    const prioB = TASK_PRIORITY_ORDER[b.prioridade];
    if (prioA !== prioB) return prioA - prioB;
    if (a.prazo && b.prazo) return a.prazo.localeCompare(b.prazo);
    if (a.prazo) return -1;
    if (b.prazo) return 1;
    return 0;
  });
}

/** Agrupa tarefas por status para o kanban */
export function agruparPorStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const grupos: Record<TaskStatus, Task[]> = {
    a_fazer:      [],
    em_andamento: [],
    homologacao:  [],
    concluido:    [],
    bloqueado:    [],
    cancelado:    [],
  };

  for (const task of tasks) {
    grupos[task.status].push(task);
  }

  for (const status of Object.keys(grupos) as TaskStatus[]) {
    grupos[status] = ordenarTarefas(grupos[status]);
  }

  return grupos;
}

/** Conta tarefas por status */
export function contarPorStatus(tasks: Task[]): Record<TaskStatus, number> {
  return tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] ?? 0) + 1;
      return acc;
    },
    {
      a_fazer:      0,
      em_andamento: 0,
      homologacao:  0,
      concluido:    0,
      bloqueado:    0,
      cancelado:    0,
    } as Record<TaskStatus, number>
  );
}

/** Calcula percentual de conclusão */
export function calcularProgresso(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const concluidas = tasks.filter((t) => t.status === 'concluido').length;
  return Math.round((concluidas / tasks.length) * 100);
}

/** Filtra tarefas críticas (crítica + alta prioridade) não concluídas */
export function tarefasCriticas(tasks: Task[]): Task[] {
  return tasks.filter(
    (t) =>
      (t.prioridade === 'critica' || t.prioridade === 'alta') &&
      t.status !== 'concluido' &&
      t.status !== 'cancelado'
  );
}

/** Filtra tarefas com prazo para hoje ou vencidas (bloqueado não conta) */
export function tarefasDeHoje(tasks: Task[]): Task[] {
  const hoje = new Date().toISOString().split('T')[0];
  return tasks.filter(
    (t) =>
      t.prazo !== null &&
      t.prazo <= hoje &&
      t.status !== 'concluido' &&
      t.status !== 'cancelado' &&
      t.status !== 'bloqueado'
  );
}

/** Filtra tarefas bloqueadas */
export function tarefasBloqueadas(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.status === 'bloqueado');
}

/** Prioridades disponíveis */
export const PRIORIDADES: TaskPriority[] = ['critica', 'alta', 'media', 'baixa'];

/** Status disponíveis (exclui cancelado da UI principal) */
export const STATUS_TAREFAS: TaskStatus[] = [
  'a_fazer',
  'em_andamento',
  'homologacao',
  'concluido',
  'bloqueado',
  'cancelado',
];
