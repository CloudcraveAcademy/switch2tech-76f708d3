import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface QuizListProps {
  courseId: string;
  onTakeQuiz: (quizId: string, options?: { review?: boolean }) => void;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
  is_published: boolean;
}

interface QuizSubmission {
  quiz_id: string;
  percentage: number;
  is_passed: boolean;
  submitted_at: string;
}

export function QuizList({ courseId, onTakeQuiz }: QuizListProps) {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['course-quizzes', courseId, user?.id],
    queryFn: async () => {
      const [quizzesResponse, submissionsResponse] = await Promise.all([
        supabase
          .from('quizzes')
          .select('*')
          .eq('course_id', courseId)
          .eq('is_published', true)
          .order('created_at'),
        supabase
          .from('quiz_submissions')
          .select('quiz_id, percentage, is_passed, submitted_at')
          .eq('student_id', user!.id)
      ]);

      if (quizzesResponse.error) throw quizzesResponse.error;
      if (submissionsResponse.error) throw submissionsResponse.error;

      return {
        quizzes: quizzesResponse.data as Quiz[],
        submissions: submissionsResponse.data as QuizSubmission[]
      };
    },
    enabled: !!courseId && !!user
  });

  if (isLoading) {
    return <div>Loading quizzes...</div>;
  }

  if (!data || data.quizzes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">No Quizzes Available</h3>
          <p className="text-muted-foreground">
            There are no published quizzes for this course yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { quizzes, submissions } = data;
  const submissionMap = new Map(submissions.map(s => [s.quiz_id, s]));

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Course Quizzes</h2>
      
      {quizzes.map((quiz) => {
        const submission = submissionMap.get(quiz.id);
        const isCompleted = !!submission;
        
        return (
          <Card key={quiz.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {quiz.title}
                  {isCompleted && (
                    submission.is_passed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )
                  )}
                </CardTitle>
                
                <div className="flex items-center gap-2">
                  {quiz.time_limit_minutes && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {quiz.time_limit_minutes} min
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Pass: {quiz.passing_score}%
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {quiz.description && (
                <p className="text-muted-foreground mb-4">{quiz.description}</p>
              )}
              
              {isCompleted ? (
                <div className="space-y-3">
                  <p className="font-medium">
                    Your Score: {submission.percentage}% 
                    <span className={`ml-2 ${submission.is_passed ? 'text-green-600' : 'text-red-600'}`}>
                      ({submission.is_passed ? 'Passed' : 'Failed'})
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Completed on {new Date(submission.submitted_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onTakeQuiz(quiz.id, { review: true })}>
                      View Corrections
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => onTakeQuiz(quiz.id)}>
                  Take Quiz
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}