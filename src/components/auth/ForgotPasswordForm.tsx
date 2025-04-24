
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordFormProps {
  forgotPasswordEmail: string;
  setForgotPasswordEmail: (email: string) => void;
  setShowForgotPassword: (show: boolean) => void;
  error?: string;
}

export const ForgotPasswordForm = ({
  forgotPasswordEmail,
  setForgotPasswordEmail,
  setShowForgotPassword,
  error
}: ForgotPasswordFormProps) => {
  const { toast } = useToast();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for instructions to reset your password",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message || "An error occurred while resetting your password",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleForgotPassword}>
      <div className="space-y-4">
        <h2 className="text-xl font-medium text-gray-900">Reset Your Password</h2>
        <p className="text-sm text-gray-600">
          Enter your email and we'll send you instructions to reset your password.
        </p>
        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <Input
            id="forgot-email"
            type="email"
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            placeholder="you@example.com"
            className={error ? "border-red-300" : ""}
          />
          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex space-x-2">
          <Button type="submit" className="flex-1">
            Send Reset Link
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowForgotPassword(false)} 
            className="flex-1"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </form>
  );
};
