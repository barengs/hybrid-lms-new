import { createContext, useContext, useCallback, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store';
import { useLoginMutation, useLogoutMutation, useRegisterMutation, useRefreshMutation } from '@/store/features/auth/authApiSlice';
import { setCredentials, updateToken, logOut, selectCurrentUser, selectTokenExpiresAt, selectIsLocked, setLocked } from '@/store/features/auth/authSlice';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLocked: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => void;
  unlock: (password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users removed as we are using API


export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const expiresAt = useAppSelector(selectTokenExpiresAt);
  const isLocked = useAppSelector(selectIsLocked);
  const [loginApi, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logoutApi, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const [registerApi, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [refreshApi] = useRefreshMutation();
  
  // Track last activity time for auto-logout
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  const isLoading = isLoginLoading || isLogoutLoading || isRegisterLoading;

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await loginApi({ email, password }).unwrap();
      
      // Backend response structure:
      // {
      //   "message": "Login successful.",
      //   "data": {
      //     "user": { ... },
      //     "token": "...",
      //     "token_type": "Bearer",
      //     "expires_at": "2019-08-24T14:15:22Z"  // Optional
      //   }
      // }
      
      const data = response.data;
      const token = data?.token;
      const expiresAt = data?.expires_at;
      let userData = data?.user;

      if (token && userData) {
        // Map API roles array to frontend single role
        // Backend returns: roles: [{ name: 'admin' }, ...]
        // Frontend expects: role: 'admin'
        if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
           const roleName = userData.roles[0].name;
          //  console.log('Mapping role:', roleName);
           userData = { ...userData, role: roleName };
        } else {
           console.warn('No roles found in user data or format incorrect', userData);
        }
        
        // console.log('Dispatching credentials with:', userData);
        dispatch(setCredentials({ user: userData, token, expiresAt }));
        
        // Reset activity timer on login
        setLastActivityTime(Date.now());
        dispatch(setLocked(false));
      } else {
        // Fallback for debugging if structure is different
        console.error('Invalid API response structure', response);
        throw new Error('Login failed: Invalid server response');
      }
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  }, [dispatch, loginApi]);

  const unlock = useCallback(async (password: string) => {
    if (!user) return;
    try {
      // Re-verify password via login endpoint
      await loginApi({ email: user.email, password }).unwrap();
      dispatch(setLocked(false));
      setLastActivityTime(Date.now());
    } catch (error) {
      console.error('Unlock failed', error);
      throw error;
    }
  }, [user, loginApi, dispatch]);

  const logout = useCallback(async () => {
    try {
      await logoutApi().unwrap();
    } catch (error) {
      console.warn('Logout failed on server', error);
    } finally {
      dispatch(logOut());
    }
  }, [dispatch, logoutApi]);

  const register = useCallback(async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      const response = await registerApi({ 
        name, 
        email, 
        password,
        password_confirmation
      }).unwrap();
      
      // Assuming auto-login after register or just success message?
      // User request did not specify response structure, but usually standard flow is login after register
      // OR user has to login manually.
      // Let's assume manual login for safety, OR check if token is returned.
      
      const data = response.data;
      const token = data?.token;
      let userData = data?.user;
      
      if (token && userData) {
         if (userData.roles && Array.isArray(userData.roles) && userData.roles.length > 0) {
           userData = { ...userData, role: userData.roles[0].name };
        }
        dispatch(setCredentials({ user: userData, token }));
      }
      
      // If no token, caller (RegisterPage) handles navigation or success message
    } catch (error) {
      console.error('Registration failed', error);
      throw error;
    }
  }, [dispatch, registerApi]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
     // Placeholder for profile update
     console.log('Update profile not yet implemented via API', data);
  }, []);

  // Activity tracking: Update last activity time
  const handleActivity = useCallback(() => {
    if (user && !isLocked) {
      setLastActivityTime(Date.now());
    }
  }, [user, isLocked]);

  // Set up activity listeners
  useEffect(() => {
    if (!user || isLocked) return;

    let debounceTimeout: number;

    const debouncedHandleActivity = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(handleActivity, 300);
    };

    // Listen to various user activity events
    const events = ['mousemove', 'keydown', 'touchstart', 'scroll', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, debouncedHandleActivity);
    });

    return () => {
      clearTimeout(debounceTimeout);
      events.forEach(event => {
        window.removeEventListener(event, debouncedHandleActivity);
      });
    };
  }, [user, isLocked, handleActivity]);

  // Token refresh and auto-logout timer
  useEffect(() => {
    if (!user) return;

    const THIRTY_MINUTES = 30 * 60 * 1000;
    const SIXTY_MINUTES = 60 * 60 * 1000;
    const FIVE_MINUTES = 5 * 60 * 1000;

    const checkTokenAndActivity = async () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityTime;

      // Check for 30 minutes of inactivity -> lock screen
      if (timeSinceLastActivity >= THIRTY_MINUTES && !isLocked) {
        console.log('Screen locked: 30 minutes of inactivity detected');
        dispatch(setLocked(true));
        return;
      }

      // Check for 60 minutes of inactivity -> auto-logout
      if (timeSinceLastActivity >= SIXTY_MINUTES) {
        console.log('Auto-logout: 60 minutes of inactivity detected');
        try {
          await logoutApi().unwrap();
        } catch (error) {
          console.warn('Logout API call failed during auto-logout', error);
        } finally {
          dispatch(logOut());
        }
        return;
      }

      // Check if token is expiring soon and user is active
      if (expiresAt) {
        const expiresAtMs = new Date(expiresAt).getTime();
        const timeUntilExpiry = expiresAtMs - now;

        // If token expires in less than 5 minutes and user is active, refresh it
        if (timeUntilExpiry < FIVE_MINUTES && timeUntilExpiry > 0 && !isLocked) {
          console.log('Token expiring soon, refreshing...');
          try {
            const response = await refreshApi().unwrap();
            const data = response.data;
            const newToken = data?.token;
            const newExpiresAt = data?.expires_at;

            if (newToken && newExpiresAt) {
              console.log('Token refreshed successfully');
              dispatch(updateToken({ token: newToken, expiresAt: newExpiresAt }));
            }
          } catch (error) {
            console.error('Token refresh failed, logging out user', error);
            try {
              await logoutApi().unwrap();
            } catch (logoutError) {
              console.warn('Logout API call failed after refresh failure', logoutError);
            } finally {
              dispatch(logOut());
            }
          }
        }
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkTokenAndActivity, 30 * 1000);

    // Also check immediately on mount
    checkTokenAndActivity();

    return () => clearInterval(interval);
  }, [user, expiresAt, lastActivityTime, isLocked, refreshApi, logoutApi, dispatch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLocked,
        isLoading,
        login,
        register,
        logout,
        unlock,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
