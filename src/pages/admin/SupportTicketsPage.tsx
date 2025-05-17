import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquare, 
  Search, 
  Filter,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";

const SupportTicketsPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  // Fetch all tickets
  const { data: tickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          id,
          subject,
          description,
          status,
          priority,
          created_at,
          user_id,
          user:user_id(first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tickets:", error);
        throw error;
      }

      return data.map(ticket => ({
        ...ticket,
        user: ticket.user || {
          first_name: 'Unknown',
          last_name: 'User',
          avatar_url: null
        }
      })) || [];
    },
  });

  // Filter tickets based on the active tab and search
  const filteredTickets = tickets?.filter(ticket => {
    const matchesTab = activeTab === "all" || ticket.status === activeTab;
    const matchesSearch = search === "" || 
      ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase()) ||
      `${ticket.user.first_name} ${ticket.user.last_name}`.toLowerCase().includes(search.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "pending": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "resolved": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "closed": return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "medium": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "low": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open": return <Clock className="h-4 w-4" />;
      case "pending": return <AlertCircle className="h-4 w-4" />;
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      case "closed": return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Support Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage customer support inquiries</p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search tickets..." 
                className="pl-10 w-[260px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Priority: High</DropdownMenuItem>
                <DropdownMenuItem>Priority: Medium</DropdownMenuItem>
                <DropdownMenuItem>Priority: Low</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Date: Newest</DropdownMenuItem>
                <DropdownMenuItem>Date: Oldest</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              {isLoadingTickets ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredTickets?.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tickets found</h3>
                  <p className="text-gray-500">There are no support tickets matching your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-sm text-gray-500">
                        <th className="text-left py-3 px-4 font-medium">Ticket</th>
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-center py-3 px-4 font-medium">Priority</th>
                        <th className="text-center py-3 px-4 font-medium">Status</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-4 px-4">
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {ticket.description.length > 80 
                                ? ticket.description.substring(0, 80) + '...' 
                                : ticket.description}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-3">
                                <AvatarImage 
                                  src={ticket.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ticket.user_id}`}
                                  alt="User avatar" 
                                />
                                <AvatarFallback>
                                  {ticket.user.first_name[0]}
                                  {ticket.user.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">
                                {ticket.user.first_name} {ticket.user.last_name}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center justify-center w-24 mx-auto ${getStatusColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1">
                                {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                              </span>
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Assign Agent</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Mark as Resolved</DropdownMenuItem>
                                <DropdownMenuItem>Mark as Pending</DropdownMenuItem>
                                <DropdownMenuItem>Close Ticket</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content for other tabs (open, pending, resolved) would be similar */}
        <TabsContent value="open" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              {isLoadingTickets ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div>{/* Similar content as "all" tab, but filtered for open tickets */}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              {isLoadingTickets ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div>{/* Similar content as "all" tab, but filtered for pending tickets */}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              {isLoadingTickets ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div>{/* Similar content as "all" tab, but filtered for resolved tickets */}</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Center Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Help Center Settings</CardTitle>
          <CardDescription>Configure your support system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">Auto-Assignment</h3>
                <p className="text-sm text-gray-500 mb-4">Configure automatic ticket assignment rules</p>
                <Button variant="outline">Configure</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">Response Templates</h3>
                <p className="text-sm text-gray-500 mb-4">Create and manage canned responses</p>
                <Button variant="outline">Manage Templates</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-2">Support Hours</h3>
                <p className="text-sm text-gray-500 mb-4">Set your support team availability hours</p>
                <Button variant="outline">Set Hours</Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportTicketsPage;
