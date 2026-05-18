import React, { useState } from 'react';
import { usePermission } from '../hooks/usePermission';
import { Plus, Download, FileText, AlertTriangle, CheckCircle, ArrowRight, Pencil, TrendingUp, Target } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { PageContainer } from '../components/layout/PageContainer';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { exportarRelatorioPDF } from '../utils/pdfExport';
import { reportsService } from '../services/reportsService';
import {
  SEMAFORO_COLORS,
  SEMAFORO_LABELS,
  SEMAFORO_TEXT_COLORS,
  PROJECT_STATUS_LABELS,
} from '../utils/statusUtils';
import { formatarData, formatarDataHora, limitesMes } from '../utils/dateUtils';
import type { Report, ReportFormData, ProjectSnapshot, ReportStatusColor } from '../types';

export function Reports() {
  const { reports, loading, createReport, updateReport, deleteReport } = useReports();
  const { canEdit } = usePermission();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const [reportAtivo, setReportAtivo] = useState<Report | null>(null);
  const [gerando, setGerando] = useState(false);

  // Gera snapshot dos projetos para o relatório
  const gerarSnapshot = (): ProjectSnapshot[] => {
    return projects
      .filter((p) => p.status !== 'concluido' && p.status !== 'pausado')
      .map((p) => {
        const ptasks = tasks.filter((t) => t.projeto_id === p.id);
        const abertas = ptasks.filter((t) => t.status !== 'concluido' && t.status !== 'cancelado').length;
        const concluidas = ptasks.filter((t) => t.status === 'concluido').length;
        const bloqueadas = ptasks.filter((t) => t.status === 'bloqueado').length;

        let cor: ReportStatusColor = 'verde';
        if (bloqueadas > 0 || p.status === 'aguardando') cor = 'vermelho';
        else if (abertas > 3) cor = 'amarelo';

        return {
          projeto_id: p.id,
          nome: p.nome,
          status: p.status,
          cor_semaforo: cor,
          tarefas_concluidas: concluidas,
          tarefas_abertas: abertas,
          observacao: '',
          valor_negocio: p.valor_negocio ?? '',
          okrs: p.okrs ?? [],
        };
      });
  };

  const handleGerarRelatorio = async () => {
    setGerando(true);
    try {
      const hoje = new Date();
      const { inicio, fim } = limitesMes(hoje.toISOString());
      const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
      const periodoRef = `${meses[hoje.getMonth()]} ${hoje.getFullYear()}`;

      const report = await createReport({
        periodo_ref: periodoRef,
        data_inicio: inicio,
        data_fim: fim,
        projetos_snapshot: gerarSnapshot(),
        destaques: [],
        riscos: [],
        proximos_passos: [],
      });

      setReportAtivo(report);
    } finally {
      setGerando(false);
    }
  };

  const handleExportarPDF = async (report: Report) => {
    exportarRelatorioPDF(report);
    await reportsService.marcarExportado(report.id);
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Excluir este relatório?')) return;
    await deleteReport(id);
    if (reportAtivo?.id === id) setReportAtivo(null);
  };

  return (
    <PageContainer
      title="Relatórios Executivos"
      subtitle="Visão mensal para apresentar ao gestor"
      actions={canEdit ? (
        <Button icon={<Plus size={16} />} onClick={handleGerarRelatorio} loading={gerando}>
          Gerar relatório do mês
        </Button>
      ) : undefined}
    >
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 && !reportAtivo ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText size={48} className="mb-4 text-gray-200" />
          <p className="text-sm">Nenhum relatório gerado ainda.</p>
          <Button
            className="mt-4"
            icon={<Plus size={15} />}
            onClick={handleGerarRelatorio}
            loading={gerando}
          >
            Gerar relatório do mês atual
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Lista de relatórios */}
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id} hover onClick={() => setReportAtivo(report)}>
                <CardBody className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{report.periodo_ref}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Gerado em {formatarDataHora(report.gerado_em)}
                        {report.exportado_em && ` · Exportado em ${formatarData(report.exportado_em)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {report.projetos_snapshot.length} projeto{report.projetos_snapshot.length !== 1 ? 's' : ''}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Download size={13} />}
                        onClick={(e) => { e.stopPropagation(); handleExportarPDF(report); }}
                      >
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }}
                      >
                        <span className="text-red-500 text-xs">Excluir</span>
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Visualização do relatório ativo */}
          {reportAtivo && (
            <ReportViewer
              report={reportAtivo}
              onExport={() => handleExportarPDF(reportAtivo)}
              onUpdate={async (data) => {
                await updateReport(reportAtivo.id, data);
                // Reload
                const updated = reports.find((r) => r.id === reportAtivo.id);
                if (updated) setReportAtivo({ ...updated, ...data });
              }}
              onClose={() => setReportAtivo(null)}
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}

interface ReportViewerProps {
  report: Report;
  onExport: () => void;
  onUpdate: (data: Partial<ReportFormData>) => Promise<void>;
  onClose: () => void;
}

function ReportViewer({ report, onExport, onUpdate, onClose }: ReportViewerProps) {
  const [editando, setEditando] = useState<'destaques' | 'riscos' | 'proximos' | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');
  const [saving, setSaving] = useState(false);

  const salvarEdicao = async () => {
    if (!editando) return;
    setSaving(true);
    try {
      const items = textoEdicao.split('\n').map((s) => s.trim()).filter(Boolean);
      const field =
        editando === 'destaques' ? 'destaques' :
        editando === 'riscos' ? 'riscos' : 'proximos_passos';
      await onUpdate({ [field]: items });
    } finally {
      setSaving(false);
      setEditando(null);
    }
  };

  const iniciarEdicao = (tipo: typeof editando, itens: string[]) => {
    setEditando(tipo);
    setTextoEdicao(itens.join('\n'));
  };

  return (
    <div id="report-viewer" className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Relatório — {report.periodo_ref}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Fechar</Button>
          <Button size="sm" icon={<Download size={14} />} onClick={onExport}>
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Status semáforo */}
      <Card className="mb-4">
        <CardHeader>
          <h3 className="font-semibold text-gray-800">Status por Projeto</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {report.projetos_snapshot.map((snap) => (
              <div key={snap.projeto_id} className="border border-gray-100 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${SEMAFORO_COLORS[snap.cor_semaforo]}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{snap.nome}</span>
                      <span className={`text-xs font-medium ${SEMAFORO_TEXT_COLORS[snap.cor_semaforo]}`}>
                        {SEMAFORO_LABELS[snap.cor_semaforo]}
                      </span>
                      <span className="text-xs text-gray-400">
                        {snap.tarefas_concluidas} concluídas / {snap.tarefas_abertas} abertas
                      </span>
                    </div>
                    {snap.observacao && (
                      <p className="text-xs text-gray-500 mt-0.5">{snap.observacao}</p>
                    )}
                  </div>
                  <Badge className={`text-xs ${
                    snap.status === 'em_execucao' ? 'bg-green-100 text-green-800' :
                    snap.status === 'aguardando' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {PROJECT_STATUS_LABELS[snap.status]}
                  </Badge>
                </div>

                {/* Valor para o Negócio */}
                {snap.valor_negocio && (
                  <div className="flex items-start gap-1.5 pl-6">
                    <TrendingUp size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-600">{snap.valor_negocio}</p>
                  </div>
                )}

                {/* OKRs */}
                {snap.okrs && snap.okrs.length > 0 && (
                  <div className="flex items-start gap-1.5 pl-6 flex-wrap">
                    <Target size={12} className="text-violet-500 mt-0.5 shrink-0" />
                    {snap.okrs.map((okr) => (
                      <span
                        key={okr}
                        className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full"
                      >
                        {okr}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Destaques */}
        <ListSection
          title="Destaques Positivos"
          items={report.destaques}
          icon={<CheckCircle size={15} className="text-green-600" />}
          onEdit={() => iniciarEdicao('destaques', report.destaques)}
          editing={editando === 'destaques'}
          textoEdicao={textoEdicao}
          onTextoChange={setTextoEdicao}
          onSave={salvarEdicao}
          onCancelEdit={() => setEditando(null)}
          saving={saving}
          emptyText="Nenhum destaque registrado."
        />

        {/* Riscos */}
        <ListSection
          title="Pontos de Atenção"
          items={report.riscos}
          icon={<AlertTriangle size={15} className="text-red-600" />}
          onEdit={() => iniciarEdicao('riscos', report.riscos)}
          editing={editando === 'riscos'}
          textoEdicao={textoEdicao}
          onTextoChange={setTextoEdicao}
          onSave={salvarEdicao}
          onCancelEdit={() => setEditando(null)}
          saving={saving}
          emptyText="Nenhum risco registrado."
        />

        {/* Próximos passos */}
        <ListSection
          title="Próximos 30 dias"
          items={report.proximos_passos}
          icon={<ArrowRight size={15} className="text-blue-600" />}
          onEdit={() => iniciarEdicao('proximos', report.proximos_passos)}
          editing={editando === 'proximos'}
          textoEdicao={textoEdicao}
          onTextoChange={setTextoEdicao}
          onSave={salvarEdicao}
          onCancelEdit={() => setEditando(null)}
          saving={saving}
          emptyText="Nenhum próximo passo registrado."
        />
      </div>
    </div>
  );
}

interface ListSectionProps {
  title: string;
  items: string[];
  icon: React.ReactNode;
  onEdit: () => void;
  editing: boolean;
  textoEdicao: string;
  onTextoChange: (v: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
  saving: boolean;
  emptyText: string;
}

function ListSection({
  title, items, icon, onEdit, editing, textoEdicao,
  onTextoChange, onSave, onCancelEdit, saving, emptyText,
}: ListSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
          </div>
          {!editing && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              <Pencil size={12} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={textoEdicao}
              onChange={(e) => onTextoChange(e.target.value)}
              rows={6}
              placeholder="Um item por linha..."
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSave} loading={saving}>Salvar</Button>
              <Button size="sm" variant="outline" onClick={onCancelEdit}>Cancelar</Button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400">{emptyText}</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-gray-400 mt-0.5">·</span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}


