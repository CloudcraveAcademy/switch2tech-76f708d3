import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EnhancedNotificationService } from '@/services/EnhancedNotificationService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, CheckCircle, XCircle, Info } from 'lucide-react';

export const NotificationPreview = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingNotifications, setIsTestingNotifications] = useState(false);

  const testNotificationPreferences = async () => {
    if (!user) return;

    setIsTestingNotifications(true);
    try {
      // Test different types of notifications
      const testNotifications = [
        { type: 'assignment', title: 'Test Assignment Notification' },
        { type: 'announcement', title: 'Test Announcement Notification' },
        { type: 'reminder', title: 'Test Reminder Notification' }
      ];

      let createdCount = 0;
      for (const notification of testNotifications) {
        const result = await EnhancedNotificationService.createNotificationWithPreferences({
          user_id: user.id,
          type: notification.type,
          title: notification.title,
          description: `This is a test ${notification.type} notification to verify your preferences.`,
          action_url: '/dashboard/settings'
        });
        
        if (result) createdCount++;
      }

      setTestResult(`Created ${createdCount} of ${testNotifications.length} test notifications based on your preferences.`);
    } catch (error) {
      setTestResult('Failed to test notifications. Please try again.');
    } finally {
      setIsTestingNotifications(false);
    }
  };

  const getNotificationTypeCounts = () => {
    if (!notifications) return {};
    
    const counts: Record<string, number> = {};
    notifications.forEach(notification => {
      counts[notification.type] = (counts[notification.type] || 0) + 1;
    });
    
    return counts;
  };

  const notificationCounts = getNotificationTypeCounts();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notification Status
        </CardTitle>
        <CardDescription>
          View your notification activity and test your preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(notificationCounts).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-2xl font-bold text-primary">{count}</div>
              <div className="text-sm text-muted-foreground capitalize">{type.replace('_', ' ')}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Notification Types Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">Assignments</span>
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">Course Updates</span>
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">Announcements</span>
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 rounded border">
              <span className="text-sm">Reminders</span>
              <Badge variant="secondary">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <Button 
            onClick={testNotificationPreferences}
            disabled={isTestingNotifications}
            variant="outline"
            className="w-full"
          >
            {isTestingNotifications ? 'Testing...' : 'Test Notification Preferences'}
          </Button>
          {testResult && (
            <div className="mt-2 p-2 rounded bg-muted">
              <p className="text-sm flex items-center">
                <Info className="h-4 w-4 mr-2" />
                {testResult}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};