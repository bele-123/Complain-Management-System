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

export function ComplaintFormAmharic() {
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
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}?action=createComplaint`,
        {
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
        }
      );
      toast({
        title: "ቅሬታ በተሳካ ሁኔታ ተልክዋል",
        description: `ቅሬታ መለያ: ${res.data.id} ተፈጥሯል።`,
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
        title: "ማስገባት አልተሳካም",
        description: "ቅሬታዎን ማስገባት ላይ ችግር ተፈጥሯል።",
        variant: "destructive"
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold text-foreground">አዲስ ቅሬታ</h1>
        <p className="text-muted-foreground mt-2">
          የኤሌክትሪክ አቅርቦት ቅሬታ ያስገቡ
        </p>
      </div>

      <form onSubmit={handleSubmit} className="animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>የደንበኛ መረጃ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ሙሉ ስም *</Label>
                <Input
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="ሙሉ ስም ያስገቡ"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ኢሜይል</Label>
                  <Input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="customer@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ስልክ ቁጥር *</Label>
                  <Input
                    value={formData.customerPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+251-9XX-XXXXXX"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>አድራሻ *</Label>
                <Textarea
                  value={formData.customerAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="ሙሉ አድራሻ ክፍለ ከተማ/ወረዳ ጨምሮ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>ክልል *</Label>
                <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="ክልል ይምረጡ" />
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
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>የቅሬታ ዝርዝር</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>የቅሬታ ርዕስ *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="የችግሩ አጭር መግለጫ"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>ምድብ *</Label>
                <Select value={formData.category} onValueChange={(value: ComplaintCategory) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="የቅሬታ ምድብ ይምረጡ" />
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
                <Label>ዝርዝር መግለጫ *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="የችግሩ ዝርዝር መግለጫ፣ መቼ እንደጀመረ፣ የተጎዱ አካባቢዎች እና ሌሎች አስፈላጊ መረጃዎችን ያካትቱ..."
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
                  {isSubmitting ? 'እየላካል...' : 'ቅሬታ አስገባ'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}