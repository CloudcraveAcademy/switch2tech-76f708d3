import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
import type { UserWithProfile } from "@/types/auth";

const enrollmentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  phone: z.string().min(10, "Please enter a valid phone number").optional(),
  country: z.string().min(2, "Please select your country").optional(),
  currency: z.string().min(3, "Please select your currency"),
  motivation: z.string().optional(),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
];

const EXCHANGE_RATES = {
  USD: 1,
  NGN: 1650,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.41,
  AUD: 1.56,
};

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
  const [formInitialized, setFormInitialized] = useState(false);

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

  // Watch the currency field to trigger price updates
  const watchedCurrency = form.watch("currency");

  const { data: flutterwaveConfig, isLoading: isLoadingPaymentConfig, error: paymentConfigError } = useQuery({
    queryKey: ["payment-gateway-config", "flutterwave"],
    queryFn: async () => {
      console.log('Fetching Flutterwave configuration...');
      
      const { data, error } = await supabase.rpc('get_payment_gateway_config', {
        gateway_name_param: 'flutterwave'
      });

      console.log('Flutterwave config response:', { data, error });

      if (error) {
        console.error('Error fetching payment gateway config:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('No Flutterwave configuration found');
        throw new Error('Flutterwave payment gateway not configured');
      }

      const config = data[0];
      console.log('Flutterwave config found:', {
        has_public_key: !!config.public_key,
        is_active: config.is_active,
        public_key_length: config.public_key?.length || 0
      });

      return config;
    },
    retry: 3,
  });

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

  const getEffectivePrice = () => {
    if (!course) return 0;
    
    if (course.discounted_price !== undefined && 
        course.discounted_price !== null && 
        course.discounted_price > 0) {
      return course.discounted_price;
    }
    
    return course.price || 0;
  };

  const basePriceUSD = getEffectivePrice();
  const isFree = basePriceUSD === 0;
  
  // Calculate display price based on watched currency
  const displayPrice = React.useMemo(() => {
    if (isFree) return 0;
    return watchedCurrency === 'USD' ? basePriceUSD : convertPrice(basePriceUSD, watchedCurrency);
  }, [basePriceUSD, watchedCurrency, isFree]);

  const completeEnrollment = async (userId: string) => {
    try {
      console.log('Starting enrollment for user:', userId, 'Course:', courseId);
      
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", courseId)
        .eq("student_id", userId)
        .maybeSingle();

      if (existingEnrollment) {
        console.log('User already enrolled, redirecting to course dashboard');
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this course!",
        });
        navigate(`/dashboard/courses/${courseId}`);
        return;
      }

      const { error: enrollmentError } = await supabase
        .from("enrollments")
        .insert({
          student_id: userId,
          course_id: courseId,
          enrollment_date: new Date().toISOString(),
          progress: 0,
        });

      if (enrollmentError) {
        console.error('Enrollment error:', enrollmentError);
        throw enrollmentError;
      }

      console.log('Enrollment successful, redirecting to course dashboard');
      toast({
        title: "Enrollment Successful! 🎉",
        description: "Welcome to the course! You can now start learning.",
      });

      // Clear stored enrollment data
      localStorage.removeItem(`enrollment_${courseId}`);
      
      // Redirect to the course dashboard page
      navigate(`/dashboard/courses/${courseId}`);
    } catch (error) {
      console.error('Enrollment completion failed:', error);
      toast({
        title: "Enrollment Error",
        description: error instanceof Error ? error.message : "Failed to complete enrollment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const verifyPaymentAndEnroll = async (transactionId: string) => {
    try {
      console.log('Verifying payment for transaction:', transactionId);
      setPaymentProcessing(true);
      
      // Check if we already have a valid user session
      if (user?.id) {
        console.log('User already authenticated, proceeding with enrollment:', user.id);
        await completeEnrollment(user.id);
        return;
      }
      
      // If no user, try to get current session
      console.log('No user in context, checking current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }
      
      if (session?.user) {
        console.log('Found valid session, proceeding with enrollment:', session.user.id);
        await completeEnrollment(session.user.id);
        return;
      }
      
      // If still no user, check for stored enrollment data to attempt authentication
      const storedEnrollmentData = localStorage.getItem(`enrollment_${courseId}`);
      if (storedEnrollmentData) {
        try {
          const enrollmentData = JSON.parse(storedEnrollmentData);
          console.log('Found stored enrollment data, attempting authentication');
          
          if (enrollmentData.password) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: enrollmentData.email,
              password: enrollmentData.password,
            });

            if (signInError) {
              console.error('Auto sign-in failed:', signInError);
              throw signInError;
            }
            
            if (signInData.user) {
              console.log('Auto sign-in successful, proceeding with enrollment');
              // Wait a bit for auth context to update
              setTimeout(async () => {
                await completeEnrollment(signInData.user.id);
              }, 1000);
              return;
            }
          }
        } catch (parseError) {
          console.error('Error parsing stored enrollment data:', parseError);
        }
      }
      
      // If all else fails, redirect to login
      console.log('No authentication method available, redirecting to login');
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your enrollment after payment.",
        variant: "destructive",
      });
      navigate(`/login?redirect=${encodeURIComponent(`/enroll/${courseId}?payment=success&transaction_id=${transactionId}`)}`);
      
    } catch (error) {
      console.error('Payment verification failed:', error);
      toast({
        title: "Enrollment Error",
        description: error instanceof Error ? error.message : "Failed to complete enrollment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleNewUserAuth = async (enrollmentData: any, transactionId: string) => {
    try {
      console.log('Handling new user authentication for enrollment');
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: enrollmentData.email,
        password: enrollmentData.password,
        options: {
          data: {
            first_name: enrollmentData.firstName,
            last_name: enrollmentData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('User already exists, attempting sign in');
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: enrollmentData.email,
            password: enrollmentData.password,
          });

          if (signInError) {
            throw signInError;
          }
          
          console.log('User signed in successfully, proceeding with enrollment');
        } else {
          throw authError;
        }
      }

      // Wait a bit for auth state to update, then proceed with enrollment
      setTimeout(async () => {
        await verifyPaymentAndEnroll(transactionId);
      }, 2000);

    } catch (error) {
      console.error('New user authentication failed:', error);
      setPaymentProcessing(false);
      toast({
        title: "Authentication Error",
        description: "Failed to create account. Please try enrolling again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    console.log('Form submitted with data:', data);
    
    if (!course) {
      toast({
        title: "Error",
        description: "Course information not available. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    setIsEnrolling(true);

    try {
      if (isFree) {
        if (isNewUser) {
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password!,
            options: {
              data: {
                first_name: data.firstName,
                last_name: data.lastName,
              },
              emailRedirectTo: `${window.location.origin}/dashboard`
            }
          });

          if (authError) {
            if (authError.message.includes('already registered')) {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password!,
              });

              if (signInError) {
                throw signInError;
              }
            } else {
              throw authError;
            }
          }

          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return;
        }

        await completeEnrollment(user!.id);
        return;
      }

      if (!flutterwaveConfig?.public_key || !flutterwaveConfig.is_active) {
        throw new Error('Payment system not configured. Please contact support.');
      }

      localStorage.setItem(`enrollment_${courseId}`, JSON.stringify(data));

      if (!flutterwaveLoaded || !window.FlutterwaveCheckout) {
        throw new Error('Payment system not loaded. Please refresh the page and try again.');
      }

      setIsProcessingPayment(true);

      const config = {
        public_key: flutterwaveConfig.public_key,
        tx_ref: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount: displayPrice,
        currency: data.currency,
        payment_options: "card, banktransfer, ussd",
        redirect_url: `${window.location.origin}/enroll/${courseId}?payment=success`,
        customer: {
          email: data.email,
          phone_number: data.phone,
          name: `${data.firstName} ${data.lastName}`,
        },
        customizations: {
          title: course.title,
          description: `Enrollment for ${course.title}`,
          logo: "/placeholder.svg",
        },
        callback: (response: any) => {
          console.log('Flutterwave callback:', response);
          if (response.status === 'successful') {
            window.location.href = `${window.location.origin}/enroll/${courseId}?payment=success&transaction_id=${response.transaction_id}`;
          }
        },
        onclose: () => {
          console.log('Payment modal closed');
          setIsProcessingPayment(false);
        },
      };

      console.log('Calling FlutterwaveCheckout with config...');
      window.FlutterwaveCheckout(config);

    } catch (error) {
      console.error('Enrollment error:', error);
      toast({
        title: "Enrollment Error",
        description: error instanceof Error ? error.message : "An error occurred during enrollment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  useEffect(() => {
    if (profileData && user && !formInitialized) {
      console.log("Pre-filling form with profile data:", profileData);
      form.reset({
        firstName: profileData.first_name || "",
        lastName: profileData.last_name || "",
        email: user.email || "",
        phone: profileData.phone || "",
        country: profileData.country || "",
        currency: "USD", // Keep default currency
        motivation: "",
      });
      setFormInitialized(true);
    }
  }, [profileData, user, form, formInitialized]);

  useEffect(() => {
    setIsNewUser(!user);
  }, [user]);

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
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Enhanced payment success handling effect
  useEffect(() => {
    if (authLoading) return;

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const transactionId = urlParams.get('transaction_id');
    
    if (paymentStatus === 'success' && transactionId) {
      console.log('Payment success detected in URL, transaction:', transactionId);
      
      // Clean up URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Start payment verification immediately
      verifyPaymentAndEnroll(transactionId);
    } else if (paymentStatus === 'cancelled') {
      console.log('Payment was cancelled');
      toast({
        title: "Payment Cancelled",
        description: "Your payment was cancelled. You can try enrolling again.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [courseId, navigate, authLoading]);

  if (paymentProcessing) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h1 className="text-2xl font-bold">Processing Your Enrollment...</h1>
            <p className="text-gray-600">Please wait while we verify your payment and complete your enrollment.</p>
            <p className="text-sm text-gray-500">You will be redirected to your course dashboard shortly.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || authLoading || isLoadingPaymentConfig) {
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

  if (!isFree && paymentConfigError) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Payment System Unavailable</h1>
          <p className="text-gray-600 mb-8">The payment system is currently not configured. Please contact support or try again later.</p>
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

  const hasDiscount = course.discounted_price !== undefined && 
                     course.discounted_price !== null &&
                     course.discounted_price > 0 &&
                     course.discounted_price < (course.price || 0);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/courses/${courseId}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Course Details
        </Button>

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
            {course.mode === 'virtual-live' && (
              <div className="lg:col-span-3 mb-6">
                <LiveCourseDetails course={course} />
              </div>
            )}

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
                      <div className="space-y-4">
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
                                <Input 
                                  placeholder="Enter your email address" 
                                  {...field} 
                                  disabled={!!user}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {isNewUser && (
                          <>
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
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      placeholder="Enter phone number"
                                      defaultCountry="US"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Country
                                  </FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ""}>
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
                          </>
                        )}

                        <FormField
                          control={form.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Currency</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
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

                        <FormField
                          control={form.control}
                          name="motivation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Why do you want to take this course? (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us what motivates you to learn and how this course fits your goals..."
                                  className="min-h-[80px]"
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
                          disabled={
                            isEnrolling || 
                            isProcessingPayment || 
                            (!isFree && !flutterwaveLoaded) ||
                            (!isFree && (!flutterwaveConfig || !flutterwaveConfig.is_active))
                          }
                        >
                          {isProcessingPayment ? (
                            "Processing Payment..."
                          ) : isEnrolling ? (
                            "Processing..."
                          ) : !flutterwaveLoaded && !isFree ? (
                            "Loading Payment System..."
                          ) : !flutterwaveConfig && !isFree ? (
                            "Payment System Unavailable"
                          ) : !isFree && !flutterwaveConfig?.is_active ? (
                            "Payment System Disabled"
                          ) : (
                            <>
                              {isFree ? (
                                isNewUser ? "Create Account & Enroll for Free" : "Enroll for Free"
                              ) : (
                                <>
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  {isNewUser ? "Create Account & Pay" : "Enroll & Pay"} {formatPrice(displayPrice, watchedCurrency)}
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
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

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
                                {formatPrice(displayPrice, watchedCurrency)}
                              </span>
                              <Badge className="bg-red-500 text-white text-xs">
                                {Math.round(((course.price! - course.discounted_price!) / course.price!) * 100)}% OFF
                              </Badge>
                            </div>
                            <span className="text-sm line-through text-gray-500">
                              {formatPrice(watchedCurrency === 'USD' ? course.price! : convertPrice(course.price!, watchedCurrency), watchedCurrency)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-xl text-brand-600">
                            {isFree ? "Free" : formatPrice(displayPrice, watchedCurrency)}
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
