import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const UserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Get email
      const { data: emailData } = await supabase.rpc('get_user_emails', { 
        user_ids: [userId] 
      });
      const email = Array.isArray(emailData) && emailData.length > 0 ? emailData[0].email : null;

      return { ...profile, email };
    }
  });

  // Fetch user enrollments
  const { data: enrollments } = useQuery({
    queryKey: ['admin-user-enrollments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (
            id,
            title,
            image_url,
            instructor_id
          )
        `)
        .eq('student_id', userId)
        .order('enrollment_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  // Fetch user transactions
  const { data: transactions } = useQuery({
    queryKey: ['admin-user-transactions', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          courses (
            title
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!userId
  });

  const handleRoleChange = async (newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
      });

      refetch();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId!);

      if (error) throw error;

      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      });

      navigate('/dashboard/users');
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">User not found</h1>
        <Button onClick={() => navigate('/dashboard/users')} className="mt-4">
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/users')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">User Profile</h1>
          <p className="text-muted-foreground">View and manage user details</p>
        </div>
        <Button variant="destructive" onClick={handleDeleteUser}>
          Delete User
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {user.first_name} {user.last_name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email || 'No email'}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select defaultValue={user.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Active
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user.phone || 'No phone number'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{user.country || 'No location'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{user.professional_title || 'No title'}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</span>
              </div>
              {user.bio && (
                <div className="text-sm">
                  <p className="font-medium mb-1">Bio</p>
                  <p className="text-muted-foreground">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrollments">Enrollments ({enrollments?.length || 0})</TabsTrigger>
          <TabsTrigger value="transactions">Transactions ({transactions?.length || 0})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Enrollments</CardTitle>
              <CardDescription>All courses this user is enrolled in</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments && enrollments.length > 0 ? (
                <div className="space-y-4">
                  {enrollments.map((enrollment: any) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        {enrollment.courses?.image_url && (
                          <img 
                            src={enrollment.courses.image_url} 
                            alt={enrollment.courses?.title}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{enrollment.courses?.title || 'Unknown Course'}</p>
                          <p className="text-sm text-muted-foreground">
                            Enrolled {formatDistanceToNow(new Date(enrollment.enrollment_date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={enrollment.completed ? "default" : "secondary"}>
                          {enrollment.completed ? 'Completed' : 'In Progress'}
                        </Badge>
                        {enrollment.progress !== null && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {enrollment.progress}% complete
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No enrollments found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>Payment history for this user</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{transaction.courses?.title || 'Course Payment'}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {transaction.currency === 'NGN' ? '₦' : '$'}
                          {transaction.amount?.toLocaleString()}
                        </p>
                        <Badge variant={transaction.status === 'successful' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No transactions found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>User activity across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Activity tracking coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetailPage;
