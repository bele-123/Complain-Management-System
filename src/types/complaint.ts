export type ComplaintStatus = 'open' | 'in-progress' | 'resolved' | 'closed' | 'cancelled';
export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
export type ComplaintCategory = 
  | 'power-outage'
  | 'voltage-fluctuation'
  | 'billing-issue'
  | 'meter-problem'
  | 'line-damage'
  | 'transformer-issue'
  | 'safety-concern'
  | 'new-connection'
  | 'disconnection'
  | 'other';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  meterNumber?: string;
  accountNumber?: string;
}

export interface Complaint {
  id: string;
  customerId: string;
  customer: Customer;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  region: string;
  assignedTo?: string;
  assignedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  estimatedResolution?: string;
  notes: string[];
  attachments?: string[];
}

export const COMPLAINT_CATEGORIES = [
  { value: 'power-outage', label: 'Power Outage', icon: 'Zap' },
  { value: 'voltage-fluctuation', label: 'Voltage Fluctuation', icon: 'Activity' },
  { value: 'billing-issue', label: 'Billing Issue', icon: 'Receipt' },
  { value: 'meter-problem', label: 'Meter Problem', icon: 'Gauge' },
  { value: 'line-damage', label: 'Line Damage', icon: 'Cable' },
  { value: 'transformer-issue', label: 'Transformer Issue', icon: 'Box' },
  { value: 'safety-concern', label: 'Safety Concern', icon: 'Shield' },
  { value: 'new-connection', label: 'New Connection', icon: 'Plus' },
  { value: 'disconnection', label: 'Disconnection', icon: 'Minus' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' }
] as const;

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  medium: { label: 'Medium', color: 'text-primary', bgColor: 'bg-primary/10' },
  high: { label: 'High', color: 'text-warning', bgColor: 'bg-warning/10' },
  critical: { label: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/10' }
} as const;

export const STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-primary', bgColor: 'bg-primary/10' },
  'in-progress': { label: 'In Progress', color: 'text-warning', bgColor: 'bg-warning/10' },
  resolved: { label: 'Resolved', color: 'text-success', bgColor: 'bg-success/10' },
  closed: { label: 'Closed', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  cancelled: { label: 'Cancelled', color: 'text-destructive', bgColor: 'bg-destructive/10' }
} as const;