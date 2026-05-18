import { supabase } from './supabase';

export type UserRole = 'admin' | 'consulta';

export interface UserProfile {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
  criado_em: string;
}

export const usersService = {
  listar: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('criado_em', { ascending: true });
    if (error) throw error;
    return data;
  },

  buscarPorEmail: async (email: string): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  criar: async (email: string, nome: string, role: UserRole): Promise<UserProfile> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({ email, nome, role })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  atualizarRole: async (id: string, role: UserRole): Promise<UserProfile> => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  excluir: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
