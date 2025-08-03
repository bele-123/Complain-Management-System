import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole, ROLE_PERMISSIONS, RolePermissions } from '@/types/user';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  permissions: RolePermissions;
  login: (userData: User) => void;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  hasPermission: (resource: keyof RolePermissions, action: keyof RolePermissions['complaints']) => boolean;
  canAccessRegion: (region: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, User> = {
  admin: {
    id: '1',
    name: 'Abebe Kebede',
    email: 'admin@eeu.gov.et',
    role: 'admin',
    region: 'Addis Ababa',
    department: 'System Administration',
    phone: '+251-11-123-4567',
    isActive: true,
    createdAt: '2024-01-01'
  },
  manager: {
    id: '2',
    name: 'Tigist Haile',
    email: 'manager@eeu.gov.et',
    role: 'manager',
    region: 'Oromia',
    department: 'Regional Management',
    phone: '+251-11-234-5678',
    isActive: true,
    createdAt: '2024-01-02'
  },
  foreman: {
    id: '3',
    name: 'Getachew Tadesse',
    email: 'foreman@eeu.gov.et',
    role: 'foreman',
    region: 'Amhara',
    department: 'Field Operations',
    phone: '+251-11-345-6789',
    isActive: true,
    createdAt: '2024-01-03'
  },
  'call-attendant': {
    id: '4',
    name: 'Meron Tesfaye',
    email: 'callattendant@eeu.gov.et',
    role: 'call-attendant',
    region: 'Addis Ababa',
    department: 'Customer Service',
    phone: '+251-11-456-7890',
    isActive: true,
    createdAt: '2024-01-04'
  },
  technician: {
    id: '5',
    name: 'Dawit Solomon',
    email: 'technician@eeu.gov.et',
    role: 'technician',
    region: 'Addis Ababa',
    department: 'Field Service',
    phone: '+251-11-567-8901',
    isActive: true,
    createdAt: '2024-01-05'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('call-attendant');

  const permissions = ROLE_PERMISSIONS[role];

  const login = (userData: User) => {
    setUser(userData);
    setRole(userData.role);
  };

  const logout = () => {
    setUser(null);
    setRole('call-attendant');
    // Redirect to login page
    window.location.href = '/login';
  };

  const switchRole = (newRole: UserRole) => {
    const newUser = DEMO_USERS[newRole];
    setUser(newUser);
    setRole(newRole);
  };

  const hasPermission = (resource: keyof RolePermissions, action: keyof RolePermissions['complaints']): boolean => {
    if (resource === 'canAssignComplaint' || resource === 'canSetHighPriority' || resource === 'accessibleRegions') {
      return false;
    }
    if (!permissions[resource]) {
      return false;
    }
    return permissions[resource][action];
  };

  const canAccessRegion = (region: string): boolean => {
    if (permissions.accessibleRegions === 'all') return true;
    if (Array.isArray(permissions.accessibleRegions)) {
      return permissions.accessibleRegions.length === 0 ? 
        region === user?.region : 
        permissions.accessibleRegions.includes(region);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      role,
      permissions,
      login,
      logout,
      switchRole,
      hasPermission,
      canAccessRegion
    }}>
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