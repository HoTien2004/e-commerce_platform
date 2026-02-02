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
        // This function is called on app start
        // It sets temporary auth state from persisted data, actual verification happens in ProtectedRoute
        const token = localStorage.getItem('accessToken');
        const storedUser = get().user;
        const storedAccessToken = get().accessToken;
        
        // Sync tokens from localStorage if they exist
        if (token && !storedAccessToken) {
          set({
            accessToken: token,
            refreshToken: localStorage.getItem('refreshToken'),
          });
        }
        
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

        // If token and user exist in persisted state, set temporary auth state
        // This prevents logout during reload while verification is happening
        if (token && storedUser && storedUser.role === 'admin') {
          set({
            accessToken: token,
            refreshToken: localStorage.getItem('refreshToken'),
            isAuthenticated: true,
            isAdmin: true,
            isInitialized: true,
          });
        } else {
          // Mark as initialized but not authenticated - will verify in ProtectedRoute
          set({ isInitialized: true });
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        // Don't persist isAuthenticated and isAdmin - verify on init
      }),
    }
  )
);

