import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import authService from '../services/auth.service';
import { authEvents } from '../services/api';
import { User, LoginDto, RegisterDto } from '../types/api.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  setHydrated: () => void;
}

// Subscribe to auth events from API
authEvents.addEventListener('logout', () => {
  const store = useAuthStore.getState();
  store.logout();
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isHydrated: false,

      setHydrated: () => {
        console.log('[AuthStore] Marking as hydrated');
        set({ isHydrated: true });
      },

      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });
        try {
          console.log('[AuthStore] Attempting login...');
          const response = await authService.login(credentials);
          
          if (response.accessToken) {
            console.log('[AuthStore] Login successful');
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
          console.error('[AuthStore] Login error:', error);
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
        console.log('[AuthStore] Logging out...');
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          console.error('[AuthStore] Logout error:', error);
        }
        
        // Clear everything
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('auth-storage');
        
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      loadUser: async () => {
        const token = localStorage.getItem('access_token');
        console.log('[AuthStore] Loading user, token exists:', !!token);
        
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        const currentState = get();
        if (currentState.user) {
          console.log('[AuthStore] User data found in state');
          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          try {
            console.log('[AuthStore] Fetching user profile...');
            const userProfile = await authService.getProfile();
            set({
              isAuthenticated: true,
              isLoading: false,
              user: userProfile as User,
            });
          } catch (error) {
            console.error('[AuthStore] Failed to load user profile:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({
              isAuthenticated: false,
              isLoading: false,
              user: null,
            });
          }
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
        console.log('[AuthStore] Starting rehydration...');
        return (rehydratedState, error) => {
          if (error) {
            console.error('[AuthStore] Rehydration error:', error);
            // Even on error, mark as hydrated so app can proceed
            state?.setHydrated();
          } else {
            console.log('[AuthStore] Rehydration complete');
            
            // Validate stored state against tokens
            const token = localStorage.getItem('access_token');
            if (rehydratedState?.isAuthenticated && !token) {
              console.log('[AuthStore] Invalid auth state, clearing...');
              rehydratedState.isAuthenticated = false;
              rehydratedState.user = null;
            }
            
            // Mark as hydrated
            state?.setHydrated();
          }
        };
      },
    }
  )
);

// Ensure hydration happens even if persist fails
setTimeout(() => {
  const state = useAuthStore.getState();
  if (!state.isHydrated) {
    console.warn('[AuthStore] Force hydrating after timeout');
    state.setHydrated();
  }
}, 1000);
