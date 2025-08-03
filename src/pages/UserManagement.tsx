import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Users,
  MapPin,
  Mail,
  Phone,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const ETHIOPIAN_REGIONS = [
  'Addis Ababa',
  'Amhara',
  'Oromia',
  'Tigray',
  'SNNPR',
  'Benishangul-Gumuz',
  'Afar',
  'Somali',
  'Gambela',
  'Harari',
];

export function UserManagement() {
  const { permissions, role } = useAuth();
  const { toast } = useToast();

  // State declarations
  const [allUsers, setAllUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '', email: '', role: '', region: '', department: '', phone: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [roleEditUser, setRoleEditUser] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get('/api?action=getUsers');
        console.log('Users API response:', res.data);
        if (Array.isArray(res.data)) {
          // Map backend keys to frontend keys
          const mapped = res.data.map((u: any) => ({
            id: u.ID,
            name: u.Name,
            email: u.Email,
            role: u.Role,
            region: u.Region,
            department: u.Department,
            phone: u.Phone,
            isActive: u['Is Active'] !== false,
            createdAt: u['Created At'],
          }));
          setAllUsers(mapped);
        } else {
          setAllUsers([]);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        toast({
          title: "Error",
          description: "Failed to fetch users from server",
          variant: "destructive"
        });
        setAllUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [toast]);

  // Filter users based on search and role filter
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch = searchTerm === '' || 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Create new user
  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        action: 'createUser',
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        region: newUser.region,
        department: newUser.department,
        phone: newUser.phone,
        isActive: true
      };
      
      const res = await axios.post('/api', userData);
      
      if (res.data && res.data.success) {
        toast({
          title: "Success",
          description: `User ${newUser.name} has been created successfully`,
        });
        
        // Refresh users list
        const updatedRes = await axios.get('/api?action=getUsers');
        if (Array.isArray(updatedRes.data)) {
          const mapped = updatedRes.data.map((u: any) => ({
            id: u.ID,
            name: u.Name,
            email: u.Email,
            role: u.Role,
            region: u.Region,
            department: u.Department,
            phone: u.Phone,
            isActive: u['Is Active'] !== false,
            createdAt: u['Created At'],
          }));
          setAllUsers(mapped);
        }
        
        // Reset form and close dialog
        setNewUser({ name: '', email: '', role: '', region: '', department: '', phone: '' });
        setIsAddUserOpen(false);
      } else {
        throw new Error('Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      // Check if it's an "Invalid action" error from Google Apps Script
      if (err.response?.data?.error === "Invalid action") {
        toast({
          title: "Feature Not Available",
          description: "User creation is not yet implemented in the backend. Please contact your system administrator.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create user",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const userData = {
        action: 'updateUser',
        id: editingUser.id,
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        region: editingUser.region,
        department: editingUser.department,
        phone: editingUser.phone,
      };
      
      const res = await axios.post('/api', userData);
      
      if (res.data && res.data.success) {
        toast({
          title: "Success",
          description: `User ${editingUser.name} has been updated successfully`,
        });
        
        // Update local state
        setAllUsers(prev => prev.map(u => 
          u.id === editingUser.id ? { ...u, ...editingUser } : u
        ));
        
        setEditingUser(null);
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      // Check if it's an "Invalid action" error from Google Apps Script
      if (err.response?.data?.error === "Invalid action") {
        toast({
          title: "Feature Not Available",
          description: "User editing is not yet implemented in the backend. Please contact your system administrator.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post('/api', {
        action: 'deleteUser',
        id: userId,
      });
      
      if (res.data && res.data.success) {
        toast({
          title: "Success",
          description: "User has been deleted successfully",
        });
        
        // Remove from local state
        setAllUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      // Check if it's an "Invalid action" error from Google Apps Script
      if (err.response?.data?.error === "Invalid action") {
        toast({
          title: "Feature Not Available",
          description: "User deletion is not yet implemented in the backend. Please contact your system administrator.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit user
  const handleEditUser = (user) => {
    setEditingUser({ ...user });
  };

  // Toggle user status
  const toggleUserStatus = async (user) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post('/api', {
        action: 'updateUser',
        id: user.id,
        isActive: !user.isActive,
      });
      
      if (res.data && res.data.success) {
        toast({
          title: "Success",
          description: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
        });
        
        // Update local state
        setAllUsers(prev => prev.map(u => 
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        ));
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      // Check if it's an "Invalid action" error from Google Apps Script
      if (err.response?.data?.error === "Invalid action") {
        toast({
          title: "Feature Not Available",
          description: "User status updates are not yet implemented in the backend. Please contact your system administrator.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user status",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change user role
  const handleChangeUserRole = async (userId, newRole) => {
    setIsSubmitting(true);
    try {
      const res = await axios.post('/api', {
        action: 'updateUser',
        id: userId,
        role: newRole,
      });
      
      if (res.data && res.data.success) {
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
        
        // Update local state
        setAllUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
        
        setRoleEditUser(null);
        setIsRoleDialogOpen(false);
      } else {
        throw new Error('Failed to update user role');
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      // Check if it's an "Invalid action" error from Google Apps Script
      if (err.response?.data?.error === "Invalid action") {
        toast({
          title: "Feature Not Available",
          description: "User role updates are not yet implemented in the backend. Please contact your system administrator.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update user role",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canEditRoles = role === 'admin' || role === 'manager';

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-500 text-white';
      case 'manager': return 'bg-blue-500 text-white';
      case 'foreman': return 'bg-yellow-500 text-black';
      case 'technician': return 'bg-green-500 text-white';
      case 'call-attendant': return 'bg-purple-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add User Dialog */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage Ethiopian Electric Utility staff and their access permissions
          </p>
        </div>
        {permissions.users.create && (
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Fill in the details to add a new user.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@eeu.gov.et"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="call-attendant">Call Attendant</SelectItem>
                      <SelectItem value="foreman">Foreman</SelectItem>
                      {(role === 'admin' || role === 'manager') && (
                        <SelectItem value="manager">Manager</SelectItem>
                      )}
                      {role === 'admin' && (
                        <SelectItem value="admin">Administrator</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={newUser.region} onValueChange={(value) => setNewUser({...newUser, region: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {ETHIOPIAN_REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newUser.department}
                    onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    placeholder="e.g., Field Operations"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="+251-XX-XXX-XXXX"
                  />
                </div>
                <Button onClick={handleCreateUser} className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
      {/* Search and Filter */}
      <Card className="border-border animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search & Filter Users</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="foreman">Foreman</SelectItem>
                <SelectItem value="call-attendant">Call Attendant</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Users Table */}
      <Card className="border-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border min-h-[200px] flex flex-col justify-center items-center">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary mb-2" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, idx) => (
                    <TableRow key={user.id || user.email || idx} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center mt-1">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role === 'call-attendant' ? 'Call Attendant' : 
                            user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
                        </Badge>
                        {canEditRoles && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2 px-2 py-0 text-xs"
                            onClick={() => { setRoleEditUser(user); setIsRoleDialogOpen(true); }}
                          >
                            Edit Role
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                          {user.region}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{user.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                          {user.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {user.isActive ? (
                            <UserCheck className="h-4 w-4 text-success" />
                          ) : (
                            <UserX className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={`text-sm ${user.isActive ? 'text-success' : 'text-muted-foreground'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt && !isNaN(new Date(user.createdAt).getTime())
                          ? format(new Date(user.createdAt), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user)}
                            className="h-8 w-8 p-0"
                            disabled={isSubmitting}
                          >
                            {user.isActive ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>
                          {permissions.users.update && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                              className="h-8 w-8 p-0"
                              disabled={isSubmitting}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {permissions.users.delete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              disabled={isSubmitting}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Edit the details of the selected user.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({...editingUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technician">Technician</SelectItem>
                    <SelectItem value="call-attendant">Call Attendant</SelectItem>
                    <SelectItem value="foreman">Foreman</SelectItem>
                    {(role === 'admin' || role === 'manager') && (
                      <SelectItem value="manager">Manager</SelectItem>
                    )}
                    {role === 'admin' && (
                      <SelectItem value="admin">Administrator</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region</Label>
                <Select value={editingUser.region} onValueChange={(value) => setEditingUser({...editingUser, region: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ETHIOPIAN_REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                />
              </div>
              <Button onClick={handleUpdateUser} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update User'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Role Edit Dialog */}
      {roleEditUser && (
        <Dialog open={isRoleDialogOpen} onOpenChange={() => { setRoleEditUser(null); setIsRoleDialogOpen(false); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>Change the role for <b>{roleEditUser.name}</b>.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="role-select">Role</Label>
              <Select value={roleEditUser.role} onValueChange={(value) => setRoleEditUser({...roleEditUser, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technician">Technician</SelectItem>
                  <SelectItem value="call-attendant">Call Attendant</SelectItem>
                  <SelectItem value="foreman">Foreman</SelectItem>
                  {(role === 'admin' || role === 'manager') && (
                    <SelectItem value="manager">Manager</SelectItem>
                  )}
                  {role === 'admin' && (
                    <SelectItem value="admin">Administrator</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                className="w-full mt-4"
                disabled={isSubmitting}
                onClick={() => handleChangeUserRole(roleEditUser.id, roleEditUser.role)}
              >
                Update Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
