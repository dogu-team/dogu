import { UserBase } from '@dogu-private/console';
import { create } from 'zustand';

interface AuthState {
  me: UserBase | null;
  updateMe: (user: UserBase | null) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  me: null,
  updateMe: (me) => set({ me }),
}));

export default useAuthStore;
