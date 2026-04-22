import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();



  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'instructor':
        return <Navigate to="/instructor" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'instructor':
        return <Navigate to="/instructor" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
