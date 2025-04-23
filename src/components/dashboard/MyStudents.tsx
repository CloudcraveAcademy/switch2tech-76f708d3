
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Users, UserPlus, Search, MoreHorizontal, Mail } from "lucide-react";

interface Student {
  id: string;
  user_id: string;
  name: string;
  email: string;
  enrolled_courses: number;
  last_active: string;
  avatar_url: string | null;
}

interface InviteForm {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const MyStudents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState<InviteForm>({
    email: "",
    firstName: "",
    lastName: "",
    message: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchStudents = async () => {
      try {
        setIsLoading(true);

        // Get all courses by this instructor
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("id")
          .eq("instructor_id", user.id);

        if (coursesError) throw coursesError;

        if (!courses || courses.length === 0) {
          setStudents([]);
          setFilteredStudents([]);
          setIsLoading(false);
          return;
        }

        const courseIds = courses.map((course) => course.id);

        // Get all enrollments for these courses
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("student_id, course_id")
          .in("course_id", courseIds);

        if (enrollmentsError) throw enrollmentsError;

        if (!enrollments || enrollments.length === 0) {
          setStudents([]);
          setFilteredStudents([]);
          setIsLoading(false);
          return;
        }

        // Get unique student IDs
        const uniqueStudentIds = [
          ...new Set(enrollments.map((enrollment) => enrollment.student_id)),
        ];

        // Get student profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("user_profiles")
          .select("id, first_name, last_name, avatar_url");

        if (profilesError) throw profilesError;

        // Since we can't use admin methods in client-side code, we'll use mock data for emails
        // In a real application, you'd need a server endpoint to get this data
        const studentData = uniqueStudentIds.map((studentId) => {
          const matchingProfile = profiles?.find(
            (profile) => profile.id === studentId
          ) || { first_name: "Unknown", last_name: "User", avatar_url: null };
          
          const studentEnrollments = enrollments.filter(
            (enrollment) => enrollment.student_id === studentId
          );
          
          const lastActive = new Date().toISOString(); // Placeholder for last active

          return {
            id: studentId,
            user_id: studentId,
            name: `${matchingProfile.first_name || ""} ${matchingProfile.last_name || ""}`.trim() || "Unknown User",
            email: `student${studentId.substring(0, 4)}@example.com`, // Mock email
            enrolled_courses: studentEnrollments.length,
            last_active: lastActive,
            avatar_url: matchingProfile.avatar_url,
          };
        });

        setStudents(studentData);
        setFilteredStudents(studentData);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load students. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [navigate, toast, user]);

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
      // Here you would send the invitation
      // For now, let's simulate success
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send invitation. Please try again.",
      });
    }
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

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <p>Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-900">
                    No students found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? "No students match your search criteria."
                      : "You don't have any students yet."}
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite Students
                    </Button>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrolled Courses</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
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
                          {new Date(student.last_active).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Active</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>Remove Student</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="active" className="pt-4">
              <div className="text-center py-10">
                <p>Active students will be shown here</p>
              </div>
            </TabsContent>

            <TabsContent value="inactive" className="pt-4">
              <div className="text-center py-10">
                <p>Inactive students will be shown here</p>
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
    </div>
  );
};

export default MyStudents;
