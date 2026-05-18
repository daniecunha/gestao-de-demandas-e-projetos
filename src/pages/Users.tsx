import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ShieldCheck, Eye, UserCircle2 } from 'lucide-react';
import { usersService } from '../services/usersService';
import type { UserProfile, UserRole } from '../services/usersService';
import { useAuth } from '../contexts/AuthContext';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const ROLE_OPTIONS = [
  { value: 'admin',    label: 'Administrador — acesso total' },
  { value: 'consulta', label: 'Consulta — somente visualização' },
];

const ROLE_LABEL: Record<UserRole, string> = {
  admin:    'Administrador',
  consulta: 'Consulta',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin:    'bg-blue-100 text-blue-700',
  consulta: 'bg-gray-100 text-gray-600',
};

export function Users() {
  const navigate = useNavigate();
  const { user: currentUser, role: currentRole } = useAuth();
  const superAdminEmail = import.meta.env.VITE_ALLOWED_EMAIL as string | undefined;

  const [users, setUsers]         = useState<UserProfile[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [novoEmail, setNovoEmail] = useState('');
  const [novoRole, setNovoRole]   = useState<UserRole>('consulta');

  useEffect(() => {
    if (currentRole !== 'admin') {
      navigate('/', { replace: true });
      return;
    }
    carregar();
  }, [currentRole]);

  const carregar = async () => {
    setLoading(true);
    try {
      setUsers(await usersService.listar());
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionar = async () => {
    if (!novoEmail.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const created = await usersService.criar(novoEmail.trim().toLowerCase(), '', novoRole);
      setUsers((prev) => [...prev, created]);
      setModalOpen(false);
      setNovoEmail('');
      setNovoRole('consulta');
    } catch (err) {
      setSaveError((err as Error).message ?? 'Erro ao adicionar usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRole = async (profile: UserProfile, role: UserRole) => {
    try {
      const updated = await usersService.atualizarRole(profile.id, role);
      setUsers((prev) => prev.map((u) => (u.id === profile.id ? updated : u)));
    } catch (err) {
      alert('Erro ao alterar perfil: ' + (err as Error).message);
    }
  };

  const handleRemover = async (profile: UserProfile) => {
    if (!window.confirm(`Remover acesso de ${profile.email}?`)) return;
    try {
      await usersService.excluir(profile.id);
      setUsers((prev) => prev.filter((u) => u.id !== profile.id));
    } catch (err) {
      alert('Erro ao remover: ' + (err as Error).message);
    }
  };

  const isSelf = (profile: UserProfile) => profile.email === currentUser?.email;
  const isOwner = (profile: UserProfile) => !!superAdminEmail && profile.email === superAdminEmail;

  return (
    <PageContainer
      title="Controle de Acesso"
      subtitle="Gerencie quem pode acessar o sistema e com qual perfil"
      actions={
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
          Adicionar acesso
        </Button>
      }
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <UserCircle2 size={48} className="text-gray-200 mb-4" />
          <p className="text-sm">Nenhum usuário cadastrado.</p>
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-gray-100">
            {users.map((profile) => (
              <div key={profile.id} className="flex items-center gap-4 px-5 py-4">

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0">
                  {profile.email[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {profile.email}
                    </span>
                    {isOwner(profile) && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                        Proprietário
                      </span>
                    )}
                    {isSelf(profile) && !isOwner(profile) && (
                      <span className="text-xs text-gray-400">(você)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Desde {new Date(profile.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                {/* Role selector */}
                <div className="shrink-0">
                  {isOwner(profile) ? (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${ROLE_COLORS[profile.role]}`}>
                      <ShieldCheck size={12} />
                      {ROLE_LABEL[profile.role]}
                    </span>
                  ) : (
                    <select
                      value={profile.role}
                      onChange={(e) => handleChangeRole(profile, e.target.value as UserRole)}
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value="admin">Administrador</option>
                      <option value="consulta">Consulta</option>
                    </select>
                  )}
                </div>

                {/* Ações */}
                <div className="shrink-0">
                  {!isOwner(profile) && !isSelf(profile) ? (
                    <button
                      onClick={() => handleRemover(profile)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remover acesso"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : (
                    <div className="w-8" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Legenda */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg shrink-0">
              <ShieldCheck size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Administrador</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Acesso completo: criar, editar e excluir projetos, tarefas, reuniões e relatórios.
              </p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg shrink-0">
              <Eye size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Consulta</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Somente visualização: pode ver todos os dados mas não pode criar, editar ou excluir.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Modal adicionar */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSaveError(null); setNovoEmail(''); setNovoRole('consulta'); }}
        title="Adicionar acesso"
      >
        <div className="space-y-4">
          {saveError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {saveError}
            </div>
          )}
          <Input
            label="E-mail Google"
            type="email"
            required
            placeholder="nome@gmail.com"
            value={novoEmail}
            onChange={(e) => setNovoEmail(e.target.value)}
            hint="Deve ser o mesmo e-mail utilizado para login com Google."
          />
          <Select
            label="Perfil de acesso"
            options={ROLE_OPTIONS}
            value={novoRole}
            onChange={(e) => setNovoRole(e.target.value as UserRole)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => { setModalOpen(false); setSaveError(null); setNovoEmail(''); setNovoRole('consulta'); }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAdicionar} loading={saving}>
              Adicionar
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
