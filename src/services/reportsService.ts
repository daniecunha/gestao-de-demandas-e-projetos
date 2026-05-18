import { supabase } from './supabase';
import type { Report, ReportFormData } from '../types';

export const reportsService = {
  listar: async (): Promise<Report[]> => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('gerado_em', { ascending: false });
    if (error) throw error;
    return data;
  },

  buscarPorId: async (id: string): Promise<Report> => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  criar: async (payload: ReportFormData): Promise<Report> => {
    const { data, error } = await supabase
      .from('reports')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  atualizar: async (id: string, payload: Partial<ReportFormData>): Promise<Report> => {
    const { data, error } = await supabase
      .from('reports')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  marcarExportado: async (id: string): Promise<Report> => {
    const { data, error } = await supabase
      .from('reports')
      .update({ exportado_em: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
