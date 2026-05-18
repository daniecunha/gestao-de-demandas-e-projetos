import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type { Task, TaskStatus, Project } from '../../types';
import { TaskCard } from './TaskCard';
import { KANBAN_COLUMNS, TASK_STATUS_LABELS } from '../../utils/statusUtils';
import { agruparPorStatus } from '../../utils/filters';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

function SortableTaskCard({
  task,
  project,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  task: Task;
  project?: Project;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <TaskCard
        task={task}
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        compact
      />
    </div>
  );
}

const COLUMN_HEADER_COLORS: Record<TaskStatus, string> = {
  a_fazer:      'bg-slate-500',
  em_andamento: 'bg-blue-500',
  bloqueado:    'bg-red-500',
  concluido:    'bg-green-500',
  cancelado:    'bg-gray-400',
};

function KanbanColumnView({
  status,
  tasks,
  projects,
  onEdit,
  onDelete,
  onToggleStatus,
}: KanbanColumnProps) {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-200 min-h-[400px] w-72 shrink-0">
      {/* Cabeçalho da coluna */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200">
        <span className={`w-2.5 h-2.5 rounded-full ${COLUMN_HEADER_COLORS[status]}`} />
        <span className="text-sm font-semibold text-gray-700">
          {TASK_STATUS_LABELS[status]}
        </span>
        <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-2 space-y-2 overflow-y-auto">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              project={projectMap.get(task.projeto_id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24 text-sm text-gray-400">
              Nenhuma tarefa
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

interface KanbanBoardProps {
  tasks: Task[];
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  projects,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const grupos = agruparPorStatus(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Determinar coluna de destino
    const targetStatus = (KANBAN_COLUMNS as string[]).includes(overId)
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;

    if (!targetStatus) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      onStatusChange(taskId, targetStatus);
    }
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus: TaskStatus =
      task.status === 'concluido' ? 'a_fazer' : 'concluido';
    onStatusChange(task.id, newStatus);
  };

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumnView
            key={status}
            status={status}
            tasks={grupos[status]}
            projects={projects}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 opacity-90">
            <TaskCard
              task={activeTask}
              project={projectMap.get(activeTask.projeto_id)}
              onEdit={() => {}}
              onDelete={() => {}}
              compact
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
