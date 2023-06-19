import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CollapsibleSidebarStore {
  collapsed: boolean;
  updateCollapsed: () => void;
}

const useCollapsibleSidebar = create<CollapsibleSidebarStore>()(
  persist(
    (set, get) => ({
      collapsed: false,
      updateCollapsed: () => set({ collapsed: !get().collapsed }),
    }),
    { name: 'sidebar-option', storage: createJSONStorage(() => localStorage) },
  ),
);

export default useCollapsibleSidebar;
