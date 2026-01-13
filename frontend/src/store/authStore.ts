import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserAddress {
    _id: string;
    address: string;
    isDefault: boolean;
}

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    gender?: 'male' | 'female' | 'other';
    phone?: string;
    address?: string; // Keep for backward compatibility
    addresses?: UserAddress[]; // New: array of addresses
    role: string;
    avatar?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    setTokens: (accessToken: string, refreshToken?: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) => {
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                set({
                    user,
                    accessToken,
                    refreshToken,
                    isAuthenticated: true,
                });
            },

            setUser: (user) => {
                set({ user });
            },

            setTokens: (accessToken, refreshToken) => {
                localStorage.setItem('accessToken', accessToken);
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                    set({ refreshToken });
                }
                set({ accessToken });
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

