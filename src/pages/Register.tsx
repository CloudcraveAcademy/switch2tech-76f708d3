
import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import { RegisterForm } from "@/components/auth/RegisterForm";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
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
  } = useRegisterForm();

  // Extract redirect path from URL params
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || "/dashboard";

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      console.log("User is already authenticated, redirecting to:", redirectPath);
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  // Handle registration and redirect
  const handleRegister = async (e: React.FormEvent) => {
    const result = await handleSubmit(e);
    if (result?.success) {
      console.log("Registration successful, redirecting to:", redirectPath);
      // Wait a moment for auth state to settle, then redirect
      setTimeout(() => {
        navigate(redirectPath);
      }, 1000);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Join our learning community today</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
          <RegisterForm
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            role={role}
            setRole={setRole}
            loading={loading}
            errors={errors}
            authError={authError}
            handleSubmit={handleRegister}
          />

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link 
              to={`/login${redirectPath !== "/dashboard" ? `?redirect=${encodeURIComponent(redirectPath)}` : ""}`} 
              className="text-brand-600 hover:text-brand-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
