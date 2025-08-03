import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  FileText,
  TrendingUp,
  Users
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

export function StatsCards() {
  const { canAccessRegion, user } = useAuth();
  
  const [allComplaints, setAllComplaints] = useState([]);
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/api?action=getComplaints');
        setAllComplaints(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setAllComplaints([]);
      }
    };
    fetchComplaints();
  }, []);
  const accessibleComplaints = allComplaints.filter((complaint: any) => 
    canAccessRegion(complaint.region)
  );

  const stats = {
    total: accessibleComplaints.length,
    open: accessibleComplaints.filter(c => c.status === 'open').length,
    inProgress: accessibleComplaints.filter(c => c.status === 'in-progress').length,
    resolved: accessibleComplaints.filter(c => c.status === 'resolved').length,
    closed: accessibleComplaints.filter(c => c.status === 'closed').length,
    cancelled: accessibleComplaints.filter(c => c.status === 'cancelled').length,
    critical: accessibleComplaints.filter(c => c.priority === 'critical').length,
    highPriority: accessibleComplaints.filter(c => c.priority === 'high').length
  };

  const cards = [
    {
      title: 'Total Complaints',
      value: stats.total.toString(),
      description: `In ${user?.region || 'all regions'}`,
      icon: FileText,
      color: 'text-primary'
    },
    {
      title: 'Open Cases',
      value: stats.open.toString(),
      description: 'Awaiting assignment',
      icon: AlertCircle,
      color: 'text-warning'
    },
    {
      title: 'In Progress',
      value: stats.inProgress.toString(),
      description: 'Currently being resolved',
      icon: Clock,
      color: 'text-primary'
    },
    {
      title: 'Resolved',
      value: stats.resolved.toString(),
      description: 'Successfully completed',
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      title: 'Closed',
      value: stats.closed.toString(),
      description: 'No further action required',
      icon: CheckCircle,
      color: 'text-muted-foreground'
    },
    {
      title: 'Cancelled',
      value: stats.cancelled.toString(),
      description: 'Complaint was cancelled',
      icon: AlertCircle,
      color: 'text-muted-foreground'
    },
    {
      title: 'Critical Issues',
      value: stats.critical.toString(),
      description: 'Require immediate attention',
      icon: TrendingUp,
      color: 'text-destructive'
    },
    {
      title: 'High Priority',
      value: stats.highPriority.toString(),
      description: 'Priority resolution needed',
      icon: Users,
      color: 'text-warning'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="border-border hover:shadow-elevated transition-all duration-300 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}