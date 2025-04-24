
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BellRing, Settings as SettingsIcon, PanelLeft, Wallet, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { formatDate } from "@/lib/utils";

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  courseUpdates: z.boolean(),
  assignmentReminders: z.boolean(),
  newMessages: z.boolean(),
});

const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  fontSize: z.enum(["small", "medium", "large"]),
  reduceAnimations: z.boolean(),
});

const accessibilityFormSchema = z.object({
  screenReader: z.boolean(),
  highContrast: z.boolean(),
  closedCaptions: z.boolean(),
});

const paymentFormSchema = z.object({
  defaultPaymentMethod: z.enum(["card", "bank", "paystack"]),
  savePaymentInfo: z.boolean(),
  currency: z.enum(["NGN", "USD", "GBP", "EUR"]),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;
type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;
type AccessibilityFormValues = z.infer<typeof accessibilityFormSchema>;
type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Notifications form
  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      courseUpdates: true,
      assignmentReminders: true,
      newMessages: true,
    },
  });

  // Appearance form
  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      fontSize: "medium",
      reduceAnimations: false,
    },
  });

  // Accessibility form
  const accessibilityForm = useForm<AccessibilityFormValues>({
    resolver: zodResolver(accessibilityFormSchema),
    defaultValues: {
      screenReader: false,
      highContrast: false,
      closedCaptions: true,
    },
  });

  // Payment form
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      defaultPaymentMethod: "card",
      savePaymentInfo: true,
      currency: "NGN",
    },
  });

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

  function onAppearanceSubmit(data: AppearanceFormValues) {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Appearance Settings Updated",
        description: "Your appearance settings have been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  }

  function onAccessibilitySubmit(data: AccessibilityFormValues) {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Accessibility Settings Updated",
        description: "Your accessibility settings have been updated successfully.",
      });
      setIsLoading(false);
    }, 1000);
  }

  function onPaymentSubmit(data: PaymentFormValues) {
    setIsLoading(true);
    setTimeout(() => {
      toast({
        title: "Payment Settings Updated",
        description: "Your payment settings have been updated successfully.",
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

      <Tabs defaultValue="notifications" className="space-y-8">
        <div className="border-b">
          <TabsList className="w-full justify-start h-auto p-0">
            <TabsTrigger 
              value="notifications" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <BellRing className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="appearance" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <PanelLeft className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger 
              value="accessibility" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Settings className="h-4 w-4 mr-2" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              className="py-2 px-4 data-[state=active]:border-b-2 data-[state=active]:border-brand-600 rounded-none"
            >
              <Wallet className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    name="courseUpdates"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Course Updates</FormLabel>
                          <FormDescription>
                            Receive notifications when your courses are updated with new content.
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
                    name="assignmentReminders"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Assignment Reminders</FormLabel>
                          <FormDescription>
                            Receive reminders about upcoming assignment deadlines.
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
                    name="newMessages"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">New Messages</FormLabel>
                          <FormDescription>
                            Receive notifications when you receive new messages from instructors or other students.
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
                            Receive emails about new features, courses, and offers.
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the platform looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...appearanceForm}>
                <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-6">
                  <FormField
                    control={appearanceForm.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose between light, dark, or system theme.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appearanceForm.control}
                    name="fontSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Font Size</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select font size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Adjust the text size for better readability.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={appearanceForm.control}
                    name="reduceAnimations"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Reduce Animations</FormLabel>
                          <FormDescription>
                            Turn off unnecessary animations for improved performance.
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
                    {isLoading ? "Updating..." : "Update Appearance"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accessibility Settings */}
        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Settings</CardTitle>
              <CardDescription>
                Configure settings to make the platform more accessible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...accessibilityForm}>
                <form onSubmit={accessibilityForm.handleSubmit(onAccessibilitySubmit)} className="space-y-6">
                  <FormField
                    control={accessibilityForm.control}
                    name="screenReader"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Screen Reader Optimization</FormLabel>
                          <FormDescription>
                            Optimize the interface for screen readers.
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
                    control={accessibilityForm.control}
                    name="highContrast"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">High Contrast Mode</FormLabel>
                          <FormDescription>
                            Increase contrast for better visibility.
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
                    control={accessibilityForm.control}
                    name="closedCaptions"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Always Show Closed Captions</FormLabel>
                          <FormDescription>
                            Automatically show closed captions for video content when available.
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
                    {isLoading ? "Updating..." : "Update Accessibility"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>
                Manage your payment preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
                  <FormField
                    control={paymentForm.control}
                    name="defaultPaymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Payment Method</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="paystack">Paystack</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your preferred payment method.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={paymentForm.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                            <SelectItem value="USD">US Dollar ($)</SelectItem>
                            <SelectItem value="GBP">British Pound (£)</SelectItem>
                            <SelectItem value="EUR">Euro (€)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select your preferred currency for payments and receipts.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={paymentForm.control}
                    name="savePaymentInfo"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Save Payment Information</FormLabel>
                          <FormDescription>
                            Securely save your payment information for future purchases.
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
                    {isLoading ? "Updating..." : "Update Payment Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View your recent payments and invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <div className="p-4">
                    <div className="font-medium">Advanced React Course</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-sm text-gray-500">
                        <span>Payment: #{1234567}</span>
                        <span className="px-2">•</span>
                        <span>April 15, 2025</span>
                      </div>
                      <div className="font-medium">₦25,000</div>
                    </div>
                    <Button className="mt-3" variant="outline" size="sm">
                      Download Receipt
                    </Button>
                  </div>
                </div>
                <div className="rounded-md border">
                  <div className="p-4">
                    <div className="font-medium">UI/UX Design Fundamentals</div>
                    <div className="flex justify-between items-center mt-1">
                      <div className="text-sm text-gray-500">
                        <span>Payment: #{1234566}</span>
                        <span className="px-2">•</span>
                        <span>March 20, 2025</span>
                      </div>
                      <div className="font-medium">₦18,500</div>
                    </div>
                    <Button className="mt-3" variant="outline" size="sm">
                      Download Receipt
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full">
                View All Payment History
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
