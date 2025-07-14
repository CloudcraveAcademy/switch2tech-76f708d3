import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Percent, Save, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const CommissionSettings = () => {
  const [newCommission, setNewCommission] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current commission settings
  const { data: commissionSettings, isLoading } = useQuery({
    queryKey: ['commission-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('commission_settings')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const currentCommission = commissionSettings?.[0]?.commission_percentage || 0;

  const handleUpdateCommission = async () => {
    if (!newCommission || isNaN(Number(newCommission))) {
      toast.error('Please enter a valid commission percentage');
      return;
    }

    const commissionValue = Number(newCommission);
    if (commissionValue < 0 || commissionValue > 100) {
      toast.error('Commission percentage must be between 0 and 100');
      return;
    }

    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('commission_settings')
        .insert({
          commission_percentage: commissionValue
        });

      if (error) throw error;

      toast.success('Commission percentage updated successfully');
      setNewCommission('');
      queryClient.invalidateQueries({ queryKey: ['commission-settings'] });
    } catch (error: any) {
      toast.error('Failed to update commission: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Platform Commission Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Commission Display */}
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
            <div>
              <h3 className="font-semibold">Current Commission Rate</h3>
              <p className="text-sm text-muted-foreground">
                Percentage deducted from instructor earnings
              </p>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              {currentCommission}%
            </Badge>
          </div>

          {/* Update Commission Form */}
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="commission">New Commission Percentage</Label>
              <div className="flex gap-2">
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Enter percentage (0-100)"
                  value={newCommission}
                  onChange={(e) => setNewCommission(e.target.value)}
                />
                <Button 
                  onClick={handleUpdateCommission}
                  disabled={isUpdating || !newCommission}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This will affect all future instructor payouts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Commission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commissionSettings && commissionSettings.length > 0 ? (
              commissionSettings.map((setting, index) => (
                <div 
                  key={setting.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/10'
                  }`}
                >
                  <div>
                    <p className="font-medium">
                      {setting.commission_percentage}% Commission
                      {index === 0 && (
                        <Badge variant="secondary" className="ml-2">Current</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Set on {new Date(setting.created_at).toLocaleDateString()} at{' '}
                      {new Date(setting.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No commission history available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionSettings;