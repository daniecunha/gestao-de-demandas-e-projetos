import { useState } from 'react';
import { Plus, Cpu } from 'lucide-react';
import { useTechnologies } from '../hooks/useTechnologies';
import { useProjects } from '../hooks/useProjects';
import { usePermission } from '../hooks/usePermission';
import { PageContainer } from '../components/layout/PageContainer';
import { TechnologyCard } from '../components/technologies/TechnologyCard';
import { TechnologyForm } from '../components/technologies/TechnologyForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import type { Technology, TechnologyFormData } from '../types';

export function Technologies() {
  const { technologies, loading, createTechnology, updateTechnology, deleteTechnology } = useTechnologies();
  const { projects } = useProjects();
  const { canEdit } = usePermission();

  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState<Technology | undefined>(undefined);
  const [saving, setSaving]             = useState(false);
  const [saveError, setSaveError]       = useState<string | null>(null);

  const handleSubmit = async (data: TechnologyFormData) => {
    setSaving(true);
    setSaveError(null);
    try {
      if (editing) {
        await updateTechnology(editing.id, data);
      } else {
        await createTechnology(data);
      }
      fecharModalComReset();
    } catch (err) {
      console.error('[Technologies] Erro ao salvar:', err);
      setSaveError((err as Error).message ?? 'Erro desconhecido ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const fecharModalComReset = () => {
    setSaveError(null);
    fecharModal();
  };

  const handleEdit = (technology: Technology) => {
    setSaveError(null);
    setEditing(technology);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const count = projects.filter((p) => p.tecnologia_id === id).length;
    const msg = count > 0
      ? `Esta tecnologia possui ${count} projeto(s) vinculado(s). Ao excluir, os projetos perderão o vínculo. Confirmar?`
      : 'Excluir esta tecnologia?';
    if (!window.confirm(msg)) return;
    await deleteTechnology(id);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditing(undefined);
  };

  return (
    <PageContainer
      title="Tecnologias"
      subtitle={`${technologies.length} tecnologia${technologies.length !== 1 ? 's' : ''} cadastrada${technologies.length !== 1 ? 's' : ''}`}
      actions={canEdit ? (
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Nova tecnologia
        </Button>
      ) : undefined}
    >
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : technologies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Cpu size={56} className="text-gray-200 mb-4" />
          <p className="text-sm">Nenhuma tecnologia cadastrada ainda.</p>
          <Button
            className="mt-4"
            variant="outline"
            icon={<Plus size={15} />}
            onClick={() => setModalOpen(true)}
          >
            Criar primeira tecnologia
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {technologies.map((technology) => (
            <TechnologyCard
              key={technology.id}
              technology={technology}
              projectCount={projects.filter((p) => p.tecnologia_id === technology.id).length}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={fecharModalComReset}
        title={editing ? 'Editar tecnologia' : 'Nova tecnologia'}
        size="lg"
      >
        {saveError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            <strong>Erro ao salvar:</strong> {saveError}
          </div>
        )}
        <TechnologyForm
          initialData={editing}
          onSubmit={handleSubmit}
          onCancel={fecharModalComReset}
          loading={saving}
        />
      </Modal>
    </PageContainer>
  );
}
