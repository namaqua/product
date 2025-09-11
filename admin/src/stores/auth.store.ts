import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import authService from '../services/auth.service';
import { User, LoginDto, RegisterDto } from '../types/api.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean; // Track if store has been hydrated from localStorage
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isHydrated: false,

      setHydrated: () => {
        set({ isHydrated: true });
      },

      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          
          // Check if we have the tokens
          if (response.accessToken) {
            // Mark as authenticated even if user object is missing
            set({
              user: response.user || { email: credentials.email } as User,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('No access token received');
          }
        } catch (error: any) {
          console.error('Login error:', error);
          set({
            error: error.response?.data?.message || error.message || 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      register: async (data: RegisterDto) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            user: response.user || { email: data.email } as User,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      loadUser: async () => {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        // We have a token, so user is authenticated
        // The user data should already be in the persisted state
        const currentState = get();
        
        if (currentState.user) {
          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // No user data but we have a token
          // This shouldn't happen but handle it gracefully
          set({
            isAuthenticated: true,
            isLoading: false,
            // Create a minimal user object from what we know
            user: { email: 'user@example.com' } as User,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when the store has been rehydrated from localStorage
        state?.setHydrated();
      },
    }
  )
);
