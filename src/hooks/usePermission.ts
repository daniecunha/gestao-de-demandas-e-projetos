import { useAuth } from '../contexts/AuthContext';

export function usePermission() {
  const { role } = useAuth();
  return {
    canEdit: role === 'admin',
    isAdmin: role === 'admin',
    role,
  };
}
