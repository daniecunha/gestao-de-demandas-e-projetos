import { supabase } from './supabase';
import type { Technology, TechnologyFormData } from '../types';

export const technologiesService = {
  listar: async (): Promise<Technology[]> => {
    const { data, error } = await supabase
      .from('technologies')
      .select('*')
      .order('nome', { ascending: true });
    if (error) throw error;
    return data;
  },

  buscarPorId: async (id: string): Promise<Technology> => {
    const { data, error } = await supabase
      .from('technologies')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  criar: async (payload: TechnologyFormData): Promise<Technology> => {
    const { data, error } = await supabase
      .from('technologies')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  atualizar: async (id: string, payload: Partial<TechnologyFormData>): Promise<Technology> => {
    const { data, error } = await supabase
      .from('technologies')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('technologies')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
