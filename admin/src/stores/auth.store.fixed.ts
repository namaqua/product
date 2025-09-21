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
  isHydrated: boolean; // Track if store has been hydrated from localStorage
  
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
        console.log('[AuthStore] Store hydrated');
        set({ isHydrated: true });
      },

      login: async (credentials: LoginDto) => {
        set({ isLoading: true, error: null });
        try {
          console.log('[AuthStore] Attempting login...');
          const response = await authService.login(credentials);
          
          // Check if we have the tokens
          if (response.accessToken) {
            console.log('[AuthStore] Login successful');
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
        } finally {
          // Clear tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          
          // Clear persisted auth storage
          localStorage.removeItem('auth-storage');
          
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
        
        console.log('[AuthStore] Loading user, token exists:', !!token);
        
        if (!token) {
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        // We have a token, so user is authenticated
        // The user data should already be in the persisted state
        const currentState = get();
        
        if (currentState.user) {
          console.log('[AuthStore] User data found in state');
          set({
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Try to fetch user profile
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
            // Token might be invalid
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
        // Return a function that will be called after rehydration
        return (rehydratedState, error) => {
          if (error) {
            console.error('[AuthStore] Rehydration error:', error);
          } else {
            console.log('[AuthStore] Rehydration complete');
            // Call setHydrated after successful rehydration
            rehydratedState?.setHydrated();
            
            // Check if we need to validate the stored auth state
            if (rehydratedState?.isAuthenticated) {
              const token = localStorage.getItem('access_token');
              if (!token) {
                console.log('[AuthStore] No token found, clearing auth state');
                // No token but authenticated state - clear it
                rehydratedState.logout();
              }
            }
          }
        };
      },
    }
  )
);
