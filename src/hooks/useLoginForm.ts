
import { useState } from "react";
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
  const { login, loading, setLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginInProgress, setLoginInProgress] = useState(false);
  const [errors, setErrors] = useState<LoginFormErrors>({ email: "", password: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const validate = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

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
    console.log("Login form submitted");

    if (!validate()) {
      return;
    }

    setLoginInProgress(true);
    
    try {
      console.log("Attempting login with email:", email, "remember me:", rememberMe);
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
    } catch (error: any) {
      console.error("Login error in handleSubmit:", error);
      setLoginInProgress(false);
      setLoading(false);
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
    loading,
    showForgotPassword,
    setShowForgotPassword,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    handleSubmit,
  };
};
