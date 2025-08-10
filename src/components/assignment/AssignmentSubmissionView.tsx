import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Clock, Download, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  course_id: string;
}

interface Submission {
  id: string;
  submitted_at: string;
  score: number | null;
  feedback: string | null;
  submission_text: string | null;
  file_urls: string[] | null;
}

interface AssignmentSubmissionViewProps {
  assignment: Assignment;
  submission: Submission;
  onBack: () => void;
}

const AssignmentSubmissionView = ({ assignment, submission, onBack }: AssignmentSubmissionViewProps) => {
  const handleDownloadFile = (fileUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `submission-file-${index + 1}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="mb-4">
            ← Back to Assignments
          </Button>
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Submitted
          </Badge>
        </div>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          {assignment.title} - Submission View
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assignment Details */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium">Assignment Details</h4>
          <p className="text-sm text-gray-600">{assignment.description}</p>
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

        {/* Submission Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Your Submission</h4>
            <div className="text-sm text-gray-500">
              Submitted on {formatDate(submission.submitted_at)}
            </div>
          </div>

          {/* Submitted Text */}
          {submission.submission_text && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Submission Text:</h5>
              <div className="bg-white border rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{submission.submission_text}</p>
              </div>
            </div>
          )}

          {/* Submitted Files */}
          {submission.file_urls && submission.file_urls.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Attached Files:</h5>
              <div className="space-y-2">
                {submission.file_urls.map((fileUrl, index) => (
                  <div key={index} className="flex items-center justify-between bg-white border rounded-lg p-3">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">Attachment {index + 1}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadFile(fileUrl, index)}
                      className="flex items-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grading Information */}
          {submission.score !== null ? (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">Grading Results</h5>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Score: {submission.score}/{assignment.max_score}
                </Badge>
              </div>
              {submission.feedback && (
                <div>
                  <h6 className="font-medium text-sm mb-2">Instructor Feedback:</h6>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                <span className="text-sm text-yellow-700">Awaiting grading from instructor</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentSubmissionView;