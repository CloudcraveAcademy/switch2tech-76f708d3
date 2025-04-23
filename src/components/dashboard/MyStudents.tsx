
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  course_count: number;
  completion_rate?: number;
  last_activity?: string;
}

interface StudentEnrollment {
  enrollment_id: string;
  student_id: string;
  course_id: string;
  course_title: string;
  enrollment_date: string;
  progress: number;
  completed: boolean;
}

const MyStudents = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Fetch courses for filter dropdown
  const { data: courses } = useQuery({
    queryKey: ["instructor-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("instructor_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch all students enrolled in instructor's courses
  const { data: students, isLoading } = useQuery({
    queryKey: ["instructor-students", user?.id, courseFilter],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all courses by the instructor
      const { data: instructorCourses, error: coursesError } = await supabase
        .from("courses")
        .select("id")
        .eq("instructor_id", user.id);

      if (coursesError) throw coursesError;
      if (!instructorCourses?.length) return [];

      const courseIds = instructorCourses.map((course) => course.id);
      
      // Get enrollments filtered by course if specified
      let enrollmentsQuery = supabase
        .from("enrollments")
        .select("student_id, course_id")
        .in("course_id", courseIds);
        
      if (courseFilter !== "all") {
        enrollmentsQuery = enrollmentsQuery.eq("course_id", courseFilter);
      }
      
      const { data: enrollments, error: enrollmentsError } = await enrollmentsQuery;
      
      if (enrollmentsError) throw enrollmentsError;
      if (!enrollments?.length) return [];
      
      // Get unique student IDs
      const studentIds = [...new Set(enrollments.map((e) => e.student_id))];
      
      // Get student profiles
      const { data: studentProfiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("id, first_name, last_name, avatar_url")
        .in("id", studentIds);
        
      if (profilesError) throw profilesError;
      if (!studentProfiles?.length) return [];
      
      // Get all users to get emails
      const { data: authUsers, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;
      
      // Count enrollments per student
      const studentEnrollmentCounts: Record<string, number> = {};
      enrollments.forEach((enrollment) => {
        const { student_id } = enrollment;
        studentEnrollmentCounts[student_id] = (studentEnrollmentCounts[student_id] || 0) + 1;
      });
      
      // Combine data to create student objects
      const studentsData = studentProfiles.map((profile) => {
        const userDetails = authUsers?.users.find((u) => u.id === profile.id);
        
        return {
          id: profile.id,
          user_id: profile.id,
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          email: userDetails?.email || "",
          avatar_url: profile.avatar_url,
          course_count: studentEnrollmentCounts[profile.id] || 0,
          // These fields would typically come from actual tracking data
          completion_rate: Math.floor(Math.random() * 100), // Placeholder
          last_activity: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(), // Placeholder
        };
      });
      
      return studentsData as Student[];
    },
    enabled: !!user?.id,
  });

  // Fetch enrollments for a specific student when selected
  const { data: studentEnrollments, isLoading: loadingEnrollments } = useQuery({
    queryKey: ["student-enrollments", selectedStudent, user?.id],
    queryFn: async () => {
      if (!selectedStudent || !user?.id) return [];

      const { data: instructorCourses } = await supabase
        .from("courses")
        .select("id, title")
        .eq("instructor_id", user.id);

      if (!instructorCourses?.length) return [];

      const courseIds = instructorCourses.map((course) => course.id);
      
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, student_id, course_id, enrollment_date, progress, completed")
        .eq("student_id", selectedStudent)
        .in("course_id", courseIds);

      if (error) throw error;
      if (!data?.length) return [];
      
      // Map course titles to enrollments
      const enrollmentsWithCourseDetails = await Promise.all(
        data.map(async (enrollment) => {
          const course = instructorCourses.find((c) => c.id === enrollment.course_id);
          
          return {
            enrollment_id: enrollment.id,
            student_id: enrollment.student_id,
            course_id: enrollment.course_id,
            course_title: course?.title || "Unknown Course",
            enrollment_date: enrollment.enrollment_date,
            progress: enrollment.progress,
            completed: enrollment.completed,
          };
        })
      );
      
      return enrollmentsWithCourseDetails;
    },
    enabled: !!selectedStudent && !!user?.id,
  });

  // Filter students based on search query
  const filteredStudents = students?.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || student.email.toLowerCase().includes(query);
  });

  // Select a student to view details
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudent(studentId === selectedStudent ? null : studentId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="mr-2" /> My Students
          </h1>
          <p className="text-gray-600">Manage and monitor your students' progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>
              {filteredStudents?.length || 0} students enrolled in your courses
            </CardDescription>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="w-full sm:w-64">
                <Select
                  value={courseFilter}
                  onValueChange={(value) => setCourseFilter(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredStudents?.length === 0 ? (
              <div className="text-center p-10 bg-gray-50 rounded-lg">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No students found</h3>
                <p className="mt-1 text-gray-500">
                  {searchQuery ? "Try a different search term" : "No students are enrolled in your courses yet"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrolled Courses</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents?.map((student) => (
                      <TableRow 
                        key={student.id} 
                        className={selectedStudent === student.id ? "bg-gray-50" : ""}
                        onClick={() => handleSelectStudent(student.id)}
                      >
                        <TableCell className="font-medium flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatar_url} />
                            <AvatarFallback>
                              {student.first_name.charAt(0)}
                              {student.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{student.first_name} {student.last_name}</span>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.course_count}</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-brand-600 h-2.5 rounded-full"
                              style={{ width: `${student.completion_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">
                            {student.completion_rate}%
                          </span>
                        </TableCell>
                        <TableCell>
                          {student.last_activity ? new Date(student.last_activity).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={`mailto:${student.email}`}>
                              <Mail className="h-4 w-4 mr-1" /> Contact
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Student Details Section when a student is selected */}
            {selectedStudent && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">
                  Student Enrollments
                </h3>
                
                {loadingEnrollments ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : studentEnrollments?.length === 0 ? (
                  <p className="text-gray-500">No enrollments found for this student</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Enrolled On</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentEnrollments?.map((enrollment) => (
                          <TableRow key={enrollment.enrollment_id}>
                            <TableCell className="font-medium">{enrollment.course_title}</TableCell>
                            <TableCell>
                              {new Date(enrollment.enrollment_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-brand-600 h-2.5 rounded-full"
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 mt-1">
                                {enrollment.progress}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={enrollment.completed ? "success" : "default"}>
                                {enrollment.completed ? "Completed" : "In Progress"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyStudents;
