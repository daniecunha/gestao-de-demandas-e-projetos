import { useState } from 'react';
import { Calendar, MoreVertical, Pencil, Trash2, CheckSquare, Square } from 'lucide-react';
import type { Task, Project } from '../../types';
import { Badge } from '../ui/Badge';
import {
  TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS,
  TASK_STATUS_COLORS, TASK_STATUS_LABELS,
} from '../../utils/statusUtils';
import { labelPrazo, prazoVencido } from '../../utils/dateUtils';
import { usePermission } from '../../hooks/usePermission';

interface TaskCardProps {
  task: Task;
  project?: Project;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus?: (task: Task) => void;
  compact?: boolean;
}

export function TaskCard({ task, project, onEdit, onDelete, onToggleStatus, compact = false }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { canEdit } = usePermission();
  const vencido  = prazoVencido(task.prazo);
  const concluida = task.status === 'concluido';

  return (
    <div
      className={[
        'bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all',
        concluida && 'opacity-60',
      ].filter(Boolean).join(' ')}
    >
      {project && <div className="h-0.5 rounded-t-lg" style={{ backgroundColor: project.cor }} />}

      <div className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start justify-between gap-2">
          {/* Checkbox — apenas admin pode alterar status */}
          {onToggleStatus && canEdit && (
            <button
              onClick={() => onToggleStatus(task)}
              className="mt-0.5 text-gray-400 hover:text-blue-600 transition-colors shrink-0"
              aria-label={concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
            >
              {concluida ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>
          )}
          {/* Ícone de status somente leitura para consulta */}
          {onToggleStatus && !canEdit && (
            <span className="mt-0.5 text-gray-300 shrink-0">
              {concluida ? <CheckSquare size={16} /> : <Square size={16} />}
            </span>
          )}

          <div className="flex-1 min-w-0">
            <p className={['text-sm font-medium text-gray-900 leading-snug', concluida && 'line-through text-gray-400'].filter(Boolean).join(' ')}>
              {task.titulo}
            </p>
            {project && !compact && (
              <p className="text-xs text-gray-500 mt-0.5">{project.nome}</p>
            )}
          </div>

          {/* Menu — apenas admin */}
          {canEdit && (
            <div className="relative shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                className="p-1 rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <MoreVertical size={14} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-7 z-10 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[130px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(task); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(task.id); }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
          <Badge className={TASK_PRIORITY_COLORS[task.prioridade]}>
            {TASK_PRIORITY_LABELS[task.prioridade]}
          </Badge>
          {!compact && (
            <Badge className={TASK_STATUS_COLORS[task.status]}>
              {TASK_STATUS_LABELS[task.status]}
            </Badge>
          )}
          {task.prazo && (
            <div className={['flex items-center gap-1 text-xs', vencido ? 'text-red-600 font-medium' : 'text-gray-500'].join(' ')}>
              <Calendar size={11} />
              {labelPrazo(task.prazo)}
            </div>
          )}
        </div>

        {!compact && task.subtarefas.length > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Subtarefas</span>
              <span>{task.subtarefas.filter((s) => s.concluida).length}/{task.subtarefas.length}</span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(task.subtarefas.filter((s) => s.concluida).length / task.subtarefas.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
