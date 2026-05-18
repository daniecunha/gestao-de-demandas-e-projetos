import { create } from 'zustand';
import { technologiesService } from '../services/technologiesService';
import type { Technology, TechnologyFormData } from '../types';

interface TechnologiesState {
  technologies: Technology[];
  loading: boolean;
  error: string | null;
  fetchTechnologies: () => Promise<void>;
  createTechnology: (data: TechnologyFormData) => Promise<Technology>;
  updateTechnology: (id: string, data: Partial<TechnologyFormData>) => Promise<void>;
  deleteTechnology: (id: string) => Promise<void>;
  getTechnologyById: (id: string) => Technology | undefined;
}

export const useTechnologiesStore = create<TechnologiesState>((set, get) => ({
  technologies: [],
  loading: false,
  error: null,

  fetchTechnologies: async () => {
    set({ loading: true, error: null });
    try {
      const technologies = await technologiesService.listar();
      set({ technologies, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createTechnology: async (data) => {
    const technology = await technologiesService.criar(data);
    set((state) => ({ technologies: [...state.technologies, technology] }));
    return technology;
  },

  updateTechnology: async (id, data) => {
    const updated = await technologiesService.atualizar(id, data);
    set((state) => ({
      technologies: state.technologies.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTechnology: async (id) => {
    await technologiesService.excluir(id);
    set((state) => ({
      technologies: state.technologies.filter((t) => t.id !== id),
    }));
  },

  getTechnologyById: (id) => {
    return get().technologies.find((t) => t.id === id);
  },
}));
