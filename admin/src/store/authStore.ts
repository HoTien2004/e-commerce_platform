import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitialized: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      isInitialized: false,

      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isAdmin: user.role === 'admin',
          isInitialized: true,
        });
      },

      setUser: (user) => {
        set({
          user,
          isAdmin: user.role === 'admin',
        });
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
          isInitialized: true,
        });
      },

      initialize: () => {
        const token = localStorage.getItem('accessToken');
        const storedUser = get().user;
        
        // If no token, clear everything
        if (!token) {
          set({
            isAuthenticated: false,
            isAdmin: false,
            isInitialized: true,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          return;
        }

        // If token exists but no user in store, verify token
        if (token && !storedUser) {
          // Token exists but user info is missing - need to verify
          set({
            isAuthenticated: false,
            isAdmin: false,
            isInitialized: true,
          });
          return;
        }

        // If both token and user exist, set authenticated state
        if (token && storedUser) {
          set({
            accessToken: token,
            refreshToken: localStorage.getItem('refreshToken'),
            isAuthenticated: true,
            isAdmin: storedUser.role === 'admin',
            isInitialized: true,
          });
        } else {
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
        // Don't persist isAuthenticated and isAdmin - verify on init
      }),
    }
  )
);

