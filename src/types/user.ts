export type UserRole = 'admin' | 'manager' | 'foreman' | 'call-attendant' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  department: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

export interface Permission {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export interface RolePermissions {
  complaints: Permission;
  users: Permission;
  reports: Permission;
  settings: Permission;
  canAssignComplaint: boolean;
  canSetHighPriority: boolean;
  accessibleRegions: string[] | 'all';
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    complaints: { create: true, read: true, update: true, delete: true },
    users: { create: true, read: true, update: true, delete: true },
    reports: { create: true, read: true, update: true, delete: true },
    settings: { create: true, read: true, update: true, delete: true },
    canAssignComplaint: true,
    canSetHighPriority: true,
    accessibleRegions: 'all'
  },
  manager: {
    complaints: { create: true, read: true, update: true, delete: false },
    users: { create: false, read: true, update: true, delete: false },
    reports: { create: true, read: true, update: true, delete: false },
    settings: { create: false, read: true, update: false, delete: false },
    canAssignComplaint: true,
    canSetHighPriority: true,
    accessibleRegions: 'all'
  },
  foreman: {
    complaints: { create: true, read: true, update: true, delete: false },
    users: { create: false, read: true, update: false, delete: false },
    reports: { create: false, read: true, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false },
    canAssignComplaint: true,
    canSetHighPriority: true,
    accessibleRegions: []
  },
  'call-attendant': {
    complaints: { create: true, read: true, update: true, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    reports: { create: false, read: true, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false },
    canAssignComplaint: false,
    canSetHighPriority: false,
    accessibleRegions: 'all'
  },
  technician: {
    complaints: { create: false, read: true, update: true, delete: false },
    users: { create: false, read: false, update: false, delete: false },
    reports: { create: false, read: false, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false },
    canAssignComplaint: false,
    canSetHighPriority: false,
    accessibleRegions: []
  }
};

export const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Afar',
  'Amhara',
  'Benishangul-Gumuz',
  'Dire Dawa',
  'Gambela',
  'Harari',
  'Oromia',
  'Sidama',
  'SNNPR',
  'Somali',
  'Tigray'
];