
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const profileFormSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  bio: z.string().max(500).optional(),
});

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: "johndoe@example.com",
      firstName: "John",
      lastName: "Doe",
      bio: "I'm a passionate developer focused on web technologies.",
    },
  });

  // Notifications form
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
    },
  });

  function onProfileSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  }

  function onNotificationsSubmit(data: NotificationsFormValues) {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Notification Settings Updated",
        description: "Your notification settings have been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="border rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <Separator className="mb-6" />
          
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be used for all communications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Notification Settings */}
        <div className="border rounded-md p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <Separator className="mb-6" />
          
          <Form {...notificationsForm}>
            <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
              <FormField
                control={notificationsForm.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications via email for important updates.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationsForm.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Push Notifications</FormLabel>
                      <FormDescription>
                        Receive push notifications for important updates.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={notificationsForm.control}
                name="marketingEmails"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Marketing Emails</FormLabel>
                      <FormDescription>
                        Receive emails about new features and offers.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Notifications"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
