
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CourseEnrollmentService } from "@/services/CourseEnrollmentService";
import EnrollmentConfirmationModal from "../modals/EnrollmentConfirmationModal";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CourseEnrollButtonProps {
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
  isEnrolled?: boolean;
  isCompleted?: boolean;
  className?: string;
}

const CourseEnrollButton = ({
  courseId,
  courseTitle,
  courseThumbnail = "/placeholder.svg",
  isEnrolled = false,
  isCompleted = false,
  className = "",
}: CourseEnrollButtonProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleEnroll = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("=== ENROLL BUTTON CLICKED ===");
    console.log("User:", user?.id, "Loading:", loading);
    console.log("Course ID:", courseId);
    console.log("Button disabled?", loading || enrolling);
    
    // If auth is still loading, wait a moment
    if (loading) {
      console.log("Auth still loading, waiting...");
      return;
    }

    // If user is not logged in, redirect to login with return path
    if (!user) {
      console.log("No user found, redirecting to login");
      const returnPath = `/courses/${courseId}`;
      navigate(`/login?redirect=${encodeURIComponent(returnPath)}`);
      return;
    }

    // Prevent double-clicking
    if (enrolling) {
      console.log("Enrollment already in progress");
      return;
    }

    setEnrolling(true);
    try {
      console.log("Starting enrollment process for:", courseId);
      const result = await CourseEnrollmentService.enrollInCourse(
        courseId,
        user.id
      );
      
      console.log("Enrollment result:", result);
      
      if (result.success && result.error !== "Already enrolled") {
        setShowConfirmation(true);
      } else if (result.success && result.error === "Already enrolled") {
        navigate(`/dashboard/courses/${courseId}`);
      } else if (result.requiresPayment) {
        console.log("Payment required, navigating to enrollment page");
        navigate(`/enroll/${courseId}`);
      } else {
        toast({
          title: "Enrollment Failed",
          description: result.error || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        title: "Enrollment Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  // Show appropriate button state
  if (isEnrolled) {
    return (
      <Button 
        className={className} 
        onClick={() => navigate(`/dashboard/courses/${courseId}`)}
        disabled={isCompleted}
        variant={isCompleted ? "secondary" : "default"}
      >
        {isCompleted ? "Course Completed" : "Continue Learning"}
      </Button>
    );
  }

  const isButtonDisabled = loading || enrolling;

  return (
    <>
      <Button 
        className={`${className} cursor-pointer`}
        onClick={handleEnroll} 
        disabled={isButtonDisabled}
        type="button"
        style={{ pointerEvents: isButtonDisabled ? 'none' : 'auto' }}
      >
        {enrolling ? "Processing..." : 
         loading ? "Loading..." : 
         user ? "Enroll Now" : "Login to Enroll"}
      </Button>

      <EnrollmentConfirmationModal
        isOpen={showConfirmation}
        onClose={handleConfirmationClose}
        courseId={courseId}
        courseTitle={courseTitle}
        courseThumbnail={courseThumbnail}
      />
    </>
  );
};

export default CourseEnrollButton;
