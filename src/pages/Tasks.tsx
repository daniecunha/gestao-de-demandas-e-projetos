import { useState } from 'react';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { usePermission } from '../hooks/usePermission';
import { useTasks } from '../hooks/useTasks';
import { PageContainer } from '../components/layout/PageContainer';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import type { Task, TaskFormData } from '../types';
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
} from '../utils/statusUtils';

const PRIORITY_FILTER = [
  { value: '', label: 'Todas as prioridades' },
  ...Object.entries(TASK_PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

const STATUS_FILTER = [
  { value: '', label: 'Todos os status' },
  ...Object.entries(TASK_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

export function Tasks() {
  const { projects } = useProjects();
  const { tasks, loading, createTask, updateTask, updateTaskStatus, deleteTask } = useTasks();
  const { canEdit } = usePermission();

  const [viewMode, setViewMode] = useState<'kanban' | 'lista'>('kanban');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const [filtroProjetoId, setFiltroProjetoId] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [busca, setBusca] = useState('');

  const projectOptions = [
    { value: '', label: 'Todos os projetos' },
    ...projects.map((p) => ({ value: p.id, label: p.nome })),
  ];

  const tasksFiltradas = tasks.filter((t) => {
    if (filtroProjetoId && t.projeto_id !== filtroProjetoId) return false;
    if (filtroPrioridade && t.prioridade !== filtroPrioridade) return false;
    if (filtroStatus && t.status !== filtroStatus) return false;
    if (busca && !t.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  const handleSubmit = async (data: TaskFormData) => {
    setSaving(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, data);
      } else {
        await createTask(data);
      }
      fecharModal();
    } finally {
      setSaving(false);
    }
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditingTask(undefined);
  };

  return (
    <PageContainer
      title="Tarefas"
      subtitle={`${tasks.filter((t) => t.status !== 'concluido' && t.status !== 'cancelado').length} abertas`}
      actions={
        <div className="flex items-center gap-2">
          {/* Toggle de visualização */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={[
                'px-3 py-1.5 transition-colors',
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
              title="Kanban"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={[
                'px-3 py-1.5 transition-colors',
                viewMode === 'lista'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
              title="Lista"
            >
              <List size={15} />
            </button>
          </div>
          {canEdit && (
            <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
              Nova tarefa
            </Button>
          )}
        </div>
      }
    >
      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar tarefa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <Select
          options={projectOptions}
          value={filtroProjetoId}
          onChange={(e) => setFiltroProjetoId(e.target.value)}
          className="text-sm"
        />
        <Select
          options={PRIORITY_FILTER}
          value={filtroPrioridade}
          onChange={(e) => setFiltroPrioridade(e.target.value)}
          className="text-sm"
        />
        <Select
          options={STATUS_FILTER}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasksFiltradas}
          projects={projects}
          onEdit={(t) => { setEditingTask(t); setModalOpen(true); }}
          onDelete={deleteTask}
          onStatusChange={(id, status) => updateTaskStatus(id, status)}
        />
      ) : (
        <TaskList
          tasks={tasksFiltradas}
          projects={projects}
          onEdit={(t) => { setEditingTask(t); setModalOpen(true); }}
          onDelete={deleteTask}
          onToggleStatus={(t) =>
            updateTaskStatus(t.id, t.status === 'concluido' ? 'a_fazer' : 'concluido')
          }
        />
      )}

      <Modal
        open={modalOpen}
        onClose={fecharModal}
        title={editingTask ? 'Editar tarefa' : 'Nova tarefa'}
        size="lg"
      >
        <TaskForm
          initialData={editingTask}
          projects={projects}
          onSubmit={handleSubmit}
          onCancel={fecharModal}
          loading={saving}
        />
      </Modal>
    </PageContainer>
  );
}
