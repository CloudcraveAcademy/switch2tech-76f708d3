
import { useState } from "react";
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
  MessageSquare, 
  Calendar, 
  Graduation, 
  UserPlus, 
  Briefcase 
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "Tech enthusiast passionate about learning new skills.",
    country: "Nigeria",
    phone: "+234 812 345 6789",
    website: "",
    jobTitle: "Software Developer",
    skills: "JavaScript, React, TypeScript, Node.js",
    linkedIn: "",
    github: "",
    twitter: "",
    preference_notifications: true,
    preference_newsletter: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const countries = [
    "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", 
    "United States", "United Kingdom", "Canada", "Australia"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would update the user profile data
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure your new passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    });
    
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Summary */}
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>
                    {user?.name?.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="mt-4 text-xl font-bold">{user?.name}</h2>
                <p className="text-gray-500 capitalize">{formData.jobTitle}</p>
                <p className="text-sm text-gray-500">{formData.country}</p>
                
                <div className="w-full mt-6">
                  <div className="border-t pt-4 pb-4">
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{user?.email}</p>
                  </div>
                  
                  <div className="border-t pt-4 pb-4">
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p>February 2023</p>
                  </div>
                  
                  <div className="border-t pt-4 pb-4">
                    <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
                    <p>4</p>
                  </div>
                  
                  <div className="border-t pt-4 pb-4">
                    <p className="text-sm font-medium text-gray-500">Completed Courses</p>
                    <p>2</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-500">Last Login</p>
                    <p>Today at 10:30 AM</p>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-2 mt-6">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/my-courses">
                      <Graduation className="mr-2 h-4 w-4" />
                      My Courses
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/dashboard/certificates">
                      <Award className="mr-2 h-4 w-4" />
                      My Certificates
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opportunities Card */}
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
        </div>

        {/* Edit Profile Tabs */}
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
                  <TabsTrigger value="preferences">
                    <Settings className="h-4 w-4 mr-2" />
                    Preferences
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
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
                    
                    <div>
                      <Label htmlFor="profile-picture">Profile Picture</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback>
                            {user?.name?.split(" ").map((n) => n[0]).join("")}
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
