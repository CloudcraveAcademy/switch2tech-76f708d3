import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Eye, CheckCircle, XCircle, Clock, Search, Filter, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatCurrency, convertFromUSD, Currency } from "@/utils/currencyConverter";

interface AdminPayoutsProps {
  currency: Currency;
}

const AdminPayouts: React.FC<AdminPayoutsProps> = ({ currency }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all payouts
  const { data: payouts, isLoading } = useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      // Get payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('instructor_payouts')
        .select('*')
        .order('created_at', { ascending: false });

      if (payoutsError) throw payoutsError;

      // Get instructor profiles
      const instructorIds = [...new Set(payoutsData?.map(p => p.instructor_id) || [])];
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .in('id', instructorIds);

      if (profilesError) throw profilesError;

      // Join the data
      const payoutsWithProfiles = payoutsData?.map(payout => ({
        ...payout,
        user_profiles: profiles?.find(profile => profile.id === payout.instructor_id)
      }));

      return payoutsWithProfiles || [];
    }
  });

  // Fetch instructors with revenue for creating new payouts
  const { data: instructorsWithRevenue } = useQuery({
    queryKey: ['instructors-revenue'],
    queryFn: async () => {
      // Get all instructors
      const { data: instructors, error: instructorsError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name')
        .eq('role', 'instructor');

      if (instructorsError) throw instructorsError;

      // Get revenue data for each instructor
      const instructorsWithData = await Promise.all(
        instructors.map(async (instructor) => {
          const { data: transactions, error } = await supabase
            .from('payment_transactions')
            .select(`
              *,
              courses!inner(instructor_id)
            `)
            .eq('courses.instructor_id', instructor.id)
            .eq('status', 'completed');

          if (error) return { ...instructor, totalRevenue: 0, pendingRevenue: 0 };

          const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
          
          // Calculate already paid out amounts
          const { data: existingPayouts } = await supabase
            .from('instructor_payouts')
            .select('gross_revenue')
            .eq('instructor_id', instructor.id)
            .eq('status', 'paid');

          const paidAmount = existingPayouts?.reduce((sum, p) => sum + Number(p.gross_revenue), 0) || 0;
          const pendingRevenue = Math.max(0, totalRevenue - paidAmount);

          return {
            ...instructor,
            totalRevenue,
            pendingRevenue
          };
        })
      );

      return instructorsWithData.filter(instructor => instructor.pendingRevenue > 0);
    }
  });

  const handleUpdatePayoutStatus = async (payoutId: string, newStatus: string, reference?: string) => {
    setIsProcessing(true);
    try {
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
        if (reference) updateData.payment_reference = reference;
      }

      const { error } = await supabase
        .from('instructor_payouts')
        .update(updateData)
        .eq('id', payoutId);

      if (error) throw error;

      toast.success(`Payout ${newStatus === 'paid' ? 'marked as paid' : 'status updated'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      setSelectedPayout(null);
    } catch (error: any) {
      toast.error('Failed to update payout: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreatePayout = async (instructorId: string, grossRevenue: number) => {
    setIsProcessing(true);
    try {
      // Get current commission percentage
      const { data: commissionData } = await supabase
        .from('commission_settings')
        .select('commission_percentage')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const commissionPercentage = commissionData?.commission_percentage || 10;
      const commissionAmount = (grossRevenue * commissionPercentage) / 100;
      const netPayout = grossRevenue - commissionAmount;

      const { error } = await supabase
        .from('instructor_payouts')
        .insert({
          instructor_id: instructorId,
          period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          period_end: new Date().toISOString().split('T')[0],
          gross_revenue: grossRevenue,
          commission_percentage: commissionPercentage,
          commission_amount: commissionAmount,
          net_payout: netPayout,
          currency: 'NGN',
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Payout created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['instructors-revenue'] });
      setShowCreateModal(false);
    } catch (error: any) {
      toast.error('Failed to create payout: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary' as const,
      processing: 'default' as const,
      paid: 'default' as const,
      cancelled: 'destructive' as const
    };
    
    const colors = {
      pending: 'text-orange-600',
      processing: 'text-blue-600',
      paid: 'text-green-600',
      cancelled: 'text-red-600'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'} className={colors[status as keyof typeof colors] || ''}>
        {status}
      </Badge>
    );
  };

  const filteredPayouts = payouts?.filter(payout => {
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      payout.user_profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.user_profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const convertAmount = (amount: number) => {
    return convertFromUSD(amount, currency);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Instructor Payouts</h2>
          <p className="text-muted-foreground">Manage instructor payments and commissions</p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Payout
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Payout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {instructorsWithRevenue && instructorsWithRevenue.length > 0 ? (
                instructorsWithRevenue.map((instructor) => (
                  <Card key={instructor.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">
                          {instructor.first_name} {instructor.last_name}
                        </h4>
                        <p className="text-sm">
                          Pending Revenue: {formatCurrency(convertAmount(instructor.pendingRevenue), currency)}
                        </p>
                      </div>
                      <Button 
                        onClick={() => handleCreatePayout(instructor.id, instructor.pendingRevenue)}
                        disabled={isProcessing}
                      >
                        Create Payout
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No instructors with pending revenue found
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Search instructors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Gross Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net Payout</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts && filteredPayouts.length > 0 ? (
                filteredPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {payout.user_profiles?.first_name} {payout.user_profiles?.last_name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(payout.period_start).toLocaleDateString()} - 
                        {new Date(payout.period_end).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(convertAmount(Number(payout.gross_revenue)), currency)}
                    </TableCell>
                    <TableCell className="text-red-600">
                      -{formatCurrency(convertAmount(Number(payout.commission_amount)), currency)}
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">
                      {formatCurrency(convertAmount(Number(payout.net_payout)), currency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell>
                      {new Date(payout.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayout(payout)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {payout.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdatePayoutStatus(payout.id, 'processing')}
                              disabled={isProcessing}
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdatePayoutStatus(payout.id, 'paid')}
                              disabled={isProcessing}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No payouts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payout Details Modal */}
      {selectedPayout && (
        <Dialog open={!!selectedPayout} onOpenChange={() => setSelectedPayout(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Payout Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Instructor</Label>
                  <p className="font-medium">
                    {selectedPayout.user_profiles?.first_name} {selectedPayout.user_profiles?.last_name}
                  </p>
                  
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedPayout.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Gross Revenue</Label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(convertAmount(Number(selectedPayout.gross_revenue)), currency)}
                  </p>
                </div>
                <div>
                  <Label>Commission ({selectedPayout.commission_percentage}%)</Label>
                  <p className="text-lg font-semibold text-red-600">
                    -{formatCurrency(convertAmount(Number(selectedPayout.commission_amount)), currency)}
                  </p>
                </div>
                <div>
                  <Label>Net Payout</Label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(convertAmount(Number(selectedPayout.net_payout)), currency)}
                  </p>
                </div>
              </div>

              {selectedPayout.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleUpdatePayoutStatus(selectedPayout.id, 'processing')}
                    disabled={isProcessing}
                  >
                    Mark as Processing
                  </Button>
                  <Button
                    onClick={() => handleUpdatePayoutStatus(selectedPayout.id, 'paid')}
                    disabled={isProcessing}
                  >
                    Mark as Paid
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdatePayoutStatus(selectedPayout.id, 'cancelled')}
                    disabled={isProcessing}
                  >
                    Cancel Payout
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminPayouts;