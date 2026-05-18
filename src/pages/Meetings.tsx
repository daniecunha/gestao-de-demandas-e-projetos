import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useMeetings } from '../hooks/useMeetings';
import { usePermission } from '../hooks/usePermission';
import { useProjects } from '../hooks/useProjects';
import { PageContainer } from '../components/layout/PageContainer';
import { MeetingCard } from '../components/meetings/MeetingCard';
import { MeetingForm } from '../components/meetings/MeetingForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import type { Meeting, MeetingFormData, MeetingType } from '../types';
import { MEETING_TYPE_LABELS } from '../utils/statusUtils';

const TIPO_FILTER = [
  { value: '', label: 'Todos os tipos' },
  ...Object.entries(MEETING_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

export function Meetings() {
  const { meetings, loading, createMeeting, updateMeeting, deleteMeeting } = useMeetings();
  const { projects } = useProjects();
  const { canEdit } = usePermission();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<MeetingType | ''>('');

  const handleSubmit = async (data: MeetingFormData) => {
    setSaving(true);
    try {
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, data);
      } else {
        await createMeeting(data);
      }
      fecharModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir esta reunião?')) return;
    await deleteMeeting(id);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEditingMeeting(undefined);
  };

  const meetingsFiltradas = meetings.filter((m) => {
    if (filtroTipo && m.tipo !== filtroTipo) return false;
    if (busca && !m.titulo.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  });

  // Separar futuras e passadas
  const agora = new Date().toISOString();
  const futuras = meetingsFiltradas.filter((m) => m.data_hora >= agora);
  const passadas = meetingsFiltradas.filter((m) => m.data_hora < agora);

  return (
    <PageContainer
      title="Reuniões"
      subtitle={`${meetings.length} reunião/ões cadastrada${meetings.length !== 1 ? 's' : ''}`}
      actions={canEdit ? (
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Nova reunião
        </Button>
      ) : undefined}
    >
      {/* Filtros */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar reunião..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <Select
          options={TIPO_FILTER}
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value as MeetingType | '')}
          className="text-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : meetingsFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <p className="text-sm">Nenhuma reunião cadastrada.</p>
          <Button
            className="mt-4"
            variant="outline"
            icon={<Plus size={15} />}
            onClick={() => setModalOpen(true)}
          >
            Criar primeira reunião
          </Button>
        </div>
      ) : (
        <>
          {futuras.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Próximas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {futuras.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    projects={projects}
                    onEdit={(m) => { setEditingMeeting(m); setModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {passadas.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Realizadas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 opacity-75">
                {passadas.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    projects={projects}
                    onEdit={(m) => { setEditingMeeting(m); setModalOpen(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={fecharModal}
        title={editingMeeting ? 'Editar reunião' : 'Nova reunião'}
        size="xl"
      >
        <MeetingForm
          initialData={editingMeeting}
          projects={projects}
          onSubmit={handleSubmit}
          onCancel={fecharModal}
          loading={saving}
        />
      </Modal>
    </PageContainer>
  );
}
