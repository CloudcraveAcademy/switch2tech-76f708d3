
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface TicketResponse {
  id: string;
  ticket_id: string;
  user_id: string;
  response: string;
  created_at: string;
  user?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  user_id: string;
  assigned_to?: string;
  user_profiles?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

const fetchTickets = async () => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      user_profiles:user_id (first_name, last_name, avatar_url)
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

const fetchTicketResponses = async (ticketId: string) => {
  const { data, error } = await supabase
    .from('ticket_responses')
    .select(`
      *,
      user_profiles:user_id (first_name, last_name, avatar_url)
    `)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  return data;
};

const SupportTicketsPage = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponses, setTicketResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: fetchTickets,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const handleOpenTicket = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    try {
      const responses = await fetchTicketResponses(ticket.id);
      setTicketResponses(responses || []);
    } catch (error) {
      console.error('Error fetching ticket responses:', error);
    }
  };

  const handleCloseDialog = () => {
    setSelectedTicket(null);
    setNewResponse('');
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Status Updated',
        description: `Ticket status changed to ${newStatus}`,
      });
      
      refetch();
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({
          ...selectedTicket,
          status: newStatus as 'open' | 'in-progress' | 'closed'
        });
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update ticket status',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return;
    
    try {
      // Add response
      const { error: responseError } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: '123', // Replace with actual user ID
          response: newResponse
        });
      
      if (responseError) throw responseError;
      
      // Update status to in-progress if it's currently open
      if (selectedTicket.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in-progress' })
          .eq('id', selectedTicket.id);
      }
      
      toast({
        title: 'Response Submitted',
        description: 'Your response has been added to the ticket',
      });
      
      // Refresh data
      const responses = await fetchTicketResponses(selectedTicket.id);
      setTicketResponses(responses || []);
      setNewResponse('');
      refetch();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit your response',
        variant: 'destructive',
      });
    }
  };

  // Filter tickets based on status, priority, and search query
  const filteredTickets = tickets.filter((ticket: SupportTicket) => {
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
    const matchesSearch = !searchQuery || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <div className="flex space-x-2">
          {/* Filter and Search Controls */}
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search tickets..."
                className="pl-9 w-full md:w-60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('open')}>
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('in-progress')}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('closed')}>
                  Closed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Priority
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setPriorityFilter(null)}>
                  All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter('high')}>
                  High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter('medium')}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setPriorityFilter('low')}>
                  Low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket: SupportTicket) => (
              <Card key={ticket.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOpenTicket(ticket)}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {ticket.user_profiles?.avatar_url ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={ticket.user_profiles.avatar_url} />
                            <AvatarFallback>
                              {ticket.user_profiles?.first_name?.[0] || ''}
                              {ticket.user_profiles?.last_name?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {ticket.user_profiles?.first_name?.[0] || ''}
                              {ticket.user_profiles?.last_name?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <p className="font-medium">{ticket.subject}</p>
                          <p className="text-sm text-gray-500">
                            {ticket.user_profiles?.first_name} {ticket.user_profiles?.last_name} • 
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`${getStatusColor(ticket.status)} text-white`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className={`${getPriorityColor(ticket.priority)} text-white`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(ticket.id, 'open');
                          }}>
                            Mark as Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(ticket.id, 'in-progress');
                          }}>
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(ticket.id, 'closed');
                          }}>
                            Mark as Closed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No tickets match your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => handleCloseDialog()}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedTicket.subject}</span>
                <div className="flex space-x-2">
                  <Badge variant="outline" className={`${getStatusColor(selectedTicket.status)} text-white`}>
                    {selectedTicket.status.charAt(0).toUpperCase() + selectedTicket.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className={`${getPriorityColor(selectedTicket.priority)} text-white`}>
                    {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                  </Badge>
                </div>
              </DialogTitle>
              <DialogDescription className="text-sm">
                Submitted on {new Date(selectedTicket.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Original Ticket */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center space-x-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {selectedTicket.user_profiles?.first_name?.[0] || ''}
                      {selectedTicket.user_profiles?.last_name?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedTicket.user_profiles?.first_name} {selectedTicket.user_profiles?.last_name}</p>
                    <p className="text-xs text-gray-500">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-sm mt-2">{selectedTicket.description}</p>
              </div>

              {/* Ticket Responses */}
              {ticketResponses.map((response) => (
                <div key={response.id} className="bg-white border p-4 rounded-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {response.user?.first_name?.[0] || ''}
                        {response.user?.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{response.user?.first_name} {response.user?.last_name}</p>
                      <p className="text-xs text-gray-500">{new Date(response.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <p className="text-sm mt-2">{response.response}</p>
                </div>
              ))}

              {/* Add Response Form */}
              <div className="border-t pt-4 mt-4">
                <Label htmlFor="response">Add a response</Label>
                <Textarea
                  id="response"
                  className="mt-1"
                  placeholder="Type your response here..."
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between items-center">
              <div>
                <Label htmlFor="status" className="mr-2">Status:</Label>
                <Select 
                  value={selectedTicket.status} 
                  onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSubmitResponse} disabled={!newResponse.trim()}>
                Submit Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SupportTicketsPage;
