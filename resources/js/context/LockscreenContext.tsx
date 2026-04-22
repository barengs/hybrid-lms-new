import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface LockscreenContextType {
  isLocked: boolean;
  unlock: (email: string) => Promise<boolean>;
  resetTimer: () => void;
}

const LockscreenContext = createContext<LockscreenContextType | undefined>(undefined);

// 60 minutes in milliseconds
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 3600000ms
// For testing, you can temporarily use: const INACTIVITY_TIMEOUT = 10 * 1000; // 10 seconds

export function LockscreenProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [isLocked, setIsLocked] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Reset activity timer
  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Debounced activity handler to avoid excessive updates
  const handleActivity = useCallback(() => {
    // Only track activity if user is authenticated and not locked
    if (isAuthenticated && !isLocked) {
      resetTimer();
    }
  }, [isAuthenticated, isLocked, resetTimer]);

  // Unlock function - verify email matches current user
  const unlock = useCallback(async (email: string): Promise<boolean> => {
    if (!user) return false;
    
    // Case-insensitive email comparison
    const isEmailValid = user.email.toLowerCase() === email.toLowerCase();
    
    if (isEmailValid) {
      setIsLocked(false);
      resetTimer();
      return true;
    }
    
    return false;
  }, [user, resetTimer]);

  // Set up inactivity timer
  useEffect(() => {
    if (!isAuthenticated) {
      // If user is not authenticated, unlock and don't track
      setIsLocked(false);
      return;
    }

    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT && !isLocked) {
        setIsLocked(true);
      }
    }, 1000); // Check every second

    return () => clearInterval(checkInactivity);
  }, [isAuthenticated, lastActivity, isLocked]);

  // Set up activity listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Debounce timeout to avoid excessive updates
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
  }, [isAuthenticated, handleActivity]);

  // Unlock when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLocked(false);
    }
  }, [isAuthenticated]);

  return (
    <LockscreenContext.Provider
      value={{
        isLocked,
        unlock,
        resetTimer,
      }}
    >
      {children}
    </LockscreenContext.Provider>
  );
}

export function useLockscreen() {
  const context = useContext(LockscreenContext);
  if (context === undefined) {
    throw new Error('useLockscreen must be used within a LockscreenProvider');
  }
  return context;
}
