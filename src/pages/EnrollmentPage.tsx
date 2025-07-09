import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { CourseService } from "@/services/CourseService";
import { Course } from "@/types/Course";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { EnrollmentService } from "@/services/EnrollmentService";
import { PaymentService } from "@/services/PaymentService";

declare global {
  interface Window {
    FlutterwaveCheckout: any;
  }
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const EnrollmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: user?.name?.split(' ')[0] || "",
    lastName: user?.name?.split(' ')[1] || "",
    email: user?.email || "",
    phone: "",
  });
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [flutterwaveConfig, setFlutterwaveConfig] = useState<{ public_key: string } | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);

  // Fixed auth check - only redirect if we're sure there's no user and auth is not loading
  useEffect(() => {
    if (!authLoading && !user && id) {
      console.log("No authenticated user found, redirecting to login");
      const returnPath = `/enroll/${id}`;
      navigate(`/login?redirect=${encodeURIComponent(returnPath)}`);
    }
  }, [user, authLoading, id, navigate]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Course ID is missing.",
          variant: "destructive",
        });
        setCourseLoading(false);
        return;
      }

      try {
        const courseData = await CourseService.getCourseById(id);
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error",
          description: "Failed to load course details.",
          variant: "destructive",
        });
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourse();
  }, [id, toast]);

  useEffect(() => {
    const fetchFlutterwaveConfig = async () => {
      try {
        const config = await PaymentService.getFlutterwaveConfig();
        setFlutterwaveConfig(config);
      } catch (error) {
        console.error("Failed to load Flutterwave configuration:", error);
        toast({
          title: "Payment Error",
          description: "Failed to load payment configuration. Please try again later.",
          variant: "destructive",
        });
      }
    };

    fetchFlutterwaveConfig();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSuccessfulPayment = async (paymentResponse: any) => {
    setIsProcessingPayment(true);
    setIsEnrolling(true);

    try {
      if (!course || !user) {
        throw new Error("Course or user data is missing.");
      }

      const enrollmentResult = await EnrollmentService.enrollUserInCourse(
        user.id,
        course.id,
        paymentResponse.transaction_id
      );

      if (enrollmentResult.success) {
        toast({
          title: "Enrollment Successful",
          description: "You have successfully enrolled in the course!",
        });
        navigate(`/dashboard/courses/${course.id}`);
      } else {
        throw new Error(enrollmentResult.error || "Enrollment failed.");
      }
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment Failed",
        description: error.message || "Failed to complete enrollment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
      setIsEnrolling(false);
    }
  };

  const handleEnrollAndPay = async () => {
    if (!user) {
      console.log("No user found for enrollment");
      toast({
        title: "Authentication required",
        description: "Please log in to enroll in this course.",
        variant: "destructive",
      });
      return;
    }

    if (!course) {
      console.log("No course data available");
      toast({
        title: "Error",
        description: "Course information not available. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Prevent double submission
    if (isEnrolling || isProcessingPayment) {
      console.log("Already processing enrollment or payment");
      return;
    }

    setIsEnrolling(true);
    setIsProcessingPayment(true);

    try {
      console.log("Starting enrollment and payment process");

      if (!flutterwaveConfig?.public_key) {
        throw new Error("Payment gateway not configured");
      }

      const paymentData = {
        public_key: flutterwaveConfig.public_key,
        tx_ref: `course_${course.id}_${user.id}_${Date.now()}`,
        amount: course.discounted_price || course.price || 0,
        currency: "NGN",
        payment_options: "card,banktransfer",
        customer: {
          email: user.email || formData.email,
          phone_number: formData.phone,
          name: `${formData.firstName} ${formData.lastName}`,
        },
        customizations: {
          title: "Course Enrollment",
          description: `Enrollment for ${course.title}`,
          logo: "https://your-logo-url.com/logo.png",
        },
        callback: (response: any) => {
          console.log("Payment callback received:", response);
          if (response.status === 'successful') {
            console.log('Payment successful:', response);
            handleSuccessfulPayment(response);
          } else {
            console.log('Payment not successful:', response.status);
            setIsProcessingPayment(false);
            setIsEnrolling(false);
            toast({
              title: "Payment failed",
              description: "Your payment was not successful. Please try again.",
              variant: "destructive",
            });
          }
        },
        onclose: () => {
          console.log('Payment modal closed by user');
          setIsProcessingPayment(false);
          setIsEnrolling(false);
        },
      };

      console.log("Initializing Flutterwave payment with data:", paymentData);

      if (window.FlutterwaveCheckout) {
        window.FlutterwaveCheckout(paymentData);
      } else {
        throw new Error("Flutterwave checkout not loaded");
      }

    } catch (error: any) {
      console.error("Error during enrollment:", error);
      toast({
        title: "Enrollment failed",
        description: error.message || "Failed to start payment process. Please try again.",
        variant: "destructive",
      });
      setIsProcessingPayment(false);
      setIsEnrolling(false);
    }
  };

  // Show loading state while auth is being determined
  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Don't render anything if user is not authenticated (redirect will happen)
  if (!user) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {courseLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading course details...</p>
          </div>
        ) : course ? (
          <>
            <h1 className="text-2xl font-bold mb-4">{course.title}</h1>
            <div className="md:flex md:gap-8">
              <div className="md:w-1/3">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="rounded-md shadow-md mb-4"
                />
              </div>
              <div className="md:w-2/3">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">Course Description</h2>
                  <p className="text-gray-700">{course.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Course Details</h3>
                  <p>Price: ${course.price}</p>
                  {course.discounted_price && (
                    <p>Discounted Price: ${course.discounted_price}</p>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleEnrollAndPay}
                  disabled={isEnrolling || isProcessingPayment}
                >
                  {isEnrolling || isProcessingPayment
                    ? "Processing Payment..."
                    : "Enroll & Pay"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">Course not found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnrollmentPage;
