
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NotificationService } from "@/services/NotificationService";

export const useRegisterForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    setErrors({});

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        },
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account.",
        });
        
        // Send welcome notification to the new user
        try {
          await NotificationService.createNotification({
            user_id: data.user.id,
            type: 'welcome',
            title: 'Welcome to our platform!',
            description: `Welcome ${firstName}! Your account has been created successfully. Please verify your email to get started.`,
            action_url: '/dashboard'
          });
          
          // Notify admin about new user registration
          const { data: adminUsers } = await supabase
            .from('user_profiles')
            .select('id')
            .in('role', ['admin', 'super_admin']);
            
          if (adminUsers && adminUsers.length > 0) {
            const adminNotifications = adminUsers.map(admin => ({
              user_id: admin.id,
              type: 'user_registration',
              title: 'New User Registration',
              description: `New ${role} registered: ${firstName} ${lastName}`,
              action_url: '/dashboard/users'
            }));
            
            await NotificationService.createMultipleNotifications(adminNotifications);
          }
        } catch (notificationError) {
          console.error('Failed to send registration notifications:', notificationError);
          // Don't fail registration for notification errors
        }
        
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    role,
    setRole,
    loading,
    errors,
    authError,
    handleSubmit,
  };
};
