
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, User, Filter, ArrowUpDown, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const SupportTicketsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [responseText, setResponseText] = useState("");
  
  const { data: tickets, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user_profiles:user_id (first_name, last_name, avatar_url),
          assigned_user:assigned_to (first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: responses } = useQuery({
    queryKey: ['ticket-responses', selectedTicket?.id],
    queryFn: async () => {
      if (!selectedTicket?.id) return [];
      
      const { data, error } = await supabase
        .from('ticket_responses')
        .select(`
          *,
          user_profiles:user_id (first_name, last_name, avatar_url, role)
        `)
        .eq('ticket_id', selectedTicket.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedTicket?.id
  });

  const filteredTickets = tickets?.filter(ticket => {
    const matchesSearch = 
      searchTerm === "" || 
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user_profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId);

      if (error) throw error;
      
      toast({
        title: "Ticket updated",
        description: `Ticket status has been set to ${newStatus}.`,
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTicketPriority = async (ticketId: string, newPriority: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ priority: newPriority })
        .eq('id', ticketId);

      if (error) throw error;
      
      toast({
        title: "Ticket updated",
        description: `Ticket priority has been set to ${newPriority}.`,
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket priority. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save the response
      const { error: responseError } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user.id,
          response: responseText
        });

      if (responseError) throw responseError;

      // Update ticket status to "in-progress" if currently "open"
      if (selectedTicket.status === "open") {
        const { error: updateError } = await supabase
          .from('support_tickets')
          .update({ 
            status: "in-progress",
            assigned_to: user.id
          })
          .eq('id', selectedTicket.id);

        if (updateError) throw updateError;
      }
      
      toast({
        title: "Response sent",
        description: "Your response has been sent successfully.",
      });
      
      setResponseText("");
      refetch();
      
    } catch (error) {
      console.error("Error sending response:", error);
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openTicketDialog = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-red-500">Error loading tickets: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Support Tickets</h1>
      <p className="text-gray-600">Manage and respond to user support tickets</p>
      
      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-start md:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search tickets..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">
                    <div className="flex items-center">
                      ID
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </div>
                  </th>
                  <th className="text-left py-3 px-4 font-semibold">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold">User</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold">Created</th>
                  <th className="text-left py-3 px-4 font-semibold">Assigned To</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets?.map((ticket) => (
                  <tr key={ticket.id} className="border-b">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm">#{ticket.id.substring(0, 8)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium cursor-pointer hover:text-blue-600" onClick={() => openTicketDialog(ticket)}>
                        {ticket.subject}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {ticket.user_profiles?.avatar_url ? (
                            <img 
                              src={ticket.user_profiles.avatar_url} 
                              alt={`${ticket.user_profiles.first_name} ${ticket.user_profiles.last_name}`} 
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <span>
                          {ticket.user_profiles?.first_name} {ticket.user_profiles?.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Select 
                        defaultValue={ticket.status} 
                        onValueChange={(value) => handleUpdateTicketStatus(ticket.id, value)}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4">
                      <Select 
                        defaultValue={ticket.priority} 
                        onValueChange={(value) => handleUpdateTicketPriority(ticket.id, value)}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span>
                        {ticket.assigned_user 
                          ? `${ticket.assigned_user.first_name} ${ticket.assigned_user.last_name}`
                          : "Unassigned"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" onClick={() => openTicketDialog(ticket)}>View</Button>
                    </td>
                  </tr>
                ))}
                {filteredTickets?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No tickets found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>{selectedTicket.subject}</span>
                </DialogTitle>
                <DialogDescription className="flex justify-between items-center">
                  <div>
                    From: {selectedTicket.user_profiles?.first_name} {selectedTicket.user_profiles?.last_name}
                  </div>
                  <div className="flex space-x-2 items-center">
                    <Badge variant={
                      selectedTicket.status === "open" ? "default" :
                      selectedTicket.status === "in-progress" ? "secondary" :
                      selectedTicket.status === "resolved" ? "success" : "outline"
                    }>
                      {selectedTicket.status}
                    </Badge>
                    <Badge variant={
                      selectedTicket.priority === "low" ? "outline" :
                      selectedTicket.priority === "medium" ? "default" :
                      selectedTicket.priority === "high" ? "secondary" : "destructive"
                    }>
                      {selectedTicket.priority} priority
                    </Badge>
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-sm font-medium mb-2 text-gray-500">Original Message:</h4>
                <p>{selectedTicket.description}</p>
              </div>
              
              <div className="space-y-4">
                {responses && responses.length > 0 ? (
                  <>
                    <h4 className="font-medium text-gray-700">Responses:</h4>
                    {responses.map(response => (
                      <div key={response.id} className={`p-4 rounded-md ${
                        response.user_profiles?.role === 'admin' ? 'bg-blue-50' : 'bg-gray-50'
                      }`}>
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center">
                            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                              {response.user_profiles?.avatar_url ? (
                                <img 
                                  src={response.user_profiles.avatar_url} 
                                  alt={`${response.user_profiles.first_name}`}
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-3 w-3 text-gray-500" />
                              )}
                            </div>
                            <span className="font-medium">
                              {response.user_profiles.first_name} {response.user_profiles.last_name}
                              {' '}
                              <Badge variant="outline" className="ml-1">
                                {response.user_profiles.role}
                              </Badge>
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(response.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p>{response.response}</p>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500">No responses yet</div>
                )}
              </div>
              
              {selectedTicket.status !== "closed" && (
                <div className="space-y-4 mt-4">
                  <Textarea
                    placeholder="Type your response here..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500">
                    Your response will be sent to the user and saved to this ticket.
                  </p>
                </div>
              )}
              
              <DialogFooter>
                <div className="flex justify-between w-full">
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateTicketStatus(selectedTicket.id, "closed")}
                      disabled={selectedTicket.status === "closed"}
                    >
                      Close Ticket
                    </Button>
                    <Button
                      variant={selectedTicket.status === "resolved" ? "outline" : "default"}
                      onClick={() => handleUpdateTicketStatus(selectedTicket.id, "resolved")}
                      disabled={selectedTicket.status === "resolved" || selectedTicket.status === "closed"}
                    >
                      Mark Resolved
                    </Button>
                  </div>
                  <Button 
                    onClick={handleSubmitResponse}
                    disabled={selectedTicket.status === "closed" || !responseText.trim()}
                  >
                    Send Response
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportTicketsPage;
