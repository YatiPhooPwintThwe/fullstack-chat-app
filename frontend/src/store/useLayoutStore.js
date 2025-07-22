// store/useLayoutStore.js
import { create } from "zustand";

export const useLayoutStore = create((set) => ({
  isSidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));
