import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { 
  User, 
  Settings, 
  Award, 
  Wallet, 
  Briefcase,
  GraduationCap, 
  UserPlus, 
  ShieldCheck,
  Users,
  BookOpen 
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useProfileData, ProfileData } from "@/hooks/useProfileData";
import { Skeleton } from "@/components/ui/skeleton";
import BankDetails from './profile/BankDetails';
import { useQuery } from "@tanstack/react-query";
import AvatarUploader from "./profile/AvatarUploader";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    profileData, 
    loading, 
    updateProfileData,
    verifyBankAccount,
    updatePreferences,
    fetchProfileData
  } = useProfileData();

  const [formData, setFormData] = useState({
    // --- PERSONAL ---
    first_name: "",
    last_name: "",
    email: user?.email || "",
    bio: "",
    country: "Nigeria",
    phone: "",
    // --- PROFESSIONAL ---
    professional_title: "", // This maps to career_level in the database
    skills: "",
    website: "",
    linkedin_url: "",
    github_url: "",
    twitter_url: "",
    // --- STUDENT FIELDS ---
    student_status: "Current", 
    career_level: "Junior",
    // --- BANKING ---
    bank_name: "",
    account_number: "",
    payout_frequency: "monthly",
    // --- PREFERENCES ---
    preference_notifications: true,
    preference_newsletter: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (profileData) {
      setFormData(prevData => ({
        ...prevData,
        // --- PERSONAL ---
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        email: user?.email || "",
        bio: profileData.bio || "Tech enthusiast passionate about learning new skills.",
        country: profileData.country || "Nigeria",
        phone: profileData.phone || "",
        // --- PROFESSIONAL ---
        professional_title: profileData.career_level || "", // Use as display title
        skills: profileData.skills || "",
        website: profileData.website || "",
        linkedin_url: profileData.linkedin_url || "",
        github_url: profileData.github_url || "",
        twitter_url: profileData.twitter_url || "",
        career_level: profileData.career_level || "",
        // --- STUDENT ---
        student_status: profileData.student_status || "Current",
        // --- BANKING ---
        bank_name: profileData.bank_name || "",
        account_number: profileData.account_number || "",
        payout_frequency: profileData.payout_frequency || "monthly",
        // --- PREFERENCES ---
        preference_notifications: profileData.preferences?.notifications !== false,
        preference_newsletter: profileData.preferences?.newsletter !== false,
      }));
    }
  }, [profileData, user?.email]);

  const countries = [
    "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", 
    "United States", "United Kingdom", "Canada", "Australia"
  ];

  const studentStatuses = [
    "Prospective", "Current", "Alumni"
  ];

  const careerLevels = [
    "Student/Learning", "Junior", "Mid-Level", "Senior", "Lead/Manager"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankDetailsChange = (field: string, value: string) => {
    updateProfileData({ [field]: value })
      .catch(error => {
        toast({
          title: "Update failed",
          description: `Failed to update ${field}: ${error.message}`,
          variant: "destructive"
        });
      });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        bio: formData.bio,
        country: formData.country,
        phone: formData.phone,
        website: formData.website,
        career_level: formData.professional_title, // Map professional_title to career_level
        skills: formData.skills,
        linkedin_url: formData.linkedin_url,
        github_url: formData.github_url,
        twitter_url: formData.twitter_url,
        student_status: formData.student_status,
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        payout_frequency: formData.payout_frequency,
      };
      await updateProfileData(dataToUpdate);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "There was a problem updating your profile. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updatePreferences({
        notifications: formData.preference_notifications,
        newsletter: formData.preference_newsletter
      });
      
      toast({
        title: "Preferences updated",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "There was a problem updating your preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your new passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "Password update failed",
        description: error.message || "There was a problem updating your password.",
        variant: "destructive"
      });
    }
  };

  const handleMentorshipApply = () => {
    toast({
      title: "Application submitted",
      description: "Your mentorship application has been received. We'll review it soon.",
    });
  };

  const handleInternshipApply = () => {
    toast({
      title: "Application submitted",
      description: "Your internship application has been received. We'll review it soon.",
    });
  };

  const isInstructor = user?.role === "instructor";
  const instructorId = user?.id;

  const {
    data: instructorCourses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["instructor-courses", instructorId],
    queryFn: async () => {
      if (!instructorId) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("id, is_published")
        .eq("instructor_id", instructorId);
      if (error) throw error;
      return data || [];
    },
    enabled: isInstructor && !!instructorId,
  });

  const publishedCourseIds = instructorCourses?.filter(
    (c) => c.is_published
  ).map((c) => c.id) || [];

  const {
    data: totalStudents,
    isLoading: studentsLoading,
    error: studentsError,
  } = useQuery({
    queryKey: ["instructor-total-students", publishedCourseIds.join(",")],
    queryFn: async () => {
      if (!publishedCourseIds.length) return 0;
      const { count, error } = await supabase
        .from("enrollments")
        .select("student_id", { count: "exact", head: true })
        .in("course_id", publishedCourseIds);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: isInstructor && publishedCourseIds.length > 0,
  });

  const handleAvatarUpload = async (avatarUrl: string) => {
    try {
      await updateProfileData({ avatar_url: avatarUrl });
      toast({ title: "Avatar updated!" });
      fetchProfileData();
    } catch (error: any) {
      toast({
        title: "Image update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-8">My Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[600px] w-full" />
          <div className="lg:col-span-2">
            <Skeleton className="h-[400px] w-full mb-8" />
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${formData.first_name} ${formData.last_name}`.trim();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <AvatarUploader
                  profileData={{
                    id: user?.id!,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    avatar_url: profileData?.avatar_url,
                    email: user?.email,
                  }}
                  onUpload={handleAvatarUpload}
                />
                
                <h2 className="mt-4 text-xl font-bold">{fullName || user?.email}</h2>
                <p className="text-gray-500 capitalize">{formData.professional_title}</p>
                <div className="flex items-center mt-1">
                  {user?.role && (
                    <Badge className="bg-indigo-100 text-indigo-800 mr-2 capitalize">{user.role}</Badge>
                  )}
                  {user?.role === 'student' && (
                    <Badge className="bg-blue-100 text-blue-800 mr-2">{formData.student_status} Student</Badge>
                  )}
                  {(user?.role === 'student' || user?.role === 'instructor') && (
                    <Badge className="bg-purple-100 text-purple-800">{formData.career_level}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">{formData.country}</p>
                
                <div className="w-full mt-6">
                  <div className="border-t pt-4 pb-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{user?.email}</p>
                  </div>
                  
                  <div className="border-t pt-4 pb-4">
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p>{profileData?.created_at ? formatDate(profileData.created_at) : "N/A"}</p>
                  </div>

                  {user?.role === 'student' && (
                    <>
                      <div className="border-t pt-4 pb-4">
                        <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
                        <p>4</p>
                      </div>
                      
                      <div className="border-t pt-4 pb-4">
                        <p className="text-sm font-medium text-gray-500">Completed Courses</p>
                        <p>2</p>
                      </div>
                    </>
                  )}

                  {isInstructor && (
                    <>
                      <div className="border-t pt-4 pb-4">
                        <p className="text-sm font-medium text-gray-500">Created Courses</p>
                        <p>
                          {coursesLoading
                            ? <span>Loading...</span>
                            : (coursesError 
                              ? <span className="text-destructive">Error</span>
                              : (instructorCourses?.filter((c) => c.is_published).length ?? 0)
                            )
                          }
                        </p>
                      </div>
                      <div className="border-t pt-4 pb-4">
                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                        <p>
                          {studentsLoading
                            ? <span>Loading...</span>
                            : (studentsError
                              ? <span className="text-destructive">Error</span>
                              : (totalStudents ?? 0)
                            )
                          }
                        </p>
                      </div>
                    </>
                  )}

                  {(user?.role === 'admin' || user?.role === 'super_admin') && (
                    <>
                      <div className="border-t pt-4 pb-4">
                        <p className="text-sm font-medium text-gray-500">Total Users</p>
                        <p>342</p>
                      </div>
                      
                      <div className="border-t pt-4 pb-4">
                        <p className="text-sm font-medium text-gray-500">Total Courses</p>
                        <p>28</p>
                      </div>
                    </>
                  )}
                  
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p>Today</p>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-2 mt-6">
                  {user?.role === 'student' && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/my-courses">
                          <GraduationCap className="mr-2 h-4 w-4" />
                          My Courses
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/certificates">
                          <Award className="mr-2 h-4 w-4" />
                          My Certificates
                        </Link>
                      </Button>
                    </>
                  )}

                  {user?.role === 'instructor' && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/my-courses">
                          <BookOpen className="mr-2 h-4 w-4" />
                          My Courses
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/students">
                          <Users className="mr-2 h-4 w-4" />
                          My Students
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/revenue">
                          <Wallet className="mr-2 h-4 w-4" />
                          Revenue
                        </Link>
                      </Button>
                    </>
                  )}

                  {(user?.role === 'admin' || user?.role === 'super_admin') && (
                    <>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/users">
                          <Users className="mr-2 h-4 w-4" />
                          Manage Users
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/dashboard/courses">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Manage Courses
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'student' && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Growth Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold flex items-center">
                      <UserPlus className="mr-2 h-4 w-4 text-blue-500" />
                      Mentorship Program
                    </h3>
                    <p className="text-sm text-gray-600 my-2">
                      Get guidance from industry experts to accelerate your learning and career growth.
                    </p>
                    <Button size="sm" onClick={handleMentorshipApply}>Apply Now</Button>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold flex items-center">
                      <Briefcase className="mr-2 h-4 w-4 text-green-500" />
                      Internship Opportunities
                    </h3>
                    <p className="text-sm text-gray-600 my-2">
                      Gain practical experience with our partner companies after completing relevant courses.
                    </p>
                    <Button size="sm" variant="outline" onClick={handleInternshipApply}>
                      View Opportunities
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Administration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold flex items-center">
                      <ShieldCheck className="mr-2 h-4 w-4 text-red-500" />
                      System Settings
                    </h3>
                    <p className="text-sm text-gray-600 my-2">
                      Configure platform settings and security policies.
                    </p>
                    <Button size="sm" variant="outline" asChild>
                      <Link to="/dashboard/settings">Manage Settings</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal">
                <TabsList className="mb-4">
                  <TabsTrigger value="personal">
                    <User className="h-4 w-4 mr-2" />
                    Personal Info
                  </TabsTrigger>
                  <TabsTrigger value="professional">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Professional
                  </TabsTrigger>
                  {user?.role === 'instructor' && (
                    <TabsTrigger value="banking">
                      <Wallet className="h-4 w-4 mr-2" />
                      Banking
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="preferences">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          placeholder="Your first name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          placeholder="Your last name"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="A short bio about yourself"
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Select name="country" value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map(country => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                    
                    {user?.role === 'student' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="student_status">Student Status</Label>
                          <Select name="student_status" value={formData.student_status} onValueChange={(value) => setFormData(prev => ({ ...prev, student_status: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {studentStatuses.map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="career_level">Career Level</Label>
                          <Select name="career_level" value={formData.career_level} onValueChange={(value) => setFormData(prev => ({ ...prev, career_level: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select career level" />
                            </SelectTrigger>
                            <SelectContent>
                              {careerLevels.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="profile-picture">Profile Picture</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback>
                            {fullName ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                          Change Image
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="professional">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="professional_title">Professional Title</Label>
                      <Input
                        id="professional_title"
                        name="professional_title"
                        value={formData.professional_title}
                        onChange={handleChange}
                        placeholder="e.g. Software Developer"
                      />
                      <p className="text-xs text-gray-500 mt-1">This is your display title (stored as career_level)</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="skills">Skills</Label>
                      <Textarea
                        id="skills"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="List your skills, separated by commas"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                        <Input
                          id="linkedin_url"
                          name="linkedin_url"
                          value={formData.linkedin_url}
                          onChange={handleChange}
                          placeholder="Your LinkedIn profile URL"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="github_url">Github Profile</Label>
                        <Input
                          id="github_url"
                          name="github_url"
                          value={formData.github_url}
                          onChange={handleChange}
                          placeholder="Your Github profile URL"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="twitter_url">Twitter Profile</Label>
                      <Input
                        id="twitter_url"
                        name="twitter_url"
                        value={formData.twitter_url}
                        onChange={handleChange}
                        placeholder="Your Twitter profile URL"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="career_level">Career Level</Label>
                      <Select name="career_level" value={formData.career_level} onValueChange={(value) => setFormData(prev => ({ ...prev, career_level: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select career level" />
                        </SelectTrigger>
                        <SelectContent>
                          {careerLevels.map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="banking">
                  {user?.role === "instructor" && (
                    <BankDetails
                      profileData={profileData || { id: "", role: "" } as ProfileData}
                      onBankDetailsChange={handleBankDetailsChange}
                      onVerifyBankAccount={verifyBankAccount}
                    />
                  )}
                  {user?.role === "instructor" && (
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="bank_name">Bank Name</Label>
                        <Input
                          id="bank_name"
                          name="bank_name"
                          value={formData.bank_name}
                          onChange={handleChange}
                          placeholder="Your bank name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="account_number">Account Number</Label>
                        <Input
                          id="account_number"
                          name="account_number"
                          value={formData.account_number}
                          onChange={handleChange}
                          placeholder="Your account number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payout_frequency">Payout Frequency</Label>
                        <Select name="payout_frequency" value={formData.payout_frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, payout_frequency: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payout frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  )}
                </TabsContent>

                <TabsContent value="preferences">
                  <form onSubmit={handlePreferencesSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <h3 className="font-semibold">Email Notifications</h3>
                          <p className="text-sm text-gray-500">
                            Receive email notifications about your courses, assignments, and platform updates.
                          </p>
                        </div>
                        <Switch
                          checked={formData.preference_notifications}
                          onCheckedChange={(checked) => setFormData(prev => ({...prev, preference_notifications: checked}))}
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <h3 className="font-semibold">Weekly Newsletter</h3>
                          <p className="text-sm text-gray-500">
                            Receive our weekly newsletter about new courses, tips, and learning resources.
                          </p>
                        </div>
                        <Switch
                          checked={formData.preference_newsletter}
                          onCheckedChange={(checked) => setFormData(prev => ({...prev, preference_newsletter: checked}))}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button type="submit">Save Preferences</Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button variant="outline" className="mr-2" type="button">
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Password
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
