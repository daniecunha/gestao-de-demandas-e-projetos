import { supabase } from './supabase';
import type { Task, TaskFormData, TaskStatus } from '../types';

export const tasksService = {
  // Only returns active (non-archived) tasks
  listar: async (projeto_id?: string): Promise<Task[]> => {
    let query = supabase
      .from('tasks')
      .select('*')
      .is('arquivado_em', null)
      .order('criado_em', { ascending: false });
    if (projeto_id) query = query.eq('projeto_id', projeto_id);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  listarArquivadas: async (projeto_id?: string): Promise<Task[]> => {
    let query = supabase
      .from('tasks')
      .select('*')
      .not('arquivado_em', 'is', null)
      .order('arquivado_em', { ascending: false });
    if (projeto_id) query = query.eq('projeto_id', projeto_id);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  buscarPorId: async (id: string): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  criar: async (payload: TaskFormData): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  atualizar: async (id: string, payload: Partial<TaskFormData>): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  atualizarStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    const payload: Record<string, unknown> = { status };
    if (status === 'concluido') payload.concluido_em = new Date().toISOString();
    const { data, error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  arquivar: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('tasks')
      .update({ arquivado_em: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  desarquivar: async (id: string): Promise<Task> => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ arquivado_em: null })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  listarHoje: async (): Promise<Task[]> => {
    const hoje = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .lte('prazo', hoje)
      .is('arquivado_em', null)
      .not('status', 'in', '("concluido","cancelado","bloqueado")')
      .order('prioridade', { ascending: true });
    if (error) throw error;
    return data;
  },
};
