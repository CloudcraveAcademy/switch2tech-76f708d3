
import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useLoginForm } from "@/hooks/useLoginForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    loginInProgress,
    errors,
    authError,
    showForgotPassword,
    setShowForgotPassword,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    handleSubmit,
  } = useLoginForm();

  // Extract redirect path from URL params
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || "/dashboard";

  // Redirect authenticated users after auth has finished loading
  useEffect(() => {
    if (!loading && user) {
      console.log("Login: User authenticated, redirecting to:", redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate, redirectPath]);

  // Don't show anything while auth is initializing
  if (loading) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  // If user is authenticated but we're still on login page, show redirecting message
  if (user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="text-center">Redirecting...</div>
        </div>
      </Layout>
    );
  }

  // Show login form for unauthenticated users
  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Log in to your account to continue learning</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          {!showForgotPassword ? (
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              rememberMe={rememberMe}
              setRememberMe={setRememberMe}
              errors={errors}
              loading={loading}
              loginInProgress={loginInProgress}
              setShowForgotPassword={setShowForgotPassword}
              handleSubmit={handleSubmit}
              authError={authError}
            />
          ) : (
            <ForgotPasswordForm
              forgotPasswordEmail={forgotPasswordEmail}
              setForgotPasswordEmail={setForgotPasswordEmail}
              setShowForgotPassword={setShowForgotPassword}
              error={errors.email}
            />
          )}


          <p className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link 
              to={`/register${redirectPath !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} 
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
