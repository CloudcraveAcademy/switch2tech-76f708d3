
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
  Calendar, 
  GraduationCap, 
  UserPlus, 
  Briefcase,
  ShieldCheck,
  Users,
  BookOpen 
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useProfileData, ProfileData } from "@/hooks/useProfileData";
import { Skeleton } from "@/components/ui/skeleton";
import BankDetails from './profile/BankDetails';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profileData, loading, updateProfileData } = useProfileData();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: user?.email || "",
    bio: "",
    country: "Nigeria",
    phone: "",
    website: "",
    jobTitle: "Software Developer",
    skills: "",
    linkedIn: "",
    github: "",
    twitter: "",
    studentStatus: "Current", 
    careerLevel: "Junior",
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
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        bio: profileData.bio || "Tech enthusiast passionate about learning new skills.",
        country: profileData.country || "Nigeria",
        phone: profileData.phone || "+234 812 345 6789",
        website: profileData.website || "",
        jobTitle: profileData.job_title || "Software Developer",
        skills: profileData.skills || "JavaScript, React, TypeScript, Node.js",
        linkedIn: profileData.linkedin_url || "",
        github: profileData.github_url || "",
        twitter: profileData.twitter_url || "",
        studentStatus: profileData.student_status || "Current",
        careerLevel: profileData.career_level || "Junior",
        preference_notifications: profileData.preferences?.notifications !== false,
        preference_newsletter: profileData.preferences?.newsletter !== false,
      }));
    }
  }, [profileData]);

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
        job_title: formData.jobTitle,
        skills: formData.skills,
        linkedin_url: formData.linkedIn,
        github_url: formData.github,
        twitter_url: formData.twitter,
        student_status: formData.studentStatus,
        career_level: formData.careerLevel,
        preferences: {
          notifications: formData.preference_notifications,
          newsletter: formData.preference_newsletter
        }
      };
      
      await updateProfileData(dataToUpdate);
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
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
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {fullName ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="mt-4 text-xl font-bold">{fullName || user?.email}</h2>
                <p className="text-gray-500 capitalize">{formData.jobTitle}</p>
                <div className="flex items-center mt-1">
                  {user?.role && (
                    <Badge className="bg-indigo-100 text-indigo-800 mr-2 capitalize">{user.role}</Badge>
                  )}
                  {user?.role === 'student' && (
                    <Badge className="bg-blue-100 text-blue-800 mr-2">{formData.studentStatus} Student</Badge>
                  )}
                  {(user?.role === 'student' || user?.role === 'instructor') && (
                    <Badge className="bg-purple-100 text-purple-800">{formData.careerLevel}</Badge>
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

                  {user?.role === 'instructor' && (
                    <>
                      <div className="border-t pt-4 pb-4">
                        <p className="text-sm font-medium text-gray-500">Created Courses</p>
                        <p>6</p>
                      </div>
                      
                      <div className="border-t pt-4 pb-4">
                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                        <p>156</p>
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
                          <Label htmlFor="studentStatus">Student Status</Label>
                          <Select name="studentStatus" value={formData.studentStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, studentStatus: value }))}>
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
                          <Label htmlFor="careerLevel">Career Level</Label>
                          <Select name="careerLevel" value={formData.careerLevel} onValueChange={(value) => setFormData(prev => ({ ...prev, careerLevel: value }))}>
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
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        placeholder="e.g. Software Developer"
                      />
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
                        <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                        <Input
                          id="linkedIn"
                          name="linkedIn"
                          value={formData.linkedIn}
                          onChange={handleChange}
                          placeholder="Your LinkedIn profile URL"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="github">Github Profile</Label>
                        <Input
                          id="github"
                          name="github"
                          value={formData.github}
                          onChange={handleChange}
                          placeholder="Your Github profile URL"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="banking">
                  <BankDetails 
                    profileData={profileData || {id: "", role: ""} as ProfileData} 
                    onBankDetailsChange={(field, value) => 
                      setFormData(prev => ({ ...prev, [field]: value }))
                    } 
                  />
                </TabsContent>

                <TabsContent value="preferences">
                  <form onSubmit={handleSubmit} className="space-y-4">
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
