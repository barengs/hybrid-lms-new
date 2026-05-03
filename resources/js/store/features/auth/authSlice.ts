import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
  isLocked: boolean;
}

const getUserFromStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem('hlms_user') || 'null');
    // Self-heal: Map role from roles if missing (legacy/API structure mismatch fix)
    if (user && !user.role && user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      user.role = user.roles[0].name;
    }
    return user;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromStorage(),
  token: localStorage.getItem('auth_token'),
  expiresAt: localStorage.getItem('auth_token_expires_at'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  isLocked: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; expiresAt?: string }>
    ) => {
      const { user, token, expiresAt } = action.payload;
      state.user = user;
      state.token = token;
      state.expiresAt = expiresAt || null;
      state.isAuthenticated = true;
      localStorage.setItem('hlms_user', JSON.stringify(user));
      localStorage.setItem('auth_token', token);
      if (expiresAt) {
        localStorage.setItem('auth_token_expires_at', expiresAt);
      }
    },
    updateToken: (
      state,
      action: PayloadAction<{ token: string; expiresAt: string }>
    ) => {
      const { token, expiresAt } = action.payload;
      state.token = token;
      state.expiresAt = expiresAt;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_token_expires_at', expiresAt);
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.expiresAt = null;
      state.isAuthenticated = false;
      state.isLocked = false;
      localStorage.removeItem('hlms_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_token_expires_at');
    },
    setLocked: (state, action: PayloadAction<boolean>) => {
      state.isLocked = action.payload;
    },
    updateOnboardingStatus: (state, action: PayloadAction<boolean>) => {
      if (state.user && state.user.profile) {
        state.user.profile.onboarding_completed = action.payload;
        localStorage.setItem('hlms_user', JSON.stringify(state.user));
      }
    },
  },
});

export const { setCredentials, updateToken, logOut, setLocked, updateOnboardingStatus } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentToken = (state: { auth: AuthState }) => state.auth.token;
export const selectTokenExpiresAt = (state: { auth: AuthState }) => state.auth.expiresAt;
export const selectIsLocked = (state: { auth: AuthState }) => state.auth.isLocked;
