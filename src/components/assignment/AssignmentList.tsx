import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FileText, Calendar, Clock, CheckCircle, Download, Paperclip } from "lucide-react";
import { formatDate } from "@/lib/utils";
import AssignmentSubmission from "./AssignmentSubmission";
import AssignmentSubmissionView from "./AssignmentSubmissionView";

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_score: number;
  course_id: string;
  is_published: boolean;
  attachment_url?: string;
}

interface AssignmentWithSubmission extends Assignment {
  submission?: {
    id: string;
    submitted_at: string;
    score: number | null;
    feedback: string | null;
    submission_text: string | null;
    file_urls: string[] | null;
  };
}

interface AssignmentListProps {
  courseId: string;
  userRole: 'student' | 'instructor' | 'admin';
}

const AssignmentList = ({ courseId, userRole }: AssignmentListProps) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithSubmission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<{assignment: Assignment, submission: any} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      
      // Fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', courseId)
        .order('due_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      let assignmentsWithSubmissions: AssignmentWithSubmission[] = assignmentsData || [];

      // If user is a student, fetch their submissions
      if (userRole === 'student' && user) {
        assignmentsWithSubmissions = await Promise.all(
          (assignmentsData || []).map(async (assignment) => {
            const { data: submissionData } = await supabase
              .from('assignment_submissions')
              .select('id, submitted_at, score, feedback, submission_text, file_urls')
              .eq('assignment_id', assignment.id)
              .eq('student_id', user.id)
              .maybeSingle();

            return {
              ...assignment,
              submission: submissionData ? {
                ...submissionData,
                file_urls: Array.isArray(submissionData.file_urls) ? submissionData.file_urls as string[] : null
              } : undefined,
            };
          })
        );
      }

      setAssignments(assignmentsWithSubmissions);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId, userRole, user]);

  const handleSubmissionComplete = () => {
    setSelectedAssignment(null);
    fetchAssignments();
  };

  const handleViewSubmission = (assignment: AssignmentWithSubmission) => {
    if (assignment.submission) {
      setViewingSubmission({ assignment, submission: assignment.submission });
    }
  };

  const handleBackToList = () => {
    setSelectedAssignment(null);
    setViewingSubmission(null);
  };

  const getAssignmentStatus = (assignment: AssignmentWithSubmission) => {
    if (assignment.submission) {
      return assignment.submission.score !== null ? 'graded' : 'submitted';
    }
    
    const isOverdue = new Date() > new Date(assignment.due_date);
    return isOverdue ? 'overdue' : 'pending';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge className="bg-green-100 text-green-800">Graded</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleDownloadAttachment = async (url: string) => {
    try {
      const res = await fetch(url, { credentials: 'omit' });
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      const blob = await res.blob();
      const filename = url.split('/').pop()?.split('?')[0] || 'attachment';
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback: open in a new tab (may still be blocked by extensions)
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const onAttachmentClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    handleDownloadAttachment(url);
  };

  if (viewingSubmission) {
    return (
      <AssignmentSubmissionView
        assignment={viewingSubmission.assignment}
        submission={viewingSubmission.submission}
        onBack={handleBackToList}
      />
    );
  }

  if (selectedAssignment) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={handleBackToList}
          className="mb-4"
        >
          ← Back to Assignments
        </Button>
        <AssignmentSubmission 
          assignment={selectedAssignment} 
          onSubmissionComplete={handleSubmissionComplete}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading assignments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {assignments.length > 0 ? (
          <ul className="divide-y">
            {assignments.map((assignment) => {
              const status = getAssignmentStatus(assignment);
              const timeLeft = new Date(assignment.due_date).getTime() - new Date().getTime();
              const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

              return (
                <li key={assignment.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{assignment.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500 gap-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due: {formatDate(assignment.due_date)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Max Score: {assignment.max_score} points
                        </div>
                      </div>
                      {assignment.attachment_url && (
                        <div className="flex items-center mt-2 text-sm text-blue-600">
                          <Paperclip className="h-4 w-4 mr-1" />
                          <a 
                            href={assignment.attachment_url}
                            onClick={(e) => onAttachmentClick(e, assignment.attachment_url!)}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center"
                          >
                            View Attachment
                            <Download className="h-3 w-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(status)}
                      {status === 'pending' && daysLeft > 0 && (
                        <span className="text-xs text-gray-500">
                          {daysLeft} days left
                        </span>
                      )}
                    </div>
                  </div>

                  {assignment.submission && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          Submitted on {formatDate(assignment.submission.submitted_at)}
                        </div>
                        {assignment.submission.score !== null && (
                          <Badge variant="outline">
                            Score: {assignment.submission.score}/{assignment.max_score}
                          </Badge>
                        )}
                      </div>
                      {assignment.submission.feedback && (
                        <div className="mt-2 text-sm">
                          <strong>Feedback:</strong> {assignment.submission.feedback}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {userRole === 'student' && !assignment.submission && status !== 'overdue' && (
                      <Button 
                        size="sm" 
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        Submit Assignment
                      </Button>
                    )}
                    
                    {assignment.submission && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewSubmission(assignment)}
                      >
                        View Submission
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700">No assignments yet</h3>
            <p className="text-gray-500 mb-4">
              {userRole === 'instructor' ? 
                "Create assignments to engage your students" : 
                "No assignments have been created for this course yet"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AssignmentList;