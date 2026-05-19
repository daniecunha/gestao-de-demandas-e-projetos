import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/':           'Dashboard',
  '/projetos':   'Projetos',
  '/tarefas':    'Tarefas',
  '/reunioes':   'Reuniões',
  '/relatorios': 'Relatórios',
};

export function Header() {
  const location = useLocation();

  // Resolve o título pela rota mais específica que fizer match
  const titulo =
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
      )?.[1] ?? 'Gestão de Projetos';

  const hoje = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <header className="h-14 md:h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-base md:text-lg font-semibold text-gray-900">{titulo}</h1>
        <p className="hidden sm:block text-xs text-gray-500 capitalize">{hoje}</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors relative"
          aria-label="Notificações"
        >
          <Bell size={18} />
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">
          D
        </div>
      </div>
    </header>
  );
}
