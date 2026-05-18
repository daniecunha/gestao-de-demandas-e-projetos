import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FolderKanban, Cpu } from 'lucide-react';
import { usePermission } from '../hooks/usePermission';
import { useState } from 'react';
import { useTechnologies } from '../hooks/useTechnologies';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { PageContainer } from '../components/layout/PageContainer';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import {
  Zap, Database, Bot, Brain, Globe, Settings, Code2, Server, Layers,
  Plane, Truck, Factory, Workflow,
} from 'lucide-react';
import type { Project, ProjectFormData } from '../types';

const ICON_MAP: Record<string, React.ElementType> = {
  zap: Zap, database: Database, bot: Bot, brain: Brain, cpu: Cpu,
  globe: Globe, settings: Settings, code: Code2, server: Server, layers: Layers,
  plane: Plane, truck: Truck, factory: Factory, workflow: Workflow,
};

export function TechnologyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { technologies } = useTechnologies();
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const { canEdit } = usePermission();

  const [modalOpen, setModalOpen]     = useState(false);
  const [editingProject, setEditing]  = useState<Project | undefined>(undefined);
  const [saving, setSaving]           = useState(false);

  const technology = technologies.find((t) => t.id === id);
  const techProjects = projects.filter((p) => p.tecnologia_id === id);
  const IconComponent = technology ? (ICON_MAP[technology.icone] ?? Cpu) : Cpu;

  const handleSubmit = async (data: ProjectFormData) => {
    setSaving(true);
    try {
      const payload = { ...data, tecnologia_id: id ?? null };
      if (editingProject) {
        await updateProject(editingProject.id, payload);
      } else {
        await createProject(payload);
      }
      fecharModal();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditing(project);
    setModalOpen(true);
  };

  const handleDelete = async (projId: string) => {
    if (!window.confirm('Excluir este projeto? Todas as tarefas vinculadas também serão removidas.')) return;
    await deleteProject(projId);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditing(undefined);
  };

  if (!technology && technologies.length > 0) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-sm">Tecnologia não encontrada.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/tecnologias')}>
            Voltar
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={technology?.nome ?? ''}
      subtitle={technology?.descricao ?? ''}
      actions={canEdit ? (
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Novo projeto
        </Button>
      ) : undefined}
    >
      {/* Botão voltar + cabeçalho visual */}
      <div className="flex items-center gap-3 mb-6 -mt-2">
        <button
          onClick={() => navigate('/tecnologias')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={15} />
          Tecnologias
        </button>
        <span className="text-gray-300">/</span>
        {technology && (
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: `${technology.cor}20` }}
            >
              <IconComponent size={14} style={{ color: technology.cor }} />
            </div>
            <span className="text-sm font-medium text-gray-700">{technology.nome}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : techProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FolderKanban size={48} className="text-gray-200 mb-4" />
          <p className="text-sm">Nenhum projeto cadastrado para esta tecnologia.</p>
          <Button
            className="mt-4"
            variant="outline"
            icon={<Plus size={15} />}
            onClick={() => setModalOpen(true)}
          >
            Criar primeiro projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {techProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              tasks={tasks.filter((t) => t.projeto_id === project.id)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={fecharModal}
        title={editingProject ? 'Editar projeto' : 'Novo projeto'}
        size="xl"
      >
        <ProjectForm
          initialData={editingProject}
          onSubmit={handleSubmit}
          onCancel={fecharModal}
          loading={saving}
        />
      </Modal>
    </PageContainer>
  );
}
