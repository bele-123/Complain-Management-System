import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RolePermissions } from '@/types/user';

interface PermissionGateProps {
  children: ReactNode;
  resource: keyof RolePermissions;
  action: keyof RolePermissions['complaints'];
  fallback?: ReactNode;
}

export function PermissionGate({ children, resource, action, fallback = null }: PermissionGateProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface RoleGateProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}