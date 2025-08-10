import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Upload, FileText, Calendar, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { NotificationService } from "@/services/NotificationService";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  course_id: string;
}

interface AssignmentSubmissionProps {
  assignment: Assignment;
  onSubmissionComplete: () => void;
}

const AssignmentSubmission = ({ assignment, onSubmissionComplete }: AssignmentSubmissionProps) => {
  const { user } = useAuth();
  const [submissionText, setSubmissionText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  // Check if assignment is overdue
  const isOverdue = new Date() > new Date(assignment.due_date);
  const timeLeft = new Date(assignment.due_date).getTime() - new Date().getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  };

  const handleSubmit = async () => {
    if (!user || (!submissionText.trim() && files.length === 0)) {
      toast({
        title: "Submission Required",
        description: "Please provide either text submission or upload files",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files if any
      let fileUrls: string[] = [];
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${assignment.id}/${Date.now()}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('course-materials')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('course-materials')
            .getPublicUrl(fileName);

          fileUrls.push(publicUrl);
        }
      }

      // Submit assignment
      const { error } = await supabase
        .from('assignment_submissions')
        .upsert({
          assignment_id: assignment.id,
          student_id: user.id,
          submission_text: submissionText.trim() || null,
          file_urls: fileUrls.length > 0 ? fileUrls : null,
          submitted_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Notify instructor of new submission
      try {
        const { data: course } = await supabase
          .from('courses')
          .select('instructor_id')
          .eq('id', assignment.course_id)
          .single();
          
        if (course?.instructor_id) {
          const studentName = user.name || 'Student';
          await NotificationService.notifyInstructorSubmission(
            course.instructor_id,
            studentName,
            assignment.title,
            assignment.course_id
          );
        }
      } catch (notificationError) {
        console.error('Failed to send submission notification:', notificationError);
      }

      toast({
        title: "Assignment Submitted",
        description: "Your assignment has been submitted successfully",
      });

      onSubmissionComplete();
      setSubmissionText("");
      setFiles([]);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            {assignment.title}
          </span>
          <div className="flex items-center gap-2">
            {isOverdue ? (
              <Badge variant="destructive">Overdue</Badge>
            ) : daysLeft <= 1 ? (
              <Badge variant="destructive">Due Soon</Badge>
            ) : (
              <Badge variant="outline">
                {daysLeft} days left
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assignment Details */}
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Assignment Description</h4>
            <p className="text-sm text-gray-600">{assignment.description}</p>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Due: {formatDate(assignment.due_date)}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Max Score: {assignment.max_score} points
            </div>
          </div>
        </div>

        {!isOverdue && (
          <>
            {/* Text Submission */}
            <div className="space-y-2">
              <Label htmlFor="submission-text">Your Submission</Label>
              <Textarea
                id="submission-text"
                placeholder="Type your assignment submission here..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={6}
                className="min-h-[150px]"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Files (Optional)</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {files.length > 0 && (
                <div className="text-sm text-gray-500">
                  {files.length} file(s) selected: {files.map(f => f.name).join(", ")}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || (!submissionText.trim() && files.length === 0)}
                className="flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Assignment"}
              </Button>
            </div>
          </>
        )}

        {isOverdue && (
          <div className="text-center py-8 bg-red-50 rounded-lg">
            <Clock className="h-12 w-12 text-red-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-red-700">Assignment Overdue</h3>
            <p className="text-red-600">The deadline for this assignment has passed.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentSubmission;