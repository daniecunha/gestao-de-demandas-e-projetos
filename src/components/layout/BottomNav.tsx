import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, FolderKanban, CheckSquare, CalendarDays, BarChart3,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Início'      },
  { to: '/tecnologias', icon: Cpu,             label: 'Tecnologias' },
  { to: '/projetos',    icon: FolderKanban,    label: 'Projetos'    },
  { to: '/tarefas',     icon: CheckSquare,     label: 'Tarefas'     },
  { to: '/reunioes',    icon: CalendarDays,    label: 'Reuniões'    },
  { to: '/relatorios',  icon: BarChart3,       label: 'Relatórios'  },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-sm border-t border-gray-200 flex items-stretch safe-area-pb">
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const isActive =
          to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
        return (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
          >
            <Icon
              size={20}
              className={isActive ? 'text-blue-600' : 'text-gray-400'}
            />
            <span
              className={[
                'text-[9px] font-medium leading-none font-display tracking-tight',
                isActive ? 'text-blue-600' : 'text-gray-400',
              ].join(' ')}
            >
              {label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
