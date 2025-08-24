import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface QuizTakerProps {
  quizId: string;
  onComplete?: (score: number) => void;
  initialShowCorrections?: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  points: number;
  order_number: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  time_limit_minutes: number;
  passing_score: number;
}

export function QuizTaker({ quizId, onComplete, initialShowCorrections }: QuizTakerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCorrections, setShowCorrections] = useState(!!initialShowCorrections);

  // Fetch quiz and questions
  const { data: quizData, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const [quizResponse, questionsResponse] = await Promise.all([
        supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single(),
        supabase
          .from('quiz_questions')
          .select('*')
          .eq('quiz_id', quizId)
          .order('order_number')
      ]);

      if (quizResponse.error) throw quizResponse.error;
      if (questionsResponse.error) throw questionsResponse.error;

      return {
        quiz: quizResponse.data as Quiz,
        questions: questionsResponse.data as QuizQuestion[]
      };
    },
    enabled: !!quizId && !!user
  });

  // Check if user already submitted this quiz
  const { data: existingSubmission } = useQuery({
    queryKey: ['quiz-submission', quizId, user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('quiz_submissions')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('student_id', user!.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      return data;
    },
    enabled: !!quizId && !!user
  });

  // Retake quiz mutation
  const retakeQuizMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('No user found');
      
      const { error } = await supabase
        .from('quiz_submissions')
        .delete()
        .eq('quiz_id', quizId)
        .eq('student_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-submission', quizId, user?.id] });
      setIsSubmitted(false);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowCorrections(false);
      if (quizData?.quiz.time_limit_minutes) {
        setTimeLeft(quizData.quiz.time_limit_minutes * 60);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to reset quiz. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (finalAnswers: Record<string, string>) => {
      if (!quizData || !user) throw new Error('Missing data');

      const { quiz, questions } = quizData;
      let totalScore = 0;
      let maxScore = 0;

      questions.forEach(question => {
        maxScore += question.points;
        if (finalAnswers[question.id] === question.correct_answer) {
          totalScore += question.points;
        }
      });

      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const isPassed = percentage >= (quiz.passing_score || 60);

      // Delete previous submission if exists to allow retakes
      if (existingSubmission) {
        await supabase
          .from('quiz_submissions')
          .delete()
          .eq('quiz_id', quizId)
          .eq('student_id', user.id);
      }

      const { error } = await supabase
        .from('quiz_submissions')
        .insert({
          quiz_id: quizId,
          student_id: user.id,
          score: totalScore,
          max_score: maxScore,
          percentage: Math.round(percentage * 100) / 100,
          answers: finalAnswers,
          is_passed: isPassed,
          time_taken_minutes: quiz.time_limit_minutes ? quiz.time_limit_minutes - Math.floor(timeLeft / 60) : null
        });

      if (error) throw error;

      return { totalScore, maxScore, percentage, isPassed };
    },
    onSuccess: (result) => {
      setIsSubmitted(true);
      toast({
        title: result.isPassed ? "Quiz Passed!" : "Quiz Completed",
        description: `You scored ${result.percentage.toFixed(1)}% (${result.totalScore}/${result.maxScore} points)`,
      });
      onComplete?.(result.percentage);
      queryClient.invalidateQueries({ queryKey: ['student-detailed-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Timer effect
  useEffect(() => {
    if (quizData?.quiz.time_limit_minutes && timeLeft > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            submitQuizMutation.mutate(answers);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeLeft, isSubmitted, quizData, answers, submitQuizMutation]);

  // Initialize timer
  useEffect(() => {
    if (quizData?.quiz.time_limit_minutes) {
      setTimeLeft(quizData.quiz.time_limit_minutes * 60);
    }
  }, [quizData]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    submitQuizMutation.mutate(answers);
  };

  if (isLoading) {
    return <div>Loading quiz...</div>;
  }

  if (existingSubmission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>Your score: {existingSubmission.percentage}% ({existingSubmission.score}/{existingSubmission.max_score} points)</p>
            <p className="text-sm text-muted-foreground mt-1">
              Status: {existingSubmission.is_passed ? "Passed" : "Failed"}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowCorrections(!showCorrections)}
              className="flex-1"
            >
              {showCorrections ? "Hide Corrections" : "View Corrections"}
            </Button>
            <Button 
              onClick={() => retakeQuizMutation.mutate()}
              disabled={retakeQuizMutation.isPending}
              className="flex-1"
            >
              {retakeQuizMutation.isPending ? "Resetting..." : "Retake Quiz"}
            </Button>
          </div>
          
          {/* Show quiz corrections when toggled */}
          {showCorrections && existingSubmission.answers && quizData && (
            <div className="space-y-3 mt-4">
              <h3 className="font-medium">Review Your Answers:</h3>
              {quizData.questions.map((question, index) => {
                const userAnswer = existingSubmission.answers[question.id];
                const isCorrect = userAnswer === question.correct_answer;
                
                return (
                  <div key={question.id} className="border rounded p-3 space-y-2">
                    <p className="font-medium text-sm">
                      Question {index + 1}: {question.question}
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex}
                          className={`p-2 rounded text-sm ${
                            option === question.correct_answer 
                              ? 'bg-green-100 text-green-800 font-medium' 
                              : option === userAnswer && !isCorrect
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-50'
                          }`}
                        >
                          {option === question.correct_answer && '✓ '}
                          {option === userAnswer && option !== question.correct_answer && '✗ '}
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!quizData) {
    return <div>Quiz not found</div>;
  }

  const { quiz, questions } = quizData;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (isSubmitted) {
    // Calculate results for immediate display
    let totalScore = 0;
    let maxScore = 0;
    
    questions.forEach(question => {
      maxScore += question.points;
      if (answers[question.id] === question.correct_answer) {
        totalScore += question.points;
      }
    });
    
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const isPassed = percentage >= (quiz.passing_score || 60);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Quiz Completed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-lg">Your score: {percentage.toFixed(1)}% ({totalScore}/{maxScore} points)</p>
            <p className={`text-sm mt-1 ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
              Status: {isPassed ? "Passed" : "Failed"}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowCorrections(!showCorrections)}
              className="flex-1"
            >
              {showCorrections ? "Hide Corrections" : "View Corrections"}
            </Button>
            <Button 
              onClick={() => retakeQuizMutation.mutate()}
              disabled={retakeQuizMutation.isPending}
              className="flex-1"
            >
              {retakeQuizMutation.isPending ? "Resetting..." : "Retake Quiz"}
            </Button>
          </div>
          
          {/* Show quiz corrections when toggled */}
          {showCorrections && (
            <div className="space-y-3">
              <h3 className="font-medium">Review Your Answers:</h3>
              {questions.map((question, index) => {
                const userAnswer = answers[question.id];
                const isCorrect = userAnswer === question.correct_answer;
                
                return (
                  <div key={question.id} className="border rounded p-3 space-y-2">
                    <p className="font-medium text-sm">
                      Question {index + 1}: {question.question}
                    </p>
                    <div className="grid grid-cols-1 gap-1">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex}
                          className={`p-2 rounded text-sm ${
                            option === question.correct_answer 
                              ? 'bg-green-100 text-green-800 font-medium' 
                              : option === userAnswer && !isCorrect
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-50'
                          }`}
                        >
                          {option === question.correct_answer && '✓ '}
                          {option === userAnswer && option !== question.correct_answer && '✗ '}
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.time_limit_minutes && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentQuestion.question}</h3>
            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            >
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!answers[currentQuestion.id] || submitQuizMutation.isPending}
              >
                {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}