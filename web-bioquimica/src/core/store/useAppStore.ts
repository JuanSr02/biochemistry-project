import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  activeModule: string | null;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveModule: (module: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  activeModule: null,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setActiveModule: (module) => set({ activeModule: module }),
}));
