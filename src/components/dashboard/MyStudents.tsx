
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Search, MoreHorizontal, Mail, FileText, Award, Clock, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  enrolled_courses: number;
  completed_courses: number;
  average_progress: number;
  last_active: string;
  avatar_url: string | null;
}

interface MessageForm {
  subject: string;
  message: string;
}

interface InviteForm {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
}

interface StudentProgress {
  studentId: string;
  courseId: string;
  progress: number;
  courseName: string;
}

interface ActivityRecord {
  date: string;
  count: number;
}

const MyStudents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    email: "",
    firstName: "",
    lastName: "",
    message: "",
  });
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [messageForm, setMessageForm] = useState<MessageForm>({
    subject: "",
    message: "",
  });

  const { data: studentData, isLoading } = useQuery({
    queryKey: ['instructor-students', user?.id],
    queryFn: async () => {
      try {
        console.log("🔍 Starting MyStudents query for user:", user?.id);
        
        // Get all courses by this instructor
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("id, title")
          .eq("instructor_id", user?.id);

        console.log("📚 Courses found:", courses?.length || 0, courses);
        if (coursesError) {
          console.error("❌ Courses error:", coursesError);
          throw coursesError;
        }

        if (!courses || courses.length === 0) {
          console.log("📚 No courses found for instructor");
          return { students: [], courseMap: {} };
        }

        const courseIds = courses.map((course) => course.id);
        const courseMap = courses.reduce((acc, course) => {
          acc[course.id] = course.title;
          return acc;
        }, {} as Record<string, string>);

        // Get all enrollments for these courses
        console.log("🎓 Looking for enrollments in courses:", courseIds);
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("student_id, course_id, progress, completed")
          .in("course_id", courseIds);

        console.log("🎓 Enrollments found:", enrollments?.length || 0, enrollments);
        if (enrollmentsError) {
          console.error("❌ Enrollments error:", enrollmentsError);
          throw enrollmentsError;
        }

        if (!enrollments || enrollments.length === 0) {
          console.log("🎓 No enrollments found for instructor's courses");
          return { students: [], courseMap };
        }

        // Get unique student IDs
        const uniqueStudentIds = [...new Set(enrollments.map((enrollment) => enrollment.student_id))];
        console.log("👥 Unique student IDs:", uniqueStudentIds.length, uniqueStudentIds);

        // Get user info (names, emails) via RPC functions
        const emailMap: Record<string, string> = {};
        const nameMap: Record<string, string> = {};
        const avatarMap: Record<string, string> = {};
        
        try {
          console.log("📧 Attempting to fetch user emails...");
          const { data: userEmails, error: emailError } = await supabase.rpc('get_user_emails', {
            user_ids: uniqueStudentIds,
            instructor_id: user?.id
          });

          console.log("📧 Email RPC result:", { userEmails, emailError });
          if (!emailError && userEmails && Array.isArray(userEmails)) {
            userEmails.forEach((user: { id: string; email: string }) => {
              emailMap[user.id] = user.email;
            });
            console.log("📧 Email map created:", emailMap);
          } else if (emailError) {
            console.warn("⚠️ Email RPC error:", emailError);
          }

          // Get user basic info for names and avatars
          console.log("👤 Fetching user basic info for names...");
          const userInfoPromises = uniqueStudentIds.map(userId => 
            supabase.rpc('get_user_basic_info', { user_id_param: userId })
          );
          
          const userInfoResults = await Promise.all(userInfoPromises);
          userInfoResults.forEach((result, index) => {
            if (result.data && result.data.length > 0) {
              const userInfo = result.data[0];
              const userId = uniqueStudentIds[index];
              nameMap[userId] = `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim() || 'Unknown User';
              avatarMap[userId] = userInfo.avatar_url;
            }
          });
          
        } catch (error) {
          console.error("❌ RPC call failed:", error);
        }

        // Get last activity for each student
        const { data: lessonProgress, error: progressError } = await supabase
          .from("student_lesson_progress")
          .select("student_id, last_accessed")
          .in("student_id", uniqueStudentIds)
          .order("last_accessed", { ascending: false });

        if (progressError) throw progressError;

        // Process student data
        const studentData = uniqueStudentIds.map((studentId) => {
          const studentEnrollments = enrollments.filter(
            (enrollment) => enrollment.student_id === studentId
          );
          
          // Calculate completed courses - count as completed if progress is 100% OR completed flag is true
          const completedCourses = studentEnrollments.filter(
            (enrollment) => enrollment.completed === true || (enrollment.progress && enrollment.progress >= 100)
          ).length;

          const studentLastActivity = lessonProgress?.find(
            (progress) => progress.student_id === studentId
          )?.last_accessed || new Date().toISOString();

          const totalProgress = studentEnrollments.reduce(
            (sum, enrollment) => sum + (enrollment.progress || 0), 
            0
          );
          
          const averageProgress = studentEnrollments.length > 0 
            ? Math.round(totalProgress / studentEnrollments.length) 
            : 0;

          return {
            id: studentId,
            user_id: studentId,
            name: nameMap[studentId] || 'Unknown User',
            email: emailMap[studentId] || "No email available",
            enrolled_courses: studentEnrollments.length,
            completed_courses: completedCourses,
            average_progress: averageProgress,
            last_active: studentLastActivity,
            avatar_url: avatarMap[studentId],
          };
        });

        // Generate progress data for each student per course
        const progressData = enrollments.map(enrollment => ({
          studentId: enrollment.student_id,
          courseId: enrollment.course_id,
          progress: enrollment.progress || 0,
          courseName: courseMap[enrollment.course_id] || "Unknown Course"
        }));

        return { 
          students: studentData,
          progressData,
          courseMap
        };
      } catch (error) {
        console.error("Error fetching students:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (studentData) {
      setStudents(studentData.students || []);
      setFilteredStudents(studentData.students || []);
      setStudentProgress(studentData.progressData || []);
    }
  }, [studentData]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const handleInviteChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInviteForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get instructor details
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single();

      const instructorName = profile 
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : 'Your Instructor';

      // Call the edge function to send the invitation email
      const { data, error } = await supabase.functions.invoke('send-invite-email', {
        body: {
          email: inviteForm.email,
          firstName: inviteForm.firstName,
          lastName: inviteForm.lastName,
          message: inviteForm.message,
          instructorName,
        },
      });

      if (error) {
        console.error('Error sending invitation:', error);
        throw error;
      }

      toast({
        variant: "default",
        title: "Invitation sent",
        description: `Invitation has been sent to ${inviteForm.email}`,
      });
      
      setInviteForm({
        email: "",
        firstName: "",
        lastName: "",
        message: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation. Please try again.",
      });
    }
  };

  const handleViewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleSendMessage = (student: Student) => {
    setSelectedStudent(student);
    setMessageForm({
      subject: `Message from your instructor`,
      message: "",
    });
    setIsMessageDialogOpen(true);
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !user) return;

    try {
      // Send message to database
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedStudent.id,
          subject: messageForm.subject,
          content: messageForm.message,
        });

      if (messageError) throw messageError;

      // Create notification for the student
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedStudent.id,
          type: 'message',
          title: `New message from your instructor`,
          description: messageForm.subject,
          action_url: '/dashboard/messages',
          instructor_id: user.id,
          metadata: { sender_name: `${user.user_metadata?.first_name} ${user.user_metadata?.last_name}` }
        });

      if (notificationError) throw notificationError;

      toast({
        variant: "default",
        title: "Message sent",
        description: `Message sent to ${selectedStudent.name}`,
      });
      setMessageForm({ subject: "", message: "" });
      setIsMessageDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
    }
  };

  const handleGenerateReport = (student: Student) => {
    // Generate a simple CSV report for the student
    const reportData = [
      ["Switch2Tech Academy - Student Report"],
      ["Generated on:", new Date().toLocaleDateString()],
      [""],
      ["Student Information"],
      ["Name", student.name],
      ["Email", student.email || "No email available"],
      ["Enrolled Courses", student.enrolled_courses.toString()],
      ["Completed Courses", student.completed_courses.toString()],
      ["Average Progress", `${student.average_progress}%`],
      ["Last Active", new Date(student.last_active).toLocaleDateString()],
      [""],
      ["Course Details"],
      ["Course Name", "Progress", "Status"]
    ];

    // Add course progress data
    const studentCourseProgress = studentProgress.filter(p => p.studentId === student.id);
    studentCourseProgress.forEach(progress => {
      reportData.push([
        progress.courseName,
        `${progress.progress}%`,
        progress.progress >= 100 ? "Completed" : "In Progress"
      ]);
    });

    // Convert to CSV and download
    const csvContent = reportData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${student.name.replace(/\s+/g, "_")}_report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast({
      variant: "default",
      title: "Report generated",
      description: `Report for ${student.name} has been downloaded`,
    });
  };

  const activeStudents = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return filteredStudents.filter(student => 
      new Date(student.last_active) > oneWeekAgo
    );
  }, [filteredStudents]);

  const inactiveStudents = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return filteredStudents.filter(student => 
      new Date(student.last_active) <= oneWeekAgo
    );
  }, [filteredStudents]);

  const studentActivityData = useMemo(() => {
    const lastThirtyDays = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });
    
    const activityMap: Record<string, number> = {};
    lastThirtyDays.forEach(date => {
      activityMap[date] = 0;
    });
    
    // Count student activity by date
    students.forEach(student => {
      const activityDate = new Date(student.last_active).toISOString().split('T')[0];
      if (activityMap[activityDate] !== undefined) {
        activityMap[activityDate]++;
      }
    });
    
    return Object.entries(activityMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [students]);

  const renderStudentList = (studentList: Student[]) => {
    if (studentList.length === 0) {
      return (
        <div className="text-center py-10">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No students found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "No students match your search criteria."
              : activeTab === "active" 
                ? "No active students in the last 7 days."
                : activeTab === "inactive"
                ? "All students have been active in the last 7 days."
                : "You don't have any students yet."}
          </p>
          {studentList.length === 0 && students.length === 0 && (
            <div className="mt-6">
              <Button onClick={() => setIsDialogOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Students
              </Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Enrolled Courses</TableHead>
            <TableHead>Avg. Progress</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentList.map((student) => {
            const isActive = new Date(student.last_active) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            return (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="h-8 w-8 mr-2 rounded-full overflow-hidden bg-gray-200">
                      {student.avatar_url ? (
                        <img
                          src={student.avatar_url}
                          alt={student.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs bg-blue-600 text-white">
                          {student.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                      )}
                    </div>
                    {student.name}
                  </div>
                </TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.enrolled_courses}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Progress value={student.average_progress} className="h-2 w-16 mr-2" />
                    <span>{student.average_progress}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(student.last_active).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={isActive ? "outline" : "secondary"} className={isActive ? "bg-green-50 text-green-700 border-green-300" : ""}>
                    {isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewStudentDetails(student)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSendMessage(student)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateReport(student)}>
                        <Download className="mr-2 h-4 w-4" />
                        Generate Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Students</h1>
          <p className="text-gray-500">
            Manage all your students and their enrollments
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a Student</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new student to join your courses.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInviteSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={inviteForm.firstName}
                        onChange={handleInviteChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={inviteForm.lastName}
                        onChange={handleInviteChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={inviteForm.email}
                      onChange={handleInviteChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Input
                      id="message"
                      name="message"
                      value={inviteForm.message}
                      onChange={handleInviteChange}
                      placeholder="I'd like to invite you to my course..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Send Invitation</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
            <CardDescription className="text-2xl font-bold">{students.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500">
              {students.length > 0 
                ? `${activeStudents.length} active in the last 7 days`
                : "No students enrolled yet"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Average Progress</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {students.length > 0 
                ? `${Math.round(students.reduce((acc, s) => acc + s.average_progress, 0) / students.length)}%`
                : "0%"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500">
              {students.length > 0 
                ? `${students.filter(s => s.average_progress > 50).length} students above 50%`
                : "No student progress data yet"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completed Courses</CardTitle>
            <CardDescription className="text-2xl font-bold">
              {students.reduce((acc, s) => acc + s.completed_courses, 0)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500">
              {students.length > 0 
                ? `${students.filter(s => s.completed_courses > 0).length} students completed at least one course`
                : "No courses completed yet"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Students</CardTitle>
          <CardDescription>
            View and manage all students who have enrolled in your courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search students by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading students...</p>
                </div>
              ) : (
                renderStudentList(filteredStudents)
              )}
            </TabsContent>

            <TabsContent value="active" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading students...</p>
                </div>
              ) : (
                renderStudentList(activeStudents)
              )}
            </TabsContent>

            <TabsContent value="inactive" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading students...</p>
                </div>
              ) : (
                renderStudentList(inactiveStudents)
              )}
            </TabsContent>

            <TabsContent value="reports" className="pt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Progress by Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentProgress.length > 0 ? (
                      <div className="space-y-4">
                        {(() => {
                          // Group by course
                          const courseGroups: Record<string, StudentProgress[]> = {};
                          studentProgress.forEach(item => {
                            if (!courseGroups[item.courseId]) {
                              courseGroups[item.courseId] = [];
                            }
                            courseGroups[item.courseId].push(item);
                          });
                          
                          return Object.entries(courseGroups).map(([courseId, progresses]) => {
                            const courseName = progresses[0]?.courseName || "Unknown Course";
                            const avgProgress = Math.round(progresses.reduce((sum, p) => sum + p.progress, 0) / progresses.length);
                            
                            return (
                              <div key={courseId}>
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{courseName}</span>
                                  <span className="text-sm font-medium">{avgProgress}%</span>
                                </div>
                                <Progress value={avgProgress} className="h-2" />
                                <div className="mt-1 text-xs text-gray-500">
                                  {progresses.length} student{progresses.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                          No progress data available
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          When students enroll in your courses, their progress will be shown here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Student Achievements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {students.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Award className="h-5 w-5 text-yellow-500" />
                              <h4 className="font-medium">Completed Courses</h4>
                            </div>
                            <p className="text-2xl font-bold">{students.reduce((acc, s) => acc + s.completed_courses, 0)}</p>
                          </div>
                          
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <h4 className="font-medium">Active Students</h4>
                              </div>
                              <p className="text-2xl font-bold">{activeStudents.length}</p>
                              <p className="text-xs text-gray-500">last 7 days</p>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                          <h4 className="font-medium mb-2">Top Performing Students</h4>
                          <div className="space-y-2">
                            {students
                              .sort((a, b) => b.average_progress - a.average_progress)
                              .slice(0, 3)
                              .map(student => (
                                <div key={student.id} className="flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div className="h-6 w-6 mr-2 rounded-full overflow-hidden bg-gray-200">
                                      {student.avatar_url ? (
                                        <img
                                          src={student.avatar_url}
                                          alt={student.name}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs bg-blue-600 text-white">
                                          {student.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")}
                                        </div>
                                      )}
                                    </div>
                                    <span className="text-sm">{student.name}</span>
                                  </div>
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {student.average_progress}%
                                  </Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <Award className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">
                          No achievement data available
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Student achievements will be displayed here as they complete courses.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-500">
            Total students: {filteredStudents.length}
          </p>
        </CardFooter>
      </Card>

      {/* Student Details Dialog */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                {selectedStudent.name} - {selectedStudent.email}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200">
                  {selectedStudent.avatar_url ? (
                    <img
                      src={selectedStudent.avatar_url}
                      alt={selectedStudent.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm bg-blue-600 text-white">
                      {selectedStudent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Enrolled Courses</h4>
                  <p className="font-medium">{selectedStudent.enrolled_courses}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Completed Courses</h4>
                  <p className="font-medium">{selectedStudent.completed_courses}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Average Progress</h4>
                  <div className="flex items-center">
                    <Progress value={selectedStudent.average_progress} className="h-2 w-16 mr-2" />
                    <span>{selectedStudent.average_progress}%</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Last Active</h4>
                  <p className="font-medium">{new Date(selectedStudent.last_active).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Course Progress</h4>
                <div className="space-y-3">
                  {studentProgress
                    .filter(p => p.studentId === selectedStudent.id)
                    .map(progress => (
                      <div key={progress.courseId}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">{progress.courseName}</span>
                          <span className="text-sm font-medium">{progress.progress}%</span>
                        </div>
                        <Progress value={progress.progress} className="h-2" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleSendMessage(selectedStudent)}>
                  <Mail className="h-4 w-4 mr-1" />
                  Message
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleGenerateReport(selectedStudent)}>
                  <Download className="h-4 w-4 mr-1" />
                  Report
                </Button>
              </div>
              <Button variant="default" onClick={() => setSelectedStudent(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Send Message Dialog */}
      {selectedStudent && (
        <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Send Message to {selectedStudent.name}</DialogTitle>
              <DialogDescription>
                Send a direct message to {selectedStudent.email}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleMessageSubmit}>
              <div className="py-4 space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter message subject"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={messageForm.message}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Type your message here..."
                    rows={5}
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsMessageDialogOpen(false);
                    setSelectedStudent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Mail className="h-4 w-4 mr-1" />
                  Send Message
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyStudents;
