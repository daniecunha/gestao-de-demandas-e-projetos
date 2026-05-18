import { useNavigate } from 'react-router-dom';
import { Calendar, Tag, Building2, MoreVertical, Pencil, Trash2, Cpu } from 'lucide-react';
import { useState } from 'react';
import type { Project, Task } from '../../types';
import { Badge } from '../ui/Badge';
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '../../utils/statusUtils';
import { formatarData } from '../../utils/dateUtils';
import { calcularProgresso } from '../../utils/filters';
import { useTechnologiesStore } from '../../store/technologiesStore';

interface ProjectCardProps {
  project: Project;
  tasks?: Task[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, tasks = [], onEdit, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const progresso = calcularProgresso(tasks);
  const tarefasConcluidas = tasks.filter((t) => t.status === 'concluido').length;
  const technology = useTechnologiesStore((s) => s.getTechnologyById(project.tecnologia_id ?? ''));

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
      onClick={() => navigate(`/projetos/${project.id}`)}
    >
      {/* Barra colorida no topo */}
      <div
        className="h-1.5 rounded-t-xl"
        style={{ backgroundColor: project.cor }}
      />

      <div className="p-5">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{project.nome}</h3>
            {project.descricao && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{project.descricao}</p>
            )}
          </div>

          <div className="relative shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <MoreVertical size={15} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-8 z-10 bg-white rounded-lg border border-gray-200 shadow-lg py-1 min-w-[140px]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit(project); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pencil size={14} /> Editar
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(project.id); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Badge de tecnologia */}
        {technology && (
          <div className="flex items-center gap-1 mb-2">
            <Cpu size={11} style={{ color: technology.cor }} />
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${technology.cor}18`, color: technology.cor }}
            >
              {technology.nome}
            </span>
          </div>
        )}

        {/* Badge de status */}
        <Badge className={PROJECT_STATUS_COLORS[project.status]}>
          {PROJECT_STATUS_LABELS[project.status]}
        </Badge>

        {/* Tags de tecnologia */}
        {project.tecnologias.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            <Tag size={12} className="text-gray-400 shrink-0" />
            {project.tecnologias.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {tech}
              </span>
            ))}
            {project.tecnologias.length > 3 && (
              <span className="text-xs text-gray-400">+{project.tecnologias.length - 3}</span>
            )}
          </div>
        )}

        {/* Parceiro */}
        {project.parceiro && (
          <div className="flex items-center gap-1.5 mt-2">
            <Building2 size={12} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500">{project.parceiro}</span>
          </div>
        )}

        {/* Data de previsão */}
        {project.data_previsao && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <Calendar size={12} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500">
              Prev.: {formatarData(project.data_previsao)}
            </span>
          </div>
        )}

        {/* Barra de progresso */}
        {tasks.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-500">
                {tarefasConcluidas}/{tasks.length} tarefas
              </span>
              <span className="text-xs font-medium text-gray-700">{progresso}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progresso}%`,
                  backgroundColor: project.cor,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
