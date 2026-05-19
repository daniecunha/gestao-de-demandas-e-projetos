import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
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
  onArchive: (id: string) => void;
}

function SortableTaskCard({
  task, project, onEdit, onDelete, onToggleStatus, onArchive,
}: {
  task: Task;
  project?: Project;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
  onArchive: (id: string) => void;
}) {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({ id: task.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? 'opacity-40' : ''}
      // Drag handle on the whole card via listeners/attributes
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        project={project}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
        onArchive={onArchive}
        compact
      />
    </div>
  );
}

const COLUMN_HEADER_COLORS: Record<TaskStatus, string> = {
  a_fazer:      'bg-slate-500',
  em_andamento: 'bg-blue-500',
  homologacao:  'bg-violet-500',
  concluido:    'bg-green-500',
  bloqueado:    'bg-red-500',
  cancelado:    'bg-gray-400',
};

const COLUMN_RING_COLORS: Record<TaskStatus, string> = {
  a_fazer:      'ring-slate-300',
  em_andamento: 'ring-blue-300',
  homologacao:  'ring-violet-300',
  concluido:    'ring-green-300',
  bloqueado:    'ring-red-300',
  cancelado:    'ring-gray-300',
};

function KanbanColumnView({
  status, tasks, projects, onEdit, onDelete, onToggleStatus, onArchive,
}: KanbanColumnProps) {
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Column is a droppable target so empty columns also accept drops
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={[
        'flex flex-col rounded-xl border min-h-[400px] w-72 shrink-0 transition-all duration-150',
        isOver
          ? `bg-white border-transparent ring-2 ${COLUMN_RING_COLORS[status]}`
          : 'bg-gray-50/80 border-gray-200',
      ].join(' ')}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200">
        <span className={`w-2.5 h-2.5 rounded-full ${COLUMN_HEADER_COLORS[status]}`} />
        <span className="text-sm font-semibold text-gray-700 font-display">
          {TASK_STATUS_LABELS[status]}
        </span>
        <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Droppable + sortable task list */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[80px]">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              project={projectMap.get(task.projeto_id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onArchive={onArchive}
            />
          ))}
          {tasks.length === 0 && (
            <div className={[
              'flex items-center justify-center h-24 text-sm rounded-lg border-2 border-dashed transition-colors',
              isOver ? 'border-current text-blue-400 bg-blue-50/50' : 'border-gray-200 text-gray-400',
            ].join(' ')}>
              {isOver ? 'Soltar aqui' : 'Nenhuma tarefa'}
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
  onArchive: (id: string) => void;
}

export function KanbanBoard({
  tasks, projects, onEdit, onDelete, onStatusChange, onArchive,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const grupos = agruparPorStatus(tasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Small movement threshold prevents accidental drags when clicking buttons
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Resolve target column: either dropped directly on a column (overId = status)
    // or dropped on another task card (get that card's status)
    const targetStatus: TaskStatus | undefined = (KANBAN_COLUMNS as string[]).includes(overId)
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;

    if (!targetStatus) return;

    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== targetStatus) {
      onStatusChange(taskId, targetStatus);
    }
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus: TaskStatus = task.status === 'concluido' ? 'a_fazer' : 'concluido';
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
            onArchive={onArchive}
          />
        ))}
      </div>

      {/* Ghost card shown under cursor while dragging */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask && (
          <div className="rotate-1 scale-105 shadow-card-hover opacity-95">
            <TaskCard
              task={activeTask}
              project={projectMap.get(activeTask.projeto_id)}
              onEdit={() => {}}
              onDelete={() => {}}
              onArchive={() => {}}
              compact
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
