import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PAGE_TITLES: Record<string, string> = {
  '/':           'Dashboard',
  '/projetos':   'Projetos',
  '/tarefas':    'Tarefas',
  '/reunioes':   'Reuniões',
  '/relatorios': 'Relatórios',
  '/tecnologias':'Tecnologias',
  '/usuarios':   'Usuários',
};

export function Header() {
  const location = useLocation();

  const titulo =
    Object.entries(PAGE_TITLES)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) =>
        path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
      )?.[1] ?? 'Gestão de Projetos';

  const hoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <header className="h-14 md:h-16 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 flex items-center justify-between shrink-0">
      <div>
        <h1 className="font-display text-base md:text-lg font-semibold text-gray-900 tracking-tight">
          {titulo}
        </h1>
        <p className="hidden sm:block text-xs text-gray-400 capitalize">{hoje}</p>
      </div>

      <div className="flex items-center gap-2">
        {/* Dot indicator: active session */}
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Online" />
      </div>
    </header>
  );
}
