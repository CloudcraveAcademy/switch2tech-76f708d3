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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  course_id: string;
  time_limit_minutes: number;
  passing_score: number;
  is_published: boolean;
  created_at: string;
}

interface Question {
  id: string;
  question: string;
  question_type: string;
  options: any;
  correct_answer: string;
  points: number;
  order_number: number;
}

const QuizManager = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    course_id: "",
    time_limit_minutes: 60,
    passing_score: 70,
    is_published: false
  });

  const [bulkUploadText, setBulkUploadText] = useState("");

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

  const fetchQuizzes = async () => {
    if (!selectedCourse) return;

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('course_id', selectedCourse)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
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

  const fetchQuestions = async (quizId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_number');

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const createQuiz = async () => {
    if (!quizForm.title || !quizForm.course_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert([quizForm])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz created successfully",
      });

      setIsCreateDialogOpen(false);
      setQuizForm({
        title: "",
        description: "",
        course_id: "",
        time_limit_minutes: 60,
        passing_score: 70,
        is_published: false
      });
      fetchQuizzes();
    } catch (error) {
      console.error("Error creating quiz:", error);
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      });
    }
  };

  const parseAndUploadBulkQuestions = async (quizId: string) => {
    if (!bulkUploadText.trim()) {
      toast({
        title: "Error",
        description: "Please enter questions in the specified format",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = bulkUploadText.trim().split('\n');
      const questions = [];
      let currentQuestion = null;
      let orderNumber = 1;

      for (const line of lines) {
        if (line.startsWith('Q:')) {
          if (currentQuestion) {
            questions.push(currentQuestion);
            orderNumber++;
          }
          currentQuestion = {
            quiz_id: quizId,
            question: line.substring(2).trim(),
            question_type: 'multiple_choice',
            options: [],
            correct_answer: '',
            points: 1,
            order_number: orderNumber
          };
        } else if (line.startsWith('A:') && currentQuestion) {
          currentQuestion.options.push(line.substring(2).trim());
        } else if (line.startsWith('C:') && currentQuestion) {
          currentQuestion.correct_answer = line.substring(2).trim();
        }
      }

      if (currentQuestion) {
        questions.push(currentQuestion);
      }

      const { error } = await supabase
        .from('quiz_questions')
        .insert(questions);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${questions.length} questions uploaded successfully`,
      });

      setBulkUploadText("");
      setIsBulkUploadOpen(false);
    } catch (error) {
      console.error("Error uploading questions:", error);
      toast({
        title: "Error",
        description: "Failed to upload questions",
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

  const deleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });

      fetchQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  useEffect(() => {
    if (selectedCourse) {
      fetchQuizzes();
    }
  }, [selectedCourse]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quiz Management</h1>
        <div className="flex gap-2">
          <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Bulk Upload Questions</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Format Instructions:</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    <p>Q: Question text</p>
                    <p>A: Option 1</p>
                    <p>A: Option 2</p>
                    <p>A: Option 3</p>
                    <p>A: Option 4</p>
                    <p>C: Correct answer</p>
                    <p className="mt-2">Repeat for each question...</p>
                  </div>
                </div>
                <Textarea
                  placeholder="Enter your questions here..."
                  value={bulkUploadText}
                  onChange={(e) => setBulkUploadText(e.target.value)}
                  rows={15}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsBulkUploadOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => selectedQuiz && parseAndUploadBulkQuestions(selectedQuiz.id)}
                    disabled={!selectedQuiz}
                  >
                    Upload Questions
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={quizForm.course_id}
                    onValueChange={(value) => setQuizForm({ ...quizForm, course_id: value })}
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
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    placeholder="Enter quiz title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    placeholder="Enter quiz description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                    <Input
                      id="time_limit"
                      type="number"
                      value={quizForm.time_limit_minutes}
                      onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="passing_score">Passing Score (%)</Label>
                    <Input
                      id="passing_score"
                      type="number"
                      value={quizForm.passing_score}
                      onChange={(e) => setQuizForm({ ...quizForm, passing_score: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createQuiz}>Create Quiz</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="course-select">Select Course</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Choose a course to manage quizzes" />
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
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {quiz.title}
                    <Badge variant={quiz.is_published ? "default" : "secondary"}>
                      {quiz.is_published ? "Published" : "Draft"}
                    </Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedQuiz(quiz);
                        fetchQuestions(quiz.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleQuizPublish(quiz)}
                    >
                      {quiz.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteQuiz(quiz.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">{quiz.description}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Time Limit: {quiz.time_limit_minutes} min</span>
                  <span>Passing Score: {quiz.passing_score}%</span>
                  <span>Created: {new Date(quiz.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {quizzes.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">No quizzes found for this course.</p>
                  <p className="text-muted-foreground">Create your first quiz to get started.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {selectedQuiz && (
        <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedQuiz.title} - Questions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="pt-4">
                    <p className="font-medium mb-2">
                      {index + 1}. {question.question}
                    </p>
                    <div className="space-y-1">
                      {(Array.isArray(question.options) ? question.options : []).map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`p-2 rounded text-sm ${
                            option === question.correct_answer 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-50'
                          }`}
                        >
                          {option} {option === question.correct_answer && '✓'}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Points: {question.points}
                    </p>
                  </CardContent>
                </Card>
              ))}
              
              {questions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No questions added yet.</p>
                  <Button 
                    className="mt-2"
                    onClick={() => setIsBulkUploadOpen(true)}
                  >
                    Add Questions
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default QuizManager;