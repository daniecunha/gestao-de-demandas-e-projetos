import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, AlertTriangle, Clock, FolderKanban, Calendar } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useMeetings } from '../hooks/useMeetings';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { TaskForm } from '../components/tasks/TaskForm';
import { TaskCard } from '../components/tasks/TaskCard';
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
} from '../utils/statusUtils';
import { tarefasCriticas, tarefasDeHoje, tarefasBloqueadas, calcularProgresso } from '../utils/filters';
import { formatarDataHora } from '../utils/dateUtils';
import type { TaskFormData } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const { projects, fetchProjects } = useProjects();
  const { tasks, fetchTasks, createTask, updateTaskStatus, deleteTask } = useTasks();
  const { meetings } = useMeetings();
  const [modalTask, setModalTask] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const criticas = tarefasCriticas(tasks);
  const hoje = tarefasDeHoje(tasks);
  const bloqueadas = tarefasBloqueadas(tasks);
  const abertas = tasks.filter((t) => t.status !== 'concluido' && t.status !== 'cancelado');

  // Próximas reuniões (próximas 48h)
  const agora = new Date();
  const proximas = meetings
    .filter((m) => new Date(m.data_hora) > agora)
    .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
    .slice(0, 3);

  const handleCreateTask = async (data: TaskFormData) => {
    setSavingTask(true);
    try {
      await createTask(data);
      setModalTask(false);
    } finally {
      setSavingTask(false);
    }
  };

  return (
    <PageContainer
      title="Dashboard"
      subtitle="Visão geral do seu dia"
      actions={
        <Button
          icon={<Plus size={16} />}
          onClick={() => setModalTask(true)}
        >
          Nova tarefa
        </Button>
      }
    >
      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={<FolderKanban size={20} className="text-blue-600" />}
          label="Projetos ativos"
          value={projects.filter((p) => p.status === 'em_execucao').length}
          total={projects.length}
          color="bg-blue-50"
          onClick={() => navigate('/projetos')}
        />
        <MetricCard
          icon={<CheckSquare size={20} className="text-green-600" />}
          label="Tarefas abertas"
          value={abertas.length}
          color="bg-green-50"
          onClick={() => navigate('/tarefas')}
        />
        <MetricCard
          icon={<AlertTriangle size={20} className="text-red-600" />}
          label="Bloqueadas"
          value={bloqueadas.length}
          color="bg-red-50"
          onClick={() => navigate('/tarefas')}
        />
        <MetricCard
          icon={<Clock size={20} className="text-yellow-600" />}
          label="Críticas / urgentes"
          value={criticas.length}
          color="bg-yellow-50"
          onClick={() => navigate('/tarefas')}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tarefas do dia */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Tarefas para hoje</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/tarefas')}>
              Ver todas
            </Button>
          </div>

          {hoje.length === 0 ? (
            <Card>
              <CardBody>
                <p className="text-sm text-gray-500 text-center py-6">
                  Nenhuma tarefa vencida ou para hoje. 🎉
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="space-y-2">
              {hoje.slice(0, 5).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={projects.find((p) => p.id === task.projeto_id)}
                  onEdit={() => navigate('/tarefas')}
                  onDelete={(id) => deleteTask(id)}
                  onToggleStatus={(t) =>
                    updateTaskStatus(t.id, t.status === 'concluido' ? 'a_fazer' : 'concluido')
                  }
                />
              ))}
            </div>
          )}

          {/* Status por projeto */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Status por projeto</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/projetos')}>
                Ver todos
              </Button>
            </div>

            <div className="space-y-2">
              {projects.slice(0, 5).map((project) => {
                const ptasks = tasks.filter((t) => t.projeto_id === project.id);
                const progresso = calcularProgresso(ptasks);
                return (
                  <Card
                    key={project.id}
                    hover
                    onClick={() => navigate(`/projetos/${project.id}`)}
                  >
                    <CardBody className="py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: project.cor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium text-gray-800 truncate">
                              {project.nome}
                            </span>
                            <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                              {PROJECT_STATUS_LABELS[project.status]}
                            </Badge>
                          </div>
                          {ptasks.length > 0 && (
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${progresso}%`,
                                    backgroundColor: project.cor,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 shrink-0">
                                {progresso}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}

              {projects.length === 0 && (
                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-400 text-center py-4">
                      Nenhum projeto cadastrado.{' '}
                      <button
                        className="text-blue-600 underline"
                        onClick={() => navigate('/projetos')}
                      >
                        Criar agora
                      </button>
                    </p>
                  </CardBody>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar direita */}
        <div className="space-y-4">
          {/* Próximas reuniões */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Próximas reuniões</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/reunioes')}>
                Ver todas
              </Button>
            </div>

            {proximas.length === 0 ? (
              <Card>
                <CardBody>
                  <p className="text-sm text-gray-400 text-center py-4">
                    Nenhuma reunião agendada.
                  </p>
                </CardBody>
              </Card>
            ) : (
              <div className="space-y-2">
                {proximas.map((meeting) => (
                  <Card
                    key={meeting.id}
                    hover
                    onClick={() => navigate(`/reunioes/${meeting.id}`)}
                  >
                    <CardBody className="py-3">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {meeting.titulo}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                        <Calendar size={11} />
                        {formatarDataHora(meeting.data_hora)}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Ações rápidas */}
          <Card>
            <CardBody>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Ações rápidas</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  icon={<Plus size={14} />}
                  onClick={() => navigate('/projetos')}
                >
                  Novo projeto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  icon={<Plus size={14} />}
                  onClick={() => setModalTask(true)}
                >
                  Nova tarefa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  icon={<Plus size={14} />}
                  onClick={() => navigate('/reunioes')}
                >
                  Nova reunião
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  icon={<Plus size={14} />}
                  onClick={() => navigate('/relatorios')}
                >
                  Gerar relatório
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Modal nova tarefa */}
      <Modal
        open={modalTask}
        onClose={() => setModalTask(false)}
        title="Nova tarefa"
        size="lg"
      >
        <TaskForm
          projects={projects}
          onSubmit={handleCreateTask}
          onCancel={() => setModalTask(false)}
          loading={savingTask}
        />
      </Modal>
    </PageContainer>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total?: number;
  color: string;
  onClick?: () => void;
}

function MetricCard({ icon, label, value, total, color, onClick }: MetricCardProps) {
  return (
    <Card hover onClick={onClick}>
      <CardBody>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {value}
              {total !== undefined && (
                <span className="text-sm font-normal text-gray-400 ml-1">/ {total}</span>
              )}
            </p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
