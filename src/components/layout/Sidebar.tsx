import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, FolderKanban, CheckSquare,
  CalendarDays, BarChart3, ChevronLeft, ChevronRight,
  Zap, LogOut, Users,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/tecnologias', icon: Cpu,             label: 'Tecnologias' },
  { to: '/projetos',    icon: FolderKanban,    label: 'Projetos'    },
  { to: '/tarefas',     icon: CheckSquare,     label: 'Tarefas'     },
  { to: '/reunioes',    icon: CalendarDays,    label: 'Reuniões'    },
  { to: '/relatorios',  icon: BarChart3,       label: 'Relatórios'  },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, role, signOut } = useAuth();
  const location = useLocation();

  const avatarUrl   = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? 'Usuário';
  const firstName   = displayName.split(' ')[0];

  return (
    <aside
      className={[
        'h-screen text-white hidden md:flex flex-col shrink-0 transition-all duration-300',
        // Subtle gradient adds depth to the dark sidebar without changing the hue
        'bg-gradient-to-b from-gray-800 to-gray-900 shadow-sidebar',
        sidebarOpen ? 'w-56' : 'w-16',
      ].join(' ')}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shrink-0 shadow-md">
          <Zap size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-display font-semibold text-sm leading-tight text-white/90 tracking-tight">
            Gestão de<br />Projetos
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
              ].join(' ')}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={17} className="shrink-0" />
              {sidebarOpen && (
                <span className="font-display tracking-tight">{label}</span>
              )}
            </NavLink>
          );
        })}

        {/* Usuários — admin only */}
        {role === 'admin' && (
          <>
            <div className="border-t border-white/10 my-2" />
            <NavLink
              to="/usuarios"
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                location.pathname === '/usuarios'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white',
              ].join(' ')}
              title={!sidebarOpen ? 'Usuários' : undefined}
            >
              <Users size={17} className="shrink-0" />
              {sidebarOpen && (
                <span className="font-display tracking-tight">Usuários</span>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="px-2 pb-2 border-t border-white/10 pt-3">
        <div
          className={['flex items-center gap-2 px-3 py-2 rounded-lg', !sidebarOpen && 'justify-center'].join(' ')}
          title={!sidebarOpen ? displayName : undefined}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full shrink-0 ring-2 ring-white/20" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-xs font-bold font-display">
              {firstName[0]?.toUpperCase()}
            </div>
          )}
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-200 truncate font-display">{firstName}</p>
              {role && (
                <p className="text-[10px] text-gray-500 capitalize">
                  {role === 'admin' ? 'Administrador' : 'Consulta'}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={signOut}
          className={[
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400',
            'hover:bg-red-500/20 hover:text-red-300 transition-all duration-150 text-sm',
            'focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900',
            !sidebarOpen && 'justify-center',
          ].join(' ')}
          title="Sair"
        >
          <LogOut size={15} className="shrink-0" />
          {sidebarOpen && <span className="font-display text-xs tracking-tight">Sair</span>}
        </button>
      </div>

      {/* Toggle */}
      <div className="px-2 pb-4">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-white/10 hover:text-white transition-all duration-150 text-sm focus-visible:ring-2 focus-visible:ring-white/30"
          title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen
            ? <><ChevronLeft size={15} /><span className="font-display text-xs tracking-tight">Recolher</span></>
            : <ChevronRight size={15} />}
        </button>
      </div>
    </aside>
  );
}
