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
        'h-screen bg-gray-900 text-white hidden md:flex flex-col shrink-0 transition-all duration-300',
        sidebarOpen ? 'w-56' : 'w-16',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-700">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <Zap size={16} className="text-white" />
        </div>
        {sidebarOpen && (
          <span className="font-semibold text-sm leading-tight">
            Gestão de<br />Projetos
          </span>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              ].join(' ')}
              title={!sidebarOpen ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          );
        })}

        {/* Item Usuários — visível apenas para admin */}
        {role === 'admin' && (
          <>
            <div className="border-t border-gray-700 my-2" />
            <NavLink
              to="/usuarios"
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                location.pathname === '/usuarios'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              ].join(' ')}
              title={!sidebarOpen ? 'Usuários' : undefined}
            >
              <Users size={18} className="shrink-0" />
              {sidebarOpen && <span>Usuários</span>}
            </NavLink>
          </>
        )}
      </nav>

      {/* Usuário + Logout */}
      <div className="px-2 pb-2 border-t border-gray-700 pt-3">
        <div
          className={['flex items-center gap-2 px-3 py-2 rounded-lg', !sidebarOpen && 'justify-center'].join(' ')}
          title={!sidebarOpen ? displayName : undefined}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full shrink-0 ring-1 ring-gray-600" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-xs font-bold">
              {firstName[0]?.toUpperCase()}
            </div>
          )}
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300 truncate">{firstName}</p>
              {role && (
                <p className="text-[10px] text-gray-500 capitalize">{role === 'admin' ? 'Administrador' : 'Consulta'}</p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={signOut}
          className={['w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-red-900/40 hover:text-red-300 transition-colors text-sm', !sidebarOpen && 'justify-center'].join(' ')}
          title="Sair"
        >
          <LogOut size={16} className="shrink-0" />
          {sidebarOpen && <span>Sair</span>}
        </button>
      </div>

      {/* Toggle */}
      <div className="px-2 pb-4">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm"
          title={sidebarOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          {sidebarOpen ? <><ChevronLeft size={16} /><span>Recolher</span></> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}
