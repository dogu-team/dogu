import { UserBase } from '@dogu-private/console';
import { create } from 'zustand';

interface AuthState {
  me: UserBase | null;
  updateAuthStore: (user: UserBase | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  me: null,
  updateAuthStore: (me) => set({ me }),
}));

export default useAuthStore;
