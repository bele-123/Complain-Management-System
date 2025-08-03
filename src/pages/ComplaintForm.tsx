import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { COMPLAINT_CATEGORIES, ComplaintCategory, ComplaintPriority } from '@/types/complaint';
import { ETHIOPIAN_REGIONS } from '@/types/user';

export function ComplaintForm() {
  const { toast } = useToast();
  const { user, permissions } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    region: user?.region || '',
    meterNumber: '',
    accountNumber: '',
    title: '',
    description: '',
    category: '' as ComplaintCategory,
    priority: 'medium' as ComplaintPriority
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const complaintData = {
        action: 'createComplaint',
        customerId: '', // If you have a customer ID, pass it here
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        region: formData.region,
        meterNumber: formData.meterNumber,
        accountNumber: formData.accountNumber,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        createdBy: user?.id || '',
        notes: [],
        attachments: []
      };
      const res = await axios.post('/api', complaintData);
      toast({
        title: "Complaint Submitted Successfully",
        description: `Complaint ID: ${res.data.id} has been created.`,
      });
      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        region: user?.region || '',
        meterNumber: '',
        accountNumber: '',
        title: '',
        description: '',
        category: '' as ComplaintCategory,
        priority: 'medium'
      });
    } catch (err) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your complaint.",
        variant: "destructive"
      });
    }
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Determine available priority levels based on role
  const availablePriorities = permissions.canSetHighPriority 
    ? ['low', 'medium', 'high', 'critical']
    : ['low', 'medium'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">New Complaint</h1>
        <p className="text-muted-foreground mt-2">
          Submit a new electrical supply complaint
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <Card className="border-border mb-6">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Full name of the customer"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="customer@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  placeholder="+251-9XX-XXXXXX"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address *</Label>
              <Textarea
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                placeholder="Complete address including sub-city/woreda"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="meterNumber">Meter Number</Label>
                <Input
                  id="meterNumber"
                  value={formData.meterNumber}
                  onChange={(e) => handleInputChange('meterNumber', e.target.value)}
                  placeholder="e.g., AAM-001234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="e.g., ACC-789456"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Complaint Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Brief description of the issue"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value: ComplaintCategory) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select complaint category" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value: ComplaintPriority) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  {availablePriorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide detailed description of the issue, including when it started, affected areas, and any relevant information..."
                className="min-h-[120px]"
                required
              />
            </div>
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}