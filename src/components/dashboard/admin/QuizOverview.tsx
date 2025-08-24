import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Users, BarChart3, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Quiz {
  id: string;
  title: string;
  description: string;
  course_id: string;
  is_published: boolean;
  passing_score: number;
  time_limit_minutes: number;
  created_at: string;
  courses: {
    title: string;
    instructor_id: string;
    user_profiles_public: {
      first_name: string;
      last_name: string;
    };
  };
}

interface Submission {
  id: string;
  score: number;
  max_score: number;
  percentage: number;
  is_passed: boolean;
  submitted_at: string;
  student_name: string;
}

const QuizOverview = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          courses (
            title,
            instructor_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch instructor profiles for each quiz
      const quizzesWithProfiles = await Promise.all(
        (data || []).map(async (quiz: any) => {
          const { data: instructorProfile, error: profileError } = await supabase.rpc('get_user_basic_info', { 
            user_id_param: quiz.courses?.instructor_id 
          });
          
          return {
            ...quiz,
            courses: {
              ...quiz.courses,
              user_profiles_public: instructorProfile?.[0] || { first_name: 'Unknown', last_name: 'Instructor' }
            }
          };
        })
      );
      
      setQuizzes(quizzesWithProfiles);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch quizzes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_submissions')
        .select(`*`)
        .eq('quiz_id', quizId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      const subs = data || [];
      const studentIds = Array.from(new Set(subs.map((s: any) => s.student_id)));

      // Emails (admin privileges)
      const emailMap: Record<string, string> = {};
      const { data: emailsData } = await supabase.rpc('get_user_emails', {
        user_ids: studentIds
      });
      if (Array.isArray(emailsData)) emailsData.forEach((row: any) => (emailMap[row.id] = row.email));

      // Names
      const nameMap: Record<string, string> = {};
      const userInfoResults = await Promise.all(
        studentIds.map((uid) => supabase.rpc('get_user_basic_info', { user_id_param: uid }))
      );
      userInfoResults.forEach((res, idx) => {
        const uid = studentIds[idx];
        const info = res.data?.[0];
        nameMap[uid] = `${info?.first_name || ''} ${info?.last_name || ''}`.trim() || 'Unknown Student';
      });

      const submissionsWithProfiles = subs.map((sub: any) => ({
        ...sub,
        student_name: nameMap[sub.student_id] || 'Unknown Student',
        student_email: emailMap[sub.student_id]
      }));
      
      setSubmissions(submissionsWithProfiles);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    }
  };

  const toggleQuizPublish = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_published: !quiz.is_published })
        .eq('id', quiz.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Quiz ${quiz.is_published ? 'unpublished' : 'published'} successfully`,
      });

      fetchQuizzes();
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast({
        title: "Error",
        description: "Failed to update quiz",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  if (isLoading) {
    return <div className="p-6">Loading quizzes...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quiz Overview</h1>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>{quizzes.length} total quizzes</span>
          <span>•</span>
          <span>{quizzes.filter(q => q.is_published).length} published</span>
        </div>
      </div>

      <div className="grid gap-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {quiz.title}
                    <Badge variant={quiz.is_published ? "default" : "secondary"}>
                      {quiz.is_published ? "Published" : "Draft"}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Course: {quiz.courses?.title} | 
                    Instructor: {`${quiz.courses?.user_profiles_public?.first_name || ''} ${quiz.courses?.user_profiles_public?.last_name || ''}`.trim() || 'Unknown'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      fetchSubmissions(quiz.id);
                      setIsSubmissionsDialogOpen(true);
                    }}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Submissions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleQuizPublish(quiz)}
                  >
                    {quiz.is_published ? "Unpublish" : "Publish"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">{quiz.description}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                {quiz.passing_score && (
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    Passing Score: {quiz.passing_score}%
                  </span>
                )}
                {quiz.time_limit_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Time Limit: {quiz.time_limit_minutes}min
                  </span>
                )}
                <span>Created: {new Date(quiz.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {quizzes.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="text-muted-foreground">No quizzes found in the system.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submissions Dialog */}
      <Dialog open={isSubmissionsDialogOpen} onOpenChange={setIsSubmissionsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedQuiz?.title} - Submissions
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{(submission as any).student_name}</p>
                      {(submission as any).student_email && (
                        <p className="text-xs text-muted-foreground">{(submission as any).student_email}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={submission.is_passed ? "default" : "destructive"}>
                      {submission.score}/{submission.max_score} ({submission.percentage}%)
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {submissions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No submissions yet for this quiz.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizOverview;