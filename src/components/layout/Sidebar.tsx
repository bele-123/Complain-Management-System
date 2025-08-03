
import {
  BarChart3,
  Plus,
  FileText,
  Users,
  Settings,
  Home,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  HelpCircle,
  Globe2
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { PermissionGate } from '@/components/ui/permission-gate';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export function Sidebar() {
  // All state and logic must be inside this function
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);
  const [language, setLanguage] = React.useState('en');
  const [showMobile, setShowMobile] = React.useState(false);
  const [userStatus, setUserStatus] = React.useState('online');
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [profilePic, setProfilePic] = React.useState('');
  const [profilePicFile, setProfilePicFile] = React.useState(null);
  // ...existing state, hooks, handlers, and logic...
  // Add any additional state/hooks needed for sidebar
  const location = useLocation();
  const navigate = useNavigate();
  const { role, user, logout } = useAuth();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = React.useState(false);
  const [theme, setTheme] = React.useState('light');
  const [highContrast, setHighContrast] = React.useState(false);
  const [fontSize, setFontSize] = React.useState('normal');
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const languages = [
    { code: 'en', label: 'English' },
    { code: 'am', label: 'Amharic' }
  ];
  // Navigation sections (restore your previous structure if needed)
  const navigationSections = [
    {
      heading: 'Main',
      items: [
        { name: 'Dashboard', href: '/', icon: Home, requiresAuth: false },
        { name: 'New Complaint', href: '/complaints/new', icon: Plus, requiresAuth: true, resource: 'complaints', action: 'create' },
        { name: 'All Complaints', href: '/complaints', icon: FileText, requiresAuth: true, resource: 'complaints', action: 'read' },
        { name: 'Search Complaints', href: '/complaints/search', icon: Search, requiresAuth: true, resource: 'complaints', action: 'read' },
      ]
    },
    {
      heading: 'Management',
      items: [
        { name: 'Analytics', href: '/analytics', icon: BarChart3, requiresAuth: true, resource: 'reports', action: 'read' },
        { name: 'User Management', href: '/users', icon: Users, requiresAuth: true, resource: 'users', action: 'read' },
      ]
    },
    {
      heading: 'System',
      items: [
        { name: 'Notifications', href: '/notifications', icon: Bell, requiresAuth: true, resource: 'notifications', action: 'read' },
        { name: 'Settings', href: '/settings', icon: Settings, requiresAuth: true, resource: 'settings', action: 'read' },
      ]
    }
  ];

  // Helper functions
  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };
  const getDashboardTitle = () => {
    const titles: any = {
      admin: 'System Administration Dashboard',
      manager: 'Regional Management Dashboard',
      foreman: 'Field Operations Dashboard',
      'call-attendant': 'Customer Service Dashboard',
      technician: 'Technician Dashboard'
    };
    return titles[role];
  };

  // Sidebar content
  let sidebarContent;
  if (loading) {
    sidebarContent = (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <span className="text-muted-foreground">Loading sidebar...</span>
      </div>
    );
  } else if (error) {
    sidebarContent = (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <span className="text-destructive">{error}</span>
      </div>
    );
  } else {
    sidebarContent = (
      <>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className={cn('transition-all', collapsed && 'hidden')}>
            <h2 className="text-lg font-semibold text-foreground">{getDashboardTitle()}</h2>
            <p className="text-sm text-muted-foreground mt-1">Role: {role?.charAt(0).toUpperCase() + role?.slice(1)}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(v => !v)} aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>
        {/* Quick Actions */}
        {!collapsed && (
          <div className="px-4 py-2 flex gap-2 animate-fade-in">
            <Button size="sm" variant="secondary" className="w-full" onClick={() => navigate('/complaints/new')}>+ Complaint</Button>
            <Button size="sm" variant="secondary" className="w-full" onClick={() => setUnreadNotifications(0)}>Mark All Read</Button>
          </div>
        )}
        <nav className={cn('flex-1 px-2 py-4 space-y-4', collapsed && 'px-1')}>
          {navigationSections.map(section => (
            <div key={section.heading}>
              {!collapsed && <div className="text-xs font-semibold text-muted-foreground px-2 mb-1 uppercase tracking-wider">{section.heading}</div>}
              <div className="space-y-1">
                {section.items.map((item) => (
                  item.resource && item.action ? (
                    <PermissionGate key={item.name} resource={item.resource as any} action={item.action as any} fallback={null}>
                      <NavLink
                        to={item.href}
                        className={cn(
                          'flex items-center rounded-md text-sm font-medium transition-all duration-200 group',
                          collapsed ? 'justify-center p-2' : 'px-3 py-2',
                          isActive(item.href)
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                        tabIndex={0}
                        aria-label={item.name}
                        onClick={item.name === 'Settings' ? (e) => { e.preventDefault(); setShowSettingsModal(true); } : undefined}
                      >
                        <span className="relative">
                          <item.icon className={cn('h-5 w-5 flex-shrink-0', collapsed ? '' : 'mr-3')} />
                          {item.name === 'Notifications' && unreadNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 bg-destructive text-xs text-white rounded-full px-1.5 py-0.5">
                              {unreadNotifications}
                            </span>
                          )}
                        </span>
                        {!collapsed && item.name}
                        {collapsed && <span className="sr-only">{item.name}</span>}
                        {collapsed && (
                          <span className="absolute left-full ml-2 z-10 bg-card border border-border rounded px-2 py-1 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            {item.name}
                          </span>
                        )}
                      </NavLink>
                    </PermissionGate>
                  ) : (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'flex items-center rounded-md text-sm font-medium transition-all duration-200 group',
                        collapsed ? 'justify-center p-2' : 'px-3 py-2',
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                      tabIndex={0}
                      aria-label={item.name}
                    >
                      <span className="relative">
                        <item.icon className={cn('h-5 w-5 flex-shrink-0', collapsed ? '' : 'mr-3')} />
                        {item.name === 'Notifications' && unreadNotifications > 0 && (
                          <span className="absolute -top-1 -right-1 bg-destructive text-xs text-white rounded-full px-1.5 py-0.5">
                            {unreadNotifications}
                          </span>
                        )}
                      </span>
                      {!collapsed && item.name}
                      {collapsed && <span className="sr-only">{item.name}</span>}
                      {collapsed && (
                        <span className="absolute left-full ml-2 z-10 bg-card border border-border rounded px-2 py-1 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {item.name}
                        </span>
                      )}
                    </NavLink>
                  )
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-border flex items-center justify-between gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Switch language">
                <Globe2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setLanguage(lang.code)}
                >
                  {lang.label}
                </Button>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <Avatar>
                  <AvatarImage src={profilePic} alt={user?.name} />
                  <AvatarFallback><UserIcon className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <span className={cn(
                  'absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-card',
                  userStatus === 'online' ? 'bg-green-500' : userStatus === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                )} />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 border-b border-border">
                <div className="font-medium">{user?.name || 'User'}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant={userStatus === 'online' ? 'default' : 'ghost'} onClick={() => setUserStatus('online')}>Online</Button>
                  <Button size="sm" variant={userStatus === 'away' ? 'default' : 'ghost'} onClick={() => setUserStatus('away')}>Away</Button>
                  <Button size="sm" variant={userStatus === 'offline' ? 'default' : 'ghost'} onClick={() => setUserStatus('offline')}>Offline</Button>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start" onClick={() => setShowSettingsModal(true)}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" aria-label="Help" onClick={() => window.open('mailto:support@eeu.gov.et', '_blank')}>
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
        {!collapsed && (
          <div className="px-4 pb-2 text-xs text-muted-foreground animate-fade-in">
            <p>Ethiopian Electric Utility</p>
            <p>v2.1.0 • {new Date().getFullYear()}</p>
          </div>
        )}
      </>
    );
  }

  // Mobile overlay and return
  return (
    <>
      <div className={cn(
        'bg-card border-r border-border flex flex-col h-full transition-all duration-300',
        collapsed ? 'w-20' : 'w-64',
        'hidden md:flex'
      )}>
        {sidebarContent}
      </div>
      {/* Mobile overlay */}
      <div className={cn(
        'fixed inset-0 z-40 bg-black/40 flex md:hidden transition-opacity',
        showMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}
        aria-modal="true" role="dialog"
      >
        <div className={cn(
          'bg-card border-r border-border flex flex-col h-full transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          'relative')}
        >
          <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setShowMobile(false)} aria-label="Close sidebar">
            &times;
          </Button>
          {sidebarContent}
        </div>
      </div>
      {/* Hamburger for mobile */}
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={() => setShowMobile(true)} aria-label="Open sidebar">
        <ChevronRight />
      </Button>
      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Preferences</DialogTitle>
            <DialogDescription>Manage your personal settings and preferences.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={profilePic} alt={user?.name} />
                <AvatarFallback><UserIcon className="h-7 w-7" /></AvatarFallback>
              </Avatar>
              <div>
                <input type="file" accept="image/*" id="profile-pic-upload" className="hidden" onChange={() => {}} />
                <label htmlFor="profile-pic-upload">
                  <Button asChild variant="outline" size="sm">
                    <span>Change Photo</span>
                  </Button>
                </label>
              </div>
            </div>
            {/* Theme */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Dark Mode</span>
              <Switch checked={theme === 'dark'} onCheckedChange={v => setTheme(v ? 'dark' : 'light')} aria-label="Toggle dark mode" />
            </div>
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Notifications</span>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} aria-label="Toggle notifications" />
            </div>
            {/* Language */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Language</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2" aria-label="Switch language">
                    {languages.find(l => l.code === language)?.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <Button
                      key={lang.code}
                      variant={language === lang.code ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setLanguage(lang.code)}
                    >
                      {lang.label}
                    </Button>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <div className="flex gap-2">
                <Button size="sm" variant={userStatus === 'online' ? 'default' : 'ghost'} onClick={() => setUserStatus('online')}>Online</Button>
                <Button size="sm" variant={userStatus === 'away' ? 'default' : 'ghost'} onClick={() => setUserStatus('away')}>Away</Button>
                <Button size="sm" variant={userStatus === 'offline' ? 'default' : 'ghost'} onClick={() => setUserStatus('offline')}>Offline</Button>
              </div>
            </div>
            {/* Accessibility */}
            <div className="flex items-center justify-between">
              <span className="text-sm">High Contrast</span>
              <Switch checked={highContrast} onCheckedChange={setHighContrast} aria-label="Toggle high contrast" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Font Size</span>
              <div className="flex gap-2">
                <Button size="sm" variant={fontSize === 'small' ? 'default' : 'ghost'} onClick={() => setFontSize('small')}>A-</Button>
                <Button size="sm" variant={fontSize === 'normal' ? 'default' : 'ghost'} onClick={() => setFontSize('normal')}>A</Button>
                <Button size="sm" variant={fontSize === 'large' ? 'default' : 'ghost'} onClick={() => setFontSize('large')}>A+</Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reduced Motion</span>
              <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} aria-label="Toggle reduced motion" />
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 items-stretch mt-4">
            <div className="flex gap-2 w-full">
              <Button className="flex-1" onClick={() => {}}>Save</Button>
              <Button className="flex-1" variant="secondary" onClick={() => {}}>Reset to Default</Button>
            </div>
            <Button variant="ghost" onClick={() => setShowSettingsModal(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}