import { Bell, User, LogOut, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/user';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { user, role, switchRole, logout } = useAuth();

  const getRoleColor = (userRole: UserRole) => {
    const colors = {
      admin: 'bg-destructive text-destructive-foreground',
      manager: 'bg-warning text-warning-foreground',
      foreman: 'bg-primary text-primary-foreground',
      'call-attendant': 'bg-success text-success-foreground',
      technician: 'bg-muted text-muted-foreground'
    };
    return colors[userRole];
  };

  const getRoleTitle = (userRole: UserRole) => {
    const titles = {
      admin: 'System Administrator',
      manager: 'Regional Manager',
      foreman: 'Field Foreman',
      'call-attendant': 'Call Center Attendant',
      technician: 'Field Technician'
    };
    return titles[userRole];
  };

  return (
    <header className="bg-card border-b border-border shadow-card sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EEU</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Ethiopian Electric Utility</h1>
              <p className="text-sm text-muted-foreground">Complaint Management System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Role Selector - Demo Feature */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden md:block">Switch Role:</span>
            <Select value={role} onValueChange={(value: UserRole) => switchRole(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="foreman">Foreman</SelectItem>
                <SelectItem value="call-attendant">Call Attendant</SelectItem>
                <SelectItem value="technician">Technician</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications */}
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <Badge className={getRoleColor(role)} variant="secondary">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{getRoleTitle(role)}</p>
                  <p className="text-xs text-muted-foreground">Region: {user?.region}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}