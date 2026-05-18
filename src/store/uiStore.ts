import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  modalAberto: string | null; // identificador do modal ativo
  // Preferências persistidas
  temaEscuro: boolean;
  // Ações
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  abrirModal: (id: string) => void;
  fecharModal: () => void;
  toggleTema: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      modalAberto: null,
      temaEscuro: false,

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      abrirModal: (id) => set({ modalAberto: id }),

      fecharModal: () => set({ modalAberto: null }),

      toggleTema: () =>
        set((state) => ({ temaEscuro: !state.temaEscuro })),
    }),
    {
      name: 'ui-preferences',
      partialize: (state) => ({ temaEscuro: state.temaEscuro, sidebarOpen: state.sidebarOpen }),
    }
  )
);
