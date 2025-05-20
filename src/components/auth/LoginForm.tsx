
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { LoginFormErrors } from "@/hooks/useLoginForm";
import { demoAccounts } from "@/utils/demoAccounts";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  rememberMe: boolean;
  setRememberMe: (checked: boolean) => void;
  errors: LoginFormErrors;
  loading: boolean;
  loginInProgress: boolean;
  setShowForgotPassword: (show: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  authError: string | null;
}

export const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  errors,
  loading,
  loginInProgress,
  setShowForgotPassword,
  handleSubmit,
  authError,
}: LoginFormProps) => {
  // Get demo accounts from the exported array
  const adminAccount = demoAccounts.find(account => account.role === "admin");
  const instructorAccount = demoAccounts.find(account => account.role === "instructor");
  const studentAccount = demoAccounts.find(account => account.role === "student");

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {authError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={errors.email ? "border-red-300" : ""}
            disabled={loginInProgress}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={errors.password ? "border-red-300" : ""}
            disabled={loginInProgress}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={loginInProgress}
            />
            <label
              htmlFor="remember-me"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <button
              type="button"
              className="text-brand-600 hover:text-brand-700"
              onClick={() => setShowForgotPassword(true)}
              disabled={loginInProgress}
            >
              Forgot password?
            </button>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loginInProgress}
        >
          {loginInProgress ? "Logging in..." : "Log in"}
        </Button>
        
        {/* Demo credentials */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">Demo credentials</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => {
                setEmail(adminAccount?.email || "admin@example.com");
                setPassword(adminAccount?.password || "password");
              }}
              disabled={loginInProgress}
            >
              Admin
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => {
                setEmail(instructorAccount?.email || "instructor@example.com");
                setPassword(instructorAccount?.password || "password");
              }}
              disabled={loginInProgress}
            >
              Instructor
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              className="text-xs"
              onClick={() => {
                setEmail(studentAccount?.email || "student@example.com");
                setPassword(studentAccount?.password || "password");
              }}
              disabled={loginInProgress}
            >
              Student
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
