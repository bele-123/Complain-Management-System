import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock, User } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/complaint';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export function RecentComplaints() {
  const { canAccessRegion } = useAuth();
  
  const [allComplaints, setAllComplaints] = useState([]);
  useEffect(() => {
    let isMounted = true;
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/api?action=getComplaints');
        if (isMounted) {
          setAllComplaints(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (isMounted) setAllComplaints([]);
      }
    };
    let cancelled = false;
    const poll = async () => {
      await fetchComplaints();
      if (!cancelled) {
        requestAnimationFrame(poll);
      }
    };
    poll();
    return () => {
      cancelled = true;
      isMounted = false;
    };
  }, []);
  const recentComplaints = allComplaints
    .filter((complaint: any) => canAccessRegion(complaint.region))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Recent Complaints</CardTitle>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentComplaints.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No complaints in your accessible regions
          </div>
        ) : (
          recentComplaints.map((complaint) => (
            <div key={complaint.id ? String(complaint.id) : `row-${recentComplaints.indexOf(complaint)}`} className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-foreground line-clamp-1">
                    {complaint.title}
                  </h4>
                  {PRIORITY_CONFIG[complaint.priority] ? (
                    <Badge 
                      variant="secondary" 
                      className={`${PRIORITY_CONFIG[complaint.priority].bgColor} ${PRIORITY_CONFIG[complaint.priority].color}`}
                    >
                      {PRIORITY_CONFIG[complaint.priority].label}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">{complaint.priority || 'Unknown'}</Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {complaint.description}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{complaint.customer?.name || complaint.customerName || ''}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {complaint.createdAt && !isNaN(Date.parse(complaint.createdAt))
                        ? format(new Date(complaint.createdAt), 'MMM dd, HH:mm')
                        : 'N/A'}
                    </span>
                  </div>
                  <span className="text-primary">{complaint.region}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2 ml-4">
                {STATUS_CONFIG[complaint.status] ? (
                  <Badge 
                    variant="secondary"
                    className={`${STATUS_CONFIG[complaint.status].bgColor} ${STATUS_CONFIG[complaint.status].color}`}
                  >
                    {STATUS_CONFIG[complaint.status].label}
                  </Badge>
                ) : (
                  <Badge variant="secondary">{complaint.status || 'Unknown'}</Badge>
                )}
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}