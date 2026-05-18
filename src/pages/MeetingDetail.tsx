import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Users, CheckCircle, AlertCircle, Plus, Trash2, Pencil,
  FolderKanban, CheckSquare, Link2, X,
} from 'lucide-react';
import { meetingsService } from '../services/meetingsService';
import { tasksService } from '../services/tasksService';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useTechnologies } from '../hooks/useTechnologies';
import { PageContainer } from '../components/layout/PageContainer';
import { MeetingForm } from '../components/meetings/MeetingForm';
import { TaskForm } from '../components/tasks/TaskForm';
import { ProjectForm } from '../components/projects/ProjectForm';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { MEETING_TYPE_COLORS, MEETING_TYPE_LABELS } from '../utils/statusUtils';
import { formatarDataHora } from '../utils/dateUtils';
import type {
  Meeting, MeetingFormData, Decisao, Encaminhamento,
  ProjectFormData, TaskFormData,
} from '../types';

export function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { projects, createProject } = useProjects();
  const { tasks, createTask } = useTasks();
  useTechnologies();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalEdit, setModalEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modais de ação
  const [modalNovaTarefa, setModalNovaTarefa]     = useState(false);
  const [modalNovoProjeto, setModalNovoProjeto]   = useState(false);
  const [modalVincularProj, setModalVincularProj] = useState(false);
  const [modalVincularTask, setModalVincularTask] = useState(false);
  const [savingAction, setSavingAction]           = useState(false);
  const [projetoParaVincular, setProjetoParaVincular] = useState('');
  const [tarefaParaVincular, setTarefaParaVincular]   = useState('');

  // Formulário de nova decisão / encaminhamento
  const [novaDecisao, setNovaDecisao] = useState('');
  const [novoEnc, setNovoEnc] = useState({ texto: '', responsavel: '', prazo: '' });

  const fetchMeeting = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const m = await meetingsService.buscarPorId(id);
      setMeeting(m);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeeting(); }, [id]);

  // ─── Editar reunião ───────────────────────────────────────────
  const handleUpdate = async (data: MeetingFormData) => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await meetingsService.atualizar(id, data);
      setMeeting(updated);
      setModalEdit(false);
    } finally {
      setSaving(false);
    }
  };

  // ─── Decisões ────────────────────────────────────────────────
  const adicionarDecisao = async () => {
    if (!meeting || !novaDecisao.trim()) return;
    const decisoes: Decisao[] = [
      ...meeting.decisoes,
      { texto: novaDecisao.trim(), data: new Date().toISOString() },
    ];
    const updated = await meetingsService.atualizar(meeting.id, { decisoes });
    setMeeting(updated);
    setNovaDecisao('');
  };

  const removerDecisao = async (index: number) => {
    if (!meeting) return;
    const decisoes = meeting.decisoes.filter((_, i) => i !== index);
    const updated = await meetingsService.atualizar(meeting.id, { decisoes });
    setMeeting(updated);
  };

  // ─── Encaminhamentos ─────────────────────────────────────────
  const adicionarEncaminhamento = async () => {
    if (!meeting || !novoEnc.texto.trim()) return;
    const enc: Encaminhamento = {
      texto: novoEnc.texto.trim(),
      responsavel: novoEnc.responsavel.trim(),
      prazo: novoEnc.prazo || null,
      tarefa_gerada_id: null,
    };
    const encaminhamentos = [...meeting.encaminhamentos, enc];
    const updated = await meetingsService.atualizar(meeting.id, { encaminhamentos });
    setMeeting(updated);
    setNovoEnc({ texto: '', responsavel: '', prazo: '' });
  };

  const gerarTarefaDeEncaminhamento = async (index: number) => {
    if (!meeting) return;
    const enc = meeting.encaminhamentos[index];
    if (enc.tarefa_gerada_id) return;

    const task = await tasksService.criar({
      titulo: enc.texto,
      projeto_id: meeting.projeto_ids[0] ?? '',
      prioridade: 'media',
      status: 'a_fazer',
      prazo: enc.prazo,
      notas: `Encaminhamento da reunião: ${meeting.titulo}\nResponsável: ${enc.responsavel}`,
      subtarefas: [],
      reuniao_id: meeting.id,
      valor_negocio: '',
      okrs: [],
    });

    const encaminhamentos = meeting.encaminhamentos.map((e, i) =>
      i === index ? { ...e, tarefa_gerada_id: task.id } : e
    );
    const updated = await meetingsService.atualizar(meeting.id, { encaminhamentos });
    setMeeting(updated);
  };

  // ─── Ações: criar tarefa a partir da reunião ─────────────────
  const handleCriarTarefa = async (data: TaskFormData) => {
    if (!meeting) return;
    setSavingAction(true);
    try {
      await createTask({ ...data, reuniao_id: meeting.id });
      setModalNovaTarefa(false);
    } finally {
      setSavingAction(false);
    }
  };

  // ─── Ações: criar projeto a partir da reunião ─────────────────
  const handleCriarProjeto = async (data: ProjectFormData) => {
    if (!meeting) return;
    setSavingAction(true);
    try {
      const projeto = await createProject({ ...data, reuniao_origem_id: meeting.id });
      // Adiciona o novo projeto aos projeto_ids da reunião
      const novosProjIds = [...meeting.projeto_ids, projeto.id];
      const updated = await meetingsService.atualizar(meeting.id, { projeto_ids: novosProjIds });
      setMeeting(updated);
      setModalNovoProjeto(false);
    } finally {
      setSavingAction(false);
    }
  };

  // ─── Ações: vincular projeto existente ───────────────────────
  const handleVincularProjeto = async () => {
    if (!meeting || !projetoParaVincular) return;
    if (meeting.projeto_ids.includes(projetoParaVincular)) {
      setModalVincularProj(false);
      return;
    }
    setSavingAction(true);
    try {
      const novosProjIds = [...meeting.projeto_ids, projetoParaVincular];
      const updated = await meetingsService.atualizar(meeting.id, { projeto_ids: novosProjIds });
      setMeeting(updated);
      setProjetoParaVincular('');
      setModalVincularProj(false);
    } finally {
      setSavingAction(false);
    }
  };

  const handleDesvincularProjeto = async (projId: string) => {
    if (!meeting) return;
    const novosProjIds = meeting.projeto_ids.filter((pid) => pid !== projId);
    const updated = await meetingsService.atualizar(meeting.id, { projeto_ids: novosProjIds });
    setMeeting(updated);
  };

  // ─── Ações: vincular tarefa existente ────────────────────────
  const handleVincularTarefa = async () => {
    if (!meeting || !tarefaParaVincular) return;
    setSavingAction(true);
    try {
      await tasksService.atualizar(tarefaParaVincular, { reuniao_id: meeting.id });
      setTarefaParaVincular('');
      setModalVincularTask(false);
    } finally {
      setSavingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-4" />
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!meeting) {
    return <PageContainer><p className="text-gray-500">Reunião não encontrada.</p></PageContainer>;
  }

  const meetingProjects = meeting.projeto_ids
    .map((pid) => projects.find((p) => p.id === pid))
    .filter(Boolean);

  const meetingTasks = tasks.filter((t) => t.reuniao_id === meeting.id);

  const projetosDisponiveis = projects.filter(
    (p) => !meeting.projeto_ids.includes(p.id)
  );

  const tarefasDisponiveis = tasks.filter(
    (t) => !t.reuniao_id || t.reuniao_id !== meeting.id
  );

  return (
    <PageContainer>
      {/* Voltar */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowLeft size={15} />}
          onClick={() => navigate('/reunioes')}
        >
          Reuniões
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<Pencil size={14} />}
          onClick={() => setModalEdit(true)}
        >
          Editar
        </Button>
      </div>

      {/* Cabeçalho */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{meeting.titulo}</h2>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 flex-wrap">
                <span>{formatarDataHora(meeting.data_hora)}</span>
                <span className="flex items-center gap-1"><Clock size={13} />{meeting.duracao_min} min</span>
              </div>
            </div>
            <Badge className={MEETING_TYPE_COLORS[meeting.tipo]}>
              {MEETING_TYPE_LABELS[meeting.tipo]}
            </Badge>
          </div>

          {meeting.participantes.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <Users size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">{meeting.participantes.join(', ')}</span>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ─── Ações desta Reunião ─────────────────────────────── */}
      <Card className="mb-6 border-blue-100 bg-blue-50/40">
        <CardHeader>
          <h3 className="font-semibold text-gray-800">Ações desta Reunião</h3>
        </CardHeader>
        <CardBody>
          {/* Botões de criação / vínculo */}
          <div className="flex flex-wrap gap-2 mb-5">
            <Button
              size="sm"
              icon={<CheckSquare size={14} />}
              onClick={() => setModalNovaTarefa(true)}
            >
              Criar tarefa
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={<FolderKanban size={14} />}
              onClick={() => setModalNovoProjeto(true)}
            >
              Criar projeto
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Link2 size={14} />}
              onClick={() => setModalVincularProj(true)}
            >
              Vincular projeto
            </Button>
            <Button
              size="sm"
              variant="outline"
              icon={<Link2 size={14} />}
              onClick={() => setModalVincularTask(true)}
            >
              Vincular tarefa
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Projetos vinculados */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Projetos vinculados ({meetingProjects.length})
              </p>
              {meetingProjects.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhum projeto vinculado.</p>
              ) : (
                <div className="space-y-1.5">
                  {meetingProjects.map((p) => p && (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.cor }}
                        />
                        <span
                          className="text-sm text-blue-600 hover:underline cursor-pointer truncate"
                          onClick={() => navigate(`/projetos/${p.id}`)}
                        >
                          {p.nome}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDesvincularProjeto(p.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                        title="Desvincular"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tarefas vinculadas */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Tarefas vinculadas ({meetingTasks.length})
              </p>
              {meetingTasks.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhuma tarefa vinculada.</p>
              ) : (
                <div className="space-y-1.5">
                  {meetingTasks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200"
                    >
                      <CheckSquare size={13} className="text-blue-400 shrink-0" />
                      <span className="text-sm text-gray-700 truncate">{t.titulo}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pauta */}
        {meeting.pauta.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-800">Pauta</h3>
            </CardHeader>
            <CardBody>
              <ol className="space-y-2">
                {meeting.pauta.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {item.ordem}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{item.titulo}</p>
                      <p className="text-xs text-gray-400">{item.tempo_min} min</p>
                    </div>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        )}

        {/* Decisões */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-800">Decisões</h3>
          </CardHeader>
          <CardBody>
            {meeting.decisoes.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {meeting.decisoes.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 group">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-700 flex-1">{d.texto}</p>
                    <button
                      onClick={() => removerDecisao(i)}
                      className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 mb-4">Nenhuma decisão registrada.</p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Registrar decisão..."
                value={novaDecisao}
                onChange={(e) => setNovaDecisao(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && adicionarDecisao()}
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button size="sm" icon={<Plus size={13} />} onClick={adicionarDecisao}>
                Adicionar
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Encaminhamentos */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-gray-800">Encaminhamentos</h3>
          </CardHeader>
          <CardBody>
            {meeting.encaminhamentos.length > 0 && (
              <div className="space-y-2 mb-4">
                {meeting.encaminhamentos.map((enc, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">{enc.texto}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        {enc.responsavel && <span>👤 {enc.responsavel}</span>}
                        {enc.prazo && <span>📅 {enc.prazo}</span>}
                      </div>
                    </div>
                    {!enc.tarefa_gerada_id && meeting.projeto_ids.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => gerarTarefaDeEncaminhamento(i)}
                        title="Gerar tarefa"
                      >
                        <Plus size={13} /> Tarefa
                      </Button>
                    )}
                    {enc.tarefa_gerada_id && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full shrink-0">
                        Tarefa criada
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-600">Novo encaminhamento</p>
              <input
                type="text"
                placeholder="Descrição do encaminhamento..."
                value={novoEnc.texto}
                onChange={(e) => setNovoEnc({ ...novoEnc, texto: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Responsável"
                  value={novoEnc.responsavel}
                  onChange={(e) => setNovoEnc({ ...novoEnc, responsavel: e.target.value })}
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={novoEnc.prazo}
                  onChange={(e) => setNovoEnc({ ...novoEnc, prazo: e.target.value })}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button size="sm" icon={<Plus size={13} />} onClick={adicionarEncaminhamento}>
                  Adicionar
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Notas gerais */}
        {meeting.notas_gerais && (
          <Card className="xl:col-span-2">
            <CardHeader><h3 className="font-semibold text-gray-800">Notas gerais</h3></CardHeader>
            <CardBody>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{meeting.notas_gerais}</p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* ─── Modal: Editar reunião ─────────────────────────────── */}
      <Modal open={modalEdit} onClose={() => setModalEdit(false)} title="Editar reunião" size="xl">
        <MeetingForm
          initialData={meeting}
          projects={projects}
          onSubmit={handleUpdate}
          onCancel={() => setModalEdit(false)}
          loading={saving}
        />
      </Modal>

      {/* ─── Modal: Criar tarefa ──────────────────────────────── */}
      <Modal
        open={modalNovaTarefa}
        onClose={() => setModalNovaTarefa(false)}
        title="Criar tarefa desta reunião"
        size="xl"
      >
        <TaskForm
          projects={projects}
          defaultProjectId={meeting.projeto_ids[0]}
          defaultReuniaoId={meeting.id}
          onSubmit={handleCriarTarefa}
          onCancel={() => setModalNovaTarefa(false)}
          loading={savingAction}
        />
      </Modal>

      {/* ─── Modal: Criar projeto ─────────────────────────────── */}
      <Modal
        open={modalNovoProjeto}
        onClose={() => setModalNovoProjeto(false)}
        title="Criar projeto desta reunião"
        size="xl"
      >
        <ProjectForm
          onSubmit={handleCriarProjeto}
          onCancel={() => setModalNovoProjeto(false)}
          loading={savingAction}
        />
      </Modal>

      {/* ─── Modal: Vincular projeto existente ───────────────── */}
      <Modal
        open={modalVincularProj}
        onClose={() => setModalVincularProj(false)}
        title="Vincular projeto existente"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecione um projeto para vincular a esta reunião.
          </p>
          <select
            value={projetoParaVincular}
            onChange={(e) => setProjetoParaVincular(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Selecionar projeto —</option>
            {projetosDisponiveis.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalVincularProj(false)}>Cancelar</Button>
            <Button
              onClick={handleVincularProjeto}
              loading={savingAction}
              disabled={!projetoParaVincular}
            >
              Vincular
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─── Modal: Vincular tarefa existente ────────────────── */}
      <Modal
        open={modalVincularTask}
        onClose={() => setModalVincularTask(false)}
        title="Vincular tarefa existente"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecione uma tarefa para vinculá-la a esta reunião.
          </p>
          <select
            value={tarefaParaVincular}
            onChange={(e) => setTarefaParaVincular(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— Selecionar tarefa —</option>
            {tarefasDisponiveis.map((t) => {
              const proj = projects.find((p) => p.id === t.projeto_id);
              return (
                <option key={t.id} value={t.id}>
                  {t.titulo}{proj ? ` (${proj.nome})` : ''}
                </option>
              );
            })}
          </select>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalVincularTask(false)}>Cancelar</Button>
            <Button
              onClick={handleVincularTarefa}
              loading={savingAction}
              disabled={!tarefaParaVincular}
            >
              Vincular
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
