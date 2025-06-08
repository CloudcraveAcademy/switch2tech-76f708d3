import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileData } from "@/hooks/useProfileData";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PhoneInput } from "@/components/ui/phone-input";
import { toast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  CreditCard,
  ArrowLeft,
  Play,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRIES } from "@/utils/countries";
import LiveCourseDetails from "@/components/course/LiveCourseDetails";

// Enrollment form schema - updated to include password for new users
const enrollmentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  phone: z.string().min(10, "Please enter a valid phone number"),
  country: z.string().min(2, "Please select your country"),
  currency: z.string().min(3, "Please select your currency"),
  motivation: z.string().min(20, "Please tell us why you want to take this course (minimum 20 characters)"),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

// Currency configuration with USD as base
const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

// Exchange rates with USD as base (1 USD = X in target currency)
const EXCHANGE_RATES = {
  USD: 1,
  NGN: 1650,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.41,
  AUD: 1.56,
};

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

const EnrollmentPage = () => {
  const { id: courseId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { profileData } = useProfileData();
  const navigate = useNavigate();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [flutterwaveLoaded, setFlutterwaveLoaded] = useState(false);
  const [isNewUser, setIsNewUser] = useState(!user);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      password: "",
      phone: "",
      country: "",
      currency: "USD",
      motivation: "",
    },
  });

  // Pre-fill form with user profile data when available
  useEffect(() => {
    if (profileData && user) {
      console.log("Pre-filling form with profile data:", profileData);
      form.reset({
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        email: user.email || "",
        phone: profileData.phone || "",
        country: profileData.country || "",
        currency: "USD",
        motivation: "",
      });
    }
  }, [profileData, user, form]);

  // Load Flutterwave script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    script.onload = () => {
      setFlutterwaveLoaded(true);
      console.log('Flutterwave script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Flutterwave script');
      toast({
        title: "Payment Error",
        description: "Failed to load payment system. Please refresh the page.",
        variant: "destructive",
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Wait for auth to load and mark check as complete
  useEffect(() => {
    if (!authLoading) {
      setAuthCheckComplete(true);
      console.log('Auth check complete, user:', user?.id);
    }
  }, [authLoading, user]);

  // Check for payment status in URL on component mount - IMPROVED VERSION
  useEffect(() => {
    if (!authCheckComplete) {
      console.log('Auth check not complete yet, waiting...');
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const transactionId = urlParams.get('transaction_id');
    
    if (paymentStatus === 'success') {
      console.log('Payment success detected in URL, current user:', user?.id);
      setPaymentProcessing(true);
      
      // Get enrollment data from localStorage
      const storedEnrollmentData = localStorage.getItem(`enrollment_${courseId}`);
      
      if (storedEnrollmentData) {
        const enrollmentData = JSON.parse(storedEnrollmentData);
        console.log('Found stored enrollment data:', enrollmentData);
        
        // If user is already logged in, proceed with enrollment
        if (user?.id) {
          console.log('User is logged in, proceeding with enrollment');
          verifyPaymentAndEnroll(transactionId || 'redirect_success', enrollmentData);
        } else if (enrollmentData.password) {
          // Try to register/login the new user
          console.log('No user found but password in enrollment data, attempting authentication');
          handleNewUserPaymentVerification(enrollmentData, transactionId || 'redirect_success');
        } else {
          // No user and no password - this shouldn't happen but handle gracefully
          console.log('No user and no password in enrollment data');
          toast({
            title: "Authentication Error",
            description: "Please log in to complete your enrollment.",
            variant: "destructive",
          });
          localStorage.setItem('redirect_after_login', `/enroll/${courseId}?payment=success&transaction_id=${transactionId}`);
          navigate(`/login?email=${encodeURIComponent(enrollmentData.email)}`);
        }
      } else {
        console.log('No stored enrollment data found');
        if (user?.id) {
          // User is authenticated, try to verify payment anyway
          verifyPaymentAndEnroll(transactionId || 'redirect_success');
        } else {
          toast({
            title: "Authentication Error",
            description: "Please log in to complete your enrollment.",
            variant: "destructive",
          });
          navigate('/login');
        }
      }
      
      // Clean up URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try enrolling again.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [courseId, navigate, user, authCheckComplete]);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course-enrollment", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      
      const { data: courseData, error } = await supabase
        .from("courses")
        .select(`
          *,
          user_profiles (
            id,
            first_name,
            last_name,
            avatar_url
          ),
          course_categories (
            id,
            name
          )
        `)
        .eq("id", courseId)
        .eq("is_published", true)
        .single();

      if (error) throw error;

      // Get enrollment count
      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: 'exact', head: true })
        .eq("course_id", courseId);

      return {
        ...courseData,
        enrolledStudents: enrollmentCount || 0
      };
    },
    enabled: !!courseId,
  });

  // Check if user is already enrolled
  const { data: enrollment } = useQuery({
    queryKey: ["enrollment-status", courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user?.id) return null;
      
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, progress")
        .eq("course_id", courseId)
        .eq("student_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!courseId && !!user?.id,
  });

  const convertPrice = (priceInUSD: number, toCurrency: string): number => {
    const rate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES];
    return Math.round(priceInUSD * rate * 100) / 100;
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'NGN' ? 0 : 2,
      maximumFractionDigits: currency === 'NGN' ? 0 : 2
    }).format(price);
  };

  const getEffectivePrice = () => {
    if (!course) return 0;
    
    // Use discounted price if it exists and is greater than 0
    if (course.discounted_price !== undefined && 
        course.discounted_price !== null && 
        course.discounted_price > 0) {
      return course.discounted_price;
    }
    
    return course.price || 0;
  };

  const registerOrLoginUser = async (enrollmentData: EnrollmentFormData) => {
    try {
      console.log('Attempting to register or login user:', enrollmentData.email);
      
      // First, try to sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: enrollmentData.email,
        password: enrollmentData.password!,
        options: {
          data: {
            first_name: enrollmentData.firstName,
            last_name: enrollmentData.lastName,
            role: 'student',
          },
        },
      });

      // If user already exists, try to sign them in
      if (signUpError && signUpError.message.includes('already registered')) {
        console.log('User already exists, attempting to sign them in');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: enrollmentData.email,
          password: enrollmentData.password!,
        });

        if (signInError) {
          console.error('Sign in error:', signInError);
          throw new Error("User already exists but password is incorrect. Please use the correct password or try the login page.");
        }

        console.log('User signed in successfully:', signInData.user?.id);
        return signInData.user;
      }

      if (signUpError) {
        console.error('Registration error:', signUpError);
        throw signUpError;
      }

      console.log('User registration successful:', signUpData.user?.id);
      return signUpData.user;
    } catch (error: any) {
      console.error('Registration/Login failed:', error);
      throw error;
    }
  };

  const initializeFlutterwavePayment = async (enrollmentData: EnrollmentFormData, userId: string) => {
    if (!course || !flutterwaveLoaded) {
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const basePriceUSD = getEffectivePrice();
    const isFree = basePriceUSD === 0;

    if (isFree) {
      return enrollDirectly(enrollmentData, userId);
    }

    // Convert price to selected currency
    const convertedPrice = enrollmentData.currency === 'USD' 
      ? basePriceUSD 
      : convertPrice(basePriceUSD, enrollmentData.currency);

    console.log(`Converting ${basePriceUSD} USD to ${convertedPrice} ${enrollmentData.currency}`);

    // Get current app URL for return URLs
    const currentUrl = window.location.origin;
    const returnUrl = `${currentUrl}/enroll/${courseId}?payment=success`;
    const cancelUrl = `${currentUrl}/enroll/${courseId}?payment=cancelled`;

    const flutterwaveConfig = {
      public_key: "FLWPUBK_TEST-92e54f62b62bd51b1c6bc5a6a54eafd2-X",
      tx_ref: `course-${courseId}-${userId}-${Date.now()}`,
      amount: convertedPrice,
      currency: enrollmentData.currency,
      country: enrollmentData.country === 'Nigeria' ? 'NG' : 'US',
      payment_options: "card,mobilemoney,ussd",
      redirect_url: returnUrl,
      customer: {
        email: enrollmentData.email,
        phone_number: enrollmentData.phone,
        name: `${enrollmentData.firstName} ${enrollmentData.lastName}`,
      },
      customizations: {
        title: `Enroll in ${course.title}`,
        description: `Payment for course enrollment`,
        logo: "/favicon.ico",
      },
      meta: {
        course_id: courseId,
        user_id: userId,
        enrollment_data: JSON.stringify(enrollmentData)
      },
      callback: function (response: any) {
        console.log('Flutterwave callback:', response);
        if (response.status === "successful") {
          handleSuccessfulPayment(response, enrollmentData, userId);
        } else {
          setIsProcessingPayment(false);
          toast({
            title: "Payment Failed",
            description: "Your payment was not successful. Please try again.",
            variant: "destructive",
          });
        }
      },
      onclose: function () {
        console.log('Flutterwave modal closed');
        setIsProcessingPayment(false);
        // Check if payment was successful via URL params
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        
        if (paymentStatus === 'success') {
          // Payment was successful, handle it
          console.log('Payment completed successfully via redirect');
          toast({
            title: "Payment Processing",
            description: "Your payment is being processed. Please wait...",
          });
        } else if (paymentStatus === 'cancelled') {
          toast({
            title: "Payment Cancelled",
            description: "Your payment was cancelled. You can try again.",
            variant: "destructive",
          });
        }
      },
    };

    try {
      if (window.FlutterwaveCheckout) {
        window.FlutterwaveCheckout(flutterwaveConfig);
      } else {
        throw new Error('Flutterwave checkout not available');
      }
    } catch (error) {
      console.error('Flutterwave initialization error:', error);
      setIsProcessingPayment(false);
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewUserPaymentVerification = async (enrollmentData: EnrollmentFormData, transactionId: string) => {
    try {
      console.log('Handling new user payment verification');
      
      // Try to register or login the user
      const authUser = await registerOrLoginUser(enrollmentData);
      if (!authUser) {
        throw new Error("Failed to authenticate user during payment verification");
      }

      console.log('User authenticated successfully, proceeding with enrollment');
      
      // Wait a moment for auth state to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Complete the payment verification and enrollment
      await completePaymentAndEnrollment(authUser.id, transactionId, enrollmentData);
      
    } catch (error: any) {
      console.error('New user payment verification error:', error);
      toast({
        title: "Authentication Error", 
        description: error.message || "There was an issue with your account. Please try logging in manually.",
        variant: "destructive",
      });
      // Redirect to login page with the email pre-filled
      setTimeout(() => {
        navigate(`/login?email=${encodeURIComponent(enrollmentData.email)}&redirect=/enroll/${courseId}`);
      }, 3000);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const completePaymentAndEnrollment = async (userId: string, transactionId: string, enrollmentData: EnrollmentFormData) => {
    try {
      console.log('Completing payment and enrollment for user:', userId);
      
      // Save payment transaction for the specific course
      const { error: paymentError } = await supabase
        .from("payment_transactions")
        .insert([{
          user_id: userId,
          course_id: courseId,
          amount: getEffectivePrice(),
          currency: enrollmentData.currency || 'USD',
          payment_reference: transactionId,
          paystack_reference: transactionId,
          status: "successful",
          payment_method: "card",
          metadata: {
            flutterwave_redirect: true,
            enrollment_data: enrollmentData,
            verified_course_id: courseId
          }
        }]);

      if (paymentError) {
        console.error('Payment transaction save error:', paymentError);
        throw paymentError;
      }

      console.log('Payment transaction saved successfully');

      // Complete enrollment for the specific course
      await enrollDirectly(enrollmentData, userId);

      toast({
        title: "Enrollment Successful!",
        description: "Your payment has been confirmed and you've been enrolled!",
      });

      // Clean up stored data
      localStorage.removeItem(`enrollment_${courseId}`);

      setTimeout(() => {
        navigate(`/dashboard/courses/${courseId}`);
      }, 2000);

    } catch (error) {
      console.error('Error completing payment and enrollment:', error);
      throw error;
    }
  };

  const verifyPaymentAndEnroll = async (transactionId: string, enrollmentData?: EnrollmentFormData) => {
    try {
      console.log('Verifying payment for user:', user?.id);
      
      if (!user?.id) {
        console.log('No user found during payment verification');
        toast({
          title: "Authentication Error",
          description: "Please log in to complete your enrollment.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      await completePaymentAndEnrollment(user.id, transactionId, enrollmentData || {
        firstName: user?.user_metadata?.first_name || "",
        lastName: user?.user_metadata?.last_name || "",
        email: user?.email || "",
        phone: "",
        country: "",
        currency: "USD",
        motivation: "Payment completed via redirect"
      });

    } catch (error) {
      console.error('Payment verification error:', error);
      toast({
        title: "Verification Error",
        description: "There was an issue verifying your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSuccessfulPayment = async (paymentResponse: any, enrollmentData: EnrollmentFormData, userId: string) => {
    try {
      console.log('Processing successful payment:', paymentResponse);
      
      // Save payment transaction with the effective price
      const { error: paymentError } = await supabase
        .from("payment_transactions")
        .insert([{
          user_id: userId,
          course_id: courseId,
          amount: paymentResponse.amount || getEffectivePrice(),
          currency: paymentResponse.currency || enrollmentData.currency,
          payment_reference: paymentResponse.tx_ref,
          paystack_reference: paymentResponse.transaction_id,
          status: "successful",
          payment_method: paymentResponse.payment_type || "card",
          metadata: {
            flutterwave_response: paymentResponse,
            enrollment_data: enrollmentData
          }
        }]);

      if (paymentError) {
        console.error('Payment transaction save error:', paymentError);
        throw paymentError;
      }

      // Enroll the student
      await enrollDirectly(enrollmentData, userId);

      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed and you've been enrolled in the course.",
      });

    } catch (error: any) {
      console.error('Post-payment processing error:', error);
      toast({
        title: "Enrollment Error",
        description: error.message || "Something went wrong after payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const enrollDirectly = async (enrollmentData: EnrollmentFormData, userId: string) => {
    try {
      console.log('Starting direct enrollment for course:', courseId, 'user:', userId);
      
      // Check if already enrolled in THIS specific course
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .maybeSingle();

      if (existingEnrollment) {
        console.log('User already enrolled in this course');
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this course.",
        });
        navigate(`/dashboard/courses/${courseId}`);
        return;
      }
      
      // Update user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          first_name: enrollmentData.firstName,
          last_name: enrollmentData.lastName,
          phone: enrollmentData.phone,
          country: enrollmentData.country,
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Create enrollment for the SPECIFIC course
      const { error: enrollmentError } = await supabase
        .from("enrollments")
        .insert([{
          course_id: courseId,
          student_id: userId,
          progress: 0,
          completed: false
        }]);

      if (enrollmentError) {
        console.error('Enrollment creation error:', enrollmentError);
        throw enrollmentError;
      }

      console.log('Enrollment successful for course:', courseId);
      toast({
        title: "Enrollment Successful!",
        description: "You have been successfully enrolled in this course.",
      });

      setTimeout(() => {
        navigate(`/dashboard/courses/${courseId}`);
      }, 2000);

    } catch (error: any) {
      console.error('Direct enrollment error:', error);
      throw error;
    }
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    console.log('Form submitted with data:', data);
    
    setIsEnrolling(true);
    setIsProcessingPayment(true);

    try {
      let currentUserId = user?.id;

      // Store enrollment data for payment redirect scenario
      localStorage.setItem(`enrollment_${courseId}`, JSON.stringify(data));

      // If user is not logged in, register them first
      if (!user && isNewUser) {
        if (!data.password) {
          toast({
            title: "Password Required",
            description: "Please enter a password to create your account.",
            variant: "destructive",
          });
          setIsEnrolling(false);
          setIsProcessingPayment(false);
          return;
        }

        const newUser = await registerOrLoginUser(data);
        if (!newUser) {
          throw new Error("Failed to create user account");
        }
        currentUserId = newUser.id;
      }

      // Check if already enrolled
      if (enrollment && user) {
        navigate(`/dashboard/courses/${courseId}`);
        return;
      }

      // Proceed with payment/enrollment
      await initializeFlutterwavePayment(data, currentUserId!);
    } catch (error: any) {
      console.error('Enrollment submission error:', error);
      toast({
        title: "Enrollment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsEnrolling(false);
      setIsProcessingPayment(false);
    }
  };

  // Show processing message if payment is being verified
  if (paymentProcessing) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h1 className="text-2xl font-bold">Processing Payment...</h1>
            <p className="text-gray-600">Please wait while we verify your payment and complete your enrollment.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || !authCheckComplete) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <p className="text-gray-600 mb-8">The course you're looking for doesn't exist or is not available.</p>
          <Button onClick={() => navigate("/courses")}>
            Browse All Courses
          </Button>
        </div>
      </Layout>
    );
  }

  const instructorName = course.user_profiles 
    ? `${course.user_profiles.first_name || ""} ${course.user_profiles.last_name || ""}`.trim()
    : "Instructor";

  const selectedCurrency = form.watch("currency");
  const basePriceUSD = getEffectivePrice();
  const isFree = basePriceUSD === 0;
  const displayPrice = isFree ? 0 : (selectedCurrency === 'USD' ? basePriceUSD : convertPrice(basePriceUSD, selectedCurrency));

  // Check if there's a discount to show in the course summary
  const hasDiscount = course.discounted_price !== undefined && 
                     course.discounted_price !== null &&
                     course.discounted_price > 0 &&
                     course.discounted_price < (course.price || 0);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course Details
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {enrollment ? "You're Already Enrolled!" : "Enroll in Course"}
          </h1>
          <p className="text-gray-600">
            {enrollment 
              ? "Continue your learning journey" 
              : isNewUser ? "Complete the form below to create your account and enroll" : "Complete the form below to enroll in this course"
            }
          </p>
        </div>

        {enrollment ? (
          // Already enrolled view
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
                <h3 className="text-lg font-semibold text-green-600">
                  You're enrolled in this course!
                </h3>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Your progress</p>
                  <Progress value={enrollment.progress} className="h-3" />
                  <p className="text-sm text-gray-500 mt-1">{enrollment.progress}% complete</p>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/dashboard/courses/${courseId}`)}
                >
                  Continue Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Show live course details if it's a live course */}
            {course.mode === 'virtual-live' && (
              <div className="lg:col-span-3 mb-6">
                <LiveCourseDetails course={course} />
              </div>
            )}

            {/* Enrollment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {isNewUser ? "Create Account & Enroll" : "Enrollment Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email Address
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isNewUser && (
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter a secure password (min 6 characters)" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <PhoneInput
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter phone number"
                                defaultCountry={profileData?.country ? COUNTRIES.find(c => c.name.toLowerCase() === profileData.country?.toLowerCase())?.code || "US" : "US"}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Country
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-60">
                                  {COUNTRIES.map((country) => (
                                    <SelectItem key={country.code} value={country.name}>
                                      <div className="flex items-center gap-2">
                                        <span>{country.flag}</span>
                                        <span>{country.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {SUPPORTED_CURRENCIES.map((currency) => (
                                    <SelectItem key={currency.code} value={currency.code}>
                                      {currency.symbol} {currency.name} ({currency.code})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="motivation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Why do you want to take this course?</FormLabel>
                            <FormControl>
                              <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Tell us what motivates you to learn and how this course fits your goals..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isEnrolling || isProcessingPayment || !flutterwaveLoaded}
                      >
                        {isProcessingPayment ? (
                          "Processing Payment..."
                        ) : isEnrolling ? (
                          "Processing..."
                        ) : !flutterwaveLoaded ? (
                          "Loading Payment System..."
                        ) : (
                          <>
                            {isFree ? (
                              isNewUser ? "Create Account & Enroll for Free" : "Enroll for Free"
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4 mr-2" />
                                {isNewUser ? "Create Account & Pay" : "Enroll & Pay"} {formatPrice(displayPrice, selectedCurrency)}
                              </>
                            )}
                          </>
                        )}
                      </Button>

                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          By enrolling, you agree to our terms of service and privacy policy
                          {isNewUser && ". Creating an account will give you access to your course progress and materials."}
                        </p>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Course Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <img 
                        src={course.image_url || "/placeholder.svg"} 
                        alt={course.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">by {instructorName}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{course.duration_hours || 0} hours</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>{course.enrolledStudents || 0} students enrolled</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Star className="h-4 w-4 mr-2" />
                          <span>4.8 rating</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Lifetime access</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex flex-col">
                        {hasDiscount ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xl text-brand-600">
                                {formatPrice(displayPrice, selectedCurrency)}
                              </span>
                              <Badge className="bg-red-500 text-white text-xs">
                                {Math.round(((course.price! - course.discounted_price!) / course.price!) * 100)}% OFF
                              </Badge>
                            </div>
                            <span className="text-sm line-through text-gray-500">
                              {formatPrice(selectedCurrency === 'USD' ? course.price! : convertPrice(course.price!, selectedCurrency), selectedCurrency)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-xl text-brand-600">
                            {isFree ? "Free" : formatPrice(displayPrice, selectedCurrency)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnrollmentPage;
