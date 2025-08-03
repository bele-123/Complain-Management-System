import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentComplaints } from '@/components/dashboard/RecentComplaints';
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { user, role } = useAuth();

  const getWelcomeMessage = () => {
    const messages = {
      admin: 'System Administration Overview',
      manager: 'Regional Management Overview',
      foreman: 'Field Operations Overview',
      operator: 'Control Room Overview',
      technician: 'Your Assigned Tasks'
    };
    return messages[role];
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted-foreground mt-2">
          {getWelcomeMessage()}
        </p>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <StatsCards />
      </div>

      <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <RecentComplaints />
      </div>
    </div>
  );
}