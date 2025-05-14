
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface EnrollmentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
}

const EnrollmentConfirmationModal = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  courseThumbnail,
}: EnrollmentConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-center pt-4">
            Successfully Enrolled!
          </DialogTitle>
          <DialogDescription className="text-center">
            You have successfully enrolled in this course.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-4 p-2 border rounded-md">
          <img
            src={courseThumbnail || "/placeholder.svg"}
            alt={courseTitle}
            className="h-16 w-16 object-cover rounded"
          />
          <div>
            <h4 className="font-medium">{courseTitle}</h4>
            <p className="text-sm text-gray-500">
              Your enrollment has been confirmed
            </p>
          </div>
        </div>

        <DialogFooter className="flex sm:flex-row gap-2 mt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:w-full"
          >
            Go to Dashboard
          </Button>
          <Button
            asChild
            className="sm:w-full"
          >
            <Link to={`/dashboard/courses/${courseId}`}>
              Start Course Now
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentConfirmationModal;
