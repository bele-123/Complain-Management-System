import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PERMISSIONS, UserRole } from '@/types/user';

function ComplaintDetails() {
  const { id } = useParams();
  const { permissions, role: currentUserRole } = useAuth();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      setLoading(true);
      setError('');
      try {
        // Try fast single complaint fetch first
        const res = await axios.get(`/api?action=getComplaint&id=${id}`);
        if (res.data && (res.data.ID || res.data.id)) {
          setComplaint(res.data);
        } else if (Array.isArray(res.data)) {
          // Fallback: old API returns all complaints
          const found = res.data.find((c: any) => c.ID === id || c.id === id);
          setComplaint(found || null);
        } else {
          setComplaint(null);
        }
      } catch (err) {
        setError('Failed to fetch complaint data.');
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  if (!permissions.complaints.read) {
    return (
      <div className="p-8 text-center">
        <span className="text-destructive font-bold text-lg">Access Denied</span>
        <div className="text-muted-foreground mt-2">You do not have permission to view complaint details.</div>
      </div>
    );
  }
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (!complaint) return <div className="p-8 text-center text-muted-foreground">Complaint not found.</div>;

  // Table rows for complaint details
  const complaintRows = [
    { label: 'ID', value: complaint.ID || complaint.id },
    { label: 'Customer Name', value: complaint['Customer Name'] || complaint.customerName },
    { label: 'Title', value: complaint.Title || complaint.title },
    { label: 'Description', value: complaint.Description || complaint.description },
    { label: 'Category', value: complaint.Category || complaint.category },
    { label: 'Priority', value: complaint.Priority || complaint.priority },
    { label: 'Status', value: complaint.Status || complaint.status },
    { label: 'Region', value: complaint.Region || complaint.region },
    { label: 'Created At', value: complaint['Created At'] || complaint.createdAt },
  ];

  // Table of all features and roles
  const features = ['complaints', 'users', 'reports', 'settings'];
  const actions = ['create', 'read', 'update', 'delete'];
  const roles: UserRole[] = ['admin', 'manager', 'foreman', 'call-attendant', 'technician'];

  return (
    <div className="space-y-8">
      <Card className="border-border animate-fade-in">
        <CardHeader>
          <CardTitle>Complaint Details</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full border rounded overflow-hidden">
            <tbody>
              {complaintRows.map(row => (
                <tr key={row.label} className="border-b">
                  <td className="font-medium px-4 py-2 bg-muted/50 w-1/3">{row.label}</td>
                  <td className="px-4 py-2">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-border animate-fade-in">
        <CardHeader>
          <CardTitle>Role & Feature Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-2 border bg-muted/50">Role</th>
                  {features.map(feature => (
                    actions.map(action => (
                      <th key={feature+action} className="px-2 py-2 border bg-muted/50">{feature} {action}</th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role}>
                    <td className="px-2 py-2 border font-medium bg-muted/30">{role.charAt(0).toUpperCase() + role.slice(1)}</td>
                    {features.map(feature => (
                      actions.map(action => (
                        <td key={role+feature+action} className="px-2 py-2 border text-center">
                          {ROLE_PERMISSIONS[role][feature][action] ? '✅' : '❌'}
                        </td>
                      ))
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ComplaintDetails;
