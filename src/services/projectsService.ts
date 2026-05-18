import { supabase } from './supabase';
import type { Project, ProjectFormData } from '../types';

export const projectsService = {
  listar: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data;
  },

  buscarPorId: async (id: string): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  criar: async (payload: ProjectFormData): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  atualizar: async (id: string, payload: Partial<ProjectFormData>): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
