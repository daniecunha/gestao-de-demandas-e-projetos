import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { usePermission } from '../hooks/usePermission';
import { useTasks } from '../hooks/useTasks';
import { useTechnologies } from '../hooks/useTechnologies';
import { PageContainer } from '../components/layout/PageContainer';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import type { Project, ProjectFormData, ProjectStatus } from '../types';
import { PROJECT_STATUS_LABELS } from '../utils/statusUtils';

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Todos os status' },
  ...Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

export function Projects() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const { technologies } = useTechnologies();
  const { canEdit } = usePermission();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<ProjectStatus | ''>('');
  const [filtroTecnologia, setFiltroTecnologia] = useState<string>('');

  const handleSubmit = async (data: ProjectFormData) => {
    setSaving(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
      } else {
        await createProject(data);
      }
      fecharModal();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir este projeto? Todas as tarefas vinculadas também serão removidas.')) return;
    await deleteProject(id);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditingProject(undefined);
  };

  const projectsFiltrados = projects.filter((p) => {
    if (filtroStatus && p.status !== filtroStatus) return false;
    if (filtroTecnologia && p.tecnologia_id !== filtroTecnologia) return false;
    if (busca && !p.nome.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  return (
    <PageContainer
      title="Projetos"
      subtitle={`${projects.length} projeto${projects.length !== 1 ? 's' : ''} cadastrado${projects.length !== 1 ? 's' : ''}`}
      actions={canEdit ? (
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Novo projeto
        </Button>
      ) : undefined}
    >
      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar projeto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        {technologies.length > 0 && (
          <Select
            options={[
              { value: '', label: 'Todas as tecnologias' },
              ...technologies.map((t) => ({ value: t.id, label: t.nome })),
            ]}
            value={filtroTecnologia}
            onChange={(e) => setFiltroTecnologia(e.target.value)}
            className="text-sm"
          />
        )}
        <Select
          options={STATUS_FILTER_OPTIONS}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value as ProjectStatus | '')}
          className="text-sm"
        />
      </div>

      {/* Grid de projetos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projectsFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FolderEmpty />
          <p className="mt-4 text-sm">
            {busca || filtroStatus || filtroTecnologia
              ? 'Nenhum projeto corresponde ao filtro.'
              : 'Nenhum projeto cadastrado ainda.'}
          </p>
          {!busca && !filtroStatus && !filtroTecnologia && (
            <Button
              className="mt-4"
              variant="outline"
              icon={<Plus size={15} />}
              onClick={() => setModalOpen(true)}
            >
              Criar primeiro projeto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projectsFiltrados.map((project) => (
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

      {/* Modal criar/editar */}
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

function FolderEmpty() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-gray-200">
      <rect x="4" y="16" width="56" height="40" rx="4" fill="currentColor" />
      <path d="M4 28h56" stroke="#e5e7eb" strokeWidth="2" />
      <rect x="4" y="8" width="22" height="12" rx="4" fill="currentColor" />
    </svg>
  );
}
