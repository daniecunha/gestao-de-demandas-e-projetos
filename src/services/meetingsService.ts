import { supabase } from './supabase';
import type { Meeting, MeetingFormData } from '../types';

export const meetingsService = {
  listar: async (): Promise<Meeting[]> => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('data_hora', { ascending: false });
    if (error) throw error;
    return data;
  },

  listarProximas: async (): Promise<Meeting[]> => {
    const agora = new Date().toISOString();
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .gte('data_hora', agora)
      .order('data_hora', { ascending: true })
      .limit(5);
    if (error) throw error;
    return data;
  },

  buscarPorId: async (id: string): Promise<Meeting> => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  criar: async (payload: MeetingFormData): Promise<Meeting> => {
    const { data, error } = await supabase
      .from('meetings')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  atualizar: async (id: string, payload: Partial<MeetingFormData>): Promise<Meeting> => {
    const { data, error } = await supabase
      .from('meetings')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
