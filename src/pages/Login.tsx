
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 1.667C5.4 1.667 1.667 5.4 1.667 10c0 3.7 2.4 6.833 5.733 7.933.417.075.583-.175.583-.4 0-.183-.008-.8-.008-1.45-2.092.383-2.642-.517-2.808-1-.093-.233-.5-.95-.858-1.142-.292-.158-.708-.542-.008-.55.658-.008 1.125.608 1.283.858.75 1.267 1.95.908 2.425.692.075-.55.292-.917.533-1.125-1.85-.208-3.783-.925-3.783-4.108 0-.917.317-1.675.842-2.258-.083-.208-.375-1.075.083-2.225 0 0 .7-.217 2.275.85.667-.183 1.375-.275 2.083-.275.708 0 1.417.092 2.084.275 1.575-1.075 2.275-.85 2.275-.85.459 1.15.167 2.017.084 2.225.525.583.841 1.333.841 2.258 0 3.192-1.941 3.9-3.8 4.108.3.258.558.75.558 1.517 0 1.1-.008 1.983-.008 2.258 0 .225.158.475.583.4 3.333-1.1 5.733-4.233 5.733-7.933 0-4.6-3.733-8.333-8.333-8.333z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>

              <div>
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 text-[#4285F4]" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

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
