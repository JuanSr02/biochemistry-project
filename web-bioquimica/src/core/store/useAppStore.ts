import { create } from 'zustand';

interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
}

interface AppState {
  // UI global
  sidebarOpen: boolean;
  activeModule: string | null;

  // Sesión de usuario (fuente de verdad global del cliente)
  usuario: UsuarioSesion | null;

  // Acciones
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveModule: (module: string | null) => void;
  setUsuario: (user: UsuarioSesion | null) => void;
  clearUsuario: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  activeModule: null,
  usuario: null,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setActiveModule: (module) => set({ activeModule: module }),
  setUsuario: (user) => set({ usuario: user }),
  clearUsuario: () => set({ usuario: null }),
}));
