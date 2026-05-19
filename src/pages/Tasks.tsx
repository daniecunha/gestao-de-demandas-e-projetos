import { useState } from 'react';
import { Plus, Search, LayoutGrid, List, Archive, RotateCcw, Trash2 } from 'lucide-react';
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
import { Badge } from '../components/ui/Badge';
import type { Task, TaskFormData } from '../types';
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_COLORS,
} from '../utils/statusUtils';
import { formatarData } from '../utils/dateUtils';

const PRIORITY_FILTER = [
  { value: '', label: 'Todas as prioridades' },
  ...Object.entries(TASK_PRIORITY_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

const STATUS_FILTER = [
  { value: '', label: 'Todos os status' },
  ...Object.entries(TASK_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

type ViewMode = 'kanban' | 'lista' | 'arquivo';

export function Tasks() {
  const { projects } = useProjects();
  const {
    tasks, archivedTasks, loading, loadingArchive,
    createTask, updateTask, updateTaskStatus,
    archiveTask, unarchiveTask, deleteTask, fetchArchivedTasks,
  } = useTasks();
  const { canEdit } = usePermission();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
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

  const handleArchive = async (id: string) => {
    if (!window.confirm('Arquivar esta tarefa? Ela sairá da tela principal e ficará no arquivo.')) return;
    await archiveTask(id);
  };

  const handleUnarchive = async (id: string) => {
    await unarchiveTask(id);
  };

  const handleDeleteArchived = async (id: string) => {
    if (!window.confirm('Excluir permanentemente esta tarefa?')) return;
    await deleteTask(id);
  };

  const handleEnterArchive = () => {
    setViewMode('arquivo');
    fetchArchivedTasks();
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
          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setViewMode('kanban')}
              className={[
                'px-3 py-1.5 transition-colors text-sm',
                viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
              title="Kanban"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={[
                'px-3 py-1.5 transition-colors text-sm border-l border-gray-200',
                viewMode === 'lista' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
              title="Lista"
            >
              <List size={15} />
            </button>
            <button
              onClick={handleEnterArchive}
              className={[
                'px-3 py-1.5 transition-colors text-sm border-l border-gray-200 flex items-center gap-1',
                viewMode === 'arquivo' ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
              title="Arquivo"
            >
              <Archive size={15} />
              {archivedTasks.length > 0 && viewMode !== 'arquivo' && (
                <span className="text-[10px] font-display font-semibold">{archivedTasks.length}</span>
              )}
            </button>
          </div>

          {canEdit && viewMode !== 'arquivo' && (
            <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
              Nova tarefa
            </Button>
          )}
        </div>
      }
    >
      {viewMode === 'arquivo' ? (
        <ArchivedView
          tasks={archivedTasks}
          projects={projects}
          loading={loadingArchive}
          onUnarchive={handleUnarchive}
          onDelete={handleDeleteArchived}
          onBack={() => setViewMode('kanban')}
        />
      ) : (
        <>
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
            <Select options={projectOptions} value={filtroProjetoId} onChange={(e) => setFiltroProjetoId(e.target.value)} className="text-sm" />
            <Select options={PRIORITY_FILTER} value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)} className="text-sm" />
            <Select options={STATUS_FILTER} value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="text-sm" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : viewMode === 'kanban' ? (
            <KanbanBoard
              tasks={tasksFiltradas}
              projects={projects}
              onEdit={(t) => { setEditingTask(t); setModalOpen(true); }}
              onDelete={deleteTask}
              onStatusChange={(id, status) => updateTaskStatus(id, status)}
              onArchive={handleArchive}
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
        </>
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

interface ArchivedViewProps {
  tasks: Task[];
  projects: { id: string; nome: string }[];
  loading: boolean;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

function ArchivedView({ tasks, projects, loading, onUnarchive, onDelete, onBack }: ArchivedViewProps) {
  const projectMap = new Map(projects.map((p) => [p.id, p.nome]));
  const { canEdit } = usePermission();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Voltar
        </button>
        <span className="text-gray-300">/</span>
        <div className="flex items-center gap-2">
          <Archive size={15} className="text-violet-500" />
          <span className="text-sm font-medium text-gray-700 font-display">Arquivo de Tarefas</span>
        </div>
        <span className="text-xs text-gray-400 ml-auto">{tasks.length} tarefa{tasks.length !== 1 ? 's' : ''} arquivada{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-6 w-6 border-2 border-violet-600 border-t-transparent rounded-full" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Archive size={40} className="text-gray-200 mb-3" />
          <p className="text-sm">Nenhuma tarefa arquivada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-gray-200 shadow-card px-4 py-3 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 line-through truncate">{task.titulo}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {projectMap.get(task.projeto_id) && (
                    <span className="text-xs text-gray-400">{projectMap.get(task.projeto_id)}</span>
                  )}
                  <Badge className={TASK_PRIORITY_COLORS[task.prioridade]}>
                    {TASK_PRIORITY_LABELS[task.prioridade]}
                  </Badge>
                  <Badge className={TASK_STATUS_COLORS[task.status]}>
                    {TASK_STATUS_LABELS[task.status]}
                  </Badge>
                  {task.arquivado_em && (
                    <span className="text-xs text-gray-400">
                      Arquivado em {formatarData(task.arquivado_em)}
                    </span>
                  )}
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onUnarchive(task.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-violet-700 hover:bg-violet-50 transition-colors font-medium"
                    title="Restaurar tarefa"
                  >
                    <RotateCcw size={13} />
                    Restaurar
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="Excluir permanentemente"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
