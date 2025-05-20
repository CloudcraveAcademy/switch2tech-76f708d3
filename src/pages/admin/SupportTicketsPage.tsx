
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Trash,
  Filter,
  MessageSquare,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define proper types for the support ticket
interface SupportTicket {
  id: string;
  user_id: string;
  assigned_to: string | null;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  user_profile?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface TicketResponse {
  id: string;
  ticket_id: string;
  user_id: string;
  response: string;
  created_at: string;
  user_profile?: {
    first_name: string;
    last_name: string;
  };
}

// Updated status types to match the database
type TicketStatus = 'open' | 'in-progress' | 'closed';
type TicketPriority = 'low' | 'medium' | 'high';

const SupportTicketsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState('');
  const [ticketResponses, setTicketResponses] = useState<TicketResponse[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch support tickets
  const {
    data: tickets = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async () => {
      try {
        // First, get all tickets
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('support_tickets')
          .select(`
            *,
            user_profiles:user_id (first_name, last_name, email)
          `)
          .order('created_at', { ascending: false });
  
        if (ticketsError) throw ticketsError;
  
        // Transform the data to match our expected SupportTicket type
        return (ticketsData || []).map((ticket: any) => ({
          ...ticket,
          status: ticket.status as TicketStatus,
          priority: ticket.priority as TicketPriority,
          user_profile: ticket.user_profiles,
        })) as SupportTicket[];
      } catch (error) {
        console.error('Error fetching tickets:', error);
        return [];
      }
    },
  });

  // Function to handle opening the response dialog
  const handleOpenResponseDialog = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsResponseDialogOpen(true);
    setResponseText('');

    try {
      // Fetch responses for this ticket
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          user_profiles:user_id (first_name, last_name)
        `)
        .eq('ticket_id', ticket.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform the data to match our TicketResponse type
      setTicketResponses(
        (data || []).map((response: any) => ({
          ...response,
          user_profile: response.user_profiles,
        }))
      );
    } catch (error) {
      console.error('Error fetching ticket responses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load ticket responses',
        variant: 'destructive',
      });
    }
  };

  // Function to submit a response
  const handleSubmitResponse = async () => {
    if (!selectedTicket || !responseText.trim()) return;

    setIsSubmitting(true);
    try {
      // Add the response
      const { error: responseError } = await supabase.from('ticket_responses').insert({
        ticket_id: selectedTicket.id,
        user_id: 'current_user_id', // This would normally come from auth context
        response: responseText,
      });

      if (responseError) throw responseError;

      // Update the ticket status to in-progress if it was open
      if (selectedTicket.status === 'open') {
        const { error: statusError } = await supabase
          .from('support_tickets')
          .update({ status: 'in-progress' })
          .eq('id', selectedTicket.id);

        if (statusError) throw statusError;
      }

      toast({
        title: 'Response submitted',
        description: 'Your response has been added to the ticket',
      });

      // Close dialog and refetch tickets
      setIsResponseDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit response',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to update ticket status
  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: 'Status updated',
        description: `Ticket status updated to ${status}`,
      });

      refetch();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update ticket status',
        variant: 'destructive',
      });
    }
  };

  // Function to delete a ticket
  const deleteTicket = async (ticketId: string) => {
    if (!confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete all responses for this ticket
      const { error: responsesError } = await supabase
        .from('ticket_responses')
        .delete()
        .eq('ticket_id', ticketId);

      if (responsesError) throw responsesError;

      // Then delete the ticket itself
      const { error: ticketError } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', ticketId);

      if (ticketError) throw ticketError;

      toast({
        title: 'Ticket deleted',
        description: 'The support ticket has been deleted',
      });

      refetch();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete ticket',
        variant: 'destructive',
      });
    }
  };

  // Filter tickets based on search term and filters
  const filteredTickets = tickets.filter((ticket) => {
    // Cast to ensure type safety
    const typedTicket = ticket as SupportTicket;
    
    // Search term filter
    const matchesSearch =
      typedTicket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      typedTicket.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = statusFilter === 'all' || typedTicket.status === statusFilter;

    // Priority filter
    const matchesPriority =
      priorityFilter === 'all' || typedTicket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
            <Clock className="w-3 h-3 mr-1" />
            Open
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            <RefreshCw className="w-3 h-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'closed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Closed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        );
    }
  };

  // Function to get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            Low
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
            Medium
          </Badge>
        );
      case 'high':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            High
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>{statusFilter === 'all' ? 'All Statuses' : statusFilter}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Select
                  value={priorityFilter}
                  onValueChange={(value) => setPriorityFilter(value as any)}
                >
                  <SelectTrigger>
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>
                        {priorityFilter === 'all' ? 'All Priorities' : priorityFilter}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tickets found.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => {
                    // Ensure ticket is properly typed
                    const typedTicket = ticket as SupportTicket;
                    
                    return (
                      <TableRow key={typedTicket.id}>
                        <TableCell className="font-medium">{typedTicket.subject}</TableCell>
                        <TableCell>
                          {typedTicket.user_profile
                            ? `${typedTicket.user_profile.first_name} ${typedTicket.user_profile.last_name}`
                            : 'Unknown User'}
                        </TableCell>
                        <TableCell>{getStatusBadge(typedTicket.status)}</TableCell>
                        <TableCell>{getPriorityBadge(typedTicket.priority)}</TableCell>
                        <TableCell>
                          {new Date(typedTicket.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog
                              open={isResponseDialogOpen && selectedTicket?.id === typedTicket.id}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setIsResponseDialogOpen(false);
                                  setSelectedTicket(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenResponseDialog(typedTicket)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" /> Respond
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                  <DialogTitle>{typedTicket.subject}</DialogTitle>
                                </DialogHeader>

                                <div className="mt-4 space-y-4">
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between">
                                      <div className="font-semibold">
                                        {typedTicket.user_profile
                                          ? `${typedTicket.user_profile.first_name} ${typedTicket.user_profile.last_name}`
                                          : 'Unknown User'}
                                      </div>
                                      <div className="text-gray-500 text-sm">
                                        {new Date(typedTicket.created_at).toLocaleString()}
                                      </div>
                                    </div>
                                    <p className="mt-2 whitespace-pre-wrap">
                                      {typedTicket.description}
                                    </p>
                                  </div>

                                  {ticketResponses.map((response) => (
                                    <div key={response.id} className="bg-blue-50 p-4 rounded-lg">
                                      <div className="flex justify-between">
                                        <div className="font-semibold">
                                          {response.user_profile
                                            ? `${response.user_profile.first_name} ${response.user_profile.last_name}`
                                            : 'Staff'}
                                        </div>
                                        <div className="text-gray-500 text-sm">
                                          {new Date(response.created_at).toLocaleString()}
                                        </div>
                                      </div>
                                      <p className="mt-2 whitespace-pre-wrap">{response.response}</p>
                                    </div>
                                  ))}

                                  <div className="space-y-2">
                                    <label className="font-medium">Your Response</label>
                                    <Textarea
                                      value={responseText}
                                      onChange={(e) => setResponseText(e.target.value)}
                                      placeholder="Type your response here..."
                                      className="min-h-[150px]"
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="font-medium">Update Status</label>
                                    <div className="flex gap-2">
                                      <Button
                                        variant={
                                          typedTicket.status === 'open' ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                          updateTicketStatus(typedTicket.id, 'open')
                                        }
                                      >
                                        Open
                                      </Button>
                                      <Button
                                        variant={
                                          typedTicket.status === 'in-progress'
                                            ? 'default'
                                            : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                          updateTicketStatus(typedTicket.id, 'in-progress')
                                        }
                                      >
                                        In Progress
                                      </Button>
                                      <Button
                                        variant={
                                          typedTicket.status === 'closed' ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        onClick={() =>
                                          updateTicketStatus(typedTicket.id, 'closed')
                                        }
                                      >
                                        Closed
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                <DialogFooter>
                                  <Button
                                    variant="secondary"
                                    onClick={() => {
                                      setIsResponseDialogOpen(false);
                                      setSelectedTicket(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={handleSubmitResponse}
                                    disabled={isSubmitting || !responseText.trim()}
                                  >
                                    {isSubmitting ? (
                                      <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting
                                      </>
                                    ) : (
                                      'Submit Response'
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTicket(typedTicket.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketsPage;
