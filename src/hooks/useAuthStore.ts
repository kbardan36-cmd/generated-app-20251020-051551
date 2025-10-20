import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
interface User {
  name: string;
  email: string;
}
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
interface AuthActions {
  login: (user: User) => void;
  logout: () => void;
  register: (user: User) => void;
}
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
      register: (user) => set({ isAuthenticated: true, user }),
    }),
    {
      name: 'nexus-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);