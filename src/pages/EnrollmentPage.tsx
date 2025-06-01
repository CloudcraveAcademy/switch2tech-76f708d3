
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

// Enrollment form schema
const enrollmentSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  country: z.string().min(2, "Please select your country"),
  motivation: z.string().min(20, "Please tell us why you want to take this course (minimum 20 characters)"),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

const EnrollmentPage = () => {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const form = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: user?.email || "",
      phone: "",
      country: "",
      motivation: "",
    },
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

  const initializeFlutterwavePayment = async (enrollmentData: EnrollmentFormData) => {
    if (!course || !user) return;

    const amount = course.price || 0;
    const isFree = amount === 0;

    if (isFree) {
      // For free courses, skip payment and enroll directly
      return enrollDirectly(enrollmentData);
    }

    // Initialize Flutterwave payment
    const flutterwaveConfig = {
      public_key: "FLWPUBK-********************-X", // Replace with your Flutterwave public key
      tx_ref: `course-${courseId}-${Date.now()}`,
      amount: amount,
      currency: "NGN",
      country: "NG",
      payment_options: "card,mobilemoney,ussd",
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
    };

    // @ts-ignore - Flutterwave global object
    if (typeof window !== 'undefined' && window.FlutterwaveCheckout) {
      // @ts-ignore
      window.FlutterwaveCheckout({
        ...flutterwaveConfig,
        callback: function (response: any) {
          if (response.status === "successful") {
            handleSuccessfulPayment(response, enrollmentData);
          } else {
            toast({
              title: "Payment Failed",
              description: "Your payment was not successful. Please try again.",
              variant: "destructive",
            });
          }
        },
        onclose: function () {
          setIsProcessingPayment(false);
        },
      });
    } else {
      toast({
        title: "Payment Error",
        description: "Payment system is not available. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSuccessfulPayment = async (paymentResponse: any, enrollmentData: EnrollmentFormData) => {
    try {
      // Save payment transaction
      const { error: paymentError } = await supabase
        .from("payment_transactions")
        .insert([{
          user_id: user!.id,
          course_id: courseId,
          amount: course!.price || 0,
          currency: "NGN",
          payment_reference: paymentResponse.tx_ref,
          paystack_reference: paymentResponse.transaction_id,
          status: "successful",
          payment_method: paymentResponse.payment_type,
          metadata: {
            flutterwave_response: paymentResponse,
            enrollment_data: enrollmentData
          }
        }]);

      if (paymentError) throw paymentError;

      // Enroll the student
      await enrollDirectly(enrollmentData);

      toast({
        title: "Payment Successful!",
        description: "Your payment has been processed and you've been enrolled in the course.",
      });

    } catch (error: any) {
      toast({
        title: "Enrollment Error",
        description: error.message || "Something went wrong after payment. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const enrollDirectly = async (enrollmentData: EnrollmentFormData) => {
    try {
      // Update user profile with enrollment data
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: user!.id,
          first_name: enrollmentData.firstName,
          last_name: enrollmentData.lastName,
          phone: enrollmentData.phone,
          country: enrollmentData.country,
        });

      if (profileError) throw profileError;

      // Create enrollment
      const { error: enrollmentError } = await supabase
        .from("enrollments")
        .insert([{
          course_id: courseId,
          student_id: user!.id,
          progress: 0,
          completed: false
        }]);

      if (enrollmentError) throw enrollmentError;

      toast({
        title: "Enrollment Successful!",
        description: "You have been successfully enrolled in this course.",
      });

      // Redirect to course
      setTimeout(() => {
        navigate(`/dashboard/courses/${courseId}`);
      }, 2000);

    } catch (error: any) {
      throw error;
    }
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to enroll in courses",
        variant: "destructive",
      });
      navigate("/login", { state: { from: `/enroll/${courseId}` } });
      return;
    }

    if (enrollment) {
      navigate(`/dashboard/courses/${courseId}`);
      return;
    }

    setIsEnrolling(true);
    setIsProcessingPayment(true);

    try {
      await initializeFlutterwavePayment(data);
    } catch (error: any) {
      toast({
        title: "Enrollment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
      if (course?.price === 0) {
        setIsProcessingPayment(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
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

  const isFree = (course.price || 0) === 0;

  return (
    <Layout>
      {/* Add Flutterwave script */}
      <script src="https://checkout.flutterwave.com/v3.js"></script>
      
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
              : "Complete the form below to enroll in this course"
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
            {/* Enrollment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Enrollment Information
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
                              <Input placeholder="Enter your phone number" {...field} />
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
                            <FormControl>
                              <Input placeholder="Enter your country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                        disabled={isEnrolling || isProcessingPayment}
                      >
                        {isProcessingPayment ? (
                          "Processing Payment..."
                        ) : isEnrolling ? (
                          "Enrolling..."
                        ) : (
                          <>
                            {isFree ? (
                              "Enroll for Free"
                            ) : (
                              <>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Enroll & Pay {formatPrice(course.price || 0)}
                              </>
                            )}
                          </>
                        )}
                      </Button>

                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          By enrolling, you agree to our terms of service and privacy policy
                        </p>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Course Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Course Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Course Image */}
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold mb-2">{course.title}</h3>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">
                        {course.course_categories?.name || "Course"}
                      </Badge>
                      <Badge variant="outline">{course.level}</Badge>
                      <Badge variant="outline">{course.mode}</Badge>
                    </div>

                    <div className="text-center py-4 border-y">
                      <div className="text-3xl font-bold text-brand-600 mb-1">
                        {isFree ? "FREE" : formatPrice(course.price || 0)}
                      </div>
                      {course.discounted_price && (
                        <div className="text-lg text-gray-500 line-through">
                          {formatPrice(course.discounted_price)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 text-sm mt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Clock className="h-4 w-4 mr-2" /> Duration
                        </span>
                        <span className="font-medium">{course.duration_hours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Users className="h-4 w-4 mr-2" /> Students
                        </span>
                        <span className="font-medium">{course.enrolledStudents} enrolled</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Star className="h-4 w-4 mr-2" /> Rating
                        </span>
                        <span className="font-medium">4.8 (124 reviews)</span>
                      </div>
                      {course.course_start_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center">
                            <Calendar className="h-4 w-4 mr-2" /> Starts
                          </span>
                          <span className="font-medium">
                            {new Date(course.course_start_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Instructor</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {course.user_profiles?.avatar_url ? (
                          <img 
                            src={course.user_profiles.avatar_url} 
                            alt={instructorName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {instructorName.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{instructorName}</p>
                        <p className="text-sm text-gray-500">Course Instructor</p>
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
