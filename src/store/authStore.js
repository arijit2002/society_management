import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      societyInfo: null,
      setUser: (user) => set({ user }),
      setSocietyInfo: (info) => set({ societyInfo: info }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'society-auth',
      partialize: (state) => ({ user: state.user, societyInfo: state.societyInfo }),
    }
  )
);
