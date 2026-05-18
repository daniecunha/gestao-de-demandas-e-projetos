import { format, parseISO, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/** Formata data ISO para exibição: "15 de mai. de 2026" */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), "d 'de' MMM. 'de' yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

/** Formata data+hora ISO: "15 de mai. 2026 às 14:30" */
export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), "d 'de' MMM. 'de' yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return iso;
  }
}

/** Formata apenas hora: "14:30" */
export function formatarHora(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'HH:mm');
  } catch {
    return iso;
  }
}

/** Formata mês e ano: "Maio 2026" */
export function formatarMesAno(iso: string): string {
  try {
    return format(parseISO(iso), 'MMMM yyyy', { locale: ptBR })
      .replace(/^\w/, (c) => c.toUpperCase());
  } catch {
    return iso;
  }
}

/** Rótulo relativo do prazo */
export function labelPrazo(prazo: string | null | undefined): string {
  if (!prazo) return 'Sem prazo';
  const date = parseISO(prazo);
  if (isToday(date)) return 'Hoje';
  if (isTomorrow(date)) return 'Amanhã';
  const diff = differenceInDays(date, new Date());
  if (diff < 0) return `${Math.abs(diff)}d atrasado`;
  if (diff <= 7) return `Em ${diff} dias`;
  return formatarData(prazo);
}

/** Retorna true se o prazo está vencido */
export function prazoVencido(prazo: string | null | undefined): boolean {
  if (!prazo) return false;
  return isPast(parseISO(prazo)) && !isToday(parseISO(prazo));
}

/** Converte input[type=date] para ISO date string */
export function inputParaISO(valor: string | null | undefined): string | null {
  return valor || null;
}

/** Converte ISO date string para valor de input[type=date] */
export function ISOParaInput(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return iso.split('T')[0];
  } catch {
    return '';
  }
}

/** Retorna o primeiro e último dia do mês de uma data ISO */
export function limitesMes(iso: string): { inicio: string; fim: string } {
  const date = parseISO(iso);
  const inicio = format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
  const fim = format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd');
  return { inicio, fim };
}
