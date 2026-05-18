import { create } from 'zustand';
import { tasksService } from '../services/tasksService';
import type { Task, TaskFormData, TaskStatus, FilterState } from '../types';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  viewMode: 'kanban' | 'lista';
  // Ações
  fetchTasks: (projeto_id?: string) => Promise<void>;
  createTask: (data: TaskFormData) => Promise<Task>;
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  setViewMode: (mode: 'kanban' | 'lista') => void;
  getFilteredTasks: () => Task[];
}

const DEFAULT_FILTERS: FilterState = {
  projeto_id: null,
  prioridade: null,
  status: null,
  tecnologia: null,
  busca: '',
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filters: DEFAULT_FILTERS,
  viewMode: 'kanban',

  fetchTasks: async (projeto_id) => {
    set({ loading: true, error: null });
    try {
      const tasks = await tasksService.listar(projeto_id);
      set({ tasks, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  createTask: async (data) => {
    const task = await tasksService.criar(data);
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: async (id, data) => {
    const updated = await tasksService.atualizar(id, data);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  },

  updateTaskStatus: async (id, status) => {
    const updated = await tasksService.atualizarStatus(id, status);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTask: async (id) => {
    await tasksService.excluir(id);
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  resetFilters: () => {
    set({ filters: DEFAULT_FILTERS });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    return tasks.filter((task) => {
      if (filters.projeto_id && task.projeto_id !== filters.projeto_id) return false;
      if (filters.prioridade && task.prioridade !== filters.prioridade) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.busca) {
        const busca = filters.busca.toLowerCase();
        if (!task.titulo.toLowerCase().includes(busca)) return false;
      }
      return true;
    });
  },
}));
