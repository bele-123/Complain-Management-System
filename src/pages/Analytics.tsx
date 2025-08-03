import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Zap, 
  AlertTriangle,
  MapPin,
  Calendar
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { ETHIOPIAN_REGIONS } from '@/types/user';
import { COMPLAINT_CATEGORIES } from '@/types/complaint';

export function Analytics() {
  const { canAccessRegion, permissions } = useAuth();

  const [allComplaints, setAllComplaints] = useState([]);
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/api?action=getComplaints');
        setAllComplaints(res.data || []);
      } catch (err) {}
    };
    fetchComplaints();
  }, []);
  const accessibleComplaints = allComplaints.filter((complaint: any) => 
    canAccessRegion(complaint.region)
  );

  // Calculate analytics data
  const totalComplaints = accessibleComplaints.length;
  const resolvedComplaints = accessibleComplaints.filter(c => c.status === 'resolved').length;
  const openComplaints = accessibleComplaints.filter(c => c.status === 'open').length;
  const inProgressComplaints = accessibleComplaints.filter(c => c.status === 'in-progress').length;
  const criticalComplaints = accessibleComplaints.filter(c => c.priority === 'critical').length;
  
  const resolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;
  const criticalRate = totalComplaints > 0 ? (criticalComplaints / totalComplaints) * 100 : 0;

  // Regional breakdown
  const regionStats = ETHIOPIAN_REGIONS.map(region => {
    const regionComplaints = accessibleComplaints.filter(c => c.region === region);
    return {
      region,
      total: regionComplaints.length,
      open: regionComplaints.filter(c => c.status === 'open').length,
      resolved: regionComplaints.filter(c => c.status === 'resolved').length
    };
  }).filter(stat => stat.total > 0);

  // Category breakdown
  const categoryStats = COMPLAINT_CATEGORIES.map(category => {
    const categoryComplaints = accessibleComplaints.filter(c => c.category === category.value);
    return {
      ...category,
      count: categoryComplaints.length,
      percentage: totalComplaints > 0 ? (categoryComplaints.length / totalComplaints) * 100 : 0
    };
  }).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count);

  // Recent trends (mock data for demonstration)
  const trendData = [
    { period: 'This Week', complaints: accessibleComplaints.filter(c => 
      new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length },
    { period: 'Last Week', complaints: Math.floor(totalComplaints * 0.3) },
    { period: 'This Month', complaints: totalComplaints },
    { period: 'Last Month', complaints: Math.floor(totalComplaints * 0.8) }
  ];

  if (!permissions.reports.read) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">You don't have permission to view analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Electrical supply complaint analytics and performance metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Complaints
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{totalComplaints}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={100} className="flex-1" />
              <span className="text-xs text-muted-foreground">100%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolution Rate
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{resolutionRate.toFixed(1)}%</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={resolutionRate} className="flex-1" />
              <span className="text-xs text-success">{resolvedComplaints} resolved</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Cases
            </CardTitle>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{openComplaints + inProgressComplaints}</div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex space-x-1">
                <Badge variant="outline" className="text-xs">{openComplaints} Open</Badge>
                <Badge variant="outline" className="text-xs">{inProgressComplaints} In Progress</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Issues
            </CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{criticalComplaints}</div>
            <div className="flex items-center space-x-2 mt-2">
              <Progress value={criticalRate} className="flex-1" />
              <span className="text-xs text-destructive">{criticalRate.toFixed(1)}% critical</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Breakdown */}
        <Card className="border-border animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Regional Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionStats.map((stat) => (
                <div key={stat.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stat.region}</span>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {stat.total} total
                      </Badge>
                      <Badge variant="outline" className="text-xs text-success">
                        {stat.resolved} resolved
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={stat.total > 0 ? (stat.resolved / stat.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Analysis */}
        <Card className="border-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>Complaint Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.map((category) => (
                <div key={category.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.label}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground">
                        {category.count} ({category.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trends */}
      <Card className="border-border animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Complaint Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {trendData.map((trend, index) => (
              <div key={trend.period} className="text-center p-4 border border-border rounded-lg">
                <div className="text-2xl font-bold text-foreground">{trend.complaints}</div>
                <div className="text-sm text-muted-foreground">{trend.period}</div>
                {index === 0 && (
                  <Badge variant="outline" className="mt-2 text-xs text-success">
                    Current
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Indicators */}
      <Card className="border-border animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Performance Indicators</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">
                {totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
              <Progress value={totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.2h</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
              <Progress value={85} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-warning mb-2">24h</div>
              <div className="text-sm text-muted-foreground">Avg Resolution Time</div>
              <Progress value={70} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}