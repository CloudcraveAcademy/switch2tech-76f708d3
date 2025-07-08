
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export interface LoginFormErrors {
  email: string;
  password: string;
}

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({ email: "", password: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Load remembered email from localStorage on initial render
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };
    setAuthError(null);

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }

    if (!password && !showForgotPassword) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6 && !showForgotPassword) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt for:", email);

    if (!validate()) {
      return;
    }

    setLoginInProgress(true);
    setAuthError(null);
    
    try {
      console.log("Calling login function...");
      await login(email, password);
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      console.log("Login successful");
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Please check your email to confirm your account before logging in.";
      } else if (error.message?.includes("Too many requests")) {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAuthError(errorMessage);
      
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoginInProgress(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    loginInProgress,
    errors,
    authError,
    loading: authLoading,
    showForgotPassword,
    setShowForgotPassword,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    handleSubmit,
  };
};
