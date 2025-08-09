import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Reply,
  Send,
  Loader2,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  parent_message_id?: string;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  recipient: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
  replies?: Message[];
}

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["messages", user?.id],
    queryFn: async () => {
      // First get the messages
      const { data: messagesData, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user?.id},recipient_id.eq.${user?.id}`)
        .is('parent_message_id', null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!messagesData || messagesData.length === 0) {
        return [];
      }

      // Get unique user IDs for sender and recipient
      const userIds = [...new Set([
        ...messagesData.map(msg => msg.sender_id),
        ...messagesData.map(msg => msg.recipient_id)
      ])];

      // Fetch user profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, first_name, last_name, avatar_url")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profileMap = (profiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Fetch replies for each message and attach user profiles
      const messagesWithReplies = await Promise.all(
        messagesData.map(async (message: any) => {
          const { data: replies, error: repliesError } = await supabase
            .from("messages")
            .select("*")
            .eq('parent_message_id', message.id)
            .order("created_at", { ascending: true });

          if (repliesError) throw repliesError;

          // Add user profiles to replies
          const repliesWithProfiles = (replies || []).map(reply => ({
            ...reply,
            sender: profileMap[reply.sender_id] || { first_name: 'Unknown', last_name: 'User', avatar_url: null },
            recipient: profileMap[reply.recipient_id] || { first_name: 'Unknown', last_name: 'User', avatar_url: null }
          }));
          
          return { 
            ...message, 
            replies: repliesWithProfiles,
            sender: profileMap[message.sender_id] || { first_name: 'Unknown', last_name: 'User', avatar_url: null },
            recipient: profileMap[message.recipient_id] || { first_name: 'Unknown', last_name: 'User', avatar_url: null }
          };
        })
      );

      return messagesWithReplies;
    },
    enabled: !!user?.id,
  });

  // Mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("id", messageId)
        .eq("recipient_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id] });
    },
  });

  // Send reply
  const sendReplyMutation = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const originalMessage = messages.find(m => m.id === messageId);
      if (!originalMessage) throw new Error("Original message not found");

      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: user?.id,
          recipient_id: originalMessage.sender_id === user?.id ? originalMessage.recipient_id : originalMessage.sender_id,
          subject: `Re: ${originalMessage.subject}`,
          content,
          parent_message_id: messageId,
        });

      if (error) throw error;

      // Create notification for recipient
      const recipientId = originalMessage.sender_id === user?.id ? originalMessage.recipient_id : originalMessage.sender_id;
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'message',
          title: `Reply to: ${originalMessage.subject}`,
          description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
          action_url: '/dashboard/messages',
          metadata: { sender_name: `${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}` }
        });

      if (notificationError) console.warn('Failed to create notification:', notificationError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", user?.id] });
      setReplyContent("");
      setIsReplying(false);
      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // Mark as read if user is recipient and message is unread
    if (message.recipient_id === user?.id && !message.read_at) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleReply = () => {
    if (!selectedMessage || !replyContent.trim()) return;
    sendReplyMutation.mutate({
      messageId: selectedMessage.id,
      content: replyContent,
    });
  };

  const isMessageUnread = (message: Message) => {
    return message.recipient_id === user?.id && !message.read_at;
  };

  const getOtherUser = (message: Message) => {
    return message.sender_id === user?.id ? message.recipient : message.sender;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading messages...</span>
        </div>
      </div>
    );
  }

  if (!selectedMessage) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center">
            <MessageSquare className="mr-2" /> Messages
          </h1>
        </div>

        {messages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No messages</h3>
              <p className="text-gray-500">You haven't received any messages yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const otherUser = getOtherUser(message);
              const unread = isMessageUnread(message);
              
              return (
                <Card 
                  key={message.id} 
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    unread ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={otherUser.avatar_url} />
                          <AvatarFallback>
                            {otherUser.first_name?.[0]}{otherUser.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className={`font-medium ${unread ? 'text-blue-900' : 'text-gray-900'}`}>
                              {otherUser.first_name} {otherUser.last_name}
                            </p>
                            {unread && <Badge className="bg-blue-500 text-white">New</Badge>}
                            {message.replies && message.replies.length > 0 && (
                              <Badge variant="outline">{message.replies.length} replies</Badge>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${unread ? 'font-medium text-blue-800' : 'text-gray-600'}`}>
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {message.content}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Message detail view
  const otherUser = getOtherUser(selectedMessage);
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedMessage(null)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Button>
        <h1 className="text-xl font-bold">{selectedMessage.subject}</h1>
      </div>

      <div className="space-y-6">
        {/* Original message */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedMessage.sender.avatar_url} />
                  <AvatarFallback>
                    {selectedMessage.sender.first_name?.[0]}{selectedMessage.sender.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {selectedMessage.sender.first_name} {selectedMessage.sender.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
          </CardContent>
        </Card>

        {/* Replies */}
        {selectedMessage.replies && selectedMessage.replies.map((reply) => (
          <Card key={reply.id} className="ml-8">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={reply.sender.avatar_url} />
                  <AvatarFallback>
                    {reply.sender.first_name?.[0]}{reply.sender.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {reply.sender.first_name} {reply.sender.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{reply.content}</p>
            </CardContent>
          </Card>
        ))}

        {/* Reply form */}
        <Card className="ml-8">
          <CardContent className="p-4">
            {!isReplying ? (
              <Button onClick={() => setIsReplying(true)} className="w-full">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={4}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleReply}
                    disabled={!replyContent.trim() || sendReplyMutation.isPending}
                  >
                    {sendReplyMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Messages;