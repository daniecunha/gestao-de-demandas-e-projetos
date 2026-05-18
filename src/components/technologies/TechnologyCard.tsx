import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  MoreVertical, Pencil, Trash2, FolderKanban,
  Zap, Database, Bot, Brain, Cpu, Globe, Settings, Code2, Server, Layers,
  Plane, Truck, Factory, Workflow,
} from 'lucide-react';
import type { Technology } from '../../types';
import { usePermission } from '../../hooks/usePermission';

const ICON_MAP: Record<string, React.ElementType> = {
  zap: Zap, database: Database, bot: Bot, brain: Brain, cpu: Cpu,
  globe: Globe, settings: Settings, code: Code2, server: Server, layers: Layers,
  plane: Plane, truck: Truck, factory: Factory, workflow: Workflow,
};

interface TechnologyCardProps {
  technology: Technology;
  projectCount: number;
  onEdit: (technology: Technology) => void;
  onDelete: (id: string) => void;
}

export function TechnologyCard({ technology, projectCount, onEdit, onDelete }: TechnologyCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { canEdit } = usePermission();
  const IconComponent = ICON_MAP[technology.icone] ?? Cpu;

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
      onClick={() => navigate(`/tecnologias/${technology.id}`)}
    >
      <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: technology.cor }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${technology.cor}20` }}
            >
              <IconComponent size={20} style={{ color: technology.cor }} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{technology.nome}</h3>
              {technology.descricao && (
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{technology.descricao}</p>
              )}
            </div>
          </div>

          {canEdit && (
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
                    onClick={() => { setMenuOpen(false); onEdit(technology); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Pencil size={14} /> Editar
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(technology.id); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-3">
          <FolderKanban size={13} className="text-gray-400" />
          <span className="text-xs text-gray-500">
            {projectCount} projeto{projectCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
