
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search, Filter, MapPin, User, Zap } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { STATUS_CONFIG, PRIORITY_CONFIG, COMPLAINT_CATEGORIES } from '@/types/complaint';
import { ETHIOPIAN_REGIONS } from '@/types/user';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function ComplaintsSearch() {
  const { canAccessRegion } = useAuth();
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    complaintId: '',
    customerName: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    region: 'all',
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined
  });

  const [searchResults, setSearchResults] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE}?action=getComplaints`);
        setAllComplaints(res.data || []);
        setSearchResults(res.data || []);
      } catch (err) {
        // handle error
      }
    };
    fetchComplaints();
  }, []);

  const handleSearch = () => {
    let filtered = allComplaints.filter((complaint: any) => canAccessRegion(complaint.region));

    // Apply keyword search
    if (searchFilters.keyword) {
      const keyword = searchFilters.keyword.toLowerCase();
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(keyword) ||
        complaint.description.toLowerCase().includes(keyword) ||
        complaint.customer.name.toLowerCase().includes(keyword) ||
        complaint.customer.address.toLowerCase().includes(keyword)
      );
    }

    // Apply complaint ID filter
    if (searchFilters.complaintId) {
      filtered = filtered.filter(complaint =>
        complaint.id.toLowerCase().includes(searchFilters.complaintId.toLowerCase())
      );
    }

    // Apply customer name filter
    if (searchFilters.customerName) {
      filtered = filtered.filter(complaint =>
        complaint.customer.name.toLowerCase().includes(searchFilters.customerName.toLowerCase())
      );
    }

    // Apply status filter
    if (searchFilters.status !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === searchFilters.status);
    }

    // Apply priority filter
    if (searchFilters.priority !== 'all') {
      filtered = filtered.filter(complaint => complaint.priority === searchFilters.priority);
    }

    // Apply category filter
    if (searchFilters.category !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === searchFilters.category);
    }

    // Apply region filter
    if (searchFilters.region !== 'all') {
      filtered = filtered.filter(complaint => complaint.region === searchFilters.region);
    }

    // Apply date range filter
    if (searchFilters.dateFrom) {
      filtered = filtered.filter(complaint =>
        new Date(complaint.createdAt) >= searchFilters.dateFrom!
      );
    }

    if (searchFilters.dateTo) {
      filtered = filtered.filter(complaint =>
        new Date(complaint.createdAt) <= searchFilters.dateTo!
      );
    }

    setSearchResults(filtered);
  };

  const clearFilters = () => {
    setSearchFilters({
      keyword: '',
      complaintId: '',
      customerName: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      region: 'all',
      dateFrom: undefined,
      dateTo: undefined
    });
    setSearchResults(allComplaints.filter((complaint: any) => canAccessRegion(complaint.region)));
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">Advanced Complaint Search</h1>
        <p className="text-muted-foreground mt-2">
          Search and filter electrical supply complaints using multiple criteria
        </p>
      </div>

      {/* Advanced Search Form */}
      <Card className="border-border animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Criteria</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Search Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keyword Search</label>
              <Input
                placeholder="Search in title, description..."
                value={searchFilters.keyword}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, keyword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Complaint ID</label>
              <Input
                placeholder="e.g., CMP-001"
                value={searchFilters.complaintId}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, complaintId: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <Input
                placeholder="Search by customer name"
                value={searchFilters.customerName}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={searchFilters.status} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={searchFilters.priority} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={searchFilters.category} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {COMPLAINT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={searchFilters.region} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {ETHIOPIAN_REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !searchFilters.dateFrom && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchFilters.dateFrom ? format(searchFilters.dateFrom, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={searchFilters.dateFrom}
                    onSelect={(date) => setSearchFilters(prev => ({ ...prev, dateFrom: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !searchFilters.dateTo && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {searchFilters.dateTo ? format(searchFilters.dateTo, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={searchFilters.dateTo}
                    onSelect={(date) => setSearchFilters(prev => ({ ...prev, dateTo: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button onClick={handleSearch} className="bg-gradient-primary">
              <Search className="mr-2 h-4 w-4" />
              Search Complaints
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      <Card className="border-border animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <CardHeader>
          <CardTitle>
            Search Results ({searchResults.length} complaints found)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No complaints found</h3>
              <p className="text-muted-foreground">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((complaint) => (
                <div key={complaint.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-foreground">{complaint.title}</h4>
                        <Badge variant="outline">{complaint.id}</Badge>
                        <Badge 
                          className={`${PRIORITY_CONFIG[complaint.priority].bgColor} ${PRIORITY_CONFIG[complaint.priority].color}`}
                        >
                          {PRIORITY_CONFIG[complaint.priority].label}
                        </Badge>
                        <Badge 
                          className={`${STATUS_CONFIG[complaint.status].bgColor} ${STATUS_CONFIG[complaint.status].color}`}
                        >
                          {STATUS_CONFIG[complaint.status].label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {complaint.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{complaint.customer.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{complaint.region}</span>
                        </div>
                        <span>{format(new Date(complaint.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}