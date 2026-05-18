import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Plus, Calendar, Tag, Building2, AlignLeft,
} from 'lucide-react';
import { useProjectsStore } from '../store/projectsStore';
import { useTasks } from '../hooks/useTasks';
import { projectsService } from '../services/projectsService';
import { PageContainer } from '../components/layout/PageContainer';
import { ProjectForm } from '../components/projects/ProjectForm';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { TaskList } from '../components/tasks/TaskList';
import { TaskForm } from '../components/tasks/TaskForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '../utils/statusUtils';
import { formatarData } from '../utils/dateUtils';
import { calcularProgresso } from '../utils/filters';
import type { Project, ProjectFormData, Task, TaskFormData, TaskStatus } from '../types';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateProject } = useProjectsStore();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'lista'>('kanban');

  const { tasks, createTask, updateTaskStatus, deleteTask } = useTasks(id);

  const [modalEditProject, setModalEditProject] = useState(false);
  const [modalNewTask, setModalNewTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    projectsService.buscarPorId(id).then((p) => {
      setProject(p);
      setLoading(false);
    });
  }, [id]);

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!id) return;
    setSaving(true);
    try {
      await updateProject(id, data);
      const updated = await projectsService.buscarPorId(id);
      setProject(updated);
      setModalEditProject(false);
    } finally {
      setSaving(false);
    }
  };

  const handleTaskSubmit = async (data: TaskFormData) => {
    setSaving(true);
    try {
      if (editingTask) {
        // Usar updateTask do store
      } else {
        await createTask({ ...data, projeto_id: id! });
      }
      setModalNewTask(false);
      setEditingTask(undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTaskStatus(taskId, newStatus);
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <PageContainer>
        <p className="text-gray-500">Projeto não encontrado.</p>
      </PageContainer>
    );
  }

  const projectTasks = tasks.filter((t) => t.projeto_id === id);
  const progresso = calcularProgresso(projectTasks);

  return (
    <PageContainer>
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate('/projetos')}
          >
            Projetos
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<Pencil size={14} />}
          onClick={() => setModalEditProject(true)}
        >
          Editar
        </Button>
      </div>

      {/* Info do projeto */}
      <Card className="mb-6">
        <div className="h-2 rounded-t-xl" style={{ backgroundColor: project.cor }} />
        <CardBody>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{project.nome}</h2>
              {project.descricao && (
                <p className="text-gray-500 mt-1">{project.descricao}</p>
              )}
            </div>
            <Badge className={PROJECT_STATUS_COLORS[project.status]}>
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {project.parceiro && (
              <Info icon={<Building2 size={14} />} label="Parceiro" value={project.parceiro} />
            )}
            {project.data_inicio && (
              <Info icon={<Calendar size={14} />} label="Início" value={formatarData(project.data_inicio)} />
            )}
            {project.data_previsao && (
              <Info icon={<Calendar size={14} />} label="Previsão" value={formatarData(project.data_previsao)} />
            )}
            <Info
              icon={<AlignLeft size={14} />}
              label="Progresso"
              value={`${progresso}% (${projectTasks.filter((t) => t.status === 'concluido').length}/${projectTasks.length})`}
            />
          </div>

          {project.tecnologias.length > 0 && (
            <div className="flex items-center gap-1.5 mt-4 flex-wrap">
              <Tag size={12} className="text-gray-400" />
              {project.tecnologias.map((tech) => (
                <span key={tech} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Barra de progresso */}
          {projectTasks.length > 0 && (
            <div className="mt-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progresso}%`, backgroundColor: project.cor }}
                />
              </div>
            </div>
          )}

          {project.contexto && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-1">Contexto / Histórico</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{project.contexto}</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tarefas */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">
          Tarefas{' '}
          <span className="text-gray-400 font-normal text-sm">({projectTasks.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('kanban')}
              className={[
                'px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('lista')}
              className={[
                'px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'lista'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50',
              ].join(' ')}
            >
              Lista
            </button>
          </div>
          <Button
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setModalNewTask(true)}
          >
            Nova tarefa
          </Button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={projectTasks}
          projects={[project]}
          onEdit={(t) => { setEditingTask(t); setModalNewTask(true); }}
          onDelete={deleteTask}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <TaskList
          tasks={projectTasks}
          projects={[project]}
          onEdit={(t) => { setEditingTask(t); setModalNewTask(true); }}
          onDelete={deleteTask}
          onToggleStatus={(t) =>
            updateTaskStatus(t.id, t.status === 'concluido' ? 'a_fazer' : 'concluido')
          }
        />
      )}

      {/* Modais */}
      <Modal
        open={modalEditProject}
        onClose={() => setModalEditProject(false)}
        title="Editar projeto"
        size="xl"
      >
        <ProjectForm
          initialData={project}
          onSubmit={handleUpdateProject}
          onCancel={() => setModalEditProject(false)}
          loading={saving}
        />
      </Modal>

      <Modal
        open={modalNewTask}
        onClose={() => { setModalNewTask(false); setEditingTask(undefined); }}
        title={editingTask ? 'Editar tarefa' : 'Nova tarefa'}
        size="lg"
      >
        <TaskForm
          initialData={editingTask}
          projects={[project]}
          defaultProjectId={id}
          onSubmit={handleTaskSubmit}
          onCancel={() => { setModalNewTask(false); setEditingTask(undefined); }}
          loading={saving}
        />
      </Modal>
    </PageContainer>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-gray-400 mb-0.5">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-sm font-medium text-gray-700">{value}</p>
    </div>
  );
}
