
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Filter, Eye, Edit, Trash2, User, Calendar } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { STATUS_CONFIG, PRIORITY_CONFIG, Complaint } from '@/types/complaint';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export function ComplaintsList() {
  const { canAccessRegion, permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [allComplaints, setAllComplaints] = useState([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch complaints from backend
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get('/api?action=getComplaints');
        console.log('Complaints API response:', res.data);
        if (Array.isArray(res.data)) {
          // Map backend keys to frontend keys
          const mapped = res.data.map((c: any) => ({
            id: c.ID,
            customerId: c['Customer ID'],
            customerName: c['Customer Name'] || c.customerName || '',
            title: c.Title,
            category: c.Category,
            priority: c.Priority,
            status: c.Status,
            region: c.Region,
            assignedTo: c['Assigned To'],
            assignedBy: c['Assigned By'],
            createdBy: c['Created By'],
            createdAt: c['Created At'],
            updatedAt: c['Updated At'],
            estResolution: c['Est. Resolution'],
            resolvedAt: c['Resolved At'],
            notes: c.Notes,
            // Add other fields as needed
          }));
          setAllComplaints(mapped);
        } else {
          setAllComplaints([]);
        }
      } catch (err) {
        setAllComplaints([]);
        console.error('Failed to fetch complaints:', err);
      }
    };
    fetchComplaints();
  }, []);

  // Filter complaints based on user access and search criteria
  const filteredComplaints = allComplaints
    .filter((complaint: any) => {
      const matchesAccess = canAccessRegion(complaint.region);
      const customerName = (complaint.customer && complaint.customer.name) ? complaint.customer.name : (complaint.customerName || '');
      const matchesSearch = searchTerm === '' || 
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || complaint.priority === priorityFilter;
      return matchesAccess && matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a: any, b: any) => {
      // Sort by createdAt descending (recent first)
      const dateA = a.createdAt && !isNaN(Date.parse(a.createdAt)) ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt && !isNaN(Date.parse(b.createdAt)) ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

  const navigate = useNavigate();
  const handleViewComplaint = (complaint: Complaint) => {
    navigate(`/complaints/${complaint.id}`);
  };

  const handleEditComplaint = (complaint: Complaint) => {
    // In a real app, this would navigate to edit form
    console.log('Edit complaint:', complaint.id);
  };

  const handleDeleteComplaint = async (complaint: Complaint) => {
    if (!window.confirm('Are you sure you want to delete this complaint?')) return;
    setDeletingId(complaint.id);
    try {
      const res = await axios.post('/api', {
        action: 'deleteComplaint',
        id: complaint.id,
      });
      if (res.data && res.data.success) {
        setAllComplaints((prev) => prev.filter((c: any) => c.id !== complaint.id));
      } else {
        alert('Failed to delete complaint.');
      }
    } catch (err) {
      alert('Error deleting complaint.');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">All Complaints</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track electrical supply complaints
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="border-border animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card className="border-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>
            Complaints ({filteredComplaints.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No complaints found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredComplaints.map((complaint, idx) => (
                    <TableRow key={complaint.id ? String(complaint.id) : `row-${idx}`} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        {complaint.id}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{complaint.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {(complaint.category ? String(complaint.category).replace('-', ' ') : '')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{complaint.customerName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-primary">{complaint.region}</span>
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {complaint.createdAt && !isNaN(Date.parse(complaint.createdAt))
                              ? format(new Date(complaint.createdAt), 'MMM dd')
                              : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewComplaint(complaint)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {permissions.complaints.update && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditComplaint(complaint)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {permissions.complaints.delete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComplaint(complaint)}
                              className="h-8 w-8 p-0 text-destructive"
                              disabled={deletingId === complaint.id}
                            >
                              {deletingId === complaint.id ? (
                                <span className="animate-spin"><Trash2 className="h-4 w-4" /></span>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}