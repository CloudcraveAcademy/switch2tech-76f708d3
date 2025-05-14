
import React from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Check } from "lucide-react";

interface EnrollmentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  courseThumbnail?: string;
}

const EnrollmentConfirmationModal = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  courseThumbnail = "/placeholder.svg"
}: EnrollmentConfirmationModalProps) => {
  const navigate = useNavigate();

  const handleStartLearning = () => {
    navigate(`/dashboard/courses/${courseId}`);
    onClose();
  };

  const handleExploreMore = () => {
    navigate("/courses");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto rounded-full bg-green-100 p-3 w-16 h-16 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl text-center">Successfully Enrolled!</DialogTitle>
          <DialogDescription className="text-center">
            You've been enrolled in <span className="font-medium">{courseTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-4 py-4">
          <div className="w-20 h-20 flex-shrink-0">
            <img
              src={courseThumbnail}
              alt={courseTitle}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div>
            <h4 className="font-medium">{courseTitle}</h4>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>Ready to start learning</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleExploreMore}
            className="sm:mr-2 w-full sm:w-auto order-2 sm:order-1"
          >
            Explore More Courses
          </Button>
          <Button 
            onClick={handleStartLearning}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Start Learning Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentConfirmationModal;
