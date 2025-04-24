
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import type { LoginFormErrors } from "@/hooks/useLoginForm";

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
}: LoginFormProps) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
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
      </div>
    </form>
  );
};
