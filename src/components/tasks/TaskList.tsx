import type { Task, Project } from '../../types';
import { TaskCard } from './TaskCard';
import { ordenarTarefas } from '../../utils/filters';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

export function TaskList({ tasks, projects, onEdit, onDelete, onToggleStatus }: TaskListProps) {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const ordered = ordenarTarefas(tasks);

  if (ordered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">Nenhuma tarefa encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ordered.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          project={projectMap.get(task.projeto_id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
