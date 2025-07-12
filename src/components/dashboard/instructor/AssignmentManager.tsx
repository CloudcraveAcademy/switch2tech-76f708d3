import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  course_id: string;
  due_date: string;
  max_score: number;
  is_published: boolean;
  created_at: string;
}

interface Submission {
  id: string;
  student_id: string;
  submission_text: string;
  file_urls: any;
  score: number;
  feedback: string;
  submitted_at: string;
  graded_at: string;
  student_name: string;
}

const AssignmentManager = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    course_id: "",
    due_date: "",
    max_score: 100,
    is_published: false,
    attachment_file: null as File | null
  });

  const fetchCourses = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('instructor_id', user.id);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive",
      });
    }
  };

  const fetchAssignments = async () => {
    if (!selectedCourse) return;

    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('course_id', selectedCourse)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          user_profiles!student_id (
            first_name,
            last_name
          )
        `)
        .eq('assignment_id', assignmentId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      const formattedSubmissions = data?.map(sub => ({
        ...sub,
        student_name: `${sub.user_profiles?.first_name || ''} ${sub.user_profiles?.last_name || ''}`.trim() || 'Unknown Student'
      })) || [];
      
      setSubmissions(formattedSubmissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    }
  };

  const createAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.course_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      let attachmentUrl = null;

      // Upload attachment if exists
      if (assignmentForm.attachment_file) {
        const fileExt = assignmentForm.attachment_file.name.split('.').pop();
        const fileName = `assignment-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('Course Materials')
          .upload(fileName, assignmentForm.attachment_file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('Course Materials')
          .getPublicUrl(fileName);
        
        attachmentUrl = urlData.publicUrl;
      }

      const assignmentData = {
        title: assignmentForm.title,
        description: assignmentForm.description,
        course_id: assignmentForm.course_id,
        due_date: assignmentForm.due_date || null,
        max_score: assignmentForm.max_score,
        is_published: assignmentForm.is_published,
        attachment_url: attachmentUrl
      };

      const { data, error } = await supabase
        .from('assignments')
        .insert([assignmentData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment created successfully",
      });

      setIsCreateDialogOpen(false);
      setAssignmentForm({
        title: "",
        description: "",
        course_id: "",
        due_date: "",
        max_score: 100,
        is_published: false,
        attachment_file: null
      });
      fetchAssignments();
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const toggleAssignmentPublish = async (assignment: Assignment) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ is_published: !assignment.is_published })
        .eq('id', assignment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Assignment ${assignment.is_published ? 'unpublished' : 'published'} successfully`,
      });

      fetchAssignments();
    } catch (error) {
      console.error("Error updating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  const gradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .update({ 
          score,
          feedback,
          graded_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Submission graded successfully",
      });

      fetchSubmissions(selectedAssignment!.id);
    } catch (error) {
      console.error("Error grading submission:", error);
      toast({
        title: "Error",
        description: "Failed to grade submission",
        variant: "destructive",
      });
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });

      fetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  useEffect(() => {
    if (selectedCourse) {
      fetchAssignments();
    }
  }, [selectedCourse]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Assignment Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="course">Course</Label>
                <Select
                  value={assignmentForm.course_id}
                  onValueChange={(value) => setAssignmentForm({ ...assignmentForm, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  placeholder="Enter assignment title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  placeholder="Enter assignment description"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="attachment">Attachment (Optional)</Label>
                <Input
                  id="attachment"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAssignmentForm({ ...assignmentForm, attachment_file: file });
                    }
                  }}
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supported formats: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={assignmentForm.due_date}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="max_score">Max Score</Label>
                  <Input
                    id="max_score"
                    type="number"
                    value={assignmentForm.max_score}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, max_score: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createAssignment}>Create Assignment</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <Label htmlFor="course-select">Select Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Choose a course to manage assignments" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCourse && (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {assignment.title}
                    <Badge variant={assignment.is_published ? "default" : "secondary"}>
                      {assignment.is_published ? "Published" : "Draft"}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        fetchSubmissions(assignment.id);
                        setIsSubmissionsDialogOpen(true);
                      }}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Submissions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAssignmentPublish(assignment)}
                    >
                      {assignment.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAssignment(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{assignment.description}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Max Score: {assignment.max_score}</span>
                  {assignment.due_date && (
                    <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                  )}
                  <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {assignments.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">No assignments found for this course.</p>
                  <p className="text-muted-foreground">Create your first assignment to get started.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Submissions Dialog */}
      <Dialog open={isSubmissionsDialogOpen} onOpenChange={setIsSubmissionsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedAssignment?.title} - Submissions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{submission.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    {submission.score !== null && (
                      <Badge variant="outline">
                        Score: {submission.score}/{selectedAssignment?.max_score}
                      </Badge>
                    )}
                  </div>
                  
                  {submission.submission_text && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Submission:</p>
                      <p className="text-sm bg-gray-50 p-2 rounded">{submission.submission_text}</p>
                    </div>
                  )}
                  
                  {submission.feedback && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Feedback:</p>
                      <p className="text-sm bg-blue-50 p-2 rounded">{submission.feedback}</p>
                    </div>
                  )}

                  {!submission.graded_at && (
                    <div className="flex gap-2 mt-3">
                      <Input
                        type="number"
                        placeholder="Score"
                        className="w-20"
                        id={`score-${submission.id}`}
                        max={selectedAssignment?.max_score}
                      />
                      <Input
                        placeholder="Feedback"
                        className="flex-1"
                        id={`feedback-${submission.id}`}
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const scoreInput = document.getElementById(`score-${submission.id}`) as HTMLInputElement;
                          const feedbackInput = document.getElementById(`feedback-${submission.id}`) as HTMLInputElement;
                          gradeSubmission(submission.id, parseInt(scoreInput.value), feedbackInput.value);
                        }}
                      >
                        Grade
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {submissions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No submissions yet.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentManager;