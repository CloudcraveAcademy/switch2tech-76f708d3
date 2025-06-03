
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleEnroll = async () => {
    if (!user) {
      // Redirect to enrollment page instead of login page
      navigate(`/enroll/${courseId}`);
      return;
    }

    setEnrolling(true);
    try {
      const result = await CourseEnrollmentService.enrollInCourse(
        courseId,
        user.id
      );
      
      if (result.success && result.error !== "Already enrolled") {
        setShowConfirmation(true);
      } else if (result.success && result.error === "Already enrolled") {
        navigate(`/dashboard/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
    } finally {
      setEnrolling(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  return (
    <>
      {isEnrolled ? (
        <Button 
          className={className} 
          onClick={() => navigate(`/dashboard/courses/${courseId}`)}
          disabled={isCompleted}
          variant={isCompleted ? "secondary" : "default"}
        >
          {isCompleted ? "Course Completed" : "Continue Learning"}
        </Button>
      ) : (
        <Button 
          className={className} 
          onClick={handleEnroll} 
          disabled={enrolling}
        >
          {enrolling ? "Enrolling..." : "Enroll Now"}
        </Button>
      )}

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
