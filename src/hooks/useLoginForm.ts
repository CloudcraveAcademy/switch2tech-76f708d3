
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
  const { login, loading: authLoading, setLoading } = useAuth();
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

  // Reset login progress when auth loading changes
  useEffect(() => {
    if (!authLoading) {
      setLoginInProgress(false);
    }
  }, [authLoading]);

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

  const resetLoginState = () => {
    setLoginInProgress(false);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted");

    if (!validate()) {
      return;
    }

    setLoginInProgress(true);
    setAuthError(null);
    
    try {
      console.log("Attempting login with email:", email, "remember me:", rememberMe);
      // We don't need to store the return data since the auth state listener will handle the session
      await login(email, password);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      console.log("Login successful");
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      
      // Set a short timeout before navigating to allow toast to display
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
      
    } catch (error: any) {
      console.error("Login error in handleSubmit:", error);
      
      // Handle specific error codes
      if (error.code === "email_not_confirmed") {
        setAuthError("Please check your email to confirm your account before logging in.");
      } else {
        setAuthError(error.message || "Please check your email and password");
      }
      
      toast({
        title: "Login failed",
        description: error.message || "Please check your email and password",
        variant: "destructive",
      });
      resetLoginState();
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
    resetLoginState,
  };
};
