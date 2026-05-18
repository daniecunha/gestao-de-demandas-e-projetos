import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAuthorized, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && !isAuthorized) {
      signOut().then(() => navigate('/login?denied=1', { replace: true }));
    }
  }, [loading, user, isAuthorized]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm">Verificando acesso...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
