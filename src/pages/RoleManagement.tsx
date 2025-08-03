import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ROLE_PERMISSIONS, UserRole } from '@/types/user';

const ROLES: UserRole[] = ['admin', 'manager', 'foreman', 'call-attendant', 'technician'];

export function RoleManagement() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const permissions = ROLE_PERMISSIONS[selectedRole];

  return (
    <div className="space-y-6">
      <Card className="border-border animate-fade-in">
        <CardHeader>
          <CardTitle>Role-Based Access Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="font-medium mr-2">Select Role:</label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value as UserRole)}
              className="border rounded px-2 py-1"
            >
              {ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead>Create</TableHead>
                <TableHead>Read</TableHead>
                <TableHead>Update</TableHead>
                <TableHead>Delete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {['complaints', 'users', 'reports', 'settings'].map(resource => (
                <TableRow key={resource}>
                  <TableCell className="font-medium">{resource}</TableCell>
                  <TableCell>{permissions[resource].create ? '✅' : '❌'}</TableCell>
                  <TableCell>{permissions[resource].read ? '✅' : '❌'}</TableCell>
                  <TableCell>{permissions[resource].update ? '✅' : '❌'}</TableCell>
                  <TableCell>{permissions[resource].delete ? '✅' : '❌'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6">
            <div><b>Can Assign Complaint:</b> {permissions.canAssignComplaint ? '✅' : '❌'}</div>
            <div><b>Can Set High Priority:</b> {permissions.canSetHighPriority ? '✅' : '❌'}</div>
            <div><b>Accessible Regions:</b> {permissions.accessibleRegions === 'all' ? 'All Regions' : (permissions.accessibleRegions as string[]).join(', ')}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoleManagement;
