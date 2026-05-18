import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Meeting, Project } from '../../types';
import { Badge } from '../ui/Badge';
import { MEETING_TYPE_COLORS, MEETING_TYPE_LABELS } from '../../utils/statusUtils';
import { formatarDataHora } from '../../utils/dateUtils';

interface MeetingCardProps {
  meeting: Meeting;
  projects: Project[];
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
}

export function MeetingCard({ meeting, projects, onEdit, onDelete }: MeetingCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const meetingProjects = meeting.projeto_ids
    .map((id) => projectMap.get(id))
    .filter(Boolean) as Project[];

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
      onClick={() => navigate(`/reunioes/${meeting.id}`)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{meeting.titulo}</h3>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {formatarDataHora(meeting.data_hora)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {meeting.duracao_min} min
              </span>
            </div>
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
                  onClick={() => { setMenuOpen(false); onEdit(meeting); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pencil size={14} /> Editar
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(meeting.id); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tipo */}
        <div className="mt-3">
          <Badge className={MEETING_TYPE_COLORS[meeting.tipo]}>
            {MEETING_TYPE_LABELS[meeting.tipo]}
          </Badge>
        </div>

        {/* Participantes */}
        {meeting.participantes.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-500">
            <Users size={12} className="shrink-0" />
            {meeting.participantes.slice(0, 3).join(', ')}
            {meeting.participantes.length > 3 && ` +${meeting.participantes.length - 3}`}
          </div>
        )}

        {/* Projetos relacionados */}
        {meetingProjects.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {meetingProjects.slice(0, 2).map((p) => (
              <span
                key={p.id}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${p.cor}20`, color: p.cor }}
              >
                {p.nome}
              </span>
            ))}
          </div>
        )}

        {/* Contadores */}
        <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
          <span>{meeting.pauta.length} item{meeting.pauta.length !== 1 ? 's' : ''} de pauta</span>
          {meeting.encaminhamentos.length > 0 && (
            <span>{meeting.encaminhamentos.length} encaminhamento{meeting.encaminhamentos.length !== 1 ? 's' : ''}</span>
          )}
          {meeting.decisoes.length > 0 && (
            <span>{meeting.decisoes.length} decisão/ões</span>
          )}
        </div>
      </div>
    </div>
  );
}
